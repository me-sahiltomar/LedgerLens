import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Forgot Password | LedgerLens — A CevonX Product',
  description: 'Request a password recovery email for your CevonX account.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
