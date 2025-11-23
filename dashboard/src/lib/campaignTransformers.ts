/**
 * Campaign Model Transformers
 * Converts between rich frontend CampaignEditor model and simplified backend Campaign model
 */

import type { CampaignEditor, Layer, TargetingRule, BottomSheetConfig, DisplayRules } from '@/store/useEditorStore';

// Backend campaign structure (as expected by server)
export interface BackendCampaign {
  id?: string;
  name: string;
  type: string;
  status: 'active' | 'paused' | 'draft';
  trigger: string;
  rules: BackendRule[];
  config: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendRule {
  id: number;
  type: 'attribute' | 'event';
  field: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains';
  value: string | number;
}

/**
 * Transform frontend CampaignEditor to backend Campaign format
 */
export function editorToBackend(campaign: CampaignEditor): BackendCampaign {
  const trigger = extractTriggerFromTargeting(campaign.targeting);
  const rules = transformTargetingRules(campaign.targeting);
  const config = buildConfigFromLayers(campaign);

  return {
    id: campaign.id,
    name: campaign.name,
    type: campaign.nudgeType,
    status: campaign.status || 'draft', // Use campaign status, default to draft
    trigger,
    rules,
    config,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
  };
}

/**
 * Transform backend Campaign to frontend CampaignEditor format
 */
export function backendToEditor(backendCampaign: BackendCampaign): CampaignEditor {
  console.log('backendToEditor: Converting campaign:', backendCampaign.id);
  console.log('backendToEditor: Config:', backendCampaign.config);
  console.log('backendToEditor: Type:', backendCampaign.type);
  
  // Reconstruct layers from config
  const layers = reconstructLayersFromConfig(backendCampaign.config, backendCampaign.type);
  console.log('backendToEditor: Reconstructed layers:', layers.length, layers);
  
  // Reconstruct targeting rules
  const targeting = reconstructTargetingRules(backendCampaign.rules, backendCampaign.trigger);
  
  // Extract bottom sheet config if type is bottomsheet
  const bottomSheetConfig = backendCampaign.type === 'bottomsheet' 
    ? extractBottomSheetConfig(backendCampaign.config)
    : undefined;

  const result = {
    id: backendCampaign.id || `campaign_${Date.now()}`,
    name: backendCampaign.name,
    nudgeType: backendCampaign.type as any,
    experienceType: 'nudges' as const,
    status: backendCampaign.status || 'draft',
    layers,
    targeting,
    bottomSheetConfig,
    displayRules: getDefaultDisplayRules(),
    selectedLayerId: layers[0]?.id || null,
    history: [layers],
    historyIndex: 0,
    createdAt: backendCampaign.createdAt || new Date().toISOString(),
    updatedAt: backendCampaign.updatedAt || new Date().toISOString(),
    lastSaved: backendCampaign.updatedAt || backendCampaign.createdAt || new Date().toISOString(),
    isDirty: false,
  };
  
  console.log('backendToEditor: Final campaign editor:', result);
  return result;
}

/**
 * Extract trigger event from targeting rules
 */
function extractTriggerFromTargeting(targeting: TargetingRule[]): string {
  // Find first event-based rule
  const eventRule = targeting.find(rule => rule.type === 'event');
  return eventRule?.event || 'page_view';
}

/**
 * Transform frontend TargetingRule[] to backend Rule[]
 */
function transformTargetingRules(targeting: TargetingRule[]): BackendRule[] {
  return targeting
    .filter(rule => rule.type === 'user_property' || rule.type === 'event')
    .map((rule, index) => ({
      id: index + 1,
      type: rule.type === 'user_property' ? 'attribute' : 'event',
      field: rule.property || rule.eventProperty || 'unknown',
      operator: mapOperator(rule.operator || 'equals'),
      value: rule.value || '',
    }));
}

/**
 * Map frontend operators to backend operators
 */
function mapOperator(op: string): BackendRule['operator'] {
  const mapping: Record<string, BackendRule['operator']> = {
    'equals': '==',
    'not_equals': '!=',
    'greater_than': '>',
    'less_than': '<',
    'contains': 'contains',
  };
  return mapping[op] || '==';
}

/**
 * Build config object from layers and bottom sheet config
 * Extract ALL styling properties for Flutter renderer
 */
function buildConfigFromLayers(campaign: CampaignEditor): Record<string, any> {
  const config: Record<string, any> = {
    type: campaign.nudgeType,
  };

  // Find key layers
  const textLayer = campaign.layers.find(l => l.type === 'text' && l.name === 'Title');
  const buttonLayer = campaign.layers.find(l => l.type === 'button');
  const imageLayer = campaign.layers.find(l => l.type === 'media');
  const containerLayer = campaign.layers.find(l => l.type === 'container' && l.name === 'Bottom Sheet');
  const handleLayer = campaign.layers.find(l => l.type === 'handle');

  // ========== TEXT LAYER - ALL PROPERTIES ==========
  if (textLayer) {
    config.showTitle = textLayer.visible !== false;
    config.text = textLayer.content.text || '';
    config.textColor = textLayer.content.textColor || '#1A1A1A';
    config.fontSize = textLayer.content.fontSize || 17;
    config.fontWeight = textLayer.content.fontWeight || 'w500';
    config.lineHeight = textLayer.style?.lineHeight || 1.35;
    config.letterSpacing = textLayer.style?.letterSpacing || -0.2;
    config.textAlign = textLayer.content.textAlign || 'center';
    
    // Position
    config.textPositionX = textLayer.position?.x || 0;
    config.textPositionY = textLayer.position?.y || 0;
    config.textPositionType = (textLayer.position as any)?.type || 'relative';
    
    // Background
    config.textBackgroundColor = textLayer.style?.backgroundColor;
    
    // Border
    config.textBorderWidth = textLayer.style?.borderWidth || 0;
    config.textBorderColor = textLayer.style?.borderColor;
    config.textBorderStyle = textLayer.style?.borderStyle || 'solid';
    
    // Border Radius (handle both number and object)
    if (typeof textLayer.style?.borderRadius === 'object') {
      config.textBorderRadiusTopLeft = textLayer.style.borderRadius.topLeft || 0;
      config.textBorderRadiusTopRight = textLayer.style.borderRadius.topRight || 0;
      config.textBorderRadiusBottomLeft = textLayer.style.borderRadius.bottomLeft || 0;
      config.textBorderRadiusBottomRight = textLayer.style.borderRadius.bottomRight || 0;
      config.textBorderRadius = config.textBorderRadiusTopLeft; // For backward compatibility
    } else {
      const radius = textLayer.style?.borderRadius || 0;
      config.textBorderRadius = radius;
      config.textBorderRadiusTopLeft = radius;
      config.textBorderRadiusTopRight = radius;
      config.textBorderRadiusBottomLeft = radius;
      config.textBorderRadiusBottomRight = radius;
    }
    
    // Opacity
    config.textOpacity = textLayer.style?.opacity !== undefined ? textLayer.style.opacity : 1.0;
    
    // Size and constraints
    config.textWidth = textLayer.size?.width;
    config.textHeight = textLayer.size?.height;
    config.textMaxWidth = textLayer.style?.maxWidth;
    config.textMinWidth = textLayer.style?.minWidth || 0;
    config.textMaxHeight = textLayer.style?.maxHeight;
    config.textMinHeight = textLayer.style?.minHeight || 0;
    
    // Display properties
    config.textDisplay = textLayer.style?.display;
    config.textCursor = textLayer.style?.cursor || 'default';
    config.textOverflow = textLayer.style?.overflow;
    
    // Padding
    if (typeof textLayer.style?.padding === 'object') {
      config.textPaddingTop = textLayer.style.padding.top || 0;
      config.textPaddingRight = textLayer.style.padding.right || 0;
      config.textPaddingBottom = textLayer.style.padding.bottom || 0;
      config.textPaddingLeft = textLayer.style.padding.left || 0;
    } else {
      const padding = textLayer.style?.padding || 0;
      config.textPaddingTop = padding;
      config.textPaddingRight = padding;
      config.textPaddingBottom = padding;
      config.textPaddingLeft = padding;
    }
    
    // Margin (all sides)
    if (typeof textLayer.style?.margin === 'object') {
      config.textMarginTop = textLayer.style.margin.top || 0;
      config.textMarginRight = textLayer.style.margin.right || 0;
      config.textMarginBottom = textLayer.style.margin.bottom || 20;
      config.textMarginLeft = textLayer.style.margin.left || 0;
    } else {
      const margin = textLayer.style?.margin || 0;
      config.textMarginTop = margin;
      config.textMarginRight = margin;
      config.textMarginBottom = margin || 20;
      config.textMarginLeft = margin;
    }
    
    // Filters
    if (textLayer.style?.filter) {
      config.textFilterBlur = textLayer.style.filter.blur || 0;
      config.textFilterBrightness = textLayer.style.filter.brightness || 100;
      config.textFilterContrast = textLayer.style.filter.contrast || 100;
      config.textFilterGrayscale = textLayer.style.filter.grayscale || 0;
    }
    
    // Box Shadow (separate from text shadow)
    if (textLayer.style?.boxShadow) {
      const shadow = parseBoxShadow(textLayer.style.boxShadow);
      config.textBoxShadowColor = shadow.color;
      config.textBoxShadowOpacity = shadow.opacity;
      config.textBoxShadowBlur = shadow.blur;
      config.textBoxShadowSpread = shadow.spread;
      config.textBoxShadowOffsetX = shadow.offsetX;
      config.textBoxShadowOffsetY = shadow.offsetY;
      config.textBoxShadowInset = shadow.inset;
    }
    
    config.textDecoration = textLayer.style?.textDecoration;
    config.textDecorationColor = (textLayer.style as any)?.textDecorationColor;
    config.fontStyle = textLayer.style?.fontFamily;
    config.textTransform = textLayer.style?.textTransform;
    
    // Text shadow
    if ((textLayer.style as any)?.textShadow) {
      const shadow = parseBoxShadow((textLayer.style as any).textShadow);
      config.textShadowColor = shadow.color;
      config.textShadowBlur = shadow.blur;
      config.textShadowOffsetX = shadow.offsetX;
      config.textShadowOffsetY = shadow.offsetY;
    }
    
    // Text transform (position/rotation)
    if (textLayer.style?.transform) {
      config.textTranslateX = textLayer.style.transform.translateX || 0;
      config.textTranslateY = textLayer.style.transform.translateY || 0;
      config.textRotate = textLayer.style.transform.rotate || 0;
      config.textScale = textLayer.style.transform.scale || 1;
    }
  }

  // ========== TITLE LAYER (if separate) ==========
  const titleLayer = campaign.layers.find(l => l.type === 'text' && l.name.toLowerCase().includes('title'));
  if (titleLayer && titleLayer !== textLayer) {
    config.title = titleLayer.content.text || '';
    config.titleFontSize = titleLayer.content.fontSize || 22;
    config.titleFontWeight = titleLayer.content.fontWeight || 'w800';
    config.titleColor = titleLayer.content.textColor || '#1A1A1A';
    config.titleLineHeight = titleLayer.style?.lineHeight || 1.2;
    config.titleLetterSpacing = titleLayer.style?.letterSpacing || -0.3;
    config.titleAlign = titleLayer.content.textAlign || 'center';
    config.titleMarginBottom = typeof titleLayer.style?.margin === 'object' ? titleLayer.style.margin.bottom : 12;
    config.titlePositionX = titleLayer.position?.x || 0;
    config.titlePositionY = titleLayer.position?.y || 0;
    config.titleDecoration = titleLayer.style?.textDecoration;
    config.titleDecorationColor = (titleLayer.style as any)?.textDecorationColor;
    config.titleDecorationStyle = (titleLayer.style as any)?.textDecorationStyle;
    config.titleFontStyle = titleLayer.style?.fontFamily;
    config.titleTextTransform = titleLayer.style?.textTransform;
    
    // Title shadow
    if ((titleLayer.style as any)?.textShadow) {
      const shadow = parseBoxShadow((titleLayer.style as any).textShadow);
      config.titleShadowColor = shadow.color;
      config.titleShadowBlur = shadow.blur;
      config.titleShadowOffsetX = shadow.offsetX;
      config.titleShadowOffsetY = shadow.offsetY;
    }
    
    // Title transform (position/rotation)
    if (titleLayer.style?.transform) {
      config.titleTranslateX = titleLayer.style.transform.translateX || 0;
      config.titleTranslateY = titleLayer.style.transform.translateY || 0;
      config.titleRotate = titleLayer.style.transform.rotate || 0;
      config.titleScale = titleLayer.style.transform.scale || 1;
    }
  }

  // ========== SUBTITLE LAYER (if exists) ==========
  const subtitleLayer = campaign.layers.find(l => l.type === 'text' && l.name.toLowerCase().includes('subtitle'));
  if (subtitleLayer) {
    config.subtitle = subtitleLayer.content.text || '';
    config.subtitleFontSize = subtitleLayer.content.fontSize || 16;
    config.subtitleFontWeight = subtitleLayer.content.fontWeight || 'w600';
    config.subtitleColor = subtitleLayer.content.textColor || '#666666';
    config.subtitleLineHeight = subtitleLayer.style?.lineHeight || 1.3;
    config.subtitleLetterSpacing = subtitleLayer.style?.letterSpacing || -0.2;
    config.subtitleAlign = subtitleLayer.content.textAlign || 'center';
    config.subtitleMarginBottom = typeof subtitleLayer.style?.margin === 'object' ? subtitleLayer.style.margin.bottom : 8;
    config.subtitlePositionX = subtitleLayer.position?.x || 0;
    config.subtitlePositionY = subtitleLayer.position?.y || 0;
    config.subtitleDecoration = subtitleLayer.style?.textDecoration;
    config.subtitleDecorationColor = (subtitleLayer.style as any)?.textDecorationColor;
    config.subtitleFontStyle = subtitleLayer.style?.fontFamily;
    config.subtitleTextTransform = subtitleLayer.style?.textTransform;
    
    // Subtitle shadow
    if ((subtitleLayer.style as any)?.textShadow) {
      const shadow = parseBoxShadow((subtitleLayer.style as any).textShadow);
      config.subtitleShadowColor = shadow.color;
      config.subtitleShadowBlur = shadow.blur;
      config.subtitleShadowOffsetX = shadow.offsetX;
      config.subtitleShadowOffsetY = shadow.offsetY;
    }
    
    // Subtitle transform (position/rotation)
    if (subtitleLayer.style?.transform) {
      config.subtitleTranslateX = subtitleLayer.style.transform.translateX || 0;
      config.subtitleTranslateY = subtitleLayer.style.transform.translateY || 0;
      config.subtitleRotate = subtitleLayer.style.transform.rotate || 0;
      config.subtitleScale = subtitleLayer.style.transform.scale || 1;
    }
  }

  // ========== BUTTON LAYER - ALL PROPERTIES ==========
  if (buttonLayer) {
    config.showButton = buttonLayer.visible !== false;
    config.buttonText = buttonLayer.content.label || '';
    config.buttonColor = buttonLayer.style?.backgroundColor || '#4CAF50';
    config.buttonTextColor = buttonLayer.content.textColor || (buttonLayer.style as any)?.color || '#FFFFFF';
    config.buttonFontSize = buttonLayer.content.fontSize || 16;
    config.buttonFontWeight = buttonLayer.content.fontWeight || 'w600';
    config.buttonHeight = buttonLayer.size?.height || 50;
    config.buttonWidth = buttonLayer.size?.width; // Can be null for full width
    config.buttonBorderRadius = buttonLayer.style?.borderRadius || 12;
    config.buttonElevation = buttonLayer.style?.boxShadow ? 2 : 0;
    config.buttonPositionX = buttonLayer.position?.x || 0;
    config.buttonPositionY = buttonLayer.position?.y || 0;
    config.buttonBorderColor = buttonLayer.style?.borderColor;
    config.buttonBorderWidth = buttonLayer.style?.borderWidth || 0;
    config.buttonPaddingVertical = typeof buttonLayer.style?.padding === 'object' 
      ? buttonLayer.style.padding.top 
      : buttonLayer.style?.padding || 0;
    config.buttonPaddingHorizontal = typeof buttonLayer.style?.padding === 'object'
      ? buttonLayer.style.padding.left
      : buttonLayer.style?.padding || 0;
    config.buttonLetterSpacing = buttonLayer.style?.letterSpacing || 0;
    config.buttonTextTransform = buttonLayer.style?.textTransform; // uppercase, lowercase, etc.
    
    // Button transform (position/rotation)
    if (buttonLayer.style?.transform) {
      config.buttonTranslateX = buttonLayer.style.transform.translateX || 0;
      config.buttonTranslateY = buttonLayer.style.transform.translateY || 0;
      config.buttonRotate = buttonLayer.style.transform.rotate || 0;
      config.buttonScale = buttonLayer.style.transform.scale || 1;
    }
    
    // Button shadow
    if (buttonLayer.style?.boxShadow) {
      const shadow = parseBoxShadow(buttonLayer.style.boxShadow);
      config.buttonShadowColor = shadow.color;
      config.buttonShadowOpacity = shadow.opacity;
      config.buttonShadowBlur = shadow.blur;
      config.buttonShadowSpread = shadow.spread;
      config.buttonShadowOffsetX = shadow.offsetX;
      config.buttonShadowOffsetY = shadow.offsetY;
    }
  }

  // ========== SECONDARY BUTTON (if exists) ==========
  const secondaryButtonLayer = campaign.layers.find(l => l.type === 'button' && l !== buttonLayer);
  if (secondaryButtonLayer) {
    config.secondaryButtonText = secondaryButtonLayer.content.label || '';
    config.secondaryButtonColor = secondaryButtonLayer.style?.backgroundColor || '#E0E0E0';
    config.secondaryButtonTextColor = secondaryButtonLayer.content.textColor || '#1A1A1A';
    config.secondaryButtonFontSize = secondaryButtonLayer.content.fontSize || 16;
    config.secondaryButtonFontWeight = secondaryButtonLayer.content.fontWeight || 'w600';
    config.secondaryButtonHeight = secondaryButtonLayer.size?.height || 50;
    config.secondaryButtonWidth = secondaryButtonLayer.size?.width;
    config.secondaryButtonBorderRadius = secondaryButtonLayer.style?.borderRadius || 12;
    config.secondaryButtonElevation = secondaryButtonLayer.style?.boxShadow ? 2 : 0;
    config.secondaryButtonPositionX = secondaryButtonLayer.position?.x || 0;
    config.secondaryButtonPositionY = secondaryButtonLayer.position?.y || 0;
    config.secondaryButtonBorderColor = secondaryButtonLayer.style?.borderColor;
    config.secondaryButtonBorderWidth = secondaryButtonLayer.style?.borderWidth || 1;
    config.secondaryButtonMarginTop = typeof secondaryButtonLayer.style?.margin === 'object'
      ? secondaryButtonLayer.style.margin.top || 12
      : 12;
    
    // Secondary button padding
    config.secondaryButtonPaddingVertical = typeof secondaryButtonLayer.style?.padding === 'object'
      ? secondaryButtonLayer.style.padding.top
      : secondaryButtonLayer.style?.padding || 0;
    config.secondaryButtonPaddingHorizontal = typeof secondaryButtonLayer.style?.padding === 'object'
      ? secondaryButtonLayer.style.padding.left
      : secondaryButtonLayer.style?.padding || 0;
    config.secondaryButtonLetterSpacing = secondaryButtonLayer.style?.letterSpacing || 0;
    config.secondaryButtonTextTransform = secondaryButtonLayer.style?.textTransform;
    
    // Secondary button transform (position/rotation)
    if (secondaryButtonLayer.style?.transform) {
      config.secondaryButtonTranslateX = secondaryButtonLayer.style.transform.translateX || 0;
      config.secondaryButtonTranslateY = secondaryButtonLayer.style.transform.translateY || 0;
      config.secondaryButtonRotate = secondaryButtonLayer.style.transform.rotate || 0;
      config.secondaryButtonScale = secondaryButtonLayer.style.transform.scale || 1;
    }
    
    // Secondary button shadow
    if (secondaryButtonLayer.style?.boxShadow) {
      const shadow = parseBoxShadow(secondaryButtonLayer.style.boxShadow);
      config.secondaryButtonShadowColor = shadow.color;
      config.secondaryButtonShadowOpacity = shadow.opacity;
      config.secondaryButtonShadowBlur = shadow.blur;
      config.secondaryButtonShadowSpread = shadow.spread;
      config.secondaryButtonShadowOffsetX = shadow.offsetX;
      config.secondaryButtonShadowOffsetY = shadow.offsetY;
    }
  }

  // ========== IMAGE LAYER - ALL PROPERTIES ==========
  if (imageLayer) {
    config.showImage = imageLayer.visible !== false;
    config.imageUrl = imageLayer.content.imageUrl || '';
    config.imageWidth = imageLayer.size?.width || 56;
    config.imageHeight = imageLayer.size?.height || 56;
    config.imageFit = imageLayer.style?.objectFit || 'cover';
    config.imagePosition = imageLayer.style?.objectPosition;
    config.imageBorderRadius = imageLayer.style?.borderRadius || 8;
    config.imageBackgroundColor = imageLayer.style?.backgroundColor;
    config.imagePositionType = imageLayer.position?.type || 'relative'; // absolute or relative
    config.imagePositionX = imageLayer.position?.x || 0;
    config.imagePositionY = imageLayer.position?.y || 0;
    
    // Image margins (all sides)
    if (typeof imageLayer.style?.margin === 'object') {
      config.imageMarginTop = imageLayer.style.margin.top || 0;
      config.imageMarginBottom = imageLayer.style.margin.bottom || 16;
      config.imageMarginLeft = imageLayer.style.margin.left || 0;
      config.imageMarginRight = imageLayer.style.margin.right || 0;
    } else {
      config.imageMarginTop = 0;
      config.imageMarginBottom = 16;
      config.imageMarginLeft = 0;
      config.imageMarginRight = 0;
    }
    
    config.imageBorderColor = imageLayer.style?.borderColor;
    config.imageBorderWidth = imageLayer.style?.borderWidth || 0;
    config.imageOpacity = imageLayer.style?.opacity || 1.0;
    
    // Image filters (blur, brightness, contrast, grayscale)
    if (imageLayer.style?.filter) {
      config.imageFilterBlur = imageLayer.style.filter.blur || 0;
      config.imageFilterBrightness = imageLayer.style.filter.brightness || 100;
      config.imageFilterContrast = imageLayer.style.filter.contrast || 100;
      config.imageFilterGrayscale = imageLayer.style.filter.grayscale || 0;
    }
    
    // Parse shadow for image
    if (imageLayer.style?.boxShadow) {
      const shadow = parseBoxShadow(imageLayer.style.boxShadow);
      config.imageShadowColor = shadow.color;
      config.imageShadowOpacity = shadow.opacity;
      config.imageShadowBlur = shadow.blur;
      config.imageShadowSpread = shadow.spread;
      config.imageShadowOffsetX = shadow.offsetX;
      config.imageShadowOffsetY = shadow.offsetY;
    }
    
    // Image transform (position/rotation)
    if (imageLayer.style?.transform) {
      config.imageTranslateX = imageLayer.style.transform.translateX || 0;
      config.imageTranslateY = imageLayer.style.transform.translateY || 0;
      config.imageRotate = imageLayer.style.transform.rotate || 0;
      config.imageScale = imageLayer.style.transform.scale || 1;
    }
  }

  // ========== CONTAINER LAYER - ALL PROPERTIES ==========
  if (containerLayer) {
    // Container position
    config.containerPositionX = containerLayer.position?.x || 0;
    config.containerPositionY = containerLayer.position?.y || 0;
    config.containerPositionType = (containerLayer.style as any)?.position || 'relative';
    
    config.backgroundColor = containerLayer.style?.backgroundColor || '#FFFFFF';
    config.borderColor = containerLayer.style?.borderColor;
    config.borderWidth = containerLayer.style?.borderWidth || 0;
    config.borderStyle = containerLayer.style?.borderStyle;
    
    // Gradient support
    if (containerLayer.style?.gradient) {
      const gradient = containerLayer.style.gradient as any;
      config.backgroundGradient = {
        type: gradient.type || 'linear',
        angle: gradient.angle || 180,
        colors: gradient.colors || [],
        stops: gradient.stops || null,
        centerX: gradient.centerX || 0.5,
        centerY: gradient.centerY || 0.5,
        radius: gradient.radius || 0.5
      };
    } else if (containerLayer.style?.backgroundImage?.includes('gradient')) {
      config.backgroundGradient = containerLayer.style.backgroundImage;
    }
    
    // Background image
    if (containerLayer.style?.backgroundImage && !containerLayer.style.backgroundImage.includes('gradient')) {
      config.backgroundImage = containerLayer.style.backgroundImage;
      config.backgroundSize = containerLayer.style.backgroundSize || 'cover';
      config.backgroundRepeat = containerLayer.style.backgroundRepeat || 'no-repeat';
      
      // Parse background position into X and Y components
      const bgPos = containerLayer.style.backgroundPosition || 'center center';
      const [bgPosX, bgPosY] = bgPos.split(' ');
      config.backgroundPositionX = bgPosX || 'center';
      config.backgroundPositionY = bgPosY || bgPosX || 'center';
    }
    
    // Border radius (per corner)
    if (typeof containerLayer.style?.borderRadius === 'object') {
      config.borderRadiusTopLeft = containerLayer.style.borderRadius.topLeft || 20;
      config.borderRadiusTopRight = containerLayer.style.borderRadius.topRight || 20;
      config.borderRadiusBottomLeft = containerLayer.style.borderRadius.bottomLeft || 0;
      config.borderRadiusBottomRight = containerLayer.style.borderRadius.bottomRight || 0;
      config.borderRadius = config.borderRadiusTopLeft; // For backward compatibility
    } else {
      const radius = containerLayer.style?.borderRadius || 20;
      config.borderRadius = radius;
      config.borderRadiusTopLeft = radius;
      config.borderRadiusTopRight = radius;
      config.borderRadiusBottomLeft = radius;
      config.borderRadiusBottomRight = radius;
    }
    
    // Padding
    if (typeof containerLayer.style?.padding === 'object') {
      config.paddingTop = containerLayer.style.padding.top || 0;
      config.paddingBottom = containerLayer.style.padding.bottom || 0;
      config.paddingLeft = containerLayer.style.padding.left || 0;
      config.paddingRight = containerLayer.style.padding.right || 0;
    } else {
      const padding = containerLayer.style?.padding || 0;
      config.paddingTop = padding;
      config.paddingBottom = padding;
      config.paddingLeft = padding;
      config.paddingRight = padding;
    }
    
    // Margin
    if (typeof containerLayer.style?.margin === 'object') {
      config.marginTop = containerLayer.style.margin.top || 0;
      config.marginBottom = containerLayer.style.margin.bottom || 0;
      config.marginLeft = containerLayer.style.margin.left || 0;
      config.marginRight = containerLayer.style.margin.right || 0;
    } else {
      const margin = containerLayer.style?.margin || 0;
      config.marginTop = margin;
      config.marginBottom = margin;
      config.marginLeft = margin;
      config.marginRight = margin;
    }
    
    // Shadow
    if (containerLayer.style?.boxShadow) {
      const shadow = parseBoxShadow(containerLayer.style.boxShadow);
      config.shadowColor = shadow.color;
      config.shadowOpacity = shadow.opacity;
      config.shadowBlur = shadow.blur;
      config.shadowSpread = shadow.spread;
      config.shadowOffsetX = shadow.offsetX;
      config.shadowOffsetY = shadow.offsetY;
    } else {
      // Default shadow
      config.shadowColor = '#000000';
      config.shadowOpacity = 0.1;
      config.shadowBlur = 16;
      config.shadowSpread = 0;
      config.shadowOffsetX = 0;
      config.shadowOffsetY = -2;
    }
    
    // Dimensions
    config.width = containerLayer.size?.width;
    config.height = containerLayer.size?.height;
    config.maxWidth = containerLayer.style?.maxWidth || null; // null = unlimited
    config.maxHeight = containerLayer.style?.maxHeight || null;
    config.minWidth = containerLayer.style?.minWidth || 0;
    config.minHeight = containerLayer.style?.minHeight || 0;
    config.containerOpacity = containerLayer.style?.opacity !== undefined ? containerLayer.style.opacity : 1.0;
    config.zIndex = containerLayer.zIndex || 0;
    config.display = containerLayer.style?.display || 'flex';
    config.overflow = containerLayer.style?.overflow || 'visible';
    config.cursor = containerLayer.style?.cursor || 'default';
    
    // Flex layout properties
    config.flexDirection = containerLayer.style?.flexDirection || 'column';
    config.alignItems = containerLayer.style?.alignItems || 'stretch';
    config.justifyContent = containerLayer.style?.justifyContent || 'flex-start';
    config.gap = containerLayer.style?.gap || 0;
    
    // Container filters (blur, brightness, contrast, grayscale)
    if (containerLayer.style?.filter) {
      config.containerFilterBlur = containerLayer.style.filter.blur || 0;
      config.containerFilterBrightness = containerLayer.style.filter.brightness || 100;
      config.containerFilterContrast = containerLayer.style.filter.contrast || 100;
      config.containerFilterGrayscale = containerLayer.style.filter.grayscale || 0;
    }
    
    // Container clip path (custom shapes)
    config.clipPath = containerLayer.style?.clipPath;
    
    // Container transform (position/rotation)
    if (containerLayer.style?.transform) {
      config.containerTranslateX = containerLayer.style.transform.translateX || 0;
      config.containerTranslateY = containerLayer.style.transform.translateY || 0;
      config.containerRotate = containerLayer.style.transform.rotate || 0;
      config.containerScale = containerLayer.style.transform.scale || 1;
    }
  }

  // ========== DRAG HANDLE - ALL PROPERTIES ==========
  if (handleLayer) {
    config.dragHandle = handleLayer.visible !== false;
    config.dragHandleWidth = handleLayer.size?.width || 32;
    config.dragHandleHeight = handleLayer.size?.height || 3;
    config.dragHandleColor = handleLayer.style?.backgroundColor || '#E0E0E0';
    config.dragHandleBorderRadius = handleLayer.style?.borderRadius || 1.5;
    config.dragHandleOpacity = handleLayer.style?.opacity !== undefined ? handleLayer.style.opacity : 1.0;
    
    // Position
    config.dragHandlePositionX = handleLayer.position?.x || 0;
    config.dragHandlePositionY = handleLayer.position?.y || 0;
    config.dragHandlePositionType = (handleLayer.position as any)?.type || 'relative';
    
    // Border
    config.dragHandleBorderWidth = handleLayer.style?.borderWidth || 0;
    config.dragHandleBorderColor = handleLayer.style?.borderColor;
    config.dragHandleBorderStyle = handleLayer.style?.borderStyle || 'solid';
    
    // Filters
    if (handleLayer.style?.filter) {
      config.dragHandleFilterBlur = handleLayer.style.filter.blur || 0;
      config.dragHandleFilterBrightness = handleLayer.style.filter.brightness || 100;
      config.dragHandleFilterContrast = handleLayer.style.filter.contrast || 100;
      config.dragHandleFilterGrayscale = handleLayer.style.filter.grayscale || 0;
    }
    
    // Transform
    if (handleLayer.style?.transform) {
      config.dragHandleTranslateX = handleLayer.style.transform.translateX || 0;
      config.dragHandleTranslateY = handleLayer.style.transform.translateY || 0;
      config.dragHandleRotate = handleLayer.style.transform.rotate || 0;
      config.dragHandleScale = handleLayer.style.transform.scale || 1;
    }
    
    // Box Shadow
    if (handleLayer.style?.boxShadow) {
      const shadow = parseBoxShadow(handleLayer.style.boxShadow);
      config.dragHandleShadowColor = shadow.color;
      config.dragHandleShadowOpacity = shadow.opacity;
      config.dragHandleShadowBlur = shadow.blur;
      config.dragHandleShadowSpread = shadow.spread;
      config.dragHandleShadowOffsetX = shadow.offsetX;
      config.dragHandleShadowOffsetY = shadow.offsetY;
      config.dragHandleShadowInset = shadow.inset;
    }
    
    if (typeof handleLayer.style?.margin === 'object') {
      config.dragHandleMarginTop = handleLayer.style.margin.top || 10;
      config.dragHandleMarginBottom = handleLayer.style.margin.bottom || 4;
    } else {
      config.dragHandleMarginTop = 10;
      config.dragHandleMarginBottom = 4;
    }
  }

  // ========== CLOSE BUTTON (X icon) ==========
  const closeButtonLayer = campaign.layers.find(l => l.type === 'icon' && (l.name.toLowerCase().includes('close') || l.name.toLowerCase().includes('dismiss')));
  if (closeButtonLayer) {
    config.showCloseButton = closeButtonLayer.visible !== false;
    config.closeButtonPosition = closeButtonLayer.content.containerPosition || 'top-right';
    config.closeButtonSize = closeButtonLayer.size?.width || 24;
    config.closeButtonColor = closeButtonLayer.content.textColor || (closeButtonLayer.style as any)?.color || '#666666';
    config.closeButtonMargin = typeof closeButtonLayer.style?.margin === 'object'
      ? closeButtonLayer.style.margin.top || 8
      : 8;
  }

  // ========== ICON LAYERS (decorative icons) ==========
  const iconLayers = campaign.layers.filter(l => l.type === 'icon' && l !== closeButtonLayer);
  if (iconLayers.length > 0) {
    config.icons = iconLayers.map(icon => ({
      name: icon.content.iconName || 'star',
      size: icon.size?.width || 20,
      color: icon.content.textColor || (icon.style as any)?.color || '#666666',
      opacity: icon.style?.opacity || 1.0,
      rotation: icon.style?.transform?.rotate || (icon.style as any)?.rotation || 0,
      translateX: icon.style?.transform?.translateX || 0,
      translateY: icon.style?.transform?.translateY || 0,
      scale: icon.style?.transform?.scale || 1,
      position: icon.position,
    }));
  }

  // ========== CONTENT PADDING (from bottom sheet config or layers) ==========
  config.contentPaddingTop = 12;
  config.contentPaddingBottom = 20;
  config.contentPaddingLeft = 20;
  config.contentPaddingRight = 20;

  // ========== BEHAVIOR & INTERACTION ==========
  config.dismissible = true;
  config.backdropDismiss = true;
  config.scrollable = false;
  config.autoDismissOnCTA = true;
  config.dismissThreshold = 0.15;

  // ========== OVERLAY/BACKDROP ==========
  if (campaign.bottomSheetConfig?.overlay) {
    config.overlayOpacity = campaign.bottomSheetConfig.overlay.opacity || 0.4;
    config.backdropColor = campaign.bottomSheetConfig.overlay.color || '#000000';
    config.backdropBlur = campaign.bottomSheetConfig.overlay.blur || 0;
  } else {
    config.overlayOpacity = 0.4;
    config.backdropColor = '#000000';
    config.backdropBlur = 0;
  }

  // ========== ANIMATION ==========
  if (campaign.bottomSheetConfig?.animation) {
    config.animationDuration = campaign.bottomSheetConfig.animation.duration || 300;
    config.animationType = campaign.bottomSheetConfig.animation.type || 'slide';
    config.animationEasing = campaign.bottomSheetConfig.animation.easing || 'ease-out';
    config.animationCurve = mapAnimationCurve(campaign.bottomSheetConfig.animation.easing);
  } else {
    config.animationDuration = 300;
    config.animationType = 'slide';
    config.animationEasing = 'ease-out';
    config.animationCurve = 'easeOutCubic';
  }

  // ========== BOTTOM SHEET SPECIFIC ==========
  if (campaign.bottomSheetConfig) {
    config.height = campaign.bottomSheetConfig.height || 'auto';
    config.dragHandle = campaign.bottomSheetConfig.dragHandle !== false;
    config.mode = campaign.bottomSheetConfig.mode; // 'container' | 'image-only'
    config.backgroundImageUrl = campaign.bottomSheetConfig.backgroundImageUrl;
    config.backgroundSize = campaign.bottomSheetConfig.backgroundSize; // 'cover' | 'contain' | 'fill'
    config.backgroundPosition = campaign.bottomSheetConfig.backgroundPosition;
  }

  return config;
}

/**
 * Map CSS animation easing to Flutter curve names
 */
function mapAnimationCurve(easing: string): string {
  const mapping: Record<string, string> = {
    'ease': 'ease',
    'ease-in': 'easeIn',
    'ease-out': 'easeOut',
    'ease-in-out': 'easeInOut',
    'linear': 'linear',
    'ease-out-cubic': 'easeOutCubic',
    'ease-in-cubic': 'easeInCubic',
    'ease-in-out-cubic': 'easeInOutCubic',
    'bounce': 'bounceOut',
    'elastic': 'elasticOut',
  };
  return mapping[easing.toLowerCase()] || 'easeOutCubic';
}

/**
 * Parse CSS box-shadow into components
 * Handles rgba(), rgb(), hex colors, and inset keyword
 */
function parseBoxShadow(boxShadow: string): {
  color: string;
  opacity: number;
  blur: number;
  spread: number;
  offsetX: number;
  offsetY: number;
  inset: boolean;
} {
  // Default values
  const result = {
    color: '#000000',
    opacity: 0.1,
    blur: 16,
    spread: 0,
    offsetX: 0,
    offsetY: -2,
    inset: false,
  };

  try {
    // Check for inset
    result.inset = boxShadow.includes('inset');
    const cleanShadow = boxShadow.replace('inset', '').trim();
    
    // Extract color first (rgba, rgb, or hex)
    const rgbaMatch = cleanShadow.match(/rgba?\(([^)]+)\)/);
    const hexMatch = cleanShadow.match(/#[0-9A-Fa-f]{3,8}/);
    
    if (rgbaMatch) {
      const rgba = rgbaMatch[1].split(',').map(v => v.trim());
      if (rgba.length >= 3) {
        const r = parseInt(rgba[0]);
        const g = parseInt(rgba[1]);
        const b = parseInt(rgba[2]);
        result.color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
        result.opacity = rgba.length === 4 ? parseFloat(rgba[3]) : 1.0;
      }
    } else if (hexMatch) {
      result.color = hexMatch[0].toUpperCase();
      result.opacity = 1.0;
    }
    
    // Extract numeric values (remove color part)
    const numericPart = cleanShadow.replace(/rgba?\([^)]+\)/, '').replace(/#[0-9A-Fa-f]{3,8}/, '').trim();
    const parts = numericPart.split(/\s+/).filter(p => p);
    
    if (parts.length >= 2) {
      result.offsetX = parseFloat(parts[0]) || 0;
      result.offsetY = parseFloat(parts[1]) || 0;
      if (parts.length >= 3) result.blur = parseFloat(parts[2]) || 0;
      if (parts.length >= 4) result.spread = parseFloat(parts[3]) || 0;
    }
  } catch (error) {
    console.warn('Failed to parse box-shadow:', boxShadow, error);
  }

  return result;
}

/**
 * Reconstruct layers from backend config
 */
function reconstructLayersFromConfig(config: Record<string, any>, type: string): Layer[] {
  if (type !== 'bottomsheet') {
    // For non-bottomsheet types, create minimal layer structure
    return [];
  }

  const baseId = Date.now();
  const layers: Layer[] = [];

  // Container layer
  const containerLayer: Layer = {
    id: `layer_${baseId}`,
    type: 'container',
    name: 'Bottom Sheet',
    parent: null,
    children: [],
    visible: true,
    locked: false,
    zIndex: config.zIndex || 0,
    position: { 
      x: config.containerPositionX || 0, 
      y: config.containerPositionY || 0 
    },
    size: { 
      width: config.width !== undefined ? config.width : '100%', 
      height: config.height !== undefined ? config.height : 'auto',
    },
    content: {},
    style: {
      backgroundColor: config.backgroundColor || '#FFFFFF',
      ...(config.backgroundGradient && { gradient: config.backgroundGradient }),
      ...(config.backgroundImage && { 
        backgroundImage: config.backgroundImage,
        backgroundSize: config.backgroundSize,
        backgroundPosition: `${config.backgroundPositionX || 'center'} ${config.backgroundPositionY || 'center'}`,
        backgroundRepeat: config.backgroundRepeat,
      }),
      borderRadius: (config.borderRadiusTopLeft !== undefined || config.borderRadiusTopRight !== undefined || 
                     config.borderRadiusBottomLeft !== undefined || config.borderRadiusBottomRight !== undefined)
        ? {
            topLeft: config.borderRadiusTopLeft ?? config.borderRadius ?? 24,
            topRight: config.borderRadiusTopRight ?? config.borderRadius ?? 24,
            bottomLeft: config.borderRadiusBottomLeft ?? 0,
            bottomRight: config.borderRadiusBottomRight ?? 0,
          }
        : config.borderRadius || 24,
      borderWidth: config.borderWidth,
      borderColor: config.borderColor,
      borderStyle: config.borderStyle,
      opacity: config.containerOpacity !== undefined ? config.containerOpacity : 1,
      maxWidth: config.maxWidth || undefined,
      maxHeight: config.maxHeight || undefined,
      minWidth: config.minWidth || 0,
      minHeight: config.minHeight || 0,
      display: config.display || 'flex',
      overflow: config.overflow || 'visible',
      cursor: config.cursor || 'default',
      flexDirection: config.flexDirection || 'column',
      alignItems: config.alignItems || 'stretch',
      justifyContent: config.justifyContent || 'flex-start',
      gap: config.gap || 0,
      clipPath: config.clipPath,
      filter: (config.containerFilterBlur || config.containerFilterBrightness !== 100 || config.containerFilterContrast !== 100 || config.containerFilterGrayscale) ? {
        blur: config.containerFilterBlur,
        brightness: config.containerFilterBrightness,
        contrast: config.containerFilterContrast,
        grayscale: config.containerFilterGrayscale,
      } : undefined,
      boxShadow: config.shadowColor
        ? `${config.shadowOffsetX || 0}px ${config.shadowOffsetY || 0}px ${config.shadowBlur || 0}px ${config.shadowSpread || 0}px ${config.shadowColor}`
        : undefined,
      transform: (config.containerTranslateX !== undefined && config.containerTranslateX !== 0) || 
                 (config.containerTranslateY !== undefined && config.containerTranslateY !== 0) || 
                 (config.containerRotate !== undefined && config.containerRotate !== 0) || 
                 (config.containerScale !== undefined && config.containerScale !== 1) ? {
        translateX: config.containerTranslateX || 0,
        translateY: config.containerTranslateY || 0,
        rotate: config.containerRotate || 0,
        scale: config.containerScale || 1,
      } : undefined,
      padding: { 
        top: config.paddingTop ?? 0, 
        right: config.paddingRight ?? 0, 
        bottom: config.paddingBottom ?? 0, 
        left: config.paddingLeft ?? 0 
      },
      margin: config.marginTop || config.marginBottom || config.marginLeft || config.marginRight ? {
        top: config.marginTop || 0,
        right: config.marginRight || 0,
        bottom: config.marginBottom || 0,
        left: config.marginLeft || 0,
      } : undefined,
    },
  };
  layers.push(containerLayer);

  // Handle layer
  if (config.dragHandle !== false) {
    const handleLayer: Layer = {
      id: `layer_${baseId + 1}`,
      type: 'handle',
      name: 'Drag Handle',
      parent: containerLayer.id,
      children: [],
      visible: config.dragHandle === undefined ? true : config.dragHandle,
      locked: false,
      zIndex: 1,
      position: { 
        x: config.dragHandlePositionX || 0, 
        y: config.dragHandlePositionY || 0,
        type: config.dragHandlePositionType || 'relative'
      },
      size: { 
        width: config.dragHandleWidth || 40, 
        height: config.dragHandleHeight || 4 
      },
      content: {},
      style: {
        backgroundColor: config.dragHandleColor || '#D1D5DB',
        borderRadius: config.dragHandleBorderRadius || 2,
        opacity: config.dragHandleOpacity !== undefined ? config.dragHandleOpacity : 1.0,
        borderWidth: config.dragHandleBorderWidth || 0,
        borderColor: config.dragHandleBorderColor,
        borderStyle: config.dragHandleBorderStyle || 'solid',
        filter: (config.dragHandleFilterBlur || config.dragHandleFilterBrightness !== 100 || 
                 config.dragHandleFilterContrast !== 100 || config.dragHandleFilterGrayscale) ? {
          blur: config.dragHandleFilterBlur || 0,
          brightness: config.dragHandleFilterBrightness || 100,
          contrast: config.dragHandleFilterContrast || 100,
          grayscale: config.dragHandleFilterGrayscale || 0,
        } : undefined,
        transform: (config.dragHandleTranslateX !== undefined && config.dragHandleTranslateX !== 0) ||
                   (config.dragHandleTranslateY !== undefined && config.dragHandleTranslateY !== 0) ||
                   (config.dragHandleRotate !== undefined && config.dragHandleRotate !== 0) ||
                   (config.dragHandleScale !== undefined && config.dragHandleScale !== 1) ? {
          translateX: config.dragHandleTranslateX || 0,
          translateY: config.dragHandleTranslateY || 0,
          rotate: config.dragHandleRotate || 0,
          scale: config.dragHandleScale || 1,
        } : undefined,
        boxShadow: config.dragHandleShadowColor
          ? `${config.dragHandleShadowInset ? 'inset ' : ''}${config.dragHandleShadowOffsetX || 0}px ${config.dragHandleShadowOffsetY || 0}px ${config.dragHandleShadowBlur || 0}px ${config.dragHandleShadowSpread || 0}px ${config.dragHandleShadowColor}`
          : undefined,
        margin: { 
          top: config.dragHandleMarginTop || 0, 
          right: 0, 
          bottom: config.dragHandleMarginBottom || 16, 
          left: 0 
        },
      },
    };
    layers.push(handleLayer);
    containerLayer.children.push(handleLayer.id);
  }

  // Image layer
  if (config.imageUrl) {
    const imageLayer: Layer = {
      id: `layer_${baseId + 2}`,
      type: 'media',
      name: 'Image',
      parent: containerLayer.id,
      children: [],
      visible: config.showImage === undefined ? true : config.showImage,
      locked: false,
      zIndex: 2,
      position: { 
        x: config.imagePositionX || 0, 
        y: config.imagePositionY || 0,
        type: config.imagePositionType || 'relative'
      },
      size: { 
        width: config.imageWidth || '100%', 
        height: config.imageHeight || 200 
      },
      content: {
        imageUrl: config.imageUrl,
      },
      style: {
        objectFit: config.imageFit || 'cover',
        objectPosition: config.imagePosition,
        backgroundColor: config.imageBackgroundColor,
        borderRadius: config.imageBorderRadius || 12,
        borderWidth: config.imageBorderWidth,
        borderColor: config.imageBorderColor,
        opacity: config.imageOpacity !== undefined ? config.imageOpacity : 1.0,
        filter: (config.imageFilterBlur || config.imageFilterBrightness !== 100 || config.imageFilterContrast !== 100 || config.imageFilterGrayscale) ? {
          blur: config.imageFilterBlur,
          brightness: config.imageFilterBrightness,
          contrast: config.imageFilterContrast,
          grayscale: config.imageFilterGrayscale,
        } : undefined,
        boxShadow: config.imageShadowColor
          ? `${config.imageShadowOffsetX || 0}px ${config.imageShadowOffsetY || 0}px ${config.imageShadowBlur || 0}px ${config.imageShadowSpread || 0}px ${config.imageShadowColor}`
          : undefined,
        transform: (config.imageTranslateX !== undefined && config.imageTranslateX !== 0) || 
                   (config.imageTranslateY !== undefined && config.imageTranslateY !== 0) || 
                   (config.imageRotate !== undefined && config.imageRotate !== 0) || 
                   (config.imageScale !== undefined && config.imageScale !== 1) ? {
          translateX: config.imageTranslateX || 0,
          translateY: config.imageTranslateY || 0,
          rotate: config.imageRotate || 0,
          scale: config.imageScale || 1,
        } : undefined,
        margin: { 
          top: config.imageMarginTop || 0, 
          right: config.imageMarginRight || 0, 
          bottom: config.imageMarginBottom || 16, 
          left: config.imageMarginLeft || 0 
        },
      },
    };
    layers.push(imageLayer);
    containerLayer.children.push(imageLayer.id);
  }

  // Text layer
  if (config.text) {
    const textLayer: Layer = {
      id: `layer_${baseId + 3}`,
      type: 'text',
      name: 'Title',
      parent: containerLayer.id,
      children: [],
      visible: config.showTitle === undefined ? true : config.showTitle,
      locked: false,
      zIndex: 3,
      position: { 
        x: config.textPositionX || 0, 
        y: config.textPositionY || 0,
        type: config.textPositionType || 'relative'
      },
      size: { 
        width: config.textWidth || '100%', 
        height: config.textHeight || 'auto' 
      },
      content: {
        text: config.text,
        fontSize: config.fontSize || 20,
        fontWeight: config.fontWeight || 'bold',
        textColor: config.textColor || '#111827',
        textAlign: config.textAlign || 'left',
      },
      style: {
        backgroundColor: config.textBackgroundColor,
        borderWidth: config.textBorderWidth || 0,
        borderColor: config.textBorderColor,
        borderStyle: config.textBorderStyle || 'solid',
        borderRadius: (config.textBorderRadiusTopLeft !== undefined || config.textBorderRadiusTopRight !== undefined ||
                       config.textBorderRadiusBottomLeft !== undefined || config.textBorderRadiusBottomRight !== undefined)
          ? {
              topLeft: config.textBorderRadiusTopLeft ?? config.textBorderRadius ?? 0,
              topRight: config.textBorderRadiusTopRight ?? config.textBorderRadius ?? 0,
              bottomLeft: config.textBorderRadiusBottomLeft ?? 0,
              bottomRight: config.textBorderRadiusBottomRight ?? 0,
            }
          : config.textBorderRadius || 0,
        opacity: config.textOpacity !== undefined ? config.textOpacity : 1.0,
        maxWidth: config.textMaxWidth || undefined,
        minWidth: config.textMinWidth || 0,
        maxHeight: config.textMaxHeight || undefined,
        minHeight: config.textMinHeight || 0,
        display: config.textDisplay,
        cursor: config.textCursor || 'default',
        overflow: config.textOverflow,
        padding: {
          top: config.textPaddingTop || 0,
          right: config.textPaddingRight || 0,
          bottom: config.textPaddingBottom || 0,
          left: config.textPaddingLeft || 0,
        },
        margin: { 
          top: config.textMarginTop || 0, 
          right: config.textMarginRight || 0, 
          bottom: config.textMarginBottom || 8, 
          left: config.textMarginLeft || 0 
        },
        filter: (config.textFilterBlur || config.textFilterBrightness !== 100 || 
                 config.textFilterContrast !== 100 || config.textFilterGrayscale) ? {
          blur: config.textFilterBlur || 0,
          brightness: config.textFilterBrightness || 100,
          contrast: config.textFilterContrast || 100,
          grayscale: config.textFilterGrayscale || 0,
        } : undefined,
        boxShadow: config.textBoxShadowColor
          ? `${config.textBoxShadowInset ? 'inset ' : ''}${config.textBoxShadowOffsetX || 0}px ${config.textBoxShadowOffsetY || 0}px ${config.textBoxShadowBlur || 0}px ${config.textBoxShadowSpread || 0}px ${config.textBoxShadowColor}`
          : undefined,
        lineHeight: config.lineHeight,
        letterSpacing: config.letterSpacing,
        textDecoration: config.textDecoration,
        textDecorationColor: config.textDecorationColor,
        textDecorationStyle: config.textDecorationStyle,
        fontFamily: config.fontStyle,
        textTransform: config.textTransform,
        textShadow: config.textShadowColor 
          ? `${config.textShadowOffsetX || 0}px ${config.textShadowOffsetY || 0}px ${config.textShadowBlur || 0}px ${config.textShadowColor}`
          : undefined,
        transform: (config.textTranslateX !== undefined && config.textTranslateX !== 0) || 
                   (config.textTranslateY !== undefined && config.textTranslateY !== 0) || 
                   (config.textRotate !== undefined && config.textRotate !== 0) || 
                   (config.textScale !== undefined && config.textScale !== 1) ? {
          translateX: config.textTranslateX || 0,
          translateY: config.textTranslateY || 0,
          rotate: config.textRotate || 0,
          scale: config.textScale || 1,
        } : undefined,
      },
    };
    layers.push(textLayer);
    containerLayer.children.push(textLayer.id);
  }

  // Title layer (if separate from text)
  if (config.title && config.title !== config.text) {
    const titleLayer: Layer = {
      id: `layer_${baseId + 10}`,
      type: 'text',
      name: 'Heading',
      parent: containerLayer.id,
      children: [],
      visible: true,
      locked: false,
      zIndex: 10,
      position: { x: config.titlePositionX || 0, y: config.titlePositionY || 0 },
      size: { width: '100%', height: 'auto' },
      content: {
        text: config.title,
        fontSize: config.titleFontSize || 22,
        fontWeight: config.titleFontWeight || 'w800',
        textColor: config.titleColor || '#1A1A1A',
        textAlign: config.titleAlign || 'center',
      },
      style: {
        lineHeight: config.titleLineHeight,
        letterSpacing: config.titleLetterSpacing,
        textDecoration: config.titleDecoration,
        textDecorationColor: config.titleDecorationColor,
        textDecorationStyle: config.titleDecorationStyle,
        fontFamily: config.titleFontStyle,
        textTransform: config.titleTextTransform,
        textShadow: config.titleShadowColor 
          ? `${config.titleShadowOffsetX || 0}px ${config.titleShadowOffsetY || 0}px ${config.titleShadowBlur || 0}px ${config.titleShadowColor}`
          : undefined,
        transform: (config.titleTranslateX !== undefined && config.titleTranslateX !== 0) || 
                   (config.titleTranslateY !== undefined && config.titleTranslateY !== 0) || 
                   (config.titleRotate !== undefined && config.titleRotate !== 0) || 
                   (config.titleScale !== undefined && config.titleScale !== 1) ? {
          translateX: config.titleTranslateX || 0,
          translateY: config.titleTranslateY || 0,
          rotate: config.titleRotate || 0,
          scale: config.titleScale || 1,
        } : undefined,
        margin: { 
          top: 0, 
          right: 0, 
          bottom: config.titleMarginBottom || 12, 
          left: 0 
        },
      },
    };
    layers.push(titleLayer);
    containerLayer.children.push(titleLayer.id);
  }

  // Subtitle layer (if exists)
  if (config.subtitle) {
    const subtitleLayer: Layer = {
      id: `layer_${baseId + 11}`,
      type: 'text',
      name: 'Subheading',
      parent: containerLayer.id,
      children: [],
      visible: true,
      locked: false,
      zIndex: 11,
      position: { x: config.subtitlePositionX || 0, y: config.subtitlePositionY || 0 },
      size: { width: '100%', height: 'auto' },
      content: {
        text: config.subtitle,
        fontSize: config.subtitleFontSize || 16,
        fontWeight: config.subtitleFontWeight || 'w600',
        textColor: config.subtitleColor || '#666666',
        textAlign: config.subtitleAlign || 'center',
      },
      style: {
        lineHeight: config.subtitleLineHeight,
        letterSpacing: config.subtitleLetterSpacing,
        textDecoration: config.subtitleDecoration,
        textDecorationColor: config.subtitleDecorationColor,
        fontFamily: config.subtitleFontStyle,
        textTransform: config.subtitleTextTransform,
        textShadow: config.subtitleShadowColor 
          ? `${config.subtitleShadowOffsetX || 0}px ${config.subtitleShadowOffsetY || 0}px ${config.subtitleShadowBlur || 0}px ${config.subtitleShadowColor}`
          : undefined,
        transform: (config.subtitleTranslateX !== undefined && config.subtitleTranslateX !== 0) || 
                   (config.subtitleTranslateY !== undefined && config.subtitleTranslateY !== 0) || 
                   (config.subtitleRotate !== undefined && config.subtitleRotate !== 0) || 
                   (config.subtitleScale !== undefined && config.subtitleScale !== 1) ? {
          translateX: config.subtitleTranslateX || 0,
          translateY: config.subtitleTranslateY || 0,
          rotate: config.subtitleRotate || 0,
          scale: config.subtitleScale || 1,
        } : undefined,
        margin: { 
          top: 0, 
          right: 0, 
          bottom: config.subtitleMarginBottom || 8, 
          left: 0 
        },
      },
    };
    layers.push(subtitleLayer);
    containerLayer.children.push(subtitleLayer.id);
  }

  // Button layer
  if (config.buttonText) {
    const buttonLayer: Layer = {
      id: `layer_${baseId + 4}`,
      type: 'button',
      name: 'CTA Button',
      parent: containerLayer.id,
      children: [],
      visible: config.showButton === undefined ? true : config.showButton,
      locked: false,
      zIndex: 4,
      position: { x: config.buttonPositionX || 0, y: config.buttonPositionY || 0 },
      size: { 
        width: config.buttonWidth || '100%', 
        height: config.buttonHeight || 48 
      },
      content: {
        label: config.buttonText,
        buttonStyle: 'primary',
        fontSize: config.buttonFontSize,
        fontWeight: config.buttonFontWeight,
        textColor: config.buttonTextColor,
        action: {
          type: 'close',
          trackConversion: true,
          autoDismiss: true,
        },
      },
      style: {
        backgroundColor: config.buttonColor || '#22C55E',
        borderRadius: config.buttonBorderRadius || 12,
        borderWidth: config.buttonBorderWidth,
        borderColor: config.buttonBorderColor,
        letterSpacing: config.buttonLetterSpacing,
        textTransform: config.buttonTextTransform,
        boxShadow: config.buttonShadowColor
          ? `${config.buttonShadowOffsetX || 0}px ${config.buttonShadowOffsetY || 0}px ${config.buttonShadowBlur || 0}px ${config.buttonShadowSpread || 0}px ${config.buttonShadowColor}`
          : undefined,
        transform: (config.buttonTranslateX !== undefined && config.buttonTranslateX !== 0) || 
                   (config.buttonTranslateY !== undefined && config.buttonTranslateY !== 0) || 
                   (config.buttonRotate !== undefined && config.buttonRotate !== 0) || 
                   (config.buttonScale !== undefined && config.buttonScale !== 1) ? {
          translateX: config.buttonTranslateX || 0,
          translateY: config.buttonTranslateY || 0,
          rotate: config.buttonRotate || 0,
          scale: config.buttonScale || 1,
        } : undefined,
        margin: { 
          top: config.buttonMarginTop || 16, 
          right: config.buttonMarginRight || 0, 
          bottom: config.buttonMarginBottom || 0, 
          left: config.buttonMarginLeft || 0 
        },
        padding: {
          top: config.buttonPaddingVertical || 0,
          right: config.buttonPaddingHorizontal || 0,
          bottom: config.buttonPaddingVertical || 0,
          left: config.buttonPaddingHorizontal || 0,
        },
      },
    };
    layers.push(buttonLayer);
    containerLayer.children.push(buttonLayer.id);
  }

  // Secondary Button layer (if exists)
  if (config.secondaryButtonText) {
    const secondaryButtonLayer: Layer = {
      id: `layer_${baseId + 5}`,
      type: 'button',
      name: 'Secondary Button',
      parent: containerLayer.id,
      children: [],
      visible: true,
      locked: false,
      zIndex: 5,
      position: { x: config.secondaryButtonPositionX || 0, y: config.secondaryButtonPositionY || 0 },
      size: { 
        width: config.secondaryButtonWidth || '100%', 
        height: config.secondaryButtonHeight || 48 
      },
      content: {
        label: config.secondaryButtonText,
        buttonStyle: 'secondary',
        fontSize: config.secondaryButtonFontSize,
        fontWeight: config.secondaryButtonFontWeight,
        textColor: config.secondaryButtonTextColor,
        action: {
          type: 'close',
          trackConversion: false,
          autoDismiss: true,
        },
      },
      style: {
        backgroundColor: config.secondaryButtonColor || '#E0E0E0',
        borderRadius: config.secondaryButtonBorderRadius || 12,
        borderWidth: config.secondaryButtonBorderWidth,
        borderColor: config.secondaryButtonBorderColor,
        letterSpacing: config.secondaryButtonLetterSpacing,
        textTransform: config.secondaryButtonTextTransform,
        boxShadow: config.secondaryButtonShadowColor
          ? `${config.secondaryButtonShadowOffsetX || 0}px ${config.secondaryButtonShadowOffsetY || 0}px ${config.secondaryButtonShadowBlur || 0}px ${config.secondaryButtonShadowSpread || 0}px ${config.secondaryButtonShadowColor}`
          : undefined,
        margin: { 
          top: config.secondaryButtonMarginTop || 12, 
          right: 0, 
          bottom: 0, 
          left: 0 
        },
        padding: {
          top: config.secondaryButtonPaddingVertical || 0,
          right: config.secondaryButtonPaddingHorizontal || 0,
          bottom: config.secondaryButtonPaddingVertical || 0,
          left: config.secondaryButtonPaddingHorizontal || 0,
        },
        transform: (config.secondaryButtonTranslateX !== undefined && config.secondaryButtonTranslateX !== 0) || 
                   (config.secondaryButtonTranslateY !== undefined && config.secondaryButtonTranslateY !== 0) || 
                   (config.secondaryButtonRotate !== undefined && config.secondaryButtonRotate !== 0) || 
                   (config.secondaryButtonScale !== undefined && config.secondaryButtonScale !== 1) ? {
          translateX: config.secondaryButtonTranslateX || 0,
          translateY: config.secondaryButtonTranslateY || 0,
          rotate: config.secondaryButtonRotate || 0,
          scale: config.secondaryButtonScale || 1,
        } : undefined,
      },
    };
    layers.push(secondaryButtonLayer);
    containerLayer.children.push(secondaryButtonLayer.id);
  }

  // ========== CLOSE BUTTON LAYER RECONSTRUCTION ==========
  if (config.showCloseButton) {
    const closeButtonLayer: Layer = {
      id: `layer_${baseId + 10}`,
      type: 'icon',
      name: 'Close Button',
      parent: containerLayer.id,
      children: [],
      visible: true,
      locked: false,
      zIndex: 100,
      position: { x: 0, y: 0 },
      size: { 
        width: config.closeButtonSize || 24, 
        height: config.closeButtonSize || 24 
      },
      content: {
        iconName: 'close',
        textColor: config.closeButtonColor || '#666666',
        containerPosition: config.closeButtonPosition || 'top-right',
      },
      style: {
        margin: typeof config.closeButtonMargin === 'number' ? {
          top: config.closeButtonMargin,
          right: config.closeButtonMargin,
          bottom: config.closeButtonMargin,
          left: config.closeButtonMargin,
        } : config.closeButtonMargin,
      },
    };
    layers.push(closeButtonLayer);
    containerLayer.children.push(closeButtonLayer.id);
  }

  // ========== ICON LAYERS RECONSTRUCTION ==========
  if (config.icons && Array.isArray(config.icons)) {
    config.icons.forEach((icon: any, index: number) => {
      const iconLayer: Layer = {
        id: `layer_${baseId + 20 + index}`,
        type: 'icon',
        name: `Icon ${index + 1}`,
        parent: containerLayer.id,
        children: [],
        visible: true,
        locked: false,
        zIndex: 10 + index,
        position: icon.position || { x: 0, y: 0 },
        size: { 
          width: icon.size || 20, 
          height: icon.size || 20 
        },
        content: {
          iconName: icon.name || 'star',
          textColor: icon.color || '#666666',
        },
        style: {
          opacity: icon.opacity || 1.0,
          transform: (icon.translateX !== undefined && icon.translateX !== 0) || 
                     (icon.translateY !== undefined && icon.translateY !== 0) || 
                     (icon.rotation !== undefined && icon.rotation !== 0) || 
                     (icon.scale !== undefined && icon.scale !== 1) ? {
            translateX: icon.translateX || 0,
            translateY: icon.translateY || 0,
            rotate: icon.rotation || 0,
            scale: icon.scale || 1,
          } : undefined,
        },
      };
      layers.push(iconLayer);
      containerLayer.children.push(iconLayer.id);
    });
  }

  return layers;
}

/**
 * Reconstruct targeting rules from backend rules
 */
function reconstructTargetingRules(rules: BackendRule[], trigger: string): TargetingRule[] {
  const targetingRules: TargetingRule[] = [];

  // Add event rule for trigger
  targetingRules.push({
    id: `rule_${Date.now()}`,
    type: 'event',
    event: trigger,
    combineWith: 'AND',
  });

  // Convert backend rules
  rules.forEach((rule, index) => {
    targetingRules.push({
      id: `rule_${Date.now() + index + 1}`,
      type: rule.type === 'attribute' ? 'user_property' : 'event',
      property: rule.type === 'attribute' ? rule.field : undefined,
      eventProperty: rule.type === 'event' ? rule.field : undefined,
      operator: reverseMapOperator(rule.operator),
      value: rule.value,
      combineWith: 'AND',
    });
  });

  return targetingRules;
}

/**
 * Reverse map backend operators to frontend operators
 */
function reverseMapOperator(op: BackendRule['operator']): TargetingRule['operator'] {
  const mapping: Record<BackendRule['operator'], TargetingRule['operator']> = {
    '==': 'equals',
    '!=': 'not_equals',
    '>': 'greater_than',
    '<': 'less_than',
    '>=': 'greater_than',
    '<=': 'less_than',
    'contains': 'contains',
  };
  return mapping[op] || 'equals';
}

/**
 * Extract bottom sheet config from backend config
 */
function extractBottomSheetConfig(config: Record<string, any>): BottomSheetConfig {
  return {
    mode: config.mode, // 'container' | 'image-only'
    height: config.height || 'auto',
    dragHandle: config.dragHandle !== false,
    swipeToDismiss: config.swipeToDismiss !== false,
    backgroundColor: config.backgroundColor || '#FFFFFF',
    backgroundImageUrl: config.backgroundImageUrl, // For image-only mode
    backgroundSize: config.backgroundSize, // 'cover' | 'contain' | 'fill'
    backgroundPosition: config.backgroundPosition,
    borderRadius: {
      topLeft: config.borderRadius || 16,
      topRight: config.borderRadius || 16,
    },
    elevation: 2,
    overlay: {
      enabled: true,
      opacity: config.overlayOpacity || 0.5,
      blur: config.backdropBlur || 0,
      color: config.backdropColor || '#000000',
      dismissOnClick: true,
    },
    animation: {
      type: config.animationType || 'slide',
      duration: config.animationDuration || 300,
      easing: 'ease-out',
    },
  };
}

/**
 * Get default display rules
 */
function getDefaultDisplayRules(): DisplayRules {
  return {
    frequency: { type: 'once' },
    interactionLimit: { type: 'unlimited' },
    sessionLimit: { enabled: false },
    priority: 50,
    platforms: ['ios', 'android'],
  };
}
