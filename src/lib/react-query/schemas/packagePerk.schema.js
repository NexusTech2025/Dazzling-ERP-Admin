/**
 * PackagePerk Schema Definition
 * Represents the validation and documentation contract for a perk mapped inside a Package.
 */
export const packagePerkSchema = {
  name: 'PackagePerk',
  primaryKey: 'perk_id',
  fields: {
    perk_id: {
      type: 'string',
      required: false,
      description: 'The unique identifier for the perk, prefixed with PRK.'
    },
    package_id: {
      type: 'string',
      required: false,
      description: 'Foreign key referencing the parent Package.'
    },
    perk_title: {
      type: 'string',
      required: true,
      description: 'The display title of the perk.'
    },
    perk_description: {
      type: 'string',
      required: false,
      description: 'A brief description of what the perk entails.'
    },
    icon: {
      type: 'string',
      required: false,
      description: 'Identifier name of the icon (e.g. material symbol key).'
    },
    display_order: {
      type: 'number',
      required: false,
      description: 'Sort ordering value for displaying this perk.'
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
    package: {
      type: 'object',
      required: false,
      description: 'Resolved parent Package object.'
    }
  }
};
