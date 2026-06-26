/**
 * CourseType Schema Definition
 * Represents the validation and documentation contract for a CourseType (Academic Segment).
 */
export const courseTypeSchema = {
  name: 'CourseType',
  primaryKey: 'segment_id',
  fields: {
    segment_id: {
      type: 'string',
      required: false,
      description: 'The unique identifier for the course type/segment, prefixed with SEG.'
    },
    id: {
      type: 'string',
      required: false,
      description: 'Unified alias ID for the course type.'
    },
    segment_name: {
      type: 'string',
      required: true,
      description: 'Unique name of the segment.'
    },
    entity_label: {
      type: 'string',
      required: false,
      description: 'Singular label for items in this segment.'
    },
    description: {
      type: 'string',
      required: false,
      description: 'Text description of the segment.'
    },
    status: {
      type: 'string',
      required: false,
      choices: ['active', 'inactive'],
      description: 'Current status of the course type.'
    }
  }
};
