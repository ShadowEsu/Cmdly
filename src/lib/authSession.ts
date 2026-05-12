const POST_VERIFY_NOTICE_KEY = 'regrade_post_verify_notice';

export function consumePostVerifyNotice(): string | null {
  try {
    const v = sessionStorage.getItem(POST_VERIFY_NOTICE_KEY);
    if (v) sessionStorage.removeItem(POST_VERIFY_NOTICE_KEY);
    return v;
  } catch {
    return null;
  }
}

export function setPostVerifyNotice(message: string) {
  try {
    sessionStorage.setItem(POST_VERIFY_NOTICE_KEY, message);
  } catch {
    /* ignore */
  }
}
