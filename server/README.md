# Cmdly Server (API)

This repo is primarily an offline-first app (web + Android). This `server/` folder adds an **optional API** with:

- **Rate limiting** on all endpoints (IP-based + user/principal-based)
- **Strict input validation + sanitization** (Zod + conservative string sanitization)
- **Secure API key handling** (Bearer auth optional; keys never logged/echoed; principal IDs are hashed)

## Run locally

```bash
cd server
npm install
npm run dev
```

Server defaults to `http://localhost:8787`.

## Configure API keys (optional)

If you set `API_KEYS`, requests must include `Authorization: Bearer <key>`.

Example `.env`:

```bash
API_KEYS=dev_key_1,dev_key_2
PORT=8787
```

## Rate limit defaults

- Per IP: 120 requests/minute
- Per user/principal: 240 requests/minute

Override with:

- `RATE_LIMIT_IP_WINDOW_MS`, `RATE_LIMIT_IP_MAX`
- `RATE_LIMIT_USER_WINDOW_MS`, `RATE_LIMIT_USER_MAX`

## Endpoints

- `GET /health`
- `POST /v1/feedback`

