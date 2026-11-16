import type { TranslationKey } from '@/lib/i18n';
import { AuthError, type AuthErrorCode } from '@/services/auth/mock-auth';

const KEYS: Record<AuthErrorCode, TranslationKey> = {
  INVALID_EMAIL: 'auth.invalidEmail',
  SHORT_PASSWORD: 'auth.shortPassword',
  PASSWORD_MISMATCH: 'auth.passwordMismatch',
  NAME_REQUIRED: 'auth.nameRequired',
  EMAIL_TAKEN: 'auth.emailTaken',
  NOT_FOUND: 'auth.notFound',
  WRONG_PASSWORD: 'auth.wrongPassword',
  GOOGLE_NOT_CONFIGURED: 'auth.googleUnavailable',
};

export function authErrorKey(error: unknown): TranslationKey {
  if (error instanceof AuthError) return KEYS[error.code];
  return 'common.error';
}
