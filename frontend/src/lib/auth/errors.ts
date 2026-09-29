/**
 * Formats authentication and Supabase errors into human-readable user messages.
 * Prevents raw database or API error objects from leaking into user-facing UI.
 */
export function formatAuthError(error: unknown): string {
  if (!error) return '';

  const rawMessage =
    typeof error === 'string'
      ? error
      : error instanceof Error
      ? error.message
      : typeof (error as any)?.message === 'string'
      ? (error as any).message
      : String(error);

  const lower = rawMessage.toLowerCase();

  // Invalid login credentials
  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid credentials') ||
    lower.includes('invalid email or password')
  ) {
    return 'Email or password is incorrect.';
  }

  // Duplicate email / already registered
  if (
    lower.includes('user already registered') ||
    lower.includes('already registered') ||
    lower.includes('already exists') ||
    lower.includes('email address is already in use')
  ) {
    return 'This email is already registered. Sign in instead.';
  }

  // Unconfirmed email
  if (
    lower.includes('email not confirmed') ||
    lower.includes('not confirmed') ||
    lower.includes('confirmation required')
  ) {
    return 'Check your email to confirm your account.';
  }

  // Password mismatch
  if (lower.includes('password mismatch') || lower.includes('passwords do not match')) {
    return 'Passwords do not match.';
  }

  // Weak password
  if (
    lower.includes('password should be at least') ||
    lower.includes('weak password') ||
    lower.includes('password is too short')
  ) {
    return 'Choose a stronger password (minimum 6 characters).';
  }

  // OAuth / Google errors
  if (lower.includes('oauth') || lower.includes('google') || lower.includes('provider')) {
    return 'Google sign-in could not be completed. Please try again.';
  }

  // Rate limiting
  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('over_email_send_rate_limit')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  // Recovery link expired / invalid
  if (
    lower.includes('token has expired') ||
    lower.includes('token is expired') ||
    lower.includes('invalid token') ||
    lower.includes('otp_expired')
  ) {
    return 'Password reset link is invalid or has expired. Please request a new link.';
  }

  return rawMessage;
}
