/**
 * Teacher Schema Definition
 * Represents the validation and documentation contract for a Teacher/Faculty member.
 */
export const teacherSchema = {
  name: 'Teacher',
  primaryKey: 'teacher_id',
  fields: {
    teacher_id: {
      type: 'string',
      required: false,
      description: 'The unique identifier for the teacher, prefixed with TCH.'
    },
    full_name: {
      type: 'string',
      required: true,
      description: 'The full name of the teacher.'
    },
    teacher_name: {
      type: 'string',
      required: false,
      description: 'Alternative name property representing the teacher name.'
    },
    mobile_number: {
      type: 'string',
      required: true,
      description: '10-digit mobile phone number.'
    },
    email: {
      type: 'string',
      required: false,
      description: 'Primary email address.'
    },
    gender: {
      type: 'string',
      required: false,
      choices: ['male', 'female', 'other'],
      description: 'Gender description.'
    },
    date_of_birth: {
      type: 'string',
      required: false,
      description: 'Date of birth, formatted as ISO date string or Date representation.'
    },
    profile_photo_url: {
      type: 'string',
      required: false,
      description: 'URL pointing to the teacher profile photo.'
    },
    avatarUrl: {
      type: 'string',
      required: false,
      description: 'Alternative URL alias for the profile photo.'
    },
    experience_years: {
      type: 'number',
      required: true,
      description: 'Years of professional experience.'
    },
    qualification: {
      type: 'string',
      required: false,
      description: 'Academic qualification degrees.'
    },
    specialization: {
      type: 'string',
      required: false,
      description: 'Field of specialization.'
    },
    previous_institute: {
      type: 'string',
      required: false,
      description: 'Name of the previous employment institute.'
    },
    teacher_type: {
      type: 'string',
      required: true,
      choices: ['full_time', 'part_time', 'guest'],
      description: 'The employment type of the teacher.'
    },
    joining_date: {
      type: 'string',
      required: true,
      description: 'Date of joining the institution.'
    },
    status: {
      type: 'string',
      required: false,
      choices: ['active', 'inactive', 'pending'],
      description: 'Current status of the teacher.'
    },
    notes: {
      type: 'string',
      required: false,
      description: 'Custom notes regarding this teacher.'
    },
    created_by: {
      type: 'string',
      required: false,
      description: 'Identifier of the creator.'
    },
    branch_id: {
      type: 'string',
      required: false,
      description: 'FK referencing the assigned Branch.'
    },
    address: {
      type: 'string',
      required: false,
      description: 'Residential address.'
    },
    prefered_time_slot: {
      type: 'string',
      required: false,
      choices: ['Morning', 'Afternoon', 'Evening'],
      description: 'Preferred scheduling slot.'
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

    // Relations
    branch: {
      type: 'object',
      required: false,
      description: 'Resolved Branch object.'
    },
    teachersubject: {
      type: 'array',
      required: false,
      description: 'List of subjects assigned to the teacher.'
    },
    teachersalaryconfig: {
      type: 'array',
      required: false,
      description: 'Salary configuration parameters.'
    },
    teacherdocument: {
      type: 'array',
      required: false,
      description: 'List of documents attached to the profile.'
    },
    teacherpaymenttransaction: {
      type: 'array',
      required: false,
      description: 'List of payment transactions.'
    },
    batches: {
      type: 'array',
      required: false,
      description: 'List of batches taught by this teacher.'
    },
    teacherattendance: {
      type: 'array',
      required: false,
      description: 'Attendance records.'
    },
    moneytransactions: {
      type: 'array',
      required: false,
      description: 'Money transaction ledger matches.'
    }
  }
};
