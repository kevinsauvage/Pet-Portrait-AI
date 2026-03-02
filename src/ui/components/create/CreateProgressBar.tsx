import { cn } from '@/lib/cn';

export type CreateStep =
  | 'upload'
  | 'style'
  | 'generating'
  | 'select'
  | 'collections'
  | 'product';

const STEPS: { id: CreateStep; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'style', label: 'Style' },
  { id: 'generating', label: 'Generating' },
  { id: 'select', label: 'Select' },
  { id: 'collections', label: 'Format' },
  { id: 'product', label: 'Order' },
];

interface CreateProgressBarProps {
  currentStep: CreateStep;
}

export default function CreateProgressBar({ currentStep }: CreateProgressBarProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="Progress" className="flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isActive = i === currentIndex;

        return (
          <div key={step.id} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isActive && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  !isCompleted && !isActive && 'bg-muted text-muted-foreground',
                )}
              >
                {isCompleted ? '✓' : i + 1}
              </div>
              <span
                className={cn(
                  'hidden text-xs font-medium sm:inline',
                  i <= currentIndex ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-px w-4 sm:w-8 transition-colors',
                  i < currentIndex ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
