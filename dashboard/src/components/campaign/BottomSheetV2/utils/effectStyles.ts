/**
 * Effect Utilities - Convert effect data to CSS styles
 */

/**
 * Generate box-shadow CSS from shadow effects
 */
export function generateShadowCSS(shadows: any[] = []): string {
  if (!shadows || shadows.length === 0) return 'none';
  
  return shadows
    .filter(shadow => shadow.enabled)
    .map(shadow => {
      const { type, x, y, blur, spread, color } = shadow;
      const inset = type === 'inner-shadow' ? 'inset ' : '';
      return `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`;
    })
    .join(', ');
}

/**
 * Generate gradient CSS from gradient effect
 */
export function generateGradientCSS(gradient: any): string {
  if (!gradient || !gradient.enabled || !gradient.stops) return '';
  
  const { type, angle, stops } = gradient;
  const colorStops = stops.map((stop: any) => `${stop.color} ${stop.position}%`).join(', ');
  
  switch (type) {
    case 'linear':
      return `linear-gradient(${angle}deg, ${colorStops})`;
    case 'radial':
      return `radial-gradient(circle, ${colorStops})`;
    case 'angular':
    case 'conic':
      return `conic-gradient(from ${angle}deg, ${colorStops})`;
    default:
      return '';
  }
}

/**
 * Generate blur filter CSS from blur effect
 */
export function generateBlurCSS(blur: any): string {
  if (!blur || !blur.enabled || blur.amount === 0) return '';
  
  if (blur.type === 'layer') {
    return `blur(${blur.amount}px)`;
  } else if (blur.type === 'background') {
    // Background blur uses backdrop-filter
    return '';
  }
  
  return '';
}

/**
 * Generate stroke CSS from stroke effect
 */
export function generateStrokeCSS(stroke: any): React.CSSProperties {
  if (!stroke || !stroke.enabled) return {};
  
  const { width, color, position, style } = stroke;
  const borderStyle = style === 'solid' ? 'solid' : style === 'dashed' ? 'dashed' : 'dotted';
  
  switch (position) {
    case 'inside':
      return {
        border: `${width}px ${borderStyle} ${color}`,
      };
    case 'center':
      return {
        outline: `${width}px ${borderStyle} ${color}`,
        outlineOffset: `-${width / 2}px`,
      } as React.CSSProperties;
    case 'outside':
      return {
        boxShadow: `0 0 0 ${width}px ${color}`,
      };
    default:
      return {
        border: `${width}px ${borderStyle} ${color}`,
      };
  }
}

/**
 * Generate all effect styles for a component
 */
export function generateEffectStyles(effects: any): React.CSSProperties {
  if (!effects) return {};
  
  const styles: React.CSSProperties = {};
  
  // Shadows
  if (effects.shadows && effects.shadows.length > 0) {
    styles.boxShadow = generateShadowCSS(effects.shadows);
  }
  
  // Gradient (as background)
  if (effects.gradient && effects.gradient.enabled) {
    styles.background = generateGradientCSS(effects.gradient);
  }
  
  // Blur
  if (effects.blur && effects.blur.enabled) {
    if (effects.blur.type === 'layer') {
      styles.filter = generateBlurCSS(effects.blur);
    } else if (effects.blur.type === 'background') {
      styles.backdropFilter = `blur(${effects.blur.amount}px)`;
      styles.WebkitBackdropFilter = `blur(${effects.blur.amount}px)`;
    }
  }
  
  // Stroke
  if (effects.stroke && effects.stroke.enabled) {
    const strokeStyles = generateStrokeCSS(effects.stroke);
    Object.assign(styles, strokeStyles);
  }
  
  // Opacity
  if (effects.opacity !== undefined && effects.opacity !== 100) {
    styles.opacity = effects.opacity / 100;
  }
  
  // Blend Mode
  if (effects.blendMode && effects.blendMode !== 'normal') {
    styles.mixBlendMode = effects.blendMode as any;
  }
  
  return styles;
}

/**
 * Generate flex container styles
 */
