import Link from 'next/link';

import { logo } from '@/assets/svg';

const Logo = () => (
  <Link href="/" className="w-fit md:order-1" aria-label="Link to home page">
    {logo}
  </Link>
);

export default Logo;
