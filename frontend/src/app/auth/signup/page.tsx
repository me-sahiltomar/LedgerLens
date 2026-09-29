import { SignupForm } from '@/components/auth/SignupForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Create Account | LedgerLens — A CevonX Product',
  description: 'Create your CevonX account to process, validate, and audit financial documents.',
};

export default function SignupPage({
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

  return <SignupForm initialRedirect={redirectTo} />;
}
