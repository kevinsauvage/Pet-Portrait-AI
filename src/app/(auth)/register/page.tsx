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
  noindex: true, // Registration page shouldn't be indexed
});

const RegisterPage = () => {
  const { title, description } = seo.register;

  return (
    <AuthShell
      title={title}
      description={description}
      footer={
        <div className="pt-4 text-body-sm text-center text-secondary">
          Already have an account?{' '}
          <Link href={config.routes.login} className="link">
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
