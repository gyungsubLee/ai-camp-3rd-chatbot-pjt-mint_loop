'use client';

import { cn } from '@/lib/utils/cn';
import type { TripKitStep } from '@/lib/types';

interface ProgressBarProps {
  currentStep: TripKitStep;
  className?: string;
}

const STEPS: TripKitStep[] = [
  'greeting',
  'spot',
  'action',
  'concept',
  'outfit',
  'pose',
  'film',
  'confirm',
  'complete',
];

const STEP_LABELS: Record<TripKitStep, string> = {
  greeting: '도시',
  spot: '장소',
  action: '장면',
  concept: '컨셉',
  outfit: '의상',
  pose: '포즈',
  film: '필름',
  confirm: '카메라',
  complete: '완료',
};

export function ProgressBar({ currentStep, className }: ProgressBarProps) {
  const currentIndex = STEPS.indexOf(currentStep);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <div className={cn('w-full', className)}>
      {/* Progress Bar */}
      <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-sepia-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between">
        {STEPS.map((step, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = step === currentStep;

          return (
            <div
              key={step}
              className={cn(
                'flex flex-col items-center',
                isActive ? 'text-sepia-600' : 'text-gray-400'
              )}
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full mb-1 transition-all duration-300',
                  isCurrent
                    ? 'bg-sepia-500 ring-4 ring-sepia-100'
                    : isActive
                    ? 'bg-sepia-500'
                    : 'bg-cream-300'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium hidden sm:block',
                  isCurrent ? 'text-sepia-600' : isActive ? 'text-sepia-400' : 'text-gray-400'
                )}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
