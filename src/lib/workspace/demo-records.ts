import type { WorkspaceRecord } from './types';

export const DEMO_PEOPLE_RECORDS: WorkspaceRecord[] = [
  {
    id: 'p1',
    values: {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      status: 'active',
      company: 'Analytical Engines',
      last_seen: '2026-03-01',
    },
    created_at: '2025-11-12T10:00:00.000Z',
    updated_at: '2026-03-01T08:30:00.000Z',
  },
  {
    id: 'p2',
    values: {
      name: 'Grace Hopper',
      email: 'grace@example.com',
      status: 'active',
      company: 'Compilers Inc',
      last_seen: '2026-02-18',
    },
    created_at: '2025-10-01T12:00:00.000Z',
    updated_at: '2026-02-18T14:20:00.000Z',
  },
  {
    id: 'p3',
    values: {
      name: 'Alan Turing',
      email: 'alan@example.com',
      status: 'churned',
      company: 'Bletchley Labs',
      last_seen: '2025-08-04',
    },
    created_at: '2025-06-15T09:00:00.000Z',
    updated_at: '2025-08-04T16:45:00.000Z',
  },
  {
    id: 'p4',
    values: {
      name: 'Katherine Johnson',
      email: 'katherine@example.com',
      status: 'active',
      company: 'Orbital Math',
      last_seen: '2026-01-22',
    },
    created_at: '2025-09-20T11:30:00.000Z',
    updated_at: '2026-01-22T10:10:00.000Z',
  },
  {
    id: 'p5',
    values: {
      name: 'Tim Berners-Lee',
      email: 'tim@example.com',
      status: 'new',
      company: 'Web Foundation',
      last_seen: '2026-03-10',
    },
    created_at: '2026-02-28T08:00:00.000Z',
    updated_at: '2026-03-10T09:15:00.000Z',
  },
  {
    id: 'p6',
    values: {
      name: 'Margaret Hamilton',
      email: 'margaret@example.com',
      status: 'active',
      company: 'Apollo Software',
      last_seen: '2026-02-02',
    },
    created_at: '2025-08-01T07:45:00.000Z',
    updated_at: '2026-02-02T18:00:00.000Z',
  },
  {
    id: 'p7',
    values: {
      name: 'Linus Torvalds',
      email: 'linus@example.com',
      status: 'new',
      company: 'Kernel Corp',
      last_seen: '2026-03-05',
    },
    created_at: '2026-01-10T13:00:00.000Z',
    updated_at: '2026-03-05T11:40:00.000Z',
  },
  {
    id: 'p8',
    values: {
      name: 'Radia Perlman',
      email: 'radia@example.com',
      status: 'churned',
      company: 'Spanning Tree LLC',
      last_seen: '2025-12-01',
    },
    created_at: '2025-07-04T15:20:00.000Z',
    updated_at: '2025-12-01T12:00:00.000Z',
  },
  {
    id: 'p9',
    values: {
      name: 'Donald Knuth',
      email: 'knuth@example.com',
      status: 'active',
      company: 'TeX Press',
      last_seen: '2026-02-25',
    },
    created_at: '2025-05-18T10:10:00.000Z',
    updated_at: '2026-02-25T17:30:00.000Z',
  },
  {
    id: 'p10',
    values: {
      name: 'Barbara Liskov',
      email: 'barbara@example.com',
      status: 'new',
      company: 'Abstraction Labs',
      last_seen: '2026-03-08',
    },
    created_at: '2026-02-15T16:00:00.000Z',
    updated_at: '2026-03-08T08:55:00.000Z',
  },
];

export const DEMO_COMPANY_RECORDS: WorkspaceRecord[] = [
  {
    id: 'c1',
    values: {
      name: 'Analytical Engines',
      domain: 'analytical.example',
      category: 'hardware',
      status: 'active',
    },
    created_at: '2025-09-01T10:00:00.000Z',
    updated_at: '2026-03-01T08:30:00.000Z',
  },
  {
    id: 'c2',
    values: {
      name: 'Compilers Inc',
      domain: 'compilers.example',
      category: 'software',
      status: 'active',
    },
    created_at: '2025-08-12T12:00:00.000Z',
    updated_at: '2026-02-18T14:20:00.000Z',
  },
  {
    id: 'c3',
    values: {
      name: 'Bletchley Labs',
      domain: 'bletchley.example',
      category: 'research',
      status: 'churned',
    },
    created_at: '2025-05-20T09:00:00.000Z',
    updated_at: '2025-08-04T16:45:00.000Z',
  },
  {
    id: 'c4',
    values: {
      name: 'Orbital Math',
      domain: 'orbital.example',
      category: 'research',
      status: 'active',
    },
    created_at: '2025-07-08T11:30:00.000Z',
    updated_at: '2026-01-22T10:10:00.000Z',
  },
  {
    id: 'c5',
    values: {
      name: 'Web Foundation',
      domain: 'webfoundation.example',
      category: 'software',
      status: 'new',
    },
    created_at: '2026-02-01T08:00:00.000Z',
    updated_at: '2026-03-10T09:15:00.000Z',
  },
  {
    id: 'c6',
    values: {
      name: 'Apollo Software',
      domain: 'apollo.example',
      category: 'software',
      status: 'active',
    },
    created_at: '2025-06-18T07:45:00.000Z',
    updated_at: '2026-02-02T18:00:00.000Z',
  },
  {
    id: 'c7',
    values: {
      name: 'Kernel Corp',
      domain: 'kernel.example',
      category: 'software',
      status: 'new',
    },
    created_at: '2026-01-04T13:00:00.000Z',
    updated_at: '2026-03-05T11:40:00.000Z',
  },
  {
    id: 'c8',
    values: {
      name: 'Spanning Tree LLC',
      domain: 'spanning.example',
      category: 'hardware',
      status: 'churned',
    },
    created_at: '2025-04-22T15:20:00.000Z',
    updated_at: '2025-12-01T12:00:00.000Z',
  },
];

export function demoRecordsFor(objectId: string): WorkspaceRecord[] {
  if (objectId === 'companies') return DEMO_COMPANY_RECORDS;
  return DEMO_PEOPLE_RECORDS;
}
