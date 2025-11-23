/**
 * Variable Registry - Manages dynamic variables for bottom sheets
 * 
 * Enables personalization with variables like:
 * - {userName} → "John Doe"
 * - {cartValue} → "₹1,250"
 * - {daysLeft} → "5"
 * - {progress}% → "65%"
 * 
 * Supports:
 * - Basic variables: {variableName}
 * - Calculations: {cartValue - 200}
 * - Conditionals: {cartValue > 200 ? "Free shipping!" : "Add ₹50 more"}
 * - Formatting: {expiryDate | formatDate}
 */

export type VariableType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'currency'
  | 'percentage';

export interface VariableDefinition {
  id: string;
  name: string;
  type: VariableType;
  defaultValue: any;
  description?: string;
  category?: 'user' | 'cart' | 'product' | 'app' | 'custom';
  format?: string; // For date/currency formatting
}

export interface VariableValue {
  [key: string]: any;
}

/**
 * Built-in system variables available in all bottom sheets
 */
export const SYSTEM_VARIABLES: VariableDefinition[] = [
  // User Variables
  {
    id: 'userName',
    name: 'userName',
    type: 'string',
    defaultValue: 'Guest',
    description: 'Current user\'s name',
    category: 'user',
  },
  {
    id: 'userEmail',
    name: 'userEmail',
    type: 'string',
    defaultValue: 'user@example.com',
    description: 'Current user\'s email',
    category: 'user',
  },
  {
    id: 'userFirstName',
    name: 'userFirstName',
    type: 'string',
    defaultValue: 'Guest',
    description: 'User\'s first name only',
    category: 'user',
  },
  {
    id: 'userPhone',
    name: 'userPhone',
    type: 'string',
    defaultValue: '+91 98765 43210',
    description: 'User\'s phone number',
    category: 'user',
  },
  
  // Cart Variables
  {
    id: 'cartValue',
    name: 'cartValue',
    type: 'currency',
    defaultValue: 0,
    description: 'Total cart value',
    category: 'cart',
    format: '₹',
  },
  {
    id: 'cartItems',
    name: 'cartItems',
    type: 'number',
    defaultValue: 0,
    description: 'Number of items in cart',
    category: 'cart',
  },
  {
    id: 'cartDiscount',
    name: 'cartDiscount',
    type: 'currency',
    defaultValue: 0,
    description: 'Total discount amount',
    category: 'cart',
    format: '₹',
  },
  {
    id: 'freeShippingThreshold',
    name: 'freeShippingThreshold',
    type: 'currency',
    defaultValue: 500,
    description: 'Minimum cart value for free shipping',
    category: 'cart',
    format: '₹',
  },
  
  // Product Variables
  {
    id: 'productName',
    name: 'productName',
    type: 'string',
    defaultValue: 'Product',
    description: 'Current product name',
    category: 'product',
  },
  {
    id: 'productPrice',
    name: 'productPrice',
    type: 'currency',
    defaultValue: 0,
    description: 'Product price',
    category: 'product',
    format: '₹',
  },
  {
    id: 'productDiscount',
    name: 'productDiscount',
    type: 'percentage',
    defaultValue: 0,
    description: 'Product discount percentage',
    category: 'product',
    format: '%',
  },
  {
    id: 'stockRemaining',
    name: 'stockRemaining',
    type: 'number',
    defaultValue: 0,
    description: 'Items remaining in stock',
    category: 'product',
  },
  
  // App Variables
  {
    id: 'appName',
    name: 'appName',
    type: 'string',
    defaultValue: 'App',
    description: 'Application name',
    category: 'app',
  },
  {
    id: 'offerExpiry',
    name: 'offerExpiry',
    type: 'date',
    defaultValue: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    description: 'Offer expiry date/time',
    category: 'app',
    format: 'DD MMM YYYY',
  },
  {
    id: 'daysLeft',
    name: 'daysLeft',
    type: 'number',
    defaultValue: 5,
    description: 'Days remaining for offer',
    category: 'app',
  },
  {
    id: 'currentDate',
    name: 'currentDate',
    type: 'date',
    defaultValue: new Date().toISOString(),
    description: 'Current date',
    category: 'app',
    format: 'DD MMM YYYY',
  },
];

/**
 * VariableRegistry - Central store for all variables
 */
export class VariableRegistry {
  private variables: Map<string, VariableDefinition> = new Map();
  private values: Map<string, any> = new Map();

  constructor() {
    // Initialize with system variables
    this.initializeSystemVariables();
  }

  /**
   * Initialize built-in system variables
   */
  private initializeSystemVariables() {
    SYSTEM_VARIABLES.forEach(variable => {
      this.variables.set(variable.name, variable);
      this.values.set(variable.name, variable.defaultValue);
    });
  }

  /**
   * Register a new custom variable
   */
  registerVariable(variable: VariableDefinition) {
    this.variables.set(variable.name, variable);
    this.values.set(variable.name, variable.defaultValue);
  }

  /**
   * Set variable value
   */
  setValue(name: string, value: any) {
    if (!this.variables.has(name)) {
      console.warn(`Variable "${name}" not registered. Registering with default type.`);
      this.registerVariable({
        id: name,
        name,
        type: typeof value === 'number' ? 'number' : 'string',
        defaultValue: value,
        category: 'custom',
      });
    }
    this.values.set(name, value);
  }

  /**
   * Set multiple variable values at once
   */
  setValues(values: VariableValue) {
    Object.entries(values).forEach(([name, value]) => {
      this.setValue(name, value);
    });
  }

  /**
   * Get variable value
   */
  getValue(name: string): any {
    return this.values.get(name);
  }

  /**
   * Get all variable values
   */
  getAllValues(): VariableValue {
    const result: VariableValue = {};
    this.values.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Get variable definition
   */
  getDefinition(name: string): VariableDefinition | undefined {
    return this.variables.get(name);
  }

  /**
   * Get all variable definitions
   */
  getAllDefinitions(): VariableDefinition[] {
    return Array.from(this.variables.values());
  }

  /**
   * Get variables by category
   */
  getByCategory(category: string): VariableDefinition[] {
    return this.getAllDefinitions().filter(v => v.category === category);
  }

  /**
   * Check if variable exists
   */
  hasVariable(name: string): boolean {
    return this.variables.has(name);
  }

  /**
   * Remove a variable
   */
  removeVariable(name: string) {
    this.variables.delete(name);
    this.values.delete(name);
  }

  /**
   * Reset all values to defaults
   */
  resetToDefaults() {
    this.variables.forEach((def, name) => {
      this.values.set(name, def.defaultValue);
    });
  }

  /**
   * Clear all custom variables (keep system variables)
   */
  clearCustomVariables() {
    const systemVariableNames = SYSTEM_VARIABLES.map(v => v.name);
    this.variables.forEach((_, name) => {
      if (!systemVariableNames.includes(name)) {
        this.removeVariable(name);
      }
    });
  }
}

// Global singleton instance
export const globalVariableRegistry = new VariableRegistry();
