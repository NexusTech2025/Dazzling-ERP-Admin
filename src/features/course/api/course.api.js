/**
 * @file course.api.js
 * @module CourseAPI
 * @description API service layer for course structures, categories, segments, and academic programs.
 * Bridges course components to the Google Apps Script (GAS) DazzlingDB relational engine.
 * Implements JSDoc type safety and maps actions through standard apiRegistry namespaces.
 */

import { executeAction } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';

// ==========================================
// --- COURSE TYPES (SEGMENTS) SERVICE LAYER ---
// ==========================================

/**
 * Fetches all active Course Types (academic organization segments, e.g., Academic, Vocational).
 * Utilizes the generic query engine (DATA.QUERY).
 * 
 * @async
 * @function fetchCourseTypes
 * @param {string} token - The active user authorization session token.
 * @param {object} [options={}] - HTTP fetch configuration options (e.g. AbortController signal).
 * @param {AbortSignal} [options.signal] - Cancellation signal for TanStack Query lifecycle aborts.
 * @returns {Promise<object>} Returns standard GAS response envelope containing active Segment arrays.
 */
export const fetchCourseTypes = (token, options = {}) => 
  executeAction(API_REGISTRY.DATA.QUERY, { 
    target: 'CourseType', 
    where: { status: 'active' } 
  }, token, options);

/**
 * Creates a new Course Type segment configuration.
 * Triggers referential and formatting check validations on the backend before inserting.
 * 
 * @async
 * @function createCourseType
 * @param {string} token - The active user authorization session token.
 * @param {object} data - The configuration parameters for the new course type segment.
 * @param {string} data.segment_name - Required unique name of the segment (e.g. "Academy Classes").
 * @param {string} [data.entity_label] - Singular identifier label for course items (e.g. "Subject").
 * @param {string} [data.description] - Text narrative describing the segment context.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Returns standard GAS envelope containing the generated Segment records.
 */
export const createCourseType = (token, data, options = {}) => 
  executeAction(API_REGISTRY.ACADEMIC.CREATE_COURSE_TYPE, data, token, options);

// ==========================================
// --- COURSES (SUBJECTS) SERVICE LAYER ---
// ==========================================

/**
 * Retrieves lists of active courses/subjects with their corresponding segment types hydrated.
 * Utilizes the generic query engine (DATA.QUERY) with inner joins hydration support.
 * 
 * @async
 * @function fetchCourses
 * @param {string} token - The active user authorization session token.
 * @param {object} [filter={}] - Dynamic filters mapped to matching database columns (e.g. language_medium).
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Returns standard GAS envelope containing hydrated active Course objects.
 */
export const fetchCourses = (token, filter = {}, options = {}) => 
  executeAction(API_REGISTRY.DATA.QUERY, { 
    target: 'Course', 
    where: { status: 'active', ...filter },
    include: {
      coursetype: {} // Hydrates the linked Segment object
    }
  }, token, options);

/**
 * Retrieves the full profile and details for a single specific course/subject.
 * 
 * @async
 * @function fetchCourseDetail
 * @param {string} token - The active user authorization session token.
 * @param {string} id - The unique primary course identifier (prefix: CRS-).
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Returns standard GAS envelope containing the specific course item.
 */
export const fetchCourseDetail = (token, id, options = {}) => 
  executeAction(API_REGISTRY.DATA.QUERY, { 
    target: 'Course', 
    where: { course_id: id },
    include: {
      coursetype: {}
    }
  }, token, options);

/**
 * Creates a new course configuration inside the database.
 * Triggers relation verification to ensure segment_id exists and is active.
 * 
 * @async
 * @function createCourse
 * @param {string} token - The active user authorization session token.
 * @param {object} data - The configuration parameters for the new course.
 * @param {string} data.segment_id - Foreign key pointing to a valid Segment (CourseType).
 * @param {string} data.name - The unique descriptive name of the course.
 * @param {number} data.base_fee - The standard base pricing cost for enrollment.
 * @param {string} data.language_medium - The medium of education (English, Hindi, Urdu).
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Returns standard GAS envelope containing the saved Course record with new ID.
 */
export const createCourse = (token, data, options = {}) => 
  executeAction(API_REGISTRY.ACADEMIC.CREATE_COURSE, data, token, options);

/**
 * Performs a differential update of columns in a specific course record.
 * 
 * @async
 * @function updateCourse
 * @param {string} token - The active user authorization session token.
 * @param {string} id - The unique primary course identifier to update (prefix: CRS-).
 * @param {object} data - Key-value map of columns and values to update.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Returns standard GAS envelope recording validation and modification state.
 */
export const updateCourse = (token, id, data, options = {}) => 
  executeAction(API_REGISTRY.DATA.UPDATE, { 
    table: 'Course', 
    id: id, 
    data 
  }, token, options);

/**
 * Permanently deletes a specific course record from the database.
 * 
 * @async
 * @function deleteCourse
 * @param {string} token - The active user authorization session token.
 * @param {string} id - The unique primary course identifier to delete.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Returns confirmation envelope indicating delete status.
 */
export const deleteCourse = (token, id, options = {}) => 
  executeAction(API_REGISTRY.DATA.DELETE, { 
    table: 'Course', 
    id: id 
  }, token, options);

/**
 * Performs a differential update of columns in a specific segment (CourseType) record.
 * 
 * @async
 * @function updateCourseType
 * @param {string} token - The active user authorization session token.
 * @param {string} id - The unique primary segment identifier to update (prefix: SEG-).
 * @param {object} data - Key-value map of columns and values to update.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Returns standard GAS envelope recording modification state.
 */
