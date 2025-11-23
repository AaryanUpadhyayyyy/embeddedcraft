/**
 * BottomSheetV2 - Main Export
 * 
 * Feature flag support:
 * - Export both V1 (legacy) and V2 (new)
 * - Allow gradual migration
 * - A/B testing capability
 */

export { BottomSheetEditor } from './BottomSheetEditor';
export { default as ComponentRenderer } from './components/Canvas/ComponentRenderer';
export { useBottomSheetState } from './hooks/useBottomSheetState';

// Re-export types for external use
export type {
  Component,
  ComponentType,
  Position,
  BottomSheetConfig,
  Template,
} from './core/types';

// Re-export utilities
export * from './core/geometry';
export * from './core/validation';
export * from './utils/heightCalculator';
