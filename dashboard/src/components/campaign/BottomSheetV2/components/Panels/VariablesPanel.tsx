import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Eye, Code, Sparkles } from 'lucide-react';
import { globalVariableRegistry, type VariableDefinition, type VariableType } from '../../core/variableRegistry';
import { evaluateVariables, previewWithVariables, COMMON_EXPRESSIONS } from '../../core/variableEvaluator';

/**
 * VariablesPanel - UI for managing dynamic variables
 * 
 * Features:
 * - View all available variables (system + custom)
 * - Edit variable values in real-time
 * - Preview how variables will look
 * - Quick insert common expressions
 * - Add custom variables
 */

interface VariablesPanelProps {
  onInsertVariable?: (variableName: string) => void;
}

export const VariablesPanel: React.FC<VariablesPanelProps> = ({ onInsertVariable }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewText, setPreviewText] = useState<string>('Hello {userName}, your cart value is {cartValue}');
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);

  // Get all variables grouped by category
  const allVariables = globalVariableRegistry.getAllDefinitions();
  const categories = ['all', 'user', 'cart', 'product', 'app', 'custom'];

  const filteredVariables = selectedCategory === 'all'
    ? allVariables
    : allVariables.filter(v => v.category === selectedCategory);

  // Preview evaluation
  const preview = previewWithVariables(previewText);

  const handleValueChange = (varName: string, newValue: any) => {
    const definition = globalVariableRegistry.getDefinition(varName);
    
    // Parse value based on type
    let parsedValue = newValue;
    if (definition?.type === 'number' || definition?.type === 'currency' || definition?.type === 'percentage') {
      parsedValue = parseFloat(newValue) || 0;
    } else if (definition?.type === 'boolean') {
      parsedValue = newValue === 'true' || newValue === true;
    }
    
    globalVariableRegistry.setValue(varName, parsedValue);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Dynamic Variables</h3>
          <button
            onClick={() => setShowAddDialog(!showAddDialog)}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Add custom variable"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Variables List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Available Variables ({filteredVariables.length})
        </div>

        {filteredVariables.map(variable => (
          <VariableItem
            key={variable.id}
            variable={variable}
            onValueChange={handleValueChange}
            onInsert={onInsertVariable}
          />
        ))}

        {/* Common Expressions */}
        <div className="pt-4 mt-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick Expressions
            </div>
          </div>

          <div className="space-y-2">
            {COMMON_EXPRESSIONS.slice(0, 5).map((expr, idx) => (
              <div
                key={idx}
                className="p-2 bg-purple-50 border border-purple-200 rounded cursor-pointer hover:bg-purple-100 transition-colors"
                onClick={() => onInsertVariable?.(expr.expression)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-medium text-purple-900">{expr.label}</div>
                  <Code className="w-3 h-3 text-purple-500" />
                </div>
                <div className="text-xs font-mono text-purple-700 bg-white px-2 py-1 rounded">
                  {expr.expression}
                </div>
                <div className="text-xs text-purple-600 mt-1">{expr.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="border-t p-4 bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-4 h-4 text-gray-500" />
          <div className="text-xs font-semibold text-gray-700">Live Preview</div>
        </div>

        <textarea
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm font-mono mb-2"
          rows={2}
          placeholder="Type text with variables: {userName}"
        />

        <div className="p-3 bg-white border rounded">
          <div className="text-xs text-gray-500 mb-1">Result:</div>
          <div className="text-sm font-medium text-gray-900">{preview.evaluated}</div>
          
          {preview.variables.length > 0 && (
            <div className="text-xs text-blue-600 mt-2">
              Uses: {preview.variables.join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Individual variable item with edit capability
 */
interface VariableItemProps {
  variable: VariableDefinition;
  onValueChange: (name: string, value: any) => void;
  onInsert?: (variableName: string) => void;
}

const VariableItem: React.FC<VariableItemProps> = ({ variable, onValueChange, onInsert }) => {
  const [isEditing, setIsEditing] = useState(false);
  const currentValue = globalVariableRegistry.getValue(variable.name);

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'user': return 'bg-blue-100 text-blue-700';
      case 'cart': return 'bg-green-100 text-green-700';
      case 'product': return 'bg-purple-100 text-purple-700';
      case 'app': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderValueInput = () => {
    if (!isEditing) {
      return (
        <div className="text-sm font-medium text-gray-900">
          {variable.type === 'currency' && variable.format}
          {variable.type === 'number' || variable.type === 'currency'
            ? currentValue?.toLocaleString('en-IN')
            : String(currentValue || '')}
          {variable.type === 'percentage' && '%'}
        </div>
      );
    }

    switch (variable.type) {
      case 'boolean':
        return (
          <select
            value={String(currentValue)}
            onChange={(e) => {
              onValueChange(variable.name, e.target.value === 'true');
              setIsEditing(false);
            }}
            className="w-full px-2 py-1 border rounded text-sm"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
      
      case 'date':
        return (
          <input
            type="datetime-local"
            value={new Date(currentValue).toISOString().slice(0, 16)}
            onChange={(e) => {
              onValueChange(variable.name, new Date(e.target.value).toISOString());
              setIsEditing(false);
            }}
            className="w-full px-2 py-1 border rounded text-sm"
          />
        );
      
      case 'number':
      case 'currency':
      case 'percentage':
        return (
          <input
            type="number"
            value={currentValue || 0}
            onChange={(e) => onValueChange(variable.name, e.target.value)}
            onBlur={() => setIsEditing(false)}
            className="w-full px-2 py-1 border rounded text-sm"
            autoFocus
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={currentValue || ''}
            onChange={(e) => onValueChange(variable.name, e.target.value)}
            onBlur={() => setIsEditing(false)}
            className="w-full px-2 py-1 border rounded text-sm"
            autoFocus
          />
        );
    }
  };

  return (
    <div className="p-3 border rounded hover:border-blue-300 transition-colors bg-white">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <code 
              className="text-sm font-mono text-blue-600 cursor-pointer hover:underline"
              onClick={() => onInsert?.(`{${variable.name}}`)}
              title="Click to insert"
            >
              {`{${variable.name}}`}
            </code>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(variable.category)}`}>
              {variable.category}
            </span>
          </div>
          {variable.description && (
            <div className="text-xs text-gray-500">{variable.description}</div>
          )}
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-1 hover:bg-gray-100 rounded"
          title="Edit value"
        >
          <Edit2 className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      <div className="mt-2">
        <div className="text-xs text-gray-500 mb-1">Current Value:</div>
        {renderValueInput()}
      </div>
    </div>
  );
};

export default VariablesPanel;
