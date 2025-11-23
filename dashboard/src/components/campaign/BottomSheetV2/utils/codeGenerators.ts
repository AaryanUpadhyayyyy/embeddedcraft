/**
 * Code Generators - Advanced utilities for exporting components to various formats
 * 
 * Features:
 * - Full component tree traversal
 * - Proper style conversion (CSS -> Tailwind/Styled Components)
 * - Nested children support
 * - SVG generation
 * - React/Flutter code generation
 */

import type { Component } from '../core/types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert hex color to Tailwind color class
 */
const hexToTailwindColor = (hex: string): string => {
  const colorMap: Record<string, string> = {
    '#ffffff': 'white',
    '#000000': 'black',
    '#ef4444': 'red-500',
    '#f59e0b': 'amber-500',
    '#10b981': 'green-500',
    '#3b82f6': 'blue-500',
    '#8b5cf6': 'violet-500',
    '#ec4899': 'pink-500',
    '#6b7280': 'gray-500',
  };
  
  return colorMap[hex.toLowerCase()] || 'gray-500';
};

/**
 * Convert CSS property value to Tailwind class
 */
const cssPropToTailwind = (prop: string, value: any): string => {
  const classes: string[] = [];
  
  switch (prop) {
    case 'backgroundColor':
      classes.push(`bg-${hexToTailwindColor(value)}`);
      break;
    case 'color':
      classes.push(`text-${hexToTailwindColor(value)}`);
      break;
    case 'fontSize':
      const fontSizeMap: Record<number, string> = {
        12: 'text-xs',
        14: 'text-sm',
        16: 'text-base',
        18: 'text-lg',
        20: 'text-xl',
        24: 'text-2xl',
      };
      classes.push(fontSizeMap[parseInt(value)] || 'text-base');
      break;
    case 'fontWeight':
      const weightMap: Record<string, string> = {
        'normal': 'font-normal',
        'bold': 'font-bold',
        '500': 'font-medium',
        '600': 'font-semibold',
      };
      classes.push(weightMap[value.toString()] || 'font-normal');
      break;
    case 'padding':
      classes.push(`p-${Math.floor(parseInt(value) / 4)}`);
      break;
    case 'margin':
      classes.push(`m-${Math.floor(parseInt(value) / 4)}`);
      break;
    case 'borderRadius':
      const radiusMap: Record<number, string> = {
        0: 'rounded-none',
        4: 'rounded',
        8: 'rounded-lg',
        16: 'rounded-xl',
        9999: 'rounded-full',
      };
      classes.push(radiusMap[parseInt(value)] || 'rounded');
      break;
  }
  
  return classes.join(' ');
};

/**
 * Convert component style to CSS properties object
 */
const componentStyleToCss = (component: Component): Record<string, string> => {
  const css: Record<string, string> = {};
  
  if (component.style) {
    Object.entries(component.style).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        css[key] = String(value);
      }
    });
  }
  
  // Add position properties
  if (component.position) {
    if (component.position.width) css.width = `${component.position.width}px`;
    if (component.position.height) css.height = `${component.position.height}px`;
  }
  
  // Add flex layout properties
  if (component.flexLayout?.enabled) {
    css.display = 'flex';
    css.flexDirection = component.flexLayout.direction || 'column';
    css.gap = `${component.flexLayout.gap || 12}px`;
    
    if (component.flexLayout.padding) {
      css.padding = `${component.flexLayout.padding.top}px ${component.flexLayout.padding.right}px ${component.flexLayout.padding.bottom}px ${component.flexLayout.padding.left}px`;
    }
    
    if (component.flexLayout.justifyContent) {
      css.justifyContent = component.flexLayout.justifyContent;
    }
    
    if (component.flexLayout.alignItems) {
      css.alignItems = component.flexLayout.alignItems;
    }
  }
  
  return css;
};

/**
 * Get component text content
 */
const getComponentText = (component: Component): string => {
  if (component.content && typeof component.content.text === 'string') {
    return component.content.text;
  }
  return '';
};

/**
 * Get component children recursively
 */
const getComponentChildren = (component: Component, allComponents: Component[]): Component[] => {
  if (!component.childIds || component.childIds.length === 0) {
    return [];
  }
  
  return component.childIds
    .map(childId => allComponents.find(c => c.id === childId))
    .filter((c): c is Component => c !== undefined);
};

// ============================================================================
// SVG Generation
// ============================================================================

/**
 * Generate SVG from component tree
 */
