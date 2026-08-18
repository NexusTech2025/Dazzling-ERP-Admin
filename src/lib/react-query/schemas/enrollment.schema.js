/**
 * Enrollment Schema Definition
 * Represents the validation and documentation contract for an Enrollment.
 */
export const enrollmentSchema = {
  name: 'Enrollment',
  primaryKey: 'enrollment_id',
  fields: {
    enrollment_id: {
      type: 'string',
      required: false,
      description: 'The unique identifier for the enrollment, prefixed with ENR.'
    },
    id: {
      type: 'string',
      required: false,
      description: 'Normalized primary key alias.'
    },
    student_id: {
      type: 'string',
      required: true,
      description: 'Foreign key to the enrolled student (STU-).'
    },
    enrollment_type: {
      type: 'string',
      required: true,
      choices: ['course', 'package', 'subject'],
      description: 'Category of enrollment.'
    },
    item_id: {
      type: 'string',
      required: true,
      description: 'Identifier of the enrolled item (Package or Course).'
    },
    roll_number: {
      type: 'number',
      required: false,
      description: 'Optional roll number.'
    },
    enrollment_date: {
      type: 'string',
      required: false,
      description: 'ISO date of enrollment.'
    },
    status: {
      type: 'string',
      required: false,
      choices: ['active', 'completed', 'withdrawn'],
      description: 'Status of enrollment.'
    },
    academic_status: {
      type: 'string',
      required: false,
      choices: ['active', 'suspended', 'completed', 'withdrawn'],
      description: 'Academic standing.'
    },
    metadata: {
      type: 'object',
      required: false,
      description: 'Parsed JSON metadata object including course fees.'
    },

    // Synthetic Relational Read Fields (Attached via hydrateEnrollment)
    item_name: {
      type: 'string',
      required: false,
      description: 'Resolved display name of enrolled course or package.'
    },
    item_type: {
      type: 'string',
      required: false,
      description: 'Resolved course type segment or entity descriptor.'
    },
    item_code: {
      type: 'string',
      required: false,
      description: 'Short code or identifier of the enrolled item.'
    },
    item: {
      type: 'object',
      required: false,
      description: 'Direct object reference to resolved course or package entity.'
    },

    // Relations
    student: {
      type: 'object',
      required: false,
      description: 'Stitched Student record.'
    },
    studentfeeaccounts: {
      type: 'array',
      required: false,
      description: 'Associated Student Fee Accounts array.'
    },
    allocations: {
      type: 'array',
      required: false,
      description: 'Linked batch allocations array.'
    }
  }
};
