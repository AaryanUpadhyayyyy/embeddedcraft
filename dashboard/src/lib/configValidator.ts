/**
 * Configuration validation for production-ready config loading
 * Validates and sanitizes campaign configs, layers, and bottom sheet configs
 */

import type { Layer, BottomSheetConfig, CampaignEditor } from '@/store/useEditorStore';
import { validateNumericInput, validateColor, validateOpacity } from './validation';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitized?: any;
}

/**
 * Validate and sanitize a layer object
 */
export function validateLayer(layer: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!layer.id || typeof layer.id !== 'string') {
    errors.push('Layer missing valid id');
  }
  if (!layer.type || typeof layer.type !== 'string') {
    errors.push('Layer missing valid type');
  }
  if (!layer.name || typeof layer.name !== 'string') {
    warnings.push(`Layer ${layer.id} missing name, using default`);
    layer.name = layer.type || 'Unnamed Layer';
  }

  // Validate visibility
  if (typeof layer.visible !== 'boolean') {
    warnings.push(`Layer ${layer.id} has invalid visible property`);
    layer.visible = true;
  }

  // Validate locked
  if (typeof layer.locked !== 'boolean') {
    layer.locked = false;
  }

  // Validate zIndex
  if (typeof layer.zIndex !== 'number' || !isFinite(layer.zIndex)) {
    warnings.push(`Layer ${layer.id} has invalid zIndex`);
    layer.zIndex = 0;
  }

  // Validate position
  if (!layer.position || typeof layer.position !== 'object') {
    layer.position = { x: 0, y: 0 };
  } else {
    layer.position.x = validateNumericInput(layer.position.x, { defaultValue: 0 });
    layer.position.y = validateNumericInput(layer.position.y, { defaultValue: 0 });
  }

  // Validate size
  if (!layer.size || typeof layer.size !== 'object') {
    layer.size = { width: 'auto', height: 'auto' };
  }

  // Validate children array
  if (!Array.isArray(layer.children)) {
    layer.children = [];
  }

  // Validate parent
  if (layer.parent !== null && typeof layer.parent !== 'string') {
    warnings.push(`Layer ${layer.id} has invalid parent reference`);
    layer.parent = null;
  }

  // Validate content
  if (!layer.content || typeof layer.content !== 'object') {
    layer.content = {};
  }

  // Validate style
  if (!layer.style || typeof layer.style !== 'object') {
    layer.style = {};
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitized: layer
  };
}

/**
 * Validate bottom sheet configuration
 */
export function validateBottomSheetConfig(config: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config || typeof config !== 'object') {
    return {
      isValid: false,
      errors: ['Config is null or not an object'],
      warnings: [],
      sanitized: getDefaultBottomSheetConfig()
    };
  }

  // Validate height
  if (typeof config.height === 'number') {
    config.height = validateNumericInput(config.height, { min: 50, max: 1000, defaultValue: 400 });
  } else if (typeof config.height !== 'string' || 
             !['auto', 'half', 'full'].includes(config.height)) {
    if (typeof config.height === 'string' && (config.height.includes('%') || config.height.includes('vh'))) {
      // Valid percentage/vh string, keep it
    } else {
      warnings.push('Invalid height value, using auto');
      config.height = 'auto';
    }
  }

  // Validate booleans
  if (typeof config.dragHandle !== 'boolean') {
    config.dragHandle = true;
  }
  if (typeof config.swipeToDismiss !== 'boolean') {
    config.swipeToDismiss = true;
  }

  // Validate colors
  config.backgroundColor = validateColor(config.backgroundColor, '#FFFFFF');

  // Validate border radius
  if (!config.borderRadius || typeof config.borderRadius !== 'object') {
    config.borderRadius = { topLeft: 16, topRight: 16 };
  } else {
    config.borderRadius.topLeft = validateNumericInput(config.borderRadius.topLeft, { min: 0, max: 50, defaultValue: 16 });
    config.borderRadius.topRight = validateNumericInput(config.borderRadius.topRight, { min: 0, max: 50, defaultValue: 16 });
    if (config.borderRadius.bottomLeft !== undefined) {
      config.borderRadius.bottomLeft = validateNumericInput(config.borderRadius.bottomLeft, { min: 0, max: 50, defaultValue: 0 });
    }
    if (config.borderRadius.bottomRight !== undefined) {
      config.borderRadius.bottomRight = validateNumericInput(config.borderRadius.bottomRight, { min: 0, max: 50, defaultValue: 0 });
    }
  }

  // Validate elevation
  if (typeof config.elevation !== 'number' || config.elevation < 0 || config.elevation > 5) {
    config.elevation = 2;
  }

  // Validate overlay
  if (!config.overlay || typeof config.overlay !== 'object') {
    config.overlay = {
      enabled: true,
      opacity: 0.5,
      blur: 0,
      color: '#000000',
      dismissOnClick: true
    };
  } else {
    if (typeof config.overlay.enabled !== 'boolean') config.overlay.enabled = true;
    config.overlay.opacity = validateOpacity(config.overlay.opacity, 0.5);
    config.overlay.blur = validateNumericInput(config.overlay.blur, { min: 0, max: 20, defaultValue: 0 });
    config.overlay.color = validateColor(config.overlay.color, '#000000');
    if (typeof config.overlay.dismissOnClick !== 'boolean') config.overlay.dismissOnClick = true;
  }

  // Validate animation
  if (!config.animation || typeof config.animation !== 'object') {
    config.animation = {
      type: 'slide',
      duration: 300,
      easing: 'ease-out'
    };
  } else {
    if (!['slide', 'fade', 'scale'].includes(config.animation.type)) {
      config.animation.type = 'slide';
    }
    config.animation.duration = validateNumericInput(config.animation.duration, { min: 100, max: 2000, defaultValue: 300 });
    if (!config.animation.easing) {
      config.animation.easing = 'ease-out';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitized: config
  };
}

