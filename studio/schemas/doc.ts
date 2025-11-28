export default {
  name: 'doc',
  title: 'Document',
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
      name: 'file',
      title: 'PDF File',
      type: 'file',
      options: {
        accept: '.pdf',
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'docType',
      title: 'Document Type',
      type: 'string',
      options: {
        list: [
          { title: 'Plan', value: 'plan' },
          { title: 'Contract', value: 'contract' },
          { title: 'Estimate', value: 'estimate' },
        ],
        layout: 'radio',
      },
      validation: (Rule: any) => Rule.required(),
    },
  ],
};
