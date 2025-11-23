import type { Component } from '../core/types';

/**
 * Alignment Guides - Smart snapping system like Figma
 * 
 * Detects when a dragging component aligns with other components
 * and provides visual guides + automatic snapping.
 */

export interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number; // x for vertical, y for horizontal
  matchedComponents: string[]; // IDs of components that align
}

export interface AlignmentResult {
  guides: AlignmentGuide[];
  snapPosition: { x?: number; y?: number } | null;
}

const SNAP_THRESHOLD = 5; // pixels

/**
 * Get all edge positions for a component
 */
function getComponentEdges(component: Component) {
  const x = component.position.x || 0;
  const y = component.position.y || 0;
  const width = component.position.width || 0;
  const height = component.position.height || 0;

  return {
    left: x,
    right: x + width,
    centerX: x + width / 2,
    top: y,
    bottom: y + height,
    centerY: y + height / 2,
  };
}

/**
 * Detect alignment guides for a component being dragged
 * 
 * @param draggingComponent - The component being moved
 * @param otherComponents - All other components on canvas
 * @param threshold - Snap distance in pixels (default: 5)
 * @returns Alignment guides and suggested snap position
 */
export function detectAlignmentGuides(
  draggingComponent: Component,
  otherComponents: Component[],
  threshold: number = SNAP_THRESHOLD
): AlignmentResult {
  const guides: AlignmentGuide[] = [];
  const snapPosition: { x?: number; y?: number } = {};

  const draggingEdges = getComponentEdges(draggingComponent);

  // Check against each other component
  for (const other of otherComponents) {
    if (other.id === draggingComponent.id) continue;
    
    const otherEdges = getComponentEdges(other);

    // Vertical alignment checks (left, center, right)
    const verticalChecks = [
      { dragging: draggingEdges.left, other: otherEdges.left, type: 'left' },
      { dragging: draggingEdges.centerX, other: otherEdges.centerX, type: 'center' },
      { dragging: draggingEdges.right, other: otherEdges.right, type: 'right' },
      { dragging: draggingEdges.left, other: otherEdges.right, type: 'left-to-right' },
      { dragging: draggingEdges.right, other: otherEdges.left, type: 'right-to-left' },
    ];

    for (const check of verticalChecks) {
      const diff = Math.abs(check.dragging - check.other);
      if (diff <= threshold) {
        // Add guide if not already present
        const existingGuide = guides.find(
          g => g.type === 'vertical' && Math.abs(g.position - check.other) < 1
        );
        
        if (!existingGuide) {
          guides.push({
            type: 'vertical',
            position: check.other,
            matchedComponents: [other.id],
          });
        } else {
          existingGuide.matchedComponents.push(other.id);
        }

        // Calculate snap position for X
        if (snapPosition.x === undefined) {
          if (check.type === 'left') {
            snapPosition.x = check.other;
          } else if (check.type === 'center') {
            snapPosition.x = check.other - (draggingComponent.position.width || 0) / 2;
          } else if (check.type === 'right') {
            snapPosition.x = check.other - (draggingComponent.position.width || 0);
          } else if (check.type === 'left-to-right') {
            snapPosition.x = check.other;
          } else if (check.type === 'right-to-left') {
            snapPosition.x = check.other - (draggingComponent.position.width || 0);
          }
        }
      }
    }

    // Horizontal alignment checks (top, middle, bottom)
    const horizontalChecks = [
      { dragging: draggingEdges.top, other: otherEdges.top, type: 'top' },
      { dragging: draggingEdges.centerY, other: otherEdges.centerY, type: 'middle' },
      { dragging: draggingEdges.bottom, other: otherEdges.bottom, type: 'bottom' },
      { dragging: draggingEdges.top, other: otherEdges.bottom, type: 'top-to-bottom' },
      { dragging: draggingEdges.bottom, other: otherEdges.top, type: 'bottom-to-top' },
    ];

    for (const check of horizontalChecks) {
      const diff = Math.abs(check.dragging - check.other);
      if (diff <= threshold) {
        // Add guide if not already present
        const existingGuide = guides.find(
          g => g.type === 'horizontal' && Math.abs(g.position - check.other) < 1
        );
        
        if (!existingGuide) {
          guides.push({
            type: 'horizontal',
            position: check.other,
            matchedComponents: [other.id],
          });
        } else {
          existingGuide.matchedComponents.push(other.id);
        }

        // Calculate snap position for Y
        if (snapPosition.y === undefined) {
          if (check.type === 'top') {
            snapPosition.y = check.other;
          } else if (check.type === 'middle') {
            snapPosition.y = check.other - (draggingComponent.position.height || 0) / 2;
          } else if (check.type === 'bottom') {
            snapPosition.y = check.other - (draggingComponent.position.height || 0);
          } else if (check.type === 'top-to-bottom') {
            snapPosition.y = check.other;
          } else if (check.type === 'bottom-to-top') {
            snapPosition.y = check.other - (draggingComponent.position.height || 0);
          }
        }
      }
    }
  }

  return {
    guides,
    snapPosition: guides.length > 0 ? snapPosition : null,
  };
}

/**
 * Apply snap position to component position
 * 
 * @param currentPosition - Current drag position
 * @param snapPosition - Suggested snap position from alignment detection
 * @returns Final position with snapping applied
 */
export function applySnap(
  currentPosition: { x: number; y: number },
  snapPosition: { x?: number; y?: number } | null
): { x: number; y: number } {
  if (!snapPosition) return currentPosition;

  return {
    x: snapPosition.x !== undefined ? snapPosition.x : currentPosition.x,
    y: snapPosition.y !== undefined ? snapPosition.y : currentPosition.y,
  };
}
