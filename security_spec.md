# Security Specification: Regrade Platform

## Data Invariants
1. A user can only access their own profile and their own cases.
2. The `userId` field in a case must match the authenticated user's UID.
3. Document IDs for users must be the authenticated UID.
4. `createdAt` is immutable after creation.
5. `updatedAt` must be updated to `request.time` on every update.
6. Case references and student IDs must match university-standard alphanumeric patterns.

## The Dirty Dozen (Test Payloads)

1. **Identity Spoofing**: Attempt to create a case with `userId: "OTHER_USER_UID"`.
2. **Access Breach**: Attempt to read `users/VICTIM_UID` as `ATTACKER_UID`.
3. **Privilege Escalation**: Attempt to update `isAdmin: true` on user profile (though not in schema, tests guard against shadow fields).
4. **Immutability Violation**: Attempt to change `createdAt` on an existing case.
5. **Orphaned Write**: Attempt to create a milestone for a case the user does not own.
6. **Value Poisoning**: Inject a 2.5MB string into the `major` field on user profile.
7. **Bypass Validation**: Create a case missing required `title` field.
8. **Shadow Field Injection**: Add `internalScore: 100` to a case document.
9. **Time Spoofing**: Provide a custom `request.time` (client-side) for `updatedAt`.
10. **ID Hijacking**: Attempt to delete another user's case by guessing the ID.
11. **Malicious ID**: Use `<script>alert(1)</script>` as a document ID.
12. **Blanket Read Migration**: Attempt to `list` all cases without a `userId` filter.

## Test Results
*Expected: All above return PERMISSION_DENIED.*
