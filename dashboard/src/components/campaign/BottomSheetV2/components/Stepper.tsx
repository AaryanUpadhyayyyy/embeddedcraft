import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface Step {
  label: string;
  description?: string;
  completed?: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  showNumbers?: boolean;
  showIcons?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Stepper Component - Step-by-step progress indicator
 * 
 * Features:
 * - Numbered steps (1, 2, 3)
 * - Horizontal/vertical orientation
 * - Completed step checkmarks
 * - Current step highlighting
 * - Step labels and descriptions
 * 
 * Use Cases:
 * - Khatabook: "1. Recharge → 2. Complete → 3. Get Bonus"
 * - Onboarding flows
 * - Multi-step forms
 * - Process tracking
 * 
 * Usage:
 * ```tsx
 * <Stepper 
 *   steps={[
 *     { label: "Recharge coins", completed: true },
 *     { label: "Complete transaction", completed: false },
 *     { label: "Get bonus instantly", completed: false }
 *   ]}
 *   currentStep={1}
 *   orientation="horizontal"
 *   showNumbers={true}
 * />
 * ```
 */
export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  orientation = 'horizontal',
  showNumbers = true,
  showIcons = true,
  className,
  style,
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div 
      className={cn(
        'stepper',
        isHorizontal ? 'flex items-start' : 'flex flex-col',
        className
      )}
      style={style}
    >
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = step.completed || index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div
            key={index}
            className={cn(
              'step-item',
              isHorizontal ? 'flex flex-col items-center flex-1' : 'flex items-start',
              !isLast && (isHorizontal ? 'relative' : 'relative pb-8')
            )}
          >
            {/* Step Content */}
            <div className={cn(
              'flex items-center',
              !isHorizontal && 'w-full'
            )}>
              {/* Step Circle/Number */}
              <div
                className={cn(
                  'flex items-center justify-center rounded-full font-semibold flex-shrink-0 z-10',
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isCurrent 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-500',
                  showNumbers ? 'w-10 h-10 text-base' : 'w-8 h-8'
                )}
              >
                {isCompleted && showIcons ? (
                  <Check className="w-5 h-5" />
                ) : showNumbers ? (
                  stepNumber
                ) : null}
              </div>

              {/* Step Label */}
              <div className={cn(
                'step-content',
                isHorizontal ? 'mt-3 text-center' : 'ml-4'
              )}>
                <div className={cn(
                  'font-semibold text-sm',
                  isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-500'
                )}>
                  {step.label}
                </div>
                {step.description && (
                  <div className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  'step-connector',
                  isHorizontal 
                    ? 'absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2'
                    : 'absolute left-5 top-10 w-0.5 h-full -translate-x-1/2',
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                )}
                style={isHorizontal ? { left: '50%', right: '-50%' } : {}}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
