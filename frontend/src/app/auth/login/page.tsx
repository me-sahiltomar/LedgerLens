import { LoginForm } from '@/components/auth/LoginForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sign In | LedgerLens — A CevonX Product',
  description: 'Sign in to access your LedgerLens document workspace with CevonX central authentication.',
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const redirectTo =
    typeof searchParams?.redirectTo === 'string'
      ? searchParams.redirectTo
      : typeof searchParams?.next === 'string'
      ? searchParams.next
      : undefined;

  const error = typeof searchParams?.error === 'string' ? searchParams.error : undefined;

  return <LoginForm initialRedirect={redirectTo} initialError={error} />;
}
