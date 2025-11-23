/**
 * Input validation utilities for production-ready numeric inputs
 * Handles edge cases: NaN, Infinity, out-of-range values
 */

export interface NumericValidationOptions {
  min?: number;
  max?: number;
  allowFloat?: boolean;
  defaultValue?: number;
}

/**
 * Safely parse and validate numeric input
 * @param value - Raw input value (string or number)
 * @param options - Validation constraints
 * @returns Validated number or default value
 */
export function validateNumericInput(
  value: string | number,
  options: NumericValidationOptions = {}
): number {
  const {
    min,
    max,
    allowFloat = false,
    defaultValue = 0
  } = options;

  // Convert to number
  let num: number;
  if (typeof value === 'string') {
    num = allowFloat ? parseFloat(value) : parseInt(value, 10);
  } else {
    num = value;
  }

  // Check for invalid numbers
  if (isNaN(num) || !isFinite(num)) {
    return defaultValue;
  }

  // Apply constraints
  if (min !== undefined && num < min) {
    return min;
  }
  if (max !== undefined && num > max) {
    return max;
  }

  return num;
}

/**
 * Create a safe numeric input change handler
 * @param callback - Function to call with validated value
 * @param options - Validation constraints
 * @returns Event handler function
 */
export function createNumericInputHandler(
  callback: (value: number) => void,
  options: NumericValidationOptions = {}
): (e: React.ChangeEvent<HTMLInputElement>) => void {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const validated = validateNumericInput(e.target.value, options);
    callback(validated);
  };
}

/**
 * Validate color hex string
 * @param color - Color value to validate
 * @param defaultColor - Fallback color if invalid
 * @returns Valid hex color
 */
export function validateColor(color: string, defaultColor: string = '#000000'): string {
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  return hexRegex.test(color) ? color : defaultColor;
}

/**
 * Validate percentage value (0-100)
 * @param value - Value to validate
 * @param defaultValue - Fallback value
 * @returns Clamped percentage
 */
export function validatePercentage(value: number, defaultValue: number = 0): number {
  return validateNumericInput(value, { min: 0, max: 100, defaultValue });
}

/**
 * Validate opacity value (0-1)
 * @param value - Value to validate
 * @param defaultValue - Fallback value
 * @returns Clamped opacity
 */
export function validateOpacity(value: number, defaultValue: number = 1): number {
  return validateNumericInput(value, { min: 0, max: 1, allowFloat: true, defaultValue });
}

/**
 * Validate dimension value (pixels)
 * @param value - Value to validate
 * @param options - Min/max constraints
 * @returns Valid pixel value
 */
export function validateDimension(
  value: number,
  options: { min?: number; max?: number } = {}
): number {
  return validateNumericInput(value, {
    min: options.min ?? 0,
    max: options.max,
    defaultValue: 0
  });
}
