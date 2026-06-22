import { getSchema } from './schemaRegistry.js';
import { alertStore } from './alertStore.js';

export class SchemaValidationError extends Error {
  constructor(message, entityName, errors, record) {
    super(message);
    this.name = 'SchemaValidationError';
    this.entityName = entityName;
    this.errors = errors; // Array of error details: { field, type, message, description }
    this.record = record;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Validates a single record against its registered schema.
 * 
 * @param {string} entityName - The registered name of the schema (e.g. 'package').
 * @param {object} record - The record object to validate.
 * @param {object} [options={}] - Validation control options.
 * @param {string} [options.failMode='lazy'] - 'fast' (throw immediately on first error) or 'lazy' (collect all and log/warn/throw at end).
 * @param {string} [options.context='read'] - 'read', 'create', or 'update'. In 'update' mode, missing required fields are ignored.
 * @returns {boolean} True if validation passes (or in lazy mode if it logs warnings).
 * @throws {SchemaValidationError} If validation fails in 'fast' mode, or in 'lazy' mode if configured to throw.
 */
export function validateRecordSchema(entityName, record, options = {}) {
  const { failMode = 'lazy', context = 'read' } = options;
  const schema = getSchema(entityName);

  if (!schema) {
    console.warn(`[ValidationEngine] No schema registered for entity type: "${entityName}". Skipping validation.`);
    return true;
  }

  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    const errorMsg = `Invalid record format: expected object, got ${typeof record}`;
    if (failMode === 'fast') {
      throw new SchemaValidationError(errorMsg, entityName, [{ field: 'root', type: 'format', message: errorMsg }], record);
    }
    console.error(`[ValidationEngine:Error] ${errorMsg}`);
    return false;
  }

  const errors = [];
  const schemaFields = schema.fields;
  const recordKeys = Object.keys(record);

  // 1. Check for unknown fields in the record (fields not declared in schema)
  for (const key of recordKeys) {
    if (!schemaFields[key]) {
      const description = 'This field is not defined in the schema registry contract.';
      const message = `Unknown field "${key}" detected in record.`;
      const err = { field: key, type: 'unknown_field', message, description };
      
      if (failMode === 'fast') {
        throw new SchemaValidationError(message, entityName, [err], record);
      }
      errors.push(err);
    }
  }

  // 2. Validate schema fields
  for (const [fieldName, rules] of Object.entries(schemaFields)) {
    const value = record[fieldName];
    const isPresent = fieldName in record;

    // Check required fields (skip missing required checks during update context)
    if (rules.required && context !== 'update') {
      if (!isPresent || value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        const message = `Missing required field: "${fieldName}".`;
        const err = { field: fieldName, type: 'required', message, description: rules.description };
        
        if (failMode === 'fast') {
          throw new SchemaValidationError(message, entityName, [err], record);
        }
        errors.push(err);
        continue;
      }
    }

    // Skip type check if not present or null/undefined (unless required, which was handled above)
    if (!isPresent || value === null || value === undefined) {
      continue;
    }

    // Type check
    let typeMatches = true;
    if (rules.type === 'string' && typeof value !== 'string') {
      typeMatches = false;
    } else if (rules.type === 'number' && typeof value !== 'number') {
      typeMatches = false;
    } else if (rules.type === 'boolean' && typeof value !== 'boolean') {
      typeMatches = false;
    } else if (rules.type === 'array' && !Array.isArray(value)) {
      typeMatches = false;
    } else if (rules.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
      typeMatches = false;
    }

    if (!typeMatches) {
      const message = `Type mismatch for field "${fieldName}": Expected ${rules.type}, got ${typeof value}.`;
      const err = { field: fieldName, type: 'type_mismatch', message, description: rules.description };
      
      if (failMode === 'fast') {
        throw new SchemaValidationError(message, entityName, [err], record);
      }
      errors.push(err);
      continue;
    }

    // Choices check (e.g. status)
    if (rules.choices && !rules.choices.includes(value)) {
      const message = `Invalid value for field "${fieldName}": Must be one of [${rules.choices.join(', ')}], got "${value}".`;
      const err = { field: fieldName, type: 'invalid_choice', message, description: rules.description };
      
      if (failMode === 'fast') {
        throw new SchemaValidationError(message, entityName, [err], record);
      }
      errors.push(err);
    }
  }

  // 3. Handle collected errors
  if (errors.length > 0) {
    const summaryMessage = `Validation failed for entity "${entityName}" (${errors.length} violations).`;
    
    // Log helpful developer/agent debug information with schema descriptions
    console.group(`⚠️ [ValidationEngine:SchemaViolation] ${summaryMessage}`);
    console.log('Violated Record:', record);
    errors.forEach(err => {
      console.warn(`- [${err.field}]: ${err.message}`);
      console.info(`  ↳ Description: ${err.description || 'No description provided.'}`);
    });
    console.groupEnd();

    // Trigger non-blocking toast warning alert
    const fieldsStr = errors.map(e => `- [${e.field}]: ${e.message}`).join('\n');
    const description = `The following schema violations were detected during data operations:\n\n${fieldsStr}\n\nRecord details:\n${JSON.stringify(record, null, 2)}`;
    
    alertStore.addAlert({
      variant: 'warning',
      title: `Schema Violation: ${entityName.toUpperCase()}`,
      description
    });

    if (failMode === 'fast') {
      throw new SchemaValidationError(summaryMessage, entityName, errors, record);
    }
    return false;
  }

  return true;
}
