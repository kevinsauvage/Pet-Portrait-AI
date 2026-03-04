import type { Metadata } from 'next';
import Link from 'next/link';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import AuthShell from '@/ui/components/auth/AuthShell';
import RegisterForm from '@/ui/components/auth/RegisterForm';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.register.title,
  description: seo.register.description,
  url: config.routes.register,
  noindex: true,
});

interface RegisterPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

const RegisterPage = async ({ searchParams }: RegisterPageProps) => {
  const { redirect: redirectUrl } = await searchParams;
  const { title, description } = seo.register;

  const loginHref = redirectUrl
    ? `${config.routes.login}?redirect=${encodeURIComponent(redirectUrl)}`
    : config.routes.login;

  return (
    <AuthShell
      title={title}
      description={description}
      footer={
        <div className="pt-4 text-body-sm text-center text-secondary">
          Already have an account?{' '}
          <Link href={loginHref} className="link">
            Sign in
          </Link>
        </div>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
};

export default RegisterPage;
