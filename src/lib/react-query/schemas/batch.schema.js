/**
 * Batch Schema Definition
 * Represents the validation and documentation contract for a Batch.
 */
export const batchSchema = {
  name: 'Batch',
  primaryKey: 'batch_id',
  fields: {
    // Core Columns
    batch_id: {
      type: 'string',
      required: false,
      description: 'The unique identifier for the batch, prefixed with BAT.'
    },
    id: {
      type: 'string',
      required: false,
      description: 'Unified alias ID for the batch.'
    },
    course_id: {
      type: 'string',
      required: false,
      description: 'FK referencing the associated Course.'
    },
    teacher_id: {
      type: 'string',
      required: false,
      description: 'FK referencing the assigned Teacher/Instructor.'
    },
    branch_id: {
      type: 'string',
      required: false,
      description: 'FK referencing the associated Branch.'
    },
    batch_name: {
      type: 'string',
      required: true,
      description: 'Name of the batch.'
    },
    start_date: {
      type: 'string',
      required: false,
      description: 'The start date of the batch.'
    },
    end_date: {
      type: 'string',
      required: false,
      description: 'The end date of the batch.'
    },
    capacity: {
      type: 'number',
      required: false,
      description: 'Maximum student capacity for the batch.'
    },
    batch_type: {
      type: 'string',
      required: true,
      choices: ['Academy', 'Computer', 'Foundation', 'Competitive'],
      description: 'Classification type of the batch.'
    },
    status: {
      type: 'string',
      required: false,
      choices: ['active', 'completed', 'cancelled'],
      description: 'Operational status of the batch.'
    },
    schedule: {
      type: 'object',
      required: false,
      description: 'JSON/Object mapping start_time, end_time, days_of_week, and room.'
    },
    created_at: {
      type: 'string',
      required: false,
      description: 'Record creation timestamp.'
    },
    updated_at: {
      type: 'string',
      required: false,
      description: 'Record modification timestamp.'
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

    // UI-Derived and Normalization Mapped Fields
    course_name: {
      type: 'string',
      required: false,
      description: 'Name of the associated course (resolved client-side or from backend joins).'
    },
    instructor_name: {
      type: 'string',
      required: false,
      description: 'Name of the assigned instructor.'
    },
    branch_name: {
      type: 'string',
      required: false,
      description: 'Name of the branch.'
    },
    enrolled_students: {
      type: 'number',
      required: false,
      description: 'Number of students currently enrolled in the batch.'
    },
    is_active: {
      type: 'boolean',
      required: false,
      description: 'Helper flag indicating whether the batch status is active.'
    },
    has_schedule: {
      type: 'boolean',
      required: false,
      description: 'Helper flag indicating whether the batch has a fully defined schedule.'
    },

    // Relations
    course: {
      type: 'object',
      required: false,
      description: 'Associated Course details object.'
    },
    teacher: {
      type: 'object',
      required: false,
      description: 'Associated Teacher/Instructor details object.'
    },
    branch: {
      type: 'object',
      required: false,
      description: 'Associated Branch details object.'
    },
    allocations: {
      type: 'array',
      required: false,
      description: 'List of student allocations in the batch.'
    },
    studentleads: {
      type: 'array',
      required: false,
      description: 'List of leads tracking interest in this batch.'
    },
    studentattendance: {
      type: 'array',
      required: false,
      description: 'Batch attendance registry logs.'
    },
    classtests: {
      type: 'array',
      required: false,
      description: 'Tests/exams scheduled for this batch.'
    }
  }
};
