import type * as React from 'react';

import { cn } from '@/lib/cn';
import CardHeaderPattern from '@/ui/components/CardHeaderPattern';
import { Card, CardContent } from '@/ui/components/ui/card';

type AuthShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

const AuthShell = ({ title, description, children, footer, className }: AuthShellProps) => {
  return (
    <div
      className={cn(
        'min-h-[calc(100vh-76px)] bg-linear-to-b from-background to-muted/30',
        className,
      )}
    >
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mx-auto w-full max-w-md">
          <Card className="shadow-lg border-border/60 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/70">
            <CardHeaderPattern
              className="pb-4"
              titleClassName="text-center w-full"
              descriptionClassName="text-center"
              title={title}
              description={description}
              size={3}
            />
            <CardContent className="pt-0 space-y-6">
              {children}
              {footer ? <div className="pt-2 border-t">{footer}</div> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
