export const SESSION_COOKIE_NAME = "apm_session";
export const USER_ID_COOKIE_NAME = "apm_uid";
export const LOCAL_DEMO_USER_ID = "local-admin";

export function getExpectedEmail() {
  return process.env.APP_LOGIN_EMAIL ?? "admin@apimonitor.local";
}

export function getExpectedPassword() {
  return process.env.APP_LOGIN_PASSWORD ?? "admin123";
}

export function isValidLogin(email: string, password: string) {
  return email === getExpectedEmail() && password === getExpectedPassword();
}

export function normalizeUserId(value: string) {
  return value.trim().toLowerCase();
}
