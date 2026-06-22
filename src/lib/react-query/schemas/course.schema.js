/**
 * Course Schema Definition
 * Represents the validation and documentation contract for a Course or Subject.
 */
export const courseSchema = {
  name: 'Course',
  primaryKey: 'course_id',
  fields: {
    course_id: {
      type: 'string',
      required: false,
      description: 'The unique identifier for the course, prefixed with CRS.'
    },
    id: {
      type: 'string',
      required: false,
      description: 'Unified alias ID for the course.'
    },
    segment_id: {
      type: 'string',
      required: false,
      description: 'Foreign key referencing the associated CourseType segment.'
    },
    entity_type: {
      type: 'string',
      required: false,
      choices: ['subject', 'course'],
      description: 'The entity type of this record, defining if it is a subject or a full course.'
    },
    name: {
      type: 'string',
      required: true,
      description: 'The display name of the course or subject.'
    },
    short_code: {
      type: 'string',
      required: false,
      description: 'A unique short code representing the course.'
    },
    language_medium: {
      type: 'string',
      required: true,
      choices: ['English', 'Hindi', 'Urdu'],
      description: 'The primary language medium used for instruction.'
    },
    description: {
      type: 'string',
      required: false,
      description: 'A brief description of what the course covers.'
    },
    duration_value: {
      type: 'number',
      required: false,
      description: 'The duration value of the course.'
    },
    duration_unit: {
      type: 'string',
      required: false,
      choices: ['months', 'days', 'weeks'],
      description: 'The unit of duration (e.g. months, weeks).'
    },
    base_fee: {
      type: 'number',
      required: true,
      description: 'The base pricing/fee configured for enrolling in this course.'
    },
    default_installment_count: {
      type: 'number',
      required: false,
      description: 'Default number of billing installments offered for this course.'
    },
    status: {
      type: 'string',
      required: false,
      choices: ['active', 'inactive'],
      description: 'The current status of the course.'
    },
    metadata: {
      type: 'object',
      required: false,
      description: 'JSON metadata structure for additional custom attributes.'
    },
    __tx_id: {
      type: 'string',
      required: false,
      description: 'Transaction ID for sync tracing.'
    },
    __tx_status: {
      type: 'string',
      required: false,
      description: 'Transaction status for sync tracing.'
    },
    __created_at: {
      type: 'string',
      required: false,
      description: 'Timestamp when the record was created in the system.'
    },
    
    // Relations / Resolved Fields
    coursetype: {
      type: 'object',
      required: false,
      description: 'Associated course type metadata.'
    },
    batches: {
      type: 'array',
      required: false,
      description: 'List of batches assigned to this course.'
    },
    batchallocations: {
      type: 'array',
      required: false,
      description: 'Batch allocation records for this course.'
    },
    teachersubjects: {
      type: 'array',
      required: false,
      description: 'Junction records mapping assigned teachers to this course.'
    },
    enrollments: {
      type: 'array',
      required: false,
      description: 'Active enrollments under this course.'
    },
    packageitems: {
      type: 'array',
      required: false,
      description: 'Package item mappings referencing this course.'
    }
  }
};
