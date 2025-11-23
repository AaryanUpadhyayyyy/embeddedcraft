import type { BoundingBox, DragBounds } from './types';

// ============================================================================
// Rotation-Aware Bounding Box Calculation
// ============================================================================

/**
 * Calculate the axis-aligned bounding box (AABB) for a rotated rectangle.
 * This is the smallest rectangle that fully contains the rotated component.
 * 
 * @param x - Original X position (top-left corner)
 * @param y - Original Y position (top-left corner)
 * @param width - Original width before rotation
 * @param height - Original height before rotation
 * @param rotation - Rotation angle in degrees (0-360)
 * @returns Axis-aligned bounding box { x, y, width, height }
 */
export function getRotatedBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number
): BoundingBox {
  // No rotation - return original bounds
  if (rotation === 0 || Math.abs(rotation) === 360) {
    return { x, y, width, height };
  }

  // Convert degrees to radians
  const rad = (rotation * Math.PI) / 180;
  
  // Calculate absolute values of sin and cos
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));

  // Calculate bounding box dimensions
  // Formula: rotated width = w*|cos(θ)| + h*|sin(θ)|
  //          rotated height = h*|cos(θ)| + w*|sin(θ)|
  const rotatedWidth = width * cos + height * sin;
  const rotatedHeight = height * cos + width * sin;

  return {
    x,
    y,
    width: rotatedWidth,
    height: rotatedHeight,
  };
}

/**
 * Calculate the bottom-right corner of a bounding box.
 */
export function getBottomRight(bounds: BoundingBox): { x: number; y: number } {
  return {
    x: bounds.x + bounds.width,
    y: bounds.y + bounds.height,
  };
}

// ============================================================================
// Position Clamping & Validation
// ============================================================================

/**
 * Clamp a position to stay within canvas bounds.
 * Ensures the component doesn't go off-screen.
 * 
 * @param x - Desired X position
 * @param y - Desired Y position
 * @param componentWidth - Width of the component (after rotation if applicable)
 * @param componentHeight - Height of the component (after rotation if applicable)
 * @param canvasWidth - Canvas width (usually 375px for mobile)
 * @param canvasHeight - Canvas height (user-adjustable)
 * @param padding - Optional padding from edges (default 0)
 * @returns Clamped position { x, y }
 */
export function clampPosition(
  x: number,
  y: number,
  componentWidth: number,
  componentHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  padding = 0
): { x: number; y: number } {
  return {
    x: Math.max(padding, Math.min(canvasWidth - componentWidth - padding, x)),
    y: Math.max(padding, Math.min(canvasHeight - componentHeight - padding, y)),
  };
}

/**
 * Clamp dimensions to valid range.
 */
export function clampDimensions(
  width: number,
  height: number,
  minWidth = 20,
  maxWidth = 800,
  minHeight = 20,
  maxHeight = 800
): { width: number; height: number } {
  return {
    width: Math.max(minWidth, Math.min(maxWidth, width)),
    height: Math.max(minHeight, Math.min(maxHeight, height)),
  };
}

/**
 * Normalize rotation to 0-360 range.
 */
export function normalizeRotation(rotation: number): number {
  const normalized = rotation % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

// ============================================================================
// Drag Bounds Calculation
// ============================================================================

/**
 * Calculate drag bounds for react-draggable.
 * Accounts for canvas dimensions and component size.
 * 
 * @param componentWidth - Width of the component
 * @param componentHeight - Height of the component
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 * @param handleBarHeight - Height of bottom sheet handle bar (default 32px)
 * @returns DragBounds object for react-draggable
 */
export function calculateDragBounds(
  componentWidth: number,
  componentHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  handleBarHeight = 32
): DragBounds {
  return {
    left: 0,
    top: 0,
    right: canvasWidth - componentWidth,
    bottom: canvasHeight - componentHeight - handleBarHeight,
  };
}

// ============================================================================
// Collision Detection
// ============================================================================

/**
 * Check if two bounding boxes overlap.
 */
export function doBoxesOverlap(box1: BoundingBox, box2: BoundingBox): boolean {
  return !(
    box1.x + box1.width < box2.x ||
    box2.x + box2.width < box1.x ||
    box1.y + box1.height < box2.y ||
    box2.y + box2.height < box1.y
  );
}

/**
 * Check if a point is inside a bounding box.
 */
export function isPointInBox(
  pointX: number,
  pointY: number,
  box: BoundingBox
): boolean {
  return (
    pointX >= box.x &&
    pointX <= box.x + box.width &&
    pointY >= box.y &&
    pointY <= box.y + box.height
  );
}

// ============================================================================
// Snap to Grid
// ============================================================================

/**
 * Snap a value to the nearest grid line.
 * 
 * @param value - Value to snap
 * @param gridSize - Grid cell size (default 20px)
 * @returns Snapped value
 */
export function snapToGrid(value: number, gridSize = 20): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Snap a position to grid.
 */
export function snapPositionToGrid(
  x: number,
  y: number,
  gridSize = 20
): { x: number; y: number } {
  return {
    x: snapToGrid(x, gridSize),
    y: snapToGrid(y, gridSize),
  };
}

// ============================================================================
// Alignment Helpers
// ============================================================================

/**
 * Calculate X position to align component to the left edge.
 */
export function alignLeft(padding = 0): number {
  return padding;
}

/**
 * Calculate X position to center component horizontally.
 */
export function alignCenter(componentWidth: number, canvasWidth: number): number {
  return (canvasWidth - componentWidth) / 2;
}

/**
 * Calculate X position to align component to the right edge.
 */
export function alignRight(
  componentWidth: number,
  canvasWidth: number,
  padding = 0
): number {
  return canvasWidth - componentWidth - padding;
}

/**
 * Calculate Y position to align component to the top edge.
 */
export function alignTop(padding = 0): number {
  return padding;
}

/**
 * Calculate Y position to center component vertically.
 */
export function alignMiddle(
  componentHeight: number,
  canvasHeight: number
): number {
  return (canvasHeight - componentHeight) / 2;
}

/**
 * Calculate Y position to align component to the bottom edge.
 */
export function alignBottom(
  componentHeight: number,
  canvasHeight: number,
  padding = 0
): number {
  return canvasHeight - componentHeight - padding;
}

// ============================================================================
// Distance Calculations
// ============================================================================

/**
 * Calculate Euclidean distance between two points.
 */
export function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Find the nearest snap point for alignment guides.
 * Used for "smart guides" when dragging components.
 */
export function findNearestSnapPoint(
  value: number,
  snapPoints: number[],
  threshold = 10
): number | null {
  let nearest: number | null = null;
  let minDistance = threshold;

  for (const point of snapPoints) {
    const dist = Math.abs(value - point);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = point;
    }
  }

  return nearest;
}

// ============================================================================
// Component Center Point
// ============================================================================

/**
 * Get the center point of a component.
 */
export function getCenterPoint(bounds: BoundingBox): { x: number; y: number } {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
}
