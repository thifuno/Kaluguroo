import type { LocalAccount } from '@/lib/storage';

export type AuthErrorCode =
  | 'INVALID_EMAIL'
  | 'SHORT_PASSWORD'
  | 'PASSWORD_MISMATCH'
  | 'NAME_REQUIRED'
  | 'EMAIL_TAKEN'
  | 'NOT_FOUND'
  | 'WRONG_PASSWORD'
  | 'GOOGLE_NOT_CONFIGURED';

export class AuthError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode, message = code) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/**
 * Phase 1 mock authentication.
 * Accounts are stored locally so the UI can be exercised end-to-end.
 * This is intentionally NOT secure and is replaced by Supabase Auth in Phase 2.
 */
export async function mockSignUp(
  accounts: LocalAccount[],
  input: { name: string; email: string; password: string },
): Promise<LocalAccount[]> {
  const email = normalizeEmail(input.email);
  if (!input.name.trim()) throw new AuthError('NAME_REQUIRED');
  if (!isValidEmail(email)) throw new AuthError('INVALID_EMAIL');
  if (input.password.length < 8) throw new AuthError('SHORT_PASSWORD');
  if (accounts.some((account) => account.email === email)) {
    throw new AuthError('EMAIL_TAKEN');
  }
  return [
    ...accounts,
    {
      email,
      name: input.name.trim(),
      password: input.password,
      createdAt: new Date().toISOString(),
    },
  ];
}

export function mockSignIn(
  accounts: LocalAccount[],
  input: { email: string; password: string },
): LocalAccount {
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) throw new AuthError('INVALID_EMAIL');
  const account = accounts.find((entry) => entry.email === email);
  if (!account) throw new AuthError('NOT_FOUND');
  if (account.password !== input.password) throw new AuthError('WRONG_PASSWORD');
  return account;
}

export function googleSignInUnavailable(): never {
  throw new AuthError('GOOGLE_NOT_CONFIGURED');
}
