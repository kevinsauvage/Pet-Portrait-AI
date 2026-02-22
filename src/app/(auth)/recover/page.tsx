import type { Metadata } from 'next';
import Link from 'next/link';

import config from '@/core/config';
import seo from '@/core/config/seo';
import AuthShell from '@/ui/components/AuthShell';

import RecoverForm from '../../../ui/components/RecoverForm';

export const metadata: Metadata = {
  description: seo.recover.description,
  title: seo.recover.title,
};

const ResetPassword = () => {
  const { title, description } = seo.recover || {};
  return (
    <AuthShell
      title={title}
      description={description}
      footer={
        <div className="pt-4 text-body-sm text-center text-secondary">
          Remembered your password?{' '}
          <Link href={config.routes.login} className="link">
            Back to login
          </Link>
        </div>
      }
    >
      <RecoverForm />
    </AuthShell>
  );
};

export default ResetPassword;
