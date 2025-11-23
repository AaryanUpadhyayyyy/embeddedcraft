/**
 * Runtime Evaluator - Replaces variables with actual values at runtime
 * 
 * Supports:
 * - Simple variables: {userName} → "John Doe"
 * - Calculations: {cartValue - 200} → "50"
 * - Conditionals: {cartValue > 200 ? "Free!" : "Add more"} → "Free!"
 * - Formatting: {offerExpiry | formatDate} → "31 Dec 2024"
 * - Nested variables: {userName}'s cart: ₹{cartValue}
 */

import { globalVariableRegistry, type VariableDefinition } from './variableRegistry';

/**
 * Format value based on variable type
 */
function formatValue(value: any, definition?: VariableDefinition, formatType?: string): string {
  if (value === null || value === undefined) return '';

  // Apply custom format if provided
  if (formatType) {
    return applyFormat(value, formatType, definition);
  }

  // Apply default format based on variable type
  if (!definition) return String(value);

  switch (definition.type) {
    case 'currency':
      const currencySymbol = definition.format || '₹';
      const numValue = typeof value === 'number' ? value : parseFloat(value);
      return `${currencySymbol}${numValue.toLocaleString('en-IN')}`;
    
    case 'percentage':
      const percentValue = typeof value === 'number' ? value : parseFloat(value);
      return `${percentValue}%`;
    
    case 'date':
      return formatDate(value, definition.format || 'DD MMM YYYY');
    
    case 'number':
      const num = typeof value === 'number' ? value : parseFloat(value);
      return num.toLocaleString('en-IN');
    
    case 'boolean':
      return value ? 'Yes' : 'No';
    
    default:
      return String(value);
  }
}

/**
 * Apply custom format to value
 */
function applyFormat(value: any, formatType: string, definition?: VariableDefinition): string {
  switch (formatType.toLowerCase()) {
    case 'formatdate':
    case 'date':
      return formatDate(value, definition?.format || 'DD MMM YYYY');
    
    case 'formatcurrency':
    case 'currency':
      const symbol = definition?.format || '₹';
      const num = typeof value === 'number' ? value : parseFloat(value);
      return `${symbol}${num.toLocaleString('en-IN')}`;
    
    case 'uppercase':
    case 'upper':
      return String(value).toUpperCase();
    
    case 'lowercase':
    case 'lower':
      return String(value).toLowerCase();
    
    case 'capitalize':
      return String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase();
    
    case 'round':
      return Math.round(parseFloat(value)).toString();
    
    case 'floor':
      return Math.floor(parseFloat(value)).toString();
    
    case 'ceil':
      return Math.ceil(parseFloat(value)).toString();
    
    default:
      return String(value);
  }
}

/**
 * Format date based on format string
 */
function formatDate(dateValue: any, format: string): string {
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return String(dateValue);

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return format
    .replace('DD', day.toString().padStart(2, '0'))
    .replace('D', day.toString())
    .replace('MMMM', monthNamesFull[month])
    .replace('MMM', monthNames[month])
    .replace('MM', (month + 1).toString().padStart(2, '0'))
    .replace('M', (month + 1).toString())
    .replace('YYYY', year.toString())
    .replace('YY', year.toString().slice(-2));
}

/**
 * Evaluate arithmetic expression with variables
 */
function evaluateExpression(expression: string, values: Record<string, any>): any {
  try {
    // Replace variable names with their values
    let processedExpr = expression;
    Object.entries(values).forEach(([name, value]) => {
      const regex = new RegExp(`\\b${name}\\b`, 'g');
      processedExpr = processedExpr.replace(regex, String(value));
    });

    // Safe evaluation (only allow numbers, basic operators, and ternary)
    // Remove any potentially dangerous characters
    if (/[a-zA-Z_$]/.test(processedExpr.replace(/true|false/g, ''))) {
      console.warn('Invalid expression:', expression);
      return expression; // Return original if contains invalid characters
    }

    // Evaluate using Function constructor (safer than eval)
    const result = new Function(`return ${processedExpr}`)();
    return result;
  } catch (error) {
    console.error('Error evaluating expression:', expression, error);
    return expression; // Return original on error
  }
}

/**
 * Extract variable name and optional format from placeholder
 * Examples:
 * - {userName} → { name: 'userName', format: undefined }
 * - {offerExpiry | formatDate} → { name: 'offerExpiry', format: 'formatDate' }
 * - {cartValue - 200} → { name: null, expression: 'cartValue - 200' }
 */
function parseVariablePlaceholder(placeholder: string): {
  name?: string;
  format?: string;
  expression?: string;
  isConditional?: boolean;
} {
  const trimmed = placeholder.trim();

  // Check if it's a conditional (contains ?)
  if (trimmed.includes('?')) {
    return { expression: trimmed, isConditional: true };
  }

  // Check if it's an expression (contains operators)
  if (/[+\-*/<>=]/.test(trimmed)) {
    return { expression: trimmed };
  }

  // Check if it has a format pipe
  if (trimmed.includes('|')) {
    const [name, format] = trimmed.split('|').map(s => s.trim());
    return { name, format };
  }

  // Simple variable name
  return { name: trimmed };
}

