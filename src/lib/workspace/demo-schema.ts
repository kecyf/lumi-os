import type { WorkspaceSchema } from './types';

export const DEMO_SCHEMA: WorkspaceSchema = {
  workspace: { id: 'personal', name: 'Personal' },
  objects: [
    {
      id: 'people',
      name: 'People',
      slug: 'people',
      primaryField: 'name',
      fields: [
        {
          id: 'name',
          name: 'Name',
          type: 'text',
          filterable: true,
          sortable: true,
        },
        {
          id: 'email',
          name: 'Email',
          type: 'email',
          filterable: true,
          sortable: true,
        },
        {
          id: 'status',
          name: 'Status',
          type: 'select',
          filterable: true,
          sortable: true,
          options: [
            { value: 'new', label: 'New' },
            { value: 'active', label: 'Active' },
            { value: 'churned', label: 'Churned' },
          ],
        },
        {
          id: 'company',
          name: 'Company',
          type: 'text',
          filterable: true,
          sortable: true,
        },
        {
          id: 'last_seen',
          name: 'Last seen',
          type: 'date',
          filterable: true,
          sortable: true,
        },
      ],
    },
  ],
};

export const PEOPLE_OBJECT_ID = 'people';
