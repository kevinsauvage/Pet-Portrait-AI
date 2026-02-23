import Link from 'next/link';

import config from '@/core/config';
import { Button } from '@/ui/primitives/button';

import { ArrowLeft } from 'lucide-react';

const BackButton: React.FC = () => (
  <Button variant="secondary" asChild>
    <Link href={config.routes.account} className="flex items-center gap-2">
      <ArrowLeft size={16} />
      Back to account
    </Link>
  </Button>
);

export default BackButton;
