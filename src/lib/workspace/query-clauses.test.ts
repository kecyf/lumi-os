import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  parseClauses,
  sameClauses,
  serializeClauses,
} from '@/lib/workspace/query-clauses';
import { isLookupPath } from '@/lib/workspace/relations';
import { DEMO_PEOPLE_RECORDS } from '@/lib/workspace/demo-records';
import { DEMO_SCHEMA, PEOPLE_OBJECT_ID } from '@/lib/workspace/demo-schema';
import { filterRecords } from '@/lib/workspace/filter-records';

describe('query clauses', () => {
  it('parses JSON strings and drops invalid rows', () => {
    const clauses = parseClauses(
      JSON.stringify([
        { path: 'company', op: 'eq', value: 'Acme' },
        { path: 'tags', op: 'nope', value: ['vip'] },
        { path: '', op: 'eq', value: 'x' },
      ])
    );
    assert.deepEqual(clauses, [
      { path: 'company', op: 'eq', value: 'Acme' },
    ]);
  });

  it('round-trips serialize / sameClauses', () => {
    const clauses = [
      { path: 'name', op: 'contains' as const, value: 'Ada' },
    ];
    assert.equal(serializeClauses(clauses), JSON.stringify(clauses));
    assert.equal(
      sameClauses(clauses, parseClauses(serializeClauses(clauses))),
      true
    );
    assert.equal(sameClauses(clauses, []), false);
  });
});

describe('lookup paths', () => {
  it('detects dotted lookup paths', () => {
    assert.equal(isLookupPath('company.name'), true);
    assert.equal(isLookupPath('name'), false);
  });
});

describe('filter records', () => {
  it('filters demo people by status=active', () => {
    const filtered = filterRecords(DEMO_SCHEMA, PEOPLE_OBJECT_ID, DEMO_PEOPLE_RECORDS, [
      { path: 'status', op: 'in', value: ['active'] },
    ]);
    assert.ok(filtered.length > 0);
    assert.ok(filtered.length < DEMO_PEOPLE_RECORDS.length);
    assert.ok(
      filtered.every((record) => record.values.status === 'active')
    );
  });
});
