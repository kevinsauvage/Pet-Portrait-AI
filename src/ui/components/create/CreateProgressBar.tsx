import { cn } from '@/lib/cn';

import { Check } from 'lucide-react';

export type CreateStep = 'upload' | 'style' | 'generating' | 'collections' | 'product';

const STEPS: { id: CreateStep; label: string; description?: string }[] = [
  { id: 'upload', label: 'Upload', description: 'Add your photo' },
  { id: 'style', label: 'Style', description: 'Choose art style' },
  { id: 'generating', label: 'Generating', description: 'AI creating magic' },
  { id: 'collections', label: 'Template', description: 'Select product' },
  { id: 'product', label: 'Order', description: 'Complete purchase' },
];

interface CreateProgressBarProps {
  currentStep: CreateStep;
}

export default function CreateProgressBar({ currentStep }: CreateProgressBarProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="Progress" className="w-full">
      <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-4xl mx-auto">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isActive = i === currentIndex;
          const isUpcoming = i > currentIndex;

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center gap-3">
                {/* Step indicator */}
                <div className="relative flex items-center justify-center">
                  <div
                    aria-current={isActive ? 'step' : undefined}
                    className={cn(
                      'relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300',
                      'ring-4 ring-offset-2 ring-offset-background',
                      isCompleted &&
                        'bg-primary text-primary-foreground shadow-md shadow-primary/20',
                      isActive &&
                        'bg-primary text-primary-foreground ring-primary/30 shadow-lg shadow-primary/30 scale-110',
                      isUpcoming &&
                        'bg-muted text-muted-foreground ring-transparent',
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" strokeWidth={3} />
                    ) : (
                      <span className="relative z-10">{i + 1}</span>
                    )}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    )}
                  </div>
                </div>

                {/* Step label */}
                <div className="hidden sm:block text-center space-y-1">
                  <span
                    className={cn(
                      'block text-sm font-semibold transition-colors duration-300',
                      isActive && 'text-primary',
                      isCompleted && 'text-foreground',
                      isUpcoming && 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span
                      className={cn(
                        'block text-xs transition-colors duration-300',
                        isActive && 'text-primary/80',
                        isCompleted && 'text-muted-foreground',
                        isUpcoming && 'text-muted-foreground/60',
                      )}
                    >
                      {step.description}
                    </span>
                  )}
                </div>

                {/* Mobile label */}
                <span
                  className={cn(
                    'block text-xs font-medium sm:hidden transition-colors duration-300',
                    isActive && 'text-primary',
                    isCompleted && 'text-foreground',
                    isUpcoming && 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden sm:flex flex-1 items-center px-2 mx-2">
                  <div
                    className={cn(
                      'h-0.5 w-full rounded-full transition-all duration-500',
                      isCompleted ? 'bg-primary' : 'bg-border',
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
