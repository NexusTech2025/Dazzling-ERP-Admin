/**
 * src/features/course/utils/courseMappers.js
 * Centralized serialization and normalizers for course/offering entities.
 */

/**
 * Safely parses serialized course JSON metadata fields.
 * 
 * @param {string|object} metadata - Stringified JSON or parsed metadata object.
 * @returns {object} Parsed metadata dictionary, fallback to empty object.
 */
export const safeParseMetadata = (metadata) => {
  if (!metadata) return {};
  if (typeof metadata === 'object') return metadata; // Returns non-null objects
  
  if (typeof metadata === 'string') {
    const trimmed = metadata.trim();
    if (trimmed === '' || trimmed === '{}' || trimmed === 'null' || trimmed === 'undefined') {
      return {};
    }
    try {
      const parsed = JSON.parse(trimmed);
      return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch (e) {
      console.error('Failed to parse course metadata JSON:', metadata, e);
      return {};
    }
  }
  
  return {};
};

/**
 * Normalizes a raw Course record.
 * 
 * @param {object} course - Raw database record.
 * @returns {object|null} Normalized course record with parsed metadata.
 */
export const normalizeCourse = (course) => {
  if (!course) return null;
  return {
    ...course,
    id: course.course_id ?? course.id ?? null,
    course_id: course.course_id ?? course.id ?? null,
    metadata: safeParseMetadata(course.metadata)
  };
};

/**
 * Normalizes an array of raw Course records.
 * 
 * @param {Array<object>} list - Array of raw course records.
 * @returns {Array<object>} Normalized course records.
 */
export const normalizeCourseList = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeCourse);
};