export function generateFlexContainerStyles(flexLayout: any): React.CSSProperties {
  if (!flexLayout || !flexLayout.enabled) return {};
  
  const { direction, gap, padding, alignItems, justifyContent, flexWrap } = flexLayout;
  
  return {
    display: 'flex',
    flexDirection: direction,
    gap: `${gap}px`,
    padding: padding
      ? `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`
      : '16px',
    alignItems: alignItems || 'flex-start',
    justifyContent: justifyContent || 'flex-start',
    flexWrap: flexWrap || 'nowrap',
  };
}

/**
 * Generate flex child styles
 */
export function generateFlexChildStyles(flexChild: any): React.CSSProperties {
  if (!flexChild) return {};
  
  const styles: React.CSSProperties = {};
  
  // Sizing mode
  if (flexChild.sizingMode === 'hug') {
    styles.flexShrink = 1;
    styles.flexGrow = 0;
    styles.width = 'auto';
    styles.height = 'auto';
  } else if (flexChild.sizingMode === 'fill') {
    styles.flexGrow = 1;
    styles.flexShrink = 1;
  } else if (flexChild.sizingMode === 'fixed') {
    styles.flexShrink = 0;
    styles.flexGrow = 0;
  }
  
  // Min/Max constraints
  if (flexChild.minWidth !== undefined) styles.minWidth = `${flexChild.minWidth}px`;
  if (flexChild.maxWidth !== undefined) styles.maxWidth = `${flexChild.maxWidth}px`;
  if (flexChild.minHeight !== undefined) styles.minHeight = `${flexChild.minHeight}px`;
  if (flexChild.maxHeight !== undefined) styles.maxHeight = `${flexChild.maxHeight}px`;
  
  // Custom flex values
  if (flexChild.flexGrow !== undefined) styles.flexGrow = flexChild.flexGrow;
  if (flexChild.flexShrink !== undefined) styles.flexShrink = flexChild.flexShrink;
  
  // Align self
  if (flexChild.alignSelf && flexChild.alignSelf !== 'auto') {
    styles.alignSelf = flexChild.alignSelf;
  }
  
  return styles;
}

/**
 * Generate animation styles (CSS animations)
 */
export function generateAnimationStyles(animations: any[], previewAnimationId?: string | null): React.CSSProperties {
  if (!animations || animations.length === 0) return {};
  
  // If previewing a specific animation, apply its styles
  if (previewAnimationId) {
    const previewAnim = animations.find(a => a.id === previewAnimationId);
    if (previewAnim && previewAnim.enabled) {
      // Generate CSS animation name from keyframes
      const animationName = `animation-${previewAnimationId}`;
      return {
        animation: `${animationName} ${previewAnim.duration}ms ${previewAnim.easing} ${previewAnim.delay}ms ${previewAnim.loop ? 'infinite' : '1'} forwards`,
      };
    }
  }
  
  // Apply on-enter animations on mount
  const enterAnimations = animations.filter(a => a.enabled && a.trigger === 'on-enter');
  if (enterAnimations.length > 0) {
    const anim = enterAnimations[0]; // Use first on-enter animation
    const animationName = `animation-${anim.id}`;
    return {
      animation: `${animationName} ${anim.duration}ms ${anim.easing} ${anim.delay}ms ${anim.loop ? 'infinite' : '1'} forwards`,
    };
  }
  
  return {};
}

/**
 * Generate CSS keyframes string for an animation
 */
export function generateKeyframesCSS(animationId: string, keyframes: any[]): string {
  if (!keyframes || keyframes.length === 0) return '';
  
  const keyframeRules = keyframes
    .map(kf => {
      const properties = Object.entries(kf.properties)
        .map(([key, value]) => `${key}: ${value};`)
        .join(' ');
      return `  ${kf.time}% { ${properties} }`;
    })
    .join('\n');
  
  return `@keyframes animation-${animationId} {\n${keyframeRules}\n}`;
}

/**
 * Inject animation keyframes into document
 */
export function injectAnimationKeyframes(animations: any[]) {
  if (!animations || animations.length === 0) return;
  
  // Remove existing animation style tag
  const existingStyle = document.getElementById('component-animations');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Generate all keyframes CSS
  const keyframesCSS = animations
    .map(anim => generateKeyframesCSS(anim.id, anim.keyframes))
    .join('\n\n');
  
  // Inject new style tag
  if (keyframesCSS) {
    const style = document.createElement('style');
    style.id = 'component-animations';
    style.innerHTML = keyframesCSS;
    document.head.appendChild(style);
  }
}
