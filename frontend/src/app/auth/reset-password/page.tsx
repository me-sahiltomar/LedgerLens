import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Reset Password | LedgerLens — A CevonX Product',
  description: 'Enter your new password to restore access to your CevonX account.',
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
