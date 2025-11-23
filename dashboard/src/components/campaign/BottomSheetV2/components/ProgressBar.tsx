import React from 'react';
import { cn } from '@/lib/utils';

export interface Milestone {
  value: number;
  label: string;
  color?: string;
}

interface ProgressBarProps {
  value: number;
  max?: number;
  height?: number;
  showPercentage?: boolean;
  milestones?: Milestone[];
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ProgressBar Component - Linear progress indicator with milestones
 * 
 * Features:
 * - Simple progress bar (0-100%)
 * - Milestones support (for Dunzo-style thresholds)
 * - Color changes at milestones
 * - Percentage display
 * - Smooth animations
 * 
 * Use Cases:
 * - Dunzo: "Add ₹200 more for ₹50 off"
 * - Cart value progress
 * - Task completion
 * - Loading states
 * 
 * Usage:
 * ```tsx
 * <ProgressBar 
 *   value={150}
 *   max={400}
 *   milestones={[
 *     { value: 200, label: "₹50 off", color: "#FBBF24" },
 *     { value: 400, label: "₹100 off", color: "#10B981" }
 *   ]}
 *   showPercentage={true}
 * />
 * ```
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  height = 8,
  showPercentage = false,
  milestones = [],
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
  animated = true,
  className,
  style,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  // Determine current color based on milestones
  const getCurrentColor = () => {
    if (milestones.length === 0) return color;
    
    // Find the highest milestone that's been reached
    const reachedMilestones = milestones
      .filter(m => value >= m.value)
      .sort((a, b) => b.value - a.value);
    
    return reachedMilestones[0]?.color || color;
  };

  const currentColor = getCurrentColor();

  // Get active milestone label
  const getActiveMilestoneLabel = () => {
    if (milestones.length === 0) return null;
    
    const nextMilestone = milestones.find(m => value < m.value);
    if (nextMilestone) {
      const remaining = nextMilestone.value - value;
      return `${remaining.toFixed(0)} more for ${nextMilestone.label}`;
    }
    
    const lastMilestone = milestones[milestones.length - 1];
    if (value >= lastMilestone.value) {
      return `${lastMilestone.label} unlocked! 🎉`;
    }
    
    return null;
  };

  return (
    <div className={cn('progress-bar-container w-full', className)} style={style}>
      {/* Header: Percentage or Milestone */}
      {(showPercentage || milestones.length > 0) && (
        <div className="flex justify-between items-center mb-2">
          {showPercentage && (
            <span className="text-sm font-semibold text-gray-700">
              {percentage.toFixed(0)}%
            </span>
          )}
          {milestones.length > 0 && (
            <span className="text-xs font-medium text-gray-600">
              {getActiveMilestoneLabel()}
            </span>
          )}
        </div>
      )}

      {/* Progress Bar Track */}
      <div
        className="relative w-full rounded-full overflow-hidden"
        style={{ 
          height: `${height}px`, 
          backgroundColor 
        }}
      >
        {/* Progress Fill */}
        <div
          className={cn(
            'h-full rounded-full',
            animated && 'transition-all duration-500 ease-out'
          )}
          style={{
            width: `${percentage}%`,
            backgroundColor: currentColor,
          }}
        />
        
        {/* Milestones Markers */}
        {milestones.map((milestone, index) => {
          const milestonePercentage = (milestone.value / max) * 100;
          const isReached = value >= milestone.value;
          
          return (
            <div
              key={index}
              className="absolute top-0 bottom-0 w-0.5 bg-white"
              style={{
                left: `${milestonePercentage}%`,
                opacity: isReached ? 0.5 : 1,
              }}
              title={milestone.label}
            />
          );
        })}
      </div>

      {/* Milestones Labels (Below Bar) */}
      {milestones.length > 0 && (
        <div className="relative w-full mt-1">
          {milestones.map((milestone, index) => {
            const milestonePercentage = (milestone.value / max) * 100;
            const isReached = value >= milestone.value;
            
            return (
              <div
                key={index}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${milestonePercentage}%` }}
              >
                <div className={cn(
                  'text-xs font-medium mt-1 whitespace-nowrap',
                  isReached ? 'text-green-600' : 'text-gray-500'
                )}>
                  {isReached && '✓ '}{milestone.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