/**
 * Validate entire campaign configuration
 */
export function validateCampaignConfig(campaign: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!campaign || typeof campaign !== 'object') {
    return {
      isValid: false,
      errors: ['Campaign config is null or not an object'],
      warnings: [],
      sanitized: null
    };
  }

  // Validate required fields
  if (!campaign.id) {
    errors.push('Campaign missing id');
  }
  if (!campaign.name) {
    warnings.push('Campaign missing name');
    campaign.name = 'Untitled Campaign';
  }

  // Validate layers
  if (!Array.isArray(campaign.layers)) {
    errors.push('Campaign layers is not an array');
    campaign.layers = [];
  } else {
    const layerResults = campaign.layers.map((layer: any) => validateLayer(layer));
    layerResults.forEach((result, index) => {
      if (!result.isValid) {
        errors.push(`Layer ${index}: ${result.errors.join(', ')}`);
      }
      warnings.push(...result.warnings);
      campaign.layers[index] = result.sanitized;
    });
  }

  // Validate bottom sheet config if present
  if (campaign.bottomSheetConfig) {
    const configResult = validateBottomSheetConfig(campaign.bottomSheetConfig);
    if (!configResult.isValid) {
      errors.push(`Bottom sheet config: ${configResult.errors.join(', ')}`);
    }
    warnings.push(...configResult.warnings);
    campaign.bottomSheetConfig = configResult.sanitized;
  }

  // Validate history
  if (!Array.isArray(campaign.history)) {
    warnings.push('Campaign history is not an array, resetting');
    campaign.history = [campaign.layers];
  }

  // Validate historyIndex
  if (typeof campaign.historyIndex !== 'number' || !isFinite(campaign.historyIndex)) {
    campaign.historyIndex = campaign.history.length - 1;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitized: campaign
  };
}

/**
 * Get default bottom sheet config
 */
function getDefaultBottomSheetConfig(): BottomSheetConfig {
  return {
    height: 'auto',
    dragHandle: true,
    swipeToDismiss: true,
    backgroundColor: '#FFFFFF',
    borderRadius: { topLeft: 16, topRight: 16 },
    elevation: 2,
    overlay: {
      enabled: true,
      opacity: 0.5,
      blur: 0,
      color: '#000000',
      dismissOnClick: true,
    },
    animation: {
      type: 'slide',
      duration: 300,
      easing: 'ease-out',
    },
  };
}

/**
 * Safe config loader with validation
 */
export function loadConfigSafely(configData: any): ValidationResult {
  try {
    // Parse if string
    const parsed = typeof configData === 'string' ? JSON.parse(configData) : configData;
    
    // Validate
    const result = validateCampaignConfig(parsed);
    
    return result;
  } catch (error) {
    return {
      isValid: false,
      errors: [`Failed to parse config: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
      sanitized: null
    };
  }
}