export const generateSVG = (component: Component, allComponents: Component[] = []): string => {
  const width = component.position?.width || 200;
  const height = component.position?.height || 100;
  const x = component.position?.x || 0;
  const y = component.position?.y || 0;
  
  const style = componentStyleToCss(component);
  const bgColor = style.backgroundColor || '#ffffff';
  const textColor = style.color || '#000000';
  const borderRadius = parseInt(style.borderRadius || '0');
  
  let svgContent = '';
  
  // Add background rectangle
  if (borderRadius > 0) {
    svgContent += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${borderRadius}" fill="${bgColor}" />\n`;
  } else {
    svgContent += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${bgColor}" />\n`;
  }
  
  // Add text content
  const text = getComponentText(component);
  if (text) {
    const fontSize = parseInt(style.fontSize || '16');
    svgContent += `  <text x="${x + 10}" y="${y + fontSize + 10}" fill="${textColor}" font-size="${fontSize}">${text}</text>\n`;
  }
  
  // Add children
  const children = getComponentChildren(component, allComponents);
  children.forEach(child => {
    const childSvg = generateSVG(child, allComponents);
    svgContent += childSvg.split('\n').filter(line => !line.includes('<svg') && !line.includes('</svg')).join('\n');
  });
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n${svgContent}</svg>`;
};

// ============================================================================
// React Code Generation
// ============================================================================

/**
 * Generate React component code with Tailwind CSS
 */
export const generateReactTailwind = (
  component: Component,
  allComponents: Component[] = [],
  indent: number = 2
): string => {
  const componentName = component.name || 'Component';
  const text = getComponentText(component);
  const children = getComponentChildren(component, allComponents);
  
  // Build Tailwind classes
  const classes: string[] = [];
  const style = componentStyleToCss(component);
  
  Object.entries(style).forEach(([prop, value]) => {
    const tailwindClass = cssPropToTailwind(prop, value);
    if (tailwindClass) classes.push(tailwindClass);
  });
  
  // Add flex classes
  if (component.flexLayout?.enabled) {
    classes.push('flex');
    if (component.flexLayout.direction?.includes('column')) {
      classes.push('flex-col');
    }
  }
  
  const className = classes.join(' ') || 'p-4';
  const spaces = ' '.repeat(indent);
  
  // Generate JSX
  let jsx = '';
  
  if (children.length > 0) {
    jsx += `${spaces}<div className="${className}">\n`;
    
    if (text) {
      jsx += `${spaces}  {/* ${text} */}\n`;
    }
    
    children.forEach(child => {
      const childJsx = generateReactTailwind(child, allComponents, indent + 2);
      jsx += childJsx.split('\n').map(line => `${spaces}  ${line}`).join('\n') + '\n';
    });
    
    jsx += `${spaces}</div>`;
  } else {
    const tag = component.type === 'button' ? 'button' : 'div';
    jsx += `${spaces}<${tag} className="${className}">\n`;
    jsx += `${spaces}  ${text || 'Content'}\n`;
    jsx += `${spaces}</${tag}>`;
  }
  
  // Only add component wrapper if this is the root
  if (indent === 2) {
    return `import React from 'react';

export const ${componentName} = () => {
  return (
${jsx}
  );
};`;
  }
  
  return jsx;
};

/**
 * Generate React component code with Styled Components
 */
export const generateReactStyledComponents = (
  component: Component,
  allComponents: Component[] = []
): string => {
  const componentName = component.name || 'Component';
  const text = getComponentText(component);
  const children = getComponentChildren(component, allComponents);
  
  const style = componentStyleToCss(component);
  
  // Build styled-components CSS
  let styledCss = '';
  Object.entries(style).forEach(([prop, value]) => {
    const cssKey = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
    styledCss += `  ${cssKey}: ${value};\n`;
  });
  
  // Generate component code
  let code = `import React from 'react';
import styled from 'styled-components';

const Container = styled.div\`
${styledCss}\`;
`;
  
  // Add child styled components
  children.forEach((child, index) => {
    const childStyle = componentStyleToCss(child);
    let childCss = '';
    Object.entries(childStyle).forEach(([prop, value]) => {
      const cssKey = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      childCss += `  ${cssKey}: ${value};\n`;
    });
    
    code += `
const Child${index + 1} = styled.div\`
${childCss}\`;
`;
  });
  
  // Generate JSX
  code += `
export const ${componentName} = () => {
  return (
    <Container>
      ${text || 'Content'}`;
  
  if (children.length > 0) {
    children.forEach((child, index) => {
      const childText = getComponentText(child);
      code += `
      <Child${index + 1}>${childText || 'Child content'}</Child${index + 1}>`;
    });
  }
  
  code += `
    </Container>
  );
};`;
  
  return code;
};

/**
 * Generate React component code with CSS Modules
 */
