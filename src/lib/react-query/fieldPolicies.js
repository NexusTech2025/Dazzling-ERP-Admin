/**
 * @module fieldPolicies
 * @description
 * Individual field-level and structural-level validation policies for the Schema Validation Engine.
 */

/**
 * Policy enforcing that required fields are present and non-empty.
 * Relaxed during "update" context to support partial patch payloads.
 */
export class RequiredFieldPolicy {
    constructor() {
        this.errorType = 'required';
    }

    /**
     * Checks if this policy should execute for the target field.
     */
    shouldExecute(isPresent, value, rules, context) {
        return !!rules.required && context !== 'update';
    }

    /**
     * Executes the validation check.
     */
    validate(fieldName, isPresent, value, rules) {
        const isMissing = !isPresent || value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

        if (isMissing) {
            return {
                isValid: false,
                error: {
                    field: fieldName,
                    type: this.errorType,
                    message: `Missing required field: "${fieldName}".`,
                    description: rules.description
                }
            };
        }

        return { isValid: true };
    }
}

/**
 * Policy enforcing explicit type safety corresponding to declared schema definitions.
 * Supported types: 'string', 'number', 'boolean', 'array', 'object'.
 */
export class TypeSafetyPolicy {
    constructor() {
        this.errorType = 'type_mismatch';
    }

    /**
     * Checks if this policy should execute for the target field.
     */
    shouldExecute(isPresent, value) {
        // Only type check if the field is present and has a meaningful value
        return isPresent && value !== null && value !== undefined;
    }

    /**
     * Executes the validation check.
     */
    validate(fieldName, isPresent, value, rules) {
        let matches = true;

        switch (rules.type) {
            case 'string':
                matches = typeof value === 'string';
                break;
            case 'number':
                matches = typeof value === 'number';
                break;
            case 'boolean':
                matches = typeof value === 'boolean';
                break;
            case 'array':
                matches = Array.isArray(value);
                break;
            case 'object':
                matches = typeof value === 'object' && value !== null && !Array.isArray(value);
                break;
            default:
                matches = true;
        }

        if (!matches) {
            return {
                isValid: false,
                error: {
                    field: fieldName,
                    type: this.errorType,
                    message: `Type mismatch for field "${fieldName}": Expected ${rules.type}, got ${typeof value}.`,
                    description: rules.description
                }
            };
        }

        return { isValid: true };
    }
}

/**
 * Policy enforcing that values stay strictly within a whitelisted choices array enum.
 */
export class ChoiceConstraintPolicy {
    constructor() {
        this.errorType = 'invalid_choice';
    }

    /**
     * Checks if this policy should execute for the target field.
     */
    shouldExecute(isPresent, value, rules) {
        return isPresent && value !== null && value !== undefined && Array.isArray(rules.choices);
    }

    /**
     * Executes the validation check.
     */
    validate(fieldName, isPresent, value, rules) {
        if (!rules.choices.includes(value)) {
            return {
                isValid: false,
                error: {
                    field: fieldName,
                    type: this.errorType,
                    message: `Invalid value for field "${fieldName}": Must be one of [${rules.choices.join(', ')}], got "${value}".`,
                    description: rules.description
                }
            };
        }

        return { isValid: true };
    }
}

/**
 * Policy enforcing that all key properties of the record exist in the schema fields.
 */
export class UnknownFieldPolicy {
    constructor() {
        this.errorType = 'unknown_field';
    }

    /**
     * Checks if this policy should execute for the target record.
     */
    shouldExecute(record, schemaFields) {
        return !!record && !!schemaFields;
    }

    /**
     * Executes the validation check on all record keys.
     */
    validate(record, schemaFields) {
        const errors = [];
        const recordKeys = Object.keys(record);

        for (const key of recordKeys) {
            if (!schemaFields[key]) {
                errors.push({
                    field: key,
                    type: this.errorType,
                    message: `Unknown field "${key}" detected in record.`,
                    description: 'This field is not defined in the schema registry contract.'
                });
            }
        }

        return errors;
    }
}
