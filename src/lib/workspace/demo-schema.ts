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
    {
      id: 'companies',
      name: 'Companies',
      slug: 'companies',
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
          id: 'domain',
          name: 'Domain',
          type: 'text',
          filterable: true,
          sortable: true,
        },
        {
          id: 'category',
          name: 'Category',
          type: 'select',
          filterable: true,
          sortable: true,
          options: [
            { value: 'software', label: 'Software' },
            { value: 'research', label: 'Research' },
            { value: 'hardware', label: 'Hardware' },
          ],
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
      ],
    },
  ],
};

export const PEOPLE_OBJECT_ID = 'people';
export const COMPANIES_OBJECT_ID = 'companies';
