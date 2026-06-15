/**
 * Package Schema Definition
 * Represents the validation and documentation contract for a course package.
 */
export const packageSchema = {
  name: 'Package',
  primaryKey: 'package_id',
  fields: {
    // Core Columns
    package_id: {
      type: 'string',
      required: false,
      description: 'The unique identifier for the package, prefixed with PKG.'
    },
    id: {
      type: 'string',
      required: false,
      description: 'Unified alias ID for the package.'
    },
    name: {
      type: 'string',
      required: true,
      description: 'The display name of the package (e.g. "Science Premium").'
    },
    description: {
      type: 'string',
      required: false,
      description: 'A detailed description of the package content and objectives.'
    },
    target_class: {
      type: 'string',
      required: false,
      description: 'The educational class or level this package is tailored for.'
    },
    board: {
      type: 'string',
      required: false,
      description: 'The academic board (e.g. CBSE, ICSE, State Board).'
    },
    month: {
      type: 'number',
      required: false,
      description: 'The duration of the package in months.'
    },
    package_fee: {
      type: 'number',
      required: true,
      description: 'The base pricing of the package before any discounts.'
    },
    discount_percent: {
      type: 'number',
      required: false,
      description: 'The standard percentage discount applied to the package.'
    },
    status: {
      type: 'string',
      required: false,
      choices: ['active', 'inactive', 'draft'],
      description: 'The operational status of the package. Must be active, inactive, or draft.'
    },

    // Raw database relations (hasMany/hasOne at root level)
    packageitems: {
      type: 'array',
      required: false,
      description: 'List of raw association records mapping this package to entities like courses.'
    },
    packageperks: {
      type: 'array',
      required: false,
      description: 'List of raw perk association records.'
    },

    // Client-side Hydrated relations (derived fields)
    courses: {
      type: 'array',
      required: false,
      description: 'List of fully hydrated Course records belonging to this package, derived by resolving course IDs from packageitems.'
    },
    perks: {
      type: 'array',
      required: false,
      description: 'List of perks associated with the package, derived/hydrated from packageperks.'
    }
  }
};
