export const USERNAME_MIN = 3;
export const USERNAME_MAX = 24;
export const PASSWORD_MIN = 8;

const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidUsername(value: string): boolean {
  return USERNAME_PATTERN.test(value);
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

export function isValidPassword(value: string): boolean {
  return value.length >= PASSWORD_MIN;
}

export function looksLikeEmail(value: string): boolean {
  return value.includes("@");
}
