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

    // Relations
    package: {
      type: 'object',
      required: false,
      description: 'Resolved parent Package object.'
    }
  }
};
