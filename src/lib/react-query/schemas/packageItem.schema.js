/**
 * PackageItem Schema Definition
 * Represents the validation and documentation contract for items mapped inside a Package.
 */
export const packageItemSchema = {
  name: 'PackageItem',
  primaryKey: 'item_id',
  fields: {
    item_id: {
      type: 'string',
      required: false,
      description: 'The unique identifier for the package item association record, prefixed with PKI.'
    },
    package_id: {
      type: 'string',
      required: true,
      description: 'Foreign key referencing the parent Package.'
    },
    entity_type: {
      type: 'string',
      required: false,
      choices: ['course', 'subject'],
      description: 'The type of the mapped entity (e.g. course or subject).'
    },
    entity_id: {
      type: 'string',
      required: true,
      description: 'Foreign key pointing to the target entity (course_id/subject_id).'
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
    package: {
      type: 'object',
      required: false,
      description: 'Resolved parent Package object.'
    },
    entity: {
      type: 'object',
      required: false,
      description: 'Polymorphic reference to the target course/subject details.'
    },
    course: {
      type: 'object',
      required: false,
      description: 'Resolved Course record resolved client-side.'
    }
  }
};
