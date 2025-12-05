'use client';

import { cn } from '@/lib/utils/cn';
import type { ConversationStep } from '@/lib/types';

interface ProgressBarProps {
  currentStep: ConversationStep;
  className?: string;
}

const STEPS: ConversationStep[] = [
  'init',
  'mood',
  'aesthetic',
  'duration',
  'interests',
  'destination',
  'complete',
];

const STEP_LABELS: Record<ConversationStep, string> = {
  init: '시작',
  mood: '무드',
  aesthetic: '미학',
  duration: '기간',
  interests: '관심사',
  destination: '장면',
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
