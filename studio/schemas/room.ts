export default {
  name: 'room',
  title: 'Room',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'shortCode',
      title: 'Short Code',
      type: 'string',
      description: 'e.g., AC501',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'planImage',
      title: 'Plan Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'acousticMeta',
      title: 'Acoustic Metadata',
      type: 'object',
      fields: [
        {
          name: 'stc',
          title: 'STC Rating',
          type: 'number',
        },
        {
          name: 'notes',
          title: 'Notes',
          type: 'text',
          rows: 3,
        },
      ],
    },
  ],
};