export const updateCourseType = (token, id, data, options = {}) => 
  executeAction(API_REGISTRY.DATA.UPDATE, { 
    table: 'CourseType', 
    id: id, 
    data 
  }, token, options);

/**
 * Permanently deletes a specific segment (CourseType) record from the database.
 * 
 * @async
 * @function deleteCourseType
 * @param {string} token - The active user authorization session token.
 * @param {string} id - The unique primary segment identifier to delete.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Returns confirmation envelope indicating delete status.
 */
export const deleteCourseType = (token, id, options = {}) => 
  executeAction(API_REGISTRY.DATA.DELETE, { 
    table: 'CourseType', 
    id: id 
  }, token, options);

// ==========================================
// --- PACKAGES SERVICE LAYER ---
// ==========================================

/**
 * Fetches all active packages from the database.
 * 
 * @async
 * @function fetchPackages
 * @param {string} token - Authorization token.
 * @param {object} [filter={}] - Dynamic filters.
 * @param {object} [options={}] - HTTP fetch options.
 * @returns {Promise<object>}
 */
export const fetchPackages = (token, filter = {}, options = {}) =>
  executeAction(API_REGISTRY.DATA.QUERY, {
    target: 'Package',
    where: { status: 'active', ...filter },
    include: {
      packageitems: {},
      packageperks: {}
    }
  }, token, options);

/**
 * Fetches all package course items from the database.
 * 
 * @async
 * @function fetchPackageItems
 * @param {string} token - Authorization token.
 * @param {object} [options={}] - HTTP fetch options.
 * @returns {Promise<object>}
 */
export const fetchPackageItems = (token, options = {}) =>
  executeAction(API_REGISTRY.DATA.QUERY, {
    target: 'PackageItem'
  }, token, options);

/**
 * Fetches all package perks from the database.
 * 
 * @async
 * @function fetchPackagePerks
 * @param {string} token - Authorization token.
 * @param {object} [options={}] - HTTP fetch options.
 * @returns {Promise<object>}
 */
export const fetchPackagePerks = (token, options = {}) =>
  executeAction(API_REGISTRY.DATA.QUERY, {
    target: 'PackagePerk'
  }, token, options);

/**
 * Retrieves the details for a single package.
 * 
 * @async
 * @function fetchPackageDetail
 * @param {string} token - Authorization token.
 * @param {string} id - Package identifier.
 * @param {object} [options={}] - HTTP fetch options.
 * @returns {Promise<object>}
 */
export const fetchPackageDetail = (token, id, options = {}) =>
  executeAction(API_REGISTRY.DATA.QUERY, {
    target: 'Package',
    where: { package_id: id },
    include: {
      packageitems: {},
      packageperks: {}
    }
  }, token, options);

/**
 * Creates a new package in the database.
 * 
 * @async
 * @function createPackage
 * @param {string} token - Authorization token.
 * @param {object} data - Package creation attributes.
 * @param {object} [options={}] - HTTP fetch options.
 * @returns {Promise<object>}
 */
export const createPackage = (token, data, options = {}) =>
  executeAction(API_REGISTRY.ACADEMIC.CREATE_PACKAGE, data, token, options);

/**
 * Performs a differential update of columns in a specific package record.
 * Uses the specialized academic package update endpoint to synchronize relations.
 * 
 * @async
 * @function updatePackage
 * @param {string} token - Authorization token.
 * @param {string} id - Package identifier.
 * @param {object} data - Updated package attributes.
 * @param {object} [options={}] - HTTP fetch options.
 * @returns {Promise<object>}
 */
export const updatePackage = (token, id, data, options = {}) =>
  executeAction(API_REGISTRY.ACADEMIC.UPDATE_PACKAGE, {
    package_id: id,
    ...data
  }, token, options);

/**
 * Permanently deletes a specific package record from the database.
 * Relies on restrict validation checks and performs cascading deletes of perks and course links.
 * 
 * @async
 * @function deletePackage
 * @param {string} token - Authorization token.
 * @param {string} id - Package identifier.
 * @param {object} [options={}] - HTTP fetch options.
 * @returns {Promise<object>}
 */
export const deletePackage = (token, id, options = {}) =>
  executeAction(API_REGISTRY.ACADEMIC.DELETE_PACKAGE, {
    package_id: id
  }, token, options);

/**
 * Fetches all enrollments for a specific package, including the associated student record.
 *
 * @async
 * @function fetchPackageEnrollments
 * @param {string} token - Authorization token.
 * @param {string} packageId - The package identifier to filter enrollments by.
 * @param {object} [options={}] - HTTP fetch options.
 * @returns {Promise<object>}
 */
export const fetchPackageEnrollments = (token, packageId, options = {}) =>
  executeAction(API_REGISTRY.DATA.QUERY, {
    target: 'Enrollment',
    where: { enrollment_type: 'package', item_id: packageId },
    include: {
      student: {}
    }
  }, token, options);

/**
 * Fetches all StudentFeeAccount records for a specific package enrollment set,
 * including nested installment records for ledger rendering.
 *
 * @async
 * @function fetchPackageFeeAccounts
 * @param {string} token - Authorization token.
 * @param {string} packageId - The package identifier used to scope the fee accounts via enrollment join.
 * @param {object} [options={}] - HTTP fetch options.
 * @returns {Promise<object>}
 */
export const fetchPackageFeeAccounts = (token, packageId, options = {}) =>
  executeAction(API_REGISTRY.DATA.QUERY, {
    target: 'StudentFeeAccount',
    where: {},
    include: {
      enrollment: { where: { enrollment_type: 'package', item_id: packageId } },
      installments: {}
    }
  }, token, options);
