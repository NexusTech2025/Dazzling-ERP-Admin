/**
 * Student Schema Definition
 * Represents the validation and documentation contract for a Student.
 */
export const studentSchema = {
  name: 'Student',
  primaryKey: 'student_id',
  fields: {
    student_id: {
      type: 'string',
      required: false,
      description: 'The unique identifier for the student, prefixed with STU.'
    },
    student_name: {
      type: 'string',
      required: true,
      description: 'The full name of the student.'
    },
    email: {
      type: 'string',
      required: false,
      description: 'Primary contact email.'
    },
    phone: {
      type: 'string',
      required: false,
      description: 'Primary contact mobile number.'
    },
    gender: {
      type: 'string',
      required: false,
      choices: ['Male', 'Female', 'Other'],
      description: 'Gender of the student.'
    },
    dob: {
      type: 'string',
      required: false,
      description: 'Date of birth formatting.'
    },
    mother_name: {
      type: 'string',
      required: false,
      description: 'Mother\'s full name.'
    },
    father_name: {
      type: 'string',
      required: false,
      description: 'Father\'s full name.'
    },
    avatarUrl: {
      type: 'string',
      required: false,
      description: 'URL pointing to the student profile image.'
    },
    status: {
      type: 'string',
      required: false,
      choices: ['active', 'inactive', 'applicant'],
      description: 'The current status of the student.'
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
    address: {
      type: 'object',
      required: false,
      description: 'Resolved Address object.'
    },
    contact: {
      type: 'object',
      required: false,
      description: 'Resolved ContactInfo object.'
    },
    education: {
      type: 'array',
      required: false,
      description: 'Education/academic history records.'
    },
    enrollments: {
      type: 'array',
      required: false,
      description: 'Active financial/course enrollments.'
    },
    allocations: {
      type: 'array',
      required: false,
      description: 'Batch allocation records mapping this student to batches.'
    },
    moneytransactions: {
      type: 'array',
      required: false,
      description: 'Money transaction ledgers.'
    },
    studentattendance: {
      type: 'array',
      required: false,
      description: 'Daily attendance logs.'
    },
    testmarks: {
      type: 'array',
      required: false,
      description: 'Class test scores and performance.'
    }
  }
};
