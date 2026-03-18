export const SESSION_COOKIE_NAME = "apm_session";
export const USER_ID_COOKIE_NAME = "apm_uid";
export const USER_EMAIL_COOKIE_NAME = "apm_email";
export const LOCAL_DEMO_USER_ID = "local-admin";
export const USER_SESSION_INACTIVITY_SECONDS = 60 * 60 * 24 * 7;

export function getExpectedEmail() {
  const configured =
    process.env.APP_LOGIN_EMAIL ??
    process.env.ADMIN_LOGIN_EMAIL ??
    "admin@apimonitor.local";
  return normalizeUserId(configured);
}

export function getExpectedPassword() {
  return (
    process.env.APP_LOGIN_PASSWORD ??
    process.env.ADMIN_LOGIN_PASSWORD ??
    "admin123"
  );
}

export function isValidLogin(email: string, password: string) {
  return normalizeUserId(email) === getExpectedEmail() && password === getExpectedPassword();
}

export function normalizeUserId(value: string) {
  return value.trim().toLowerCase();
}
