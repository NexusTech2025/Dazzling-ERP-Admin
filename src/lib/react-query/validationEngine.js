import { getSchema } from './schemaRegistry.js';
import { alertStore } from './alertStore.js';
import {
    UnknownFieldPolicy,
    RequiredFieldPolicy,
    TypeSafetyPolicy,
    ChoiceConstraintPolicy
} from './fieldPolicies.js';

/**
 * Custom error class representing one or multiple schema contract violations.
 * @class SchemaValidationError
 * @extends Error
 */
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
 * @typedef {Object} ValidationErrorDetails
 * @property {string} field - The key path name or field indicator where the violation occurred.
 * @property {('unknown_field'|'required'|'type_mismatch'|'invalid_choice'|'format')} type - Categorized structural rule violation type.
 * @property {string} message - A developer-friendly validation breakdown message string.
 * @property {string} [description] - The official schema-declared explanation text outlining the intended purpose of the field.
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Indication if the policy passed successfully.
 * @property {ValidationErrorDetails} [error] - The detailed error object if validation failed.
 */

// ============================================================================
// 1. STRATEGY REGISTRY CONFIGURATION
// ============================================================================

const STRUCTURAL_POLICIES = [
    new UnknownFieldPolicy()
];

const FIELD_POLICIES = [
    new RequiredFieldPolicy(),
    new TypeSafetyPolicy(),
    new ChoiceConstraintPolicy()
];

// ============================================================================
// 3. CORE VALIDATION ORCHESTRATOR
// ============================================================================

/**
 * Orchestrates error logging, alerts, and formatting for schema violations.
 * @private
 */
function handleValidationFailures(entityName, record, errors, failMode, suppressAlert = false) {
    const summaryMessage = `Validation failed for entity "${entityName}" (${errors.length} violations).`;

    // 1. Visual debug logging inside a clean Console Group for developers
    console.group(`⚠️ [ValidationEngine:SchemaViolation] ${summaryMessage}`);
    console.log('Violated Record:', record);
    errors.forEach(err => {
        console.warn(`- [${err.field}]: ${err.message}`);
        console.info(`  ↳ Description: ${err.description || 'No description provided.'}`);
    });
    console.groupEnd();

    // 2. STRATEGY B & D: Loop suppression and unique policy signature dispatch
    if (!suppressAlert) {
        errors.forEach(err => {
            const signature = `${entityName}:${err.type}`;

            alertStore.addAlert({
                variant: 'warning',
                title: `Schema Violation: ${entityName.toUpperCase()}`,
                signature,
                metaField: err.field,
                metaType: err.type
            });
        });
    }

    // 3. Fail Fast Check: Interrupt operations if strictly configured
    if (failMode === 'fast') {
        throw new SchemaValidationError(summaryMessage, entityName, errors, record);
    }

    return false;
}

/**
 * Validates a single record against its registered schema.
 * @function validateRecordSchema
 * @param {string} entityName - The registered name of the schema (e.g. 'package').
 * @param {Object} record - The record object to validate.
 * @param {ValidationOptions} [options={}] - Validation control options.
 * @returns {boolean} True if validation passes. False if validation fails in 'lazy' mode.
 * @throws {SchemaValidationError} If validation fails and failMode is 'fast'.
 */
export function validateRecordSchema(entityName, record, options = {}) {
    const { failMode = 'lazy', context = 'read', suppressAlert = false } = options;
    const schema = getSchema(entityName);

    // 1. Skip validation smoothly if no schema exists to prevent code blocking
    if (!schema) {
        console.warn(`[ValidationEngine] No schema registered for entity type: "${entityName}". Skipping validation.`);
        return true;
    }

    // 2. Validate Root Object Structure
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
        const errorMsg = `Invalid record format: expected object, got ${typeof record}`;

        if (failMode === 'fast') {
            const rootError = [{ field: 'root', type: 'format', message: errorMsg }];
            throw new SchemaValidationError(errorMsg, entityName, rootError, record);
        }

        console.error(`[ValidationEngine:Error] ${errorMsg}`);
        return false;
    }

    // 3. Execute Structural Validation Policies
    const structuralErrors = [];
    for (const policy of STRUCTURAL_POLICIES) {
        if (policy.shouldExecute(record, schema.fields)) {
            const errors = policy.validate(record, schema.fields);
            structuralErrors.push(...errors);
        }
    }

    // Fail-fast early exit for structural errors
    if (structuralErrors.length > 0 && failMode === 'fast') {
        return handleValidationFailures(entityName, record, structuralErrors, failMode, suppressAlert);
    }

    // 4. Execute Field Validation Policies
    const fieldErrors = [];
    for (const [fieldName, rules] of Object.entries(schema.fields)) {
        const value = record[fieldName];
        const isPresent = fieldName in record;

        for (const policy of FIELD_POLICIES) {
            if (policy.shouldExecute(isPresent, value, rules, context)) {
                const result = policy.validate(fieldName, isPresent, value, rules, context);
                if (!result.isValid) {
                    fieldErrors.push(result.error);
                }
            }
        }
    }

    // 5. Aggregate and Process Failures
    const accumulatedErrors = [...structuralErrors, ...fieldErrors];

    if (accumulatedErrors.length > 0) {
        return handleValidationFailures(entityName, record, accumulatedErrors, failMode, suppressAlert);
    }

    return true;
}