/**
 * Replace all variable placeholders in text with actual values
 */
export function evaluateVariables(text: string, customValues?: Record<string, any>): string {
  if (!text) return text;

  // Get all current variable values
  const values = {
    ...globalVariableRegistry.getAllValues(),
    ...customValues,
  };

  // Find all placeholders: {variableName} or {expression}
  const placeholderRegex = /\{([^}]+)\}/g;
  
  return text.replace(placeholderRegex, (match, content) => {
    const parsed = parseVariablePlaceholder(content);

    // Handle expressions and conditionals
    if (parsed.expression) {
      const result = evaluateExpression(parsed.expression, values);
      return String(result);
    }

    // Handle simple variables with optional formatting
    if (parsed.name) {
      const value = values[parsed.name];
      const definition = globalVariableRegistry.getDefinition(parsed.name);
      
      if (value === undefined) {
        console.warn(`Variable "${parsed.name}" not found`);
        return match; // Return original placeholder if variable not found
      }

      return formatValue(value, definition, parsed.format);
    }

    return match; // Return original if can't parse
  });
}

/**
 * Check if text contains any variable placeholders
 */
export function containsVariables(text: string): boolean {
  return /\{[^}]+\}/.test(text);
}

/**
 * Extract all variable names used in text
 */
export function extractVariableNames(text: string): string[] {
  const placeholderRegex = /\{([^}]+)\}/g;
  const matches = text.matchAll(placeholderRegex);
  const names = new Set<string>();

  for (const match of matches) {
    const parsed = parseVariablePlaceholder(match[1]);
    
    if (parsed.name) {
      names.add(parsed.name);
    } else if (parsed.expression) {
      // Extract variable names from expressions
      const varRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
      const varMatches = parsed.expression.matchAll(varRegex);
      for (const varMatch of varMatches) {
        // Skip JavaScript keywords
        if (!['true', 'false', 'null', 'undefined'].includes(varMatch[1])) {
          names.add(varMatch[1]);
        }
      }
    }
  }

  return Array.from(names);
}

/**
 * Preview how text will look with current variable values
 */
export function previewWithVariables(text: string, customValues?: Record<string, any>): {
  original: string;
  evaluated: string;
  variables: string[];
} {
  return {
    original: text,
    evaluated: evaluateVariables(text, customValues),
    variables: extractVariableNames(text),
  };
}

/**
 * Validate variable expression
 */
export function validateExpression(expression: string): {
  valid: boolean;
  error?: string;
  variables: string[];
} {
  try {
    const variables = extractVariableNames(`{${expression}}`);
    
    // Check if all variables exist
    const missingVars = variables.filter(name => !globalVariableRegistry.hasVariable(name));
    if (missingVars.length > 0) {
      return {
        valid: false,
        error: `Unknown variables: ${missingVars.join(', ')}`,
        variables,
      };
    }

    // Try to evaluate with current values
    const testValues = globalVariableRegistry.getAllValues();
    evaluateExpression(expression, testValues);

    return {
      valid: true,
      variables,
    };
  } catch (error) {
    return {
      valid: false,
      error: (error as Error).message,
      variables: [],
    };
  }
}

/**
 * Common variable expressions for quick insertion
 */
export const COMMON_EXPRESSIONS = [
  // User personalization
  {
    label: 'User Name',
    expression: '{userName}',
    description: 'Current user\'s full name',
  },
  {
    label: 'First Name',
    expression: '{userFirstName}',
    description: 'User\'s first name only',
  },
  
  // Cart calculations
  {
    label: 'Cart Value',
    expression: '{cartValue}',
    description: 'Total cart value with currency',
  },
  {
    label: 'Amount to Free Shipping',
    expression: '{freeShippingThreshold - cartValue}',
    description: 'Remaining amount for free shipping',
  },
  {
    label: 'Free Shipping Status',
    expression: '{cartValue >= freeShippingThreshold ? "FREE shipping!" : "Add ₹" + (freeShippingThreshold - cartValue) + " more"}',
    description: 'Conditional free shipping message',
  },
  
  // Product details
  {
    label: 'Product Name',
    expression: '{productName}',
    description: 'Current product name',
  },
  {
    label: 'Product Price',
    expression: '{productPrice}',
    description: 'Product price with currency',
  },
  {
    label: 'Discount Percentage',
    expression: '{productDiscount}%',
    description: 'Discount percentage',
  },
  {
    label: 'Stock Alert',
    expression: '{stockRemaining < 10 ? "Only " + stockRemaining + " left!" : stockRemaining + " available"}',
    description: 'Conditional stock alert',
  },
  
  // Dates
  {
    label: 'Offer Expiry',
    expression: '{offerExpiry | formatDate}',
    description: 'Formatted expiry date',
  },
  {
    label: 'Days Remaining',
    expression: '{daysLeft} days left',
    description: 'Days until expiry',
  },
  {
    label: 'Current Date',
    expression: '{currentDate | formatDate}',
    description: 'Today\'s date formatted',
  },
];
