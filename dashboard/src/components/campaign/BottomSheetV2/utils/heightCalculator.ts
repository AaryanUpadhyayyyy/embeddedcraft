import type { Component } from '../core/types';
import { getRotatedBounds } from '../core/geometry';
import { TEMPLATE_PADDING } from '../core/constants';

/**
 * Calculate the minimum required canvas height to fit all components.
 * Accounts for:
 * - Component positions (x, y)
 * - Component dimensions (width, height)
 * - Component rotation (bounding box expansion)
 * - Top and bottom padding
 * 
 * @param components - Array of components to calculate height for
 * @param padding - Total padding (top + bottom), defaults to 80px
 * @returns Required canvas height in pixels
 */
export function calculateRequiredHeight(
  components: Component[],
  padding = TEMPLATE_PADDING.TOTAL
): number {
  if (components.length === 0) {
    return 80; // Minimum height for empty canvas
  }

  let maxBottom = 0;

  for (const comp of components) {
    // Skip invisible components
    if (comp.visible === false) continue;

    const x = comp.position.x || 0;
    const y = comp.position.y || 0;
    const width = comp.position.width;
    const height = comp.position.height;
    const rotation = comp.position.rotation || 0;

    // Get rotation-aware bounding box
    const bounds = getRotatedBounds(x, y, width, height, rotation);
    
    // Calculate bottom edge of this component
    const componentBottom = bounds.y + bounds.height;
    
    // Track maximum bottom position
    maxBottom = Math.max(maxBottom, componentBottom);
  }

  // Add padding and round up
  return Math.ceil(maxBottom + padding);
}

/**
 * Calculate required height with safety margin.
 * Adds extra padding to ensure components don't touch edges.
 */
export function calculateSafeHeight(
  components: Component[],
  extraPadding = 20
): number {
  const baseHeight = calculateRequiredHeight(components);
  return baseHeight + extraPadding;
}

/**
 * Check if components fit within a given canvas height.
 */
export function doComponentsFit(
  components: Component[],
  canvasHeight: number,
  padding = TEMPLATE_PADDING.TOTAL
): boolean {
  const requiredHeight = calculateRequiredHeight(components, padding);
  return requiredHeight <= canvasHeight;
}

/**
 * Calculate scale factor to fit components in a target height.
 */
export function calculateScaleFactor(
  components: Component[],
  targetHeight: number,
  padding = TEMPLATE_PADDING.TOTAL
): number {
  const requiredHeight = calculateRequiredHeight(components, padding);
  
  if (requiredHeight === 0) return 1;
  
  // Calculate scale factor, ensuring it's positive
  const scaleFactor = (targetHeight - padding) / (requiredHeight - padding);
  
  // Clamp to reasonable range (10% - 200%)
  return Math.max(0.1, Math.min(2, scaleFactor));
}

/**
 * Get the widest component to ensure canvas width is adequate.
 * (Canvas width is usually fixed at 375px, but this can help with validation)
 */
export function calculateRequiredWidth(components: Component[]): number {
  if (components.length === 0) return 375;

  let maxRight = 0;

  for (const comp of components) {
    if (comp.visible === false) continue;

    const x = comp.position.x || 0;
    const y = comp.position.y || 0;
    const width = comp.position.width;
    const height = comp.position.height;
    const rotation = comp.position.rotation || 0;

    const bounds = getRotatedBounds(x, y, width, height, rotation);
    const componentRight = bounds.x + bounds.width;
    
    maxRight = Math.max(maxRight, componentRight);
  }

  return Math.ceil(maxRight + 40); // Add 40px padding
}

/**
 * Analyze component layout and return statistics.
 * Useful for debugging and validation.
 */
export function analyzeLayout(components: Component[]) {
  const visibleComponents = components.filter(c => c.visible !== false);
  
  if (visibleComponents.length === 0) {
    return {
      componentCount: 0,
      requiredHeight: 80,
      requiredWidth: 375,
      maxZ: 0,
      rotatedCount: 0,
      overflowingComponents: [],
    };
  }

  let maxBottom = 0;
  let maxRight = 0;
  let maxZ = 0;
  let rotatedCount = 0;
  const overflowingComponents: string[] = [];

  for (const comp of visibleComponents) {
    const x = comp.position.x || 0;
    const y = comp.position.y || 0;
    const width = comp.position.width;
    const height = comp.position.height;
    const rotation = comp.position.rotation || 0;
    const zIndex = comp.position.zIndex || 1;

    if (rotation !== 0) rotatedCount++;

    const bounds = getRotatedBounds(x, y, width, height, rotation);
    
    maxBottom = Math.max(maxBottom, bounds.y + bounds.height);
    maxRight = Math.max(maxRight, bounds.x + bounds.width);
    maxZ = Math.max(maxZ, zIndex);

    // Check for overflow (assuming 375px width canvas)
    if (bounds.x + bounds.width > 375 || bounds.y + bounds.height > 800) {
      overflowingComponents.push(comp.id);
    }
  }

  return {
    componentCount: visibleComponents.length,
    requiredHeight: Math.ceil(maxBottom + TEMPLATE_PADDING.TOTAL),
    requiredWidth: Math.ceil(maxRight + 40),
    maxZ,
    rotatedCount,
    overflowingComponents,
  };
}
