import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string | Date;
  showIcon?: boolean;
  format?: 'full' | 'short' | 'compact';
  urgentThreshold?: number; // Minutes remaining to show urgency
  onExpire?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

/**
 * CountdownTimer Component - Real-time countdown timer
 * 
 * Features:
 * - Live countdown (updates every second)
 * - Multiple formats (full/short/compact)
 * - Urgency indicators (color changes when time is low)
 * - Auto-hide on expiry
 * - Callback on expiry
 * 
 * Use Cases:
 * - MakeMyTrip: "Offer ends in 2h 45m"
 * - Flash sales
 * - Limited-time offers
 * - Event countdowns
 * 
 * Usage:
 * ```tsx
 * <CountdownTimer 
 *   targetDate="2024-12-31T23:59:59"
 *   format="short"
 *   urgentThreshold={60}
 *   onExpire={() => console.log('Offer expired!')}
 * />
 * ```
 */
export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  showIcon = true,
  format = 'short',
  urgentThreshold = 60, // 60 minutes
  onExpire,
  className,
  style,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        if (onExpire) onExpire();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        total: difference,
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  // Don't render if expired
  if (timeRemaining.total <= 0) {
    return null;
  }

  // Check if urgent (less than threshold minutes remaining)
  const totalMinutes = timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes;
  const isUrgent = totalMinutes <= urgentThreshold;

  const formatTime = () => {
    const { days, hours, minutes, seconds } = timeRemaining;

    switch (format) {
      case 'full':
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
      
      case 'compact':
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m ${seconds}s`;
      
      case 'short':
      default:
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (parts.length === 0 || (parts.length < 2 && seconds > 0)) {
          parts.push(`${seconds}s`);
        }
        return parts.join(' ');
    }
  };

  return (
    <div
      className={cn(
        'countdown-timer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm',
        isUrgent 
          ? 'bg-red-50 text-red-700 border border-red-200' 
          : 'bg-blue-50 text-blue-700 border border-blue-200',
        className
      )}
      style={style}
    >
      {showIcon && (
        <Clock className={cn(
          'w-4 h-4',
          isUrgent && 'animate-pulse'
        )} />
      )}
      <span>
        {isUrgent && '⏰ '}
        Ends in {formatTime()}
      </span>
    </div>
  );
};

export default CountdownTimer;
