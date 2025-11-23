import type { Component, Position, ValidationResult } from './types';
import { ComponentSchema, PositionSchema } from './types';
import { clampPosition, clampDimensions, normalizeRotation } from './geometry';

// ============================================================================
// Component Validation
// ============================================================================

/**
 * Validate and sanitize a component using Zod schema.
 * Also applies geometric constraints (clamping, normalization).
 */
export function validateComponent(
  component: Partial<Component>,
  canvasWidth = 375,
  canvasHeight = 800
): ValidationResult<Component> {
  try {
    // Parse with Zod schema
    const parsed = ComponentSchema.parse(component);

    // Apply geometric validation
    const validatedPosition = validatePosition(
      parsed.position,
      canvasWidth,
      canvasHeight
    );

    if (!validatedPosition.success || !validatedPosition.data) {
      return {
        success: false,
        error: validatedPosition.error,
      };
    }

    return {
      success: true,
      data: {
        ...parsed,
        position: validatedPosition.data,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Invalid component data',
        field: error.path?.[0],
      },
    };
  }
}

/**
 * Validate and sanitize position data.
 * Ensures values are within valid ranges and clamped to canvas bounds.
 */
export function validatePosition(
  position: Partial<Position>,
  canvasWidth = 375,
  canvasHeight = 800
): ValidationResult<Position> {
  try {
    // Parse with Zod schema (applies defaults)
    const parsed = PositionSchema.parse(position);

    // Clamp dimensions
    const { width, height } = clampDimensions(
      parsed.width,
      parsed.height,
      20,  // minWidth
      Math.min(800, canvasWidth),  // maxWidth
      20,  // minHeight
      Math.min(800, canvasHeight)  // maxHeight
    );

    // Clamp position (if absolute layout)
    let x = parsed.x || 0;
    let y = parsed.y || 0;

    if (parsed.type === 'absolute') {
      const clamped = clampPosition(x, y, width, height, canvasWidth, canvasHeight);
      x = clamped.x;
      y = clamped.y;
    }

    // Normalize rotation
    const rotation = normalizeRotation(parsed.rotation || 0);

    // Clamp zIndex
    const zIndex = Math.max(1, Math.min(100, parsed.zIndex));

    return {
      success: true,
      data: {
        ...parsed,
        x,
        y,
        width,
        height,
        rotation,
        zIndex,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Invalid position data',
        field: error.path?.[0],
      },
    };
  }
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a valid number (not NaN, not Infinity).
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && isFinite(value);
}

/**
 * Check if a value is a valid hex color.
 */
export function isValidHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value);
}

/**
 * Convert string or number to valid number, with fallback.
 */
export function toNumber(value: unknown, fallback: number): number {
  if (isValidNumber(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (isValidNumber(parsed)) return parsed;
  }
  return fallback;
}

/**
 * Convert string or number to valid integer, with fallback.
 */
export function toInteger(value: unknown, fallback: number): number {
  if (isValidNumber(value)) return Math.round(value);
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (isValidNumber(parsed)) return parsed;
  }
  return fallback;
}

/**
 * Ensure hex color format, with fallback.
 */
export function toHexColor(value: unknown, fallback: string): string {
  if (isValidHexColor(value)) return value;
  return fallback;
}

// ============================================================================
// Sanitization Helpers
// ============================================================================

/**
 * Sanitize component ID to prevent injection attacks.
 */
export function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Sanitize text content (remove script tags, XSS prevention).
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .trim();
}

/**
 * Validate and sanitize URL.
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Only allow http, https, and data URLs
    if (['http:', 'https:', 'data:'].includes(parsed.protocol)) {
      return url;
    }
    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// Batch Validation
// ============================================================================

/**
 * Validate an array of components.
 * Returns valid components and a list of errors.
 */
export function validateComponents(
  components: Partial<Component>[],
  canvasWidth = 375,
  canvasHeight = 800
): {
  validComponents: Component[];
  errors: Array<{ index: number; error: string }>;
} {
  const validComponents: Component[] = [];
  const errors: Array<{ index: number; error: string }> = [];

  components.forEach((component, index) => {
    const result = validateComponent(component, canvasWidth, canvasHeight);
    if (result.success && result.data) {
      validComponents.push(result.data);
    } else {
      errors.push({
        index,
        error: result.error?.message || 'Unknown validation error',
      });
    }
  });

  return { validComponents, errors };
}

// ============================================================================
// Deep Validation (for imported JSON)
// ============================================================================

/**
 * Deeply validate an imported config object.
 * Used when importing JSON to ensure data integrity.
 */
export function validateImportedConfig(data: unknown): ValidationResult<{
  components: Component[];
  canvasHeight: number;
  layoutType: 'absolute' | 'flex';
}> {
  try {
    // Basic structure check
    if (typeof data !== 'object' || data === null) {
      throw new Error('Config must be an object');
    }

    const config = data as any;

    // Validate components array
    if (!Array.isArray(config.components)) {
      throw new Error('Config must have a components array');
    }

    // Validate canvas height
    const canvasHeight = toNumber(config.canvasHeight, 80);
    if (canvasHeight < 50 || canvasHeight > 800) {
      throw new Error('Canvas height must be between 50 and 800');
    }

    // Validate layout type
    const layoutType = config.layout?.type === 'flex' ? 'flex' : 'absolute';

    // Validate each component
    const { validComponents, errors } = validateComponents(
      config.components,
      375,
      canvasHeight
    );

    if (errors.length > 0) {
      console.warn('Some components failed validation:', errors);
    }

    return {
      success: true,
      data: {
        components: validComponents,
        canvasHeight,
        layoutType,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to validate imported config',
      },
    };
  }
}