export const generateReactCssModules = (
  component: Component,
  allComponents: Component[] = []
): string => {
  const componentName = component.name || 'Component';
  const text = getComponentText(component);
  const children = getComponentChildren(component, allComponents);
  
  const style = componentStyleToCss(component);
  
  // Generate CSS module
  let cssModule = `.container {\n`;
  Object.entries(style).forEach(([prop, value]) => {
    const cssKey = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
    cssModule += `  ${cssKey}: ${value};\n`;
  });
  cssModule += `}\n`;
  
  // Add child styles
  children.forEach((child, index) => {
    const childStyle = componentStyleToCss(child);
    cssModule += `\n.child${index + 1} {\n`;
    Object.entries(childStyle).forEach(([prop, value]) => {
      const cssKey = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      cssModule += `  ${cssKey}: ${value};\n`;
    });
    cssModule += `}\n`;
  });
  
  // Generate component code
  let code = `import React from 'react';
import styles from './${componentName}.module.css';

export const ${componentName} = () => {
  return (
    <div className={styles.container}>
      ${text || 'Content'}`;
  
  if (children.length > 0) {
    children.forEach((child, index) => {
      const childText = getComponentText(child);
      code += `
      <div className={styles.child${index + 1}}>${childText || 'Child content'}</div>`;
    });
  }
  
  code += `
    </div>
  );
};

/* ${componentName}.module.css */
/*
${cssModule}
*/`;
  
  return code;
};

/**
 * Main React code generator
 */
export const generateReactCode = (
  component: Component,
  allComponents: Component[] = [],
  styleType: 'tailwind' | 'styled-components' | 'css-modules' = 'tailwind'
): string => {
  switch (styleType) {
    case 'tailwind':
      return generateReactTailwind(component, allComponents);
    case 'styled-components':
      return generateReactStyledComponents(component, allComponents);
    case 'css-modules':
      return generateReactCssModules(component, allComponents);
    default:
      return generateReactTailwind(component, allComponents);
  }
};

// ============================================================================
// Flutter Code Generation
// ============================================================================

/**
 * Convert CSS color to Flutter Color
 */
const cssColorToFlutter = (color: string): string => {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    return `Color(0xFF${hex.toUpperCase()})`;
  }
  
  const colorMap: Record<string, string> = {
    'white': 'Colors.white',
    'black': 'Colors.black',
    'red': 'Colors.red',
    'blue': 'Colors.blue',
    'green': 'Colors.green',
  };
  
  return colorMap[color.toLowerCase()] || 'Colors.white';
};

/**
 * Generate Flutter widget code
 */
export const generateFlutterCode = (
  component: Component,
  allComponents: Component[] = [],
  theme: 'material' | 'cupertino' = 'material'
): string => {
  const componentName = component.name || 'CustomWidget';
  const text = getComponentText(component);
  const children = getComponentChildren(component, allComponents);
  
  const style = componentStyleToCss(component);
  const bgColor = cssColorToFlutter(style.backgroundColor || '#ffffff');
  const textColor = cssColorToFlutter(style.color || '#000000');
  const fontSize = parseFloat(style.fontSize || '16');
  
  const importStatement = theme === 'material' 
    ? "import 'package:flutter/material.dart';"
    : "import 'package:flutter/cupertino.dart';";
  
  let widgetContent = '';
  
  if (children.length > 0) {
    // Container with children
    widgetContent = `      Container(
        color: ${bgColor},
        padding: EdgeInsets.all(16),
        child: Column(
          children: [`;
    
    children.forEach(child => {
      const childText = getComponentText(child);
      const childBgColor = cssColorToFlutter(componentStyleToCss(child).backgroundColor || '#ffffff');
      
      widgetContent += `
            Container(
              color: ${childBgColor},
              padding: EdgeInsets.all(8),
              child: Text(
                '${childText || 'Child'}',
                style: TextStyle(color: ${textColor}),
              ),
            ),`;
    });
    
    widgetContent += `
          ],
        ),
      )`;
  } else {
    // Simple container with text
    widgetContent = `      Container(
        color: ${bgColor},
        padding: EdgeInsets.all(16),
        child: Text(
          '${text || 'Content'}',
          style: TextStyle(
            color: ${textColor},
            fontSize: ${fontSize},
          ),
        ),
      )`;
  }
  
  return `${importStatement}

class ${componentName} extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ${widgetContent};
  }
}`;
};

// ============================================================================
// Export All Generators
// ============================================================================

export const codeGenerators = {
  generateSVG,
  generateReactCode,
  generateReactTailwind,
  generateReactStyledComponents,
  generateReactCssModules,
  generateFlutterCode,
};
