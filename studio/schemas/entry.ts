export default {
  name: 'entry',
  title: 'Timeline Entry',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 4,
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    },
    {
      name: 'rooms',
      title: 'Rooms',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'room' }],
        },
      ],
    },
    {
      name: 'media',
      title: 'Media',
      type: 'array',
      of: [
        {
          type: 'image',
          fields: [
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
          ],
        },
        {
          type: 'file',
          options: {
            accept: 'video/*,application/pdf,application/msword,image/*'
          },
          fields: [
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
            {
              name: 'thumbnail',
              title: 'Thumbnail',
              type: 'image',
              description: 'Optional thumbnail for video files',
            },
          ],
        },
        {
          type: 'mux.video',
          name: 'muxVideo',
          title: 'Mux Video',
          fields: [
            {
              name: 'caption',
              title: 'Caption',
              type: 'string'
            }
          ]
        }
      ],
    },
    {
      name: 'relatedDocs',
      title: 'Related Documents',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'doc' }],
        },
      ],
    },
  ],
};
