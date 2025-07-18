import { defineType } from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'summary',
      title: 'Short Summary',
      type: 'text',
      rows: 3,
      description: 'Displayed on homepage preview'
    },
    {
      name: 'description',
      title: 'Full Description',
      type: 'text',
      rows: 5,
      description: 'Displayed on detailed project page',
      validation: Rule => Rule.required(),
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image' }],
    },
    {
      name: 'technologies',
      title: 'Technologies',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'highlight',
      title: 'Highlight?',
      type: 'boolean',
      initialValue: false,
      description: 'If true, shows on homepage as a featured project',
    },
  ],
})
