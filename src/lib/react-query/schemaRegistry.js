import { packageSchema } from './schemas/package.schema.js';
import { courseSchema } from './schemas/course.schema.js';
import { teacherSchema } from './schemas/teacher.schema.js';
import { studentSchema } from './schemas/student.schema.js';
import { batchSchema } from './schemas/batch.schema.js';
import { branchSchema } from './schemas/branch.schema.js';
import { packageItemSchema } from './schemas/packageItem.schema.js';
import { packagePerkSchema } from './schemas/packagePerk.schema.js';

export const SCHEMA_REGISTRY = {
  package: packageSchema,
  course: courseSchema,
  teacher: teacherSchema,
  student: studentSchema,
  batch: batchSchema,
  branch: branchSchema,
  packageitem: packageItemSchema,
  packageperk: packagePerkSchema
};

/**
 * Checks if a schema is registered for the given entity name.
 * @param {string} entityName - Name of the entity.
 * @returns {boolean} True if a schema is registered.
 */
export function hasSchema(entityName) {
  return !!SCHEMA_REGISTRY[entityName?.toLowerCase()];
}

/**
 * Retrieves the schema for a given entity name.
 * @param {string} entityName - Name of the entity.
 * @returns {object|undefined} Schema object or undefined.
 */
export function getSchema(entityName) {
  return SCHEMA_REGISTRY[entityName?.toLowerCase()];
}
