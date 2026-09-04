import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  isPropertyType,
  recordFromRow,
  schemaFromRows,
  viewFromRow,
} from './persist';

describe('persist mapping', () => {
  it('accepts known property types and rejects unknown ones', () => {
    assert.equal(isPropertyType('text'), true);
    assert.equal(isPropertyType('merchant'), false);
  });

  it('maps metadata rows onto the generic schema using slugs as ids', () => {
    const schema = schemaFromRows(
      { id: 'ws-1', name: 'Personal', slug: 'personal' },
      [
        {
          id: 'obj-people',
          workspace_id: 'ws-1',
          slug: 'people',
          name: 'People',
          primary_property: 'name',
        },
        {
          id: 'obj-companies',
          workspace_id: 'ws-1',
          slug: 'companies',
          name: 'Companies',
          primary_property: 'name',
        },
      ],
      [
        {
          id: 'prop-name',
          object_id: 'obj-people',
          slug: 'name',
          name: 'Name',
          type: 'text',
          options: [],
          relation_object_id: null,
          position: 0,
        },
        {
          id: 'prop-company',
          object_id: 'obj-people',
          slug: 'company',
          name: 'Company',
          type: 'relation',
          options: [],
          relation_object_id: 'obj-companies',
          position: 1,
        },
        {
          id: 'prop-bogus',
          object_id: 'obj-people',
          slug: 'crm_score',
          name: 'Score',
          type: 'merchant',
          options: [],
          relation_object_id: null,
          position: 2,
        },
      ]
    );

    assert.equal(schema.workspace.id, 'personal');
    assert.equal(schema.objects[0]?.id, 'people');
    assert.deepEqual(
      schema.objects[0]?.fields.map((field) => field.id),
      ['name', 'company']
    );
    assert.equal(schema.objects[0]?.fields[1]?.relation, 'companies');
  });

  it('maps record and view rows', () => {
    const record = recordFromRow({
      id: 'rec-1',
      object_id: 'obj-people',
      values: { name: 'Ada' },
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-02T00:00:00.000Z',
      archived_at: null,
    });
    assert.equal(record.values.name, 'Ada');

    const view = viewFromRow(
      {
        id: 'view-1',
        object_id: 'obj-people',
        name: 'Active',
        filters: { clauses: [{ path: 'status', op: 'in', value: ['active'] }] },
        visibility: 'collaborative',
        owner_email: null,
        icon: 'sparkles',
        icon_color: 'emerald',
        position: 0,
      },
      'people'
    );
    assert.equal(view.objectId, 'people');
    assert.equal(view.visibility, 'collaborative');
    assert.deepEqual(view.filters.clauses, [
      { path: 'status', op: 'in', value: ['active'] },
    ]);
  });
});
