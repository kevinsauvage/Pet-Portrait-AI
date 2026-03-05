import type * as React from 'react';

import { cn } from '@/lib/utils';
import CardHeaderPattern from '@/ui/components/shared/CardHeaderPattern';
import { Card, CardContent } from '@/ui/primitives/card';

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
        'relative min-h-[calc(100vh-68px)] overflow-hidden bg-background',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,color-mix(in_srgb,var(--primary)_6%,transparent),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[linear-gradient(to_right,transparent,var(--border),transparent)]" />
      </div>

      <div className="container relative mx-auto px-4 py-10 md:px-6 md:py-16">
        <div className="mx-auto w-full max-w-[420px]">
          <Card className="border-border/60 bg-card/95 shadow-[var(--shadow-elevated)] backdrop-blur-sm">
            <CardHeaderPattern
              className="pb-2"
              titleClassName="text-center w-full text-heading-3"
              descriptionClassName="text-center text-body-sm text-muted-foreground"
              title={title}
              description={description}
              size={3}
            />
            <CardContent className="space-y-6 pt-2">
              {children}
              {footer ? (
                <div className="border-t border-border/60 pt-4 text-center">{footer}</div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
