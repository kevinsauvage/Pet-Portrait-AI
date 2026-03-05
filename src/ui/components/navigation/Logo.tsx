import Link from 'next/link';

import { logo } from '@/assets/svg';
import siteMetadata from '@/core/config/siteMetadata';

const Logo = () => (
  <Link href="/" className="w-fit" aria-label={`${siteMetadata.companyName} home`}>
    {logo}
  </Link>
);

export default Logo;
