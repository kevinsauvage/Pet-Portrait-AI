import type { ReactNode } from 'react';
import Link from 'next/link';

import { Button } from '@/ui/components/ui/button';
import { Card, CardContent } from '@/ui/components/ui/card';

type AccountCardCTAProps = {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  icon?: ReactNode;
};

const AccountCardCTA = ({
  title,
  description,
  buttonText,
  buttonLink,
  icon,
}: AccountCardCTAProps) => {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            {icon && <div className="text-secondary">{icon}</div>}
            <h3 className="text-heading-4">{title}</h3>
            <p className="text-body-sm text-secondary">{description}</p>
          </div>
          <Button variant="secondary" size="sm" asChild className="w-full sm:w-auto">
            <Link href={buttonLink} scroll>
              {buttonText}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountCardCTA;
