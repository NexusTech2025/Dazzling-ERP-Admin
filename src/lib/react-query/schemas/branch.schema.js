/**
 * Branch Schema Definition
 * Represents the validation and documentation contract for a physical Branch/Location.
 */
export const branchSchema = {
  name: 'Branch',
  primaryKey: 'branch_id',
  fields: {
    branch_id: {
      type: 'string',
      required: false,
      description: 'The unique identifier for the branch, prefixed with BRN.'
    },
    branch_name: {
      type: 'string',
      required: true,
      description: 'The display name of the branch.'
    },
    location: {
      type: 'string',
      required: false,
      description: 'The physical address or location coordinates.'
    },
    status: {
      type: 'string',
      required: false,
      choices: ['active', 'inactive'],
      description: 'The operational status of the branch.'
    },

    // Relations
    batches: {
      type: 'array',
      required: false,
      description: 'List of academic batches operating out of this branch.'
    },
    teachers: {
      type: 'array',
      required: false,
      description: 'List of teachers assigned to this branch.'
    }
  }
};
