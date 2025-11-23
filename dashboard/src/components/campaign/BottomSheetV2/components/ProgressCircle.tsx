import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressCircleProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ProgressCircle Component - Circular progress ring (Headway-style)
 * 
 * Features:
 * - Circular progress ring with percentage
 * - Animated fill on load
 * - Customizable size and colors
 * - Center label/percentage
 * - Goal tracking visualization
 * 
 * Use Cases:
 * - Headway: "85% daily goal complete"
 * - Profile completion
 * - Achievement progress
 * - Task completion ring
 * 
 * Usage:
 * ```tsx
 * <ProgressCircle 
 *   value={85}
 *   size={120}
 *   strokeWidth={8}
 *   color="#3B82F6"
 *   showPercentage={true}
 *   label="Daily Goal"
 *   animated={true}
 * />
 * ```
 */
export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
  showPercentage = true,
  animated = true,
  label,
  className,
  style,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div 
      className={cn('progress-circle flex flex-col items-center justify-center', className)}
      style={style}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(animated && 'transition-all duration-1000 ease-out')}
          style={{
            transition: animated ? 'stroke-dashoffset 1s ease-out' : 'none',
          }}
        />
      </svg>

      {/* Center Content */}
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{
          width: size,
          height: size,
        }}
      >
        {showPercentage && (
          <div className="text-center">
            <div 
              className="font-bold"
              style={{ 
                fontSize: `${size / 4}px`,
                lineHeight: 1,
                color: color,
              }}
            >
              {percentage.toFixed(0)}%
            </div>
            {label && (
              <div 
                className="text-gray-600 font-medium mt-1"
                style={{ fontSize: `${size / 12}px` }}
              >
                {label}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressCircle;
