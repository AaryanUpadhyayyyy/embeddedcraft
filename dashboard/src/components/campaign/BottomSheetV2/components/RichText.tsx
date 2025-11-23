import React from 'react';
import { cn } from '@/lib/utils';

interface RichTextProps {
  content: string;
  className?: string;
  allowedTags?: string[];
}

/**
 * RichText Component - Render HTML with inline formatting
 * 
 * Features:
 * - HTML rendering with dangerouslySetInnerHTML
 * - Mixed styles (bold, italic, colors, sizes)
 * - Security: whitelist allowed tags
 * - Inline formatting support
 * 
 * Usage:
 * ```tsx
 * <RichText content="Up to <b>30% OFF*</b> on <span style='color: blue'>Hotels</span>" />
 * <RichText content="<h2>Big Sale</h2><p>Limited time only!</p>" />
 * ```
 * 
 * Security Note:
 * - Sanitize user-generated content before passing
 * - Use allowedTags to restrict HTML elements
 * - For production, integrate DOMPurify library
 */
export const RichText: React.FC<RichTextProps> = ({
  content,
  className,
  allowedTags = ['b', 'i', 'u', 'strong', 'em', 'span', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
}) => {
  // Basic sanitization (for production, use DOMPurify)
  const sanitizeHTML = (html: string): string => {
    // Remove script tags
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove event handlers
    sanitized = sanitized.replace(/on\w+="[^"]*"/g, '');
    sanitized = sanitized.replace(/on\w+='[^']*'/g, '');
    
    // If allowedTags is provided, filter tags
    if (allowedTags.length > 0) {
      const allowedPattern = allowedTags.join('|');
      const regex = new RegExp(`<(?!\\/?(${allowedPattern})\\b)[^>]+>`, 'gi');
      sanitized = sanitized.replace(regex, '');
    }
    
    return sanitized;
  };

  const sanitizedContent = sanitizeHTML(content);

  return (
    <div
      className={cn('rich-text', className)}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default RichText;
