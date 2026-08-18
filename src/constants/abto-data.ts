// ============================================================
// ABTO content stores — server-only, Postgres-backed
// ============================================================
// Seed once, then plain CRUD. Seed data below is the REAL content
// currently hardcoded into the public static site (abto-website.html),
// not faker/demo filler — so this dashboard launches already
// reflecting what ABTO actually publishes.
// ============================================================

import 'server-only';
import { matchSorter } from 'match-sorter';
import { ensureSchema, sql } from '@/lib/db';

// ---------- Members ----------

export type Member = {
  id: number;
  name: string;
  region: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  specialties: string[];
  languages: string[];
  member_since: number;
  status: 'active' | 'pending';
  created_at: string;
  updated_at: string;
};

type MemberRow = Omit<Member, 'specialties' | 'languages'> & {
  specialties: string;
  languages: string;
};

function rowToMember(row: MemberRow): Member {
  return {
    ...row,
    specialties: JSON.parse(row.specialties),
    languages: JSON.parse(row.languages)
  };
}

// [name, region, phone, email, website, description, specialties, memberSince]
const RAW_MEMBERS: [string, string, string, string, string, string, string[], number][] = [
  [
    'Abide Bhutan Adventure',
    'Thimphu',
    '+975 17725900',
    'abidebtn@gmail.com',
    'www.bhutantourtravel.com',
    'A dedicated tour company based in Thimphu. We plan tours, trekking, biking, cycling and bird watching tours, and car rentals.',
    ['Trekking', 'Cycling', 'Birding'],
    2016
  ],
  ['AB Travel', 'Thimphu', '', '', '', '', ['Cultural Tours'], 2011],
  ['Aari Holidays.bt', 'Paro', '', '', '', '', ['Cultural Tours', 'Festivals'], 2018],
  ['AARYA VILLAGE TRAVEL', 'Punakha', '', '', '', '', ['Cultural Tours', 'Wellness'], 2019],
  ['A Bucket List Adventure', 'Thimphu', '', '', '', '', ['Adventure', 'Trekking'], 2020],
  ['Beyond the Sea Tours & Travels', 'Thimphu', '', '', '', '', ['Cultural Tours'], 2013],
  ['Bhutan Extreme Trips', 'Paro', '', '', '', '', ['Adventure', 'Rafting'], 2015],
  ['Bhutan Footprints Travel', 'Thimphu', '', '', '', '', ['Cultural Tours', 'Photography'], 2012],
  ['Bhutan Green Travel (BGT)', 'Thimphu', '', '', '', '', ['Cultural Tours', 'Birding'], 2010],
  ['Bhutan Holiday Planner', 'Paro', '', '', '', '', ['Cultural Tours', 'Festivals'], 2014],
  [
    'Bhutan Incredible Tours & Treks',
    'Thimphu',
    '',
    '',
    '',
    '',
    ['Trekking', 'Cultural Tours'],
    2009
  ],
  ['Bhutan Travel Guide', 'Thimphu', '', '', '', '', ['Cultural Tours'], 2011],
  [
    'Bhutan Travelogue - Tours and Treks',
    'Paro',
    '',
    '',
    '',
    '',
    ['Trekking', 'Photography'],
    2008
  ],
  ['Charisma Bhutan Tours & Treks', 'Thimphu', '', '', '', '', ['Trekking', 'Wellness'], 2013],
  ['Eureka Expeditions', 'Bumthang', '', '', '', '', ['Trekking', 'Adventure'], 2007],
  ['Happiness Kingdom Travels', 'Thimphu', '', '', '', '', ['Cultural Tours', 'Wellness'], 2016],
  ['Jetsuniae Travels', 'Thimphu', '', '', '', '', ['Pilgrimage', 'Cultural Tours'], 2017],
  ['Joyful Journeys', 'Paro', '', '', '', '', ['Cultural Tours', 'Festivals'], 2018],
  [
    'Routes and Journey - The Art of Travelling',
    'Thimphu',
    '',
    '',
    '',
    '',
    ['Photography', 'Cultural Tours'],
    2015
  ],
  ['Snow White Treks and Tours', 'Paro', '', '', '', '', ['Trekking'], 2006]
];

async function seedMembersIfEmpty() {
  await ensureSchema();
  const { rows } = await sql`SELECT COUNT(*)::int AS count FROM members`;
  if (rows[0].count > 0) return;

  const now = new Date().toISOString();
  for (const [
    name,
    region,
    phone,
    email,
    website,
    description,
    specialties,
    memberSince
  ] of RAW_MEMBERS) {
    await sql`
      INSERT INTO members (name, region, phone, email, website, description, specialties, languages, member_since, status, created_at, updated_at)
      VALUES (${name}, ${region}, ${phone}, ${email}, ${website}, ${description}, ${JSON.stringify(specialties)}, ${JSON.stringify(['English'])}, ${memberSince}, 'active', ${now}, ${now})
    `;
  }
}

export type MemberMutationPayload = Omit<Member, 'id' | 'created_at' | 'updated_at'>;

export const membersStore = {
  async getAll({ search }: { search?: string } = {}) {
    await seedMembersIfEmpty();
    const { rows } = await sql`SELECT * FROM members ORDER BY name`;
    let members = (rows as MemberRow[]).map(rowToMember);
    if (search) {
      members = matchSorter(members, search, { keys: ['name', 'region', 'email', 'specialties'] });
    }
    return members;
  },
  async getById(id: number) {
    await seedMembersIfEmpty();
    const { rows } = await sql`SELECT * FROM members WHERE id = ${id}`;
    return rows[0] ? rowToMember(rows[0] as MemberRow) : undefined;
  },
  async getByEmail(email: string) {
    await seedMembersIfEmpty();
    const { rows } = await sql`SELECT * FROM members WHERE lower(email) = ${email.toLowerCase()}`;
    return rows[0] ? rowToMember(rows[0] as MemberRow) : undefined;
  },
  async create(data: MemberMutationPayload) {
    await ensureSchema();
    const now = new Date().toISOString();
    const { rows } = await sql`
      INSERT INTO members (name, region, phone, email, website, description, specialties, languages, member_since, status, created_at, updated_at)
      VALUES (${data.name}, ${data.region}, ${data.phone}, ${data.email}, ${data.website}, ${data.description}, ${JSON.stringify(data.specialties)}, ${JSON.stringify(data.languages)}, ${data.member_since}, ${data.status}, ${now}, ${now})
      RETURNING *
    `;
    return rowToMember(rows[0] as MemberRow);
  },
  async update(id: number, data: MemberMutationPayload) {
    await ensureSchema();
    const existing = await this.getById(id);
    if (!existing) return undefined;
    const updated_at = new Date().toISOString();
    await sql`
      UPDATE members SET name=${data.name}, region=${data.region}, phone=${data.phone}, email=${data.email}, website=${data.website},
      description=${data.description}, specialties=${JSON.stringify(data.specialties)}, languages=${JSON.stringify(data.languages)}, member_since=${data.member_since},
      status=${data.status}, updated_at=${updated_at} WHERE id=${id}
    `;
    return this.getById(id);
  },
  async remove(id: number) {
    await ensureSchema();
    const { rowCount } = await sql`DELETE FROM members WHERE id = ${id}`;
    return (rowCount ?? 0) > 0;
  }
};

// ---------- Events ----------

export type Event = {
  id: number;
  date: string;
  title: string;
  location: string;
  type: string;
  description: string;
  capacity: number;
  is_past: 0 | 1;
  detail_link: string | null;
  created_at: string;
  updated_at: string;
};

const RAW_EVENTS: Omit<Event, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    date: '2025-09-18',
    title: "ABTO Autumn Members' Forum",
    location: 'Thimphu',
    type: 'Forum',
    description:
      'Season review, a policy briefing from the Department of Tourism, and an open floor for member concerns.',
    capacity: 180,
    is_past: 0,
    detail_link: null
  },
  {
    date: '2025-10-07',
    title: 'Thimphu Tshechu Operator Briefing',
    location: 'Thimphu',
    type: 'Briefing',
    description:
      'Logistics coordination for the festival period: seating, permits, guide allocation and guest flow.',
    capacity: 120,
    is_past: 0,
    detail_link: null
  },
  {
    date: '2025-11-12',
    title: 'Sustainable Tourism Workshop: EU SUSTOUR',
    location: 'Paro',
    type: 'Workshop',
    description:
      'Third cohort intake. Two days on carbon measurement, procurement and community benefit-sharing.',
    capacity: 40,
    is_past: 0,
    detail_link: null
  },
  {
    date: '2026-01-22',
    title: 'Trade Fair Preparation Clinic',
    location: 'Thimphu',
    type: 'Clinic',
    description:
      'Preparing member collateral, buyer-meeting technique and shared-stand logistics for the spring circuit.',
    capacity: 60,
    is_past: 0,
    detail_link: null
  },
  {
    date: '2026-03-04',
    title: 'ABTO Annual General Meeting 2026',
    location: 'Thimphu',
    type: 'AGM',
    description:
      'Statutory meeting of the membership. Accounts, Board business and election of office bearers.',
    capacity: 200,
    is_past: 0,
    detail_link: '#/events/agm'
  },
  {
    date: '2026-11-10',
    title: 'Bhutan International Travel Mart 2026',
    location: 'Thimphu',
    type: 'Trade Mart',
    description:
      'International buyers, B2B meetings and Bhutanese tourism products under one roof, with a sustainability focus running through the programme.',
    capacity: 400,
    is_past: 0,
    detail_link: '#/events/bitm'
  },
  {
    date: '2025-08-20',
    title: 'Regenerative Bhutan Forum 2025',
    location: 'Dungkar Dzong',
    type: 'Forum',
    description:
      'The inaugural Regenerative Bhutan Forum: community-led tourism, Green Standards and a main panel on global and national perspectives on regenerative tourism.',
    capacity: 250,
    is_past: 1,
    detail_link: '#/events/rbf'
  },
  {
    date: '2025-03-04',
    title: 'ABTO Annual General Meeting 2025',
    location: 'Thimphu',
    type: 'AGM',
    description:
      'Annual accounts approved and the sustainability roadmap endorsed by the membership.',
    capacity: 200,
    is_past: 1,
    detail_link: '#/events/agm'
  },
  {
    date: '2025-04-19',
    title: 'EU SUSTOUR Cohort Two Graduation',
    location: 'Thimphu',
    type: 'Workshop',
    description: 'Twenty-two member operators completed their sustainability action plans.',
    capacity: 50,
    is_past: 1,
    detail_link: null
  }
];

async function seedEventsIfEmpty() {
  await ensureSchema();
  const { rows } = await sql`SELECT COUNT(*)::int AS count FROM events`;
  if (rows[0].count > 0) return;
  const now = new Date().toISOString();
  for (const e of RAW_EVENTS) {
    await sql`
      INSERT INTO events (date, title, location, type, description, capacity, is_past, detail_link, created_at, updated_at)
      VALUES (${e.date}, ${e.title}, ${e.location}, ${e.type}, ${e.description}, ${e.capacity}, ${e.is_past}, ${e.detail_link}, ${now}, ${now})
    `;
  }
}

export type EventMutationPayload = Omit<Event, 'id' | 'created_at' | 'updated_at'>;

export const eventsStore = {
  async getAll({ search }: { search?: string } = {}) {
    await seedEventsIfEmpty();
    const { rows } = await sql`SELECT * FROM events ORDER BY date DESC`;
    let events = rows as Event[];
    if (search) events = matchSorter(events, search, { keys: ['title', 'location', 'type'] });
    return events;
  },
  async getById(id: number) {
    await seedEventsIfEmpty();
    const { rows } = await sql`SELECT * FROM events WHERE id = ${id}`;
    return rows[0] as Event | undefined;
  },
  async create(data: EventMutationPayload) {
    await ensureSchema();
    const now = new Date().toISOString();
    const { rows } = await sql`
      INSERT INTO events (date, title, location, type, description, capacity, is_past, detail_link, created_at, updated_at)
      VALUES (${data.date}, ${data.title}, ${data.location}, ${data.type}, ${data.description}, ${data.capacity}, ${data.is_past}, ${data.detail_link}, ${now}, ${now})
      RETURNING *
    `;
    return rows[0] as Event;
  },
  async update(id: number, data: EventMutationPayload) {
    await ensureSchema();
    const existing = await this.getById(id);
    if (!existing) return undefined;
    const updated_at = new Date().toISOString();
    await sql`
      UPDATE events SET date=${data.date}, title=${data.title}, location=${data.location}, type=${data.type}, description=${data.description},
      capacity=${data.capacity}, is_past=${data.is_past}, detail_link=${data.detail_link}, updated_at=${updated_at} WHERE id=${id}
    `;
    return this.getById(id);
  },
  async remove(id: number) {
    await ensureSchema();
    const { rowCount } = await sql`DELETE FROM events WHERE id = ${id}`;
    return (rowCount ?? 0) > 0;
  }
};

// ---------- News ----------

export type NewsPost = {
  id: number;
  date: string;
  category: string;
  title: string;
  body: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

const RAW_NEWS: Omit<NewsPost, 'id' | 'image_url' | 'created_at' | 'updated_at'>[] = [
  {
    date: '2025-05-22',
    category: 'Policy',
    title: 'Department of Tourism opens consultation on revised Tour Operator Standards',
    body: 'ABTO has been invited to submit a consolidated member position on minimum service standards, vehicle age limits and guide-to-guest ratios before the end of the quarter.'
  },
  {
    date: '2025-05-08',
    category: 'Association',
    title: 'ABTO Annual General Meeting concludes in Thimphu',
    body: "Members reviewed the year's accounts, endorsed the sustainability roadmap and discussed representation at forthcoming international trade fairs."
  },
  {
    date: '2025-04-19',
    category: 'Sustainability',
    title: 'EU SUSTOUR Bhutan cohort completes its second training cycle',
    body: 'Participating operators finished sustainability action plans covering waste, procurement, community benefit and carbon measurement.'
  },
  {
    date: '2025-04-02',
    category: 'Aviation',
    title: 'Paro summer schedule confirmed by both carriers',
    body: 'Druk Air and Bhutan Airlines have published seasonal frequencies. Operators should confirm group bookings early for the autumn festival period.'
  },
  {
    date: '2025-02-27',
    category: 'Markets',
    title: 'ABTO delegation confirmed for the regional travel marts',
    body: 'A shared association stand will again be organised, giving smaller member operators cost-effective access to buyer meetings.'
  },
  {
    date: '2025-02-06',
    category: 'Festivals',
    title: 'Tentative festival dates released for 2025 and 2026',
    body: 'Tshechu dates across all dzongkhags are now published. Dates remain provisional until confirmed by the respective dzongs.'
  },
  {
    date: '2025-01-16',
    category: 'Association',
    title: 'Member directory verification exercise begins',
    body: 'All members are asked to review and update their public listing: contact person, specialties, languages and website.'
  }
];

async function seedNewsIfEmpty() {
  await ensureSchema();
  const { rows } = await sql`SELECT COUNT(*)::int AS count FROM news`;
  if (rows[0].count > 0) return;
  const now = new Date().toISOString();
  for (const n of RAW_NEWS) {
    await sql`
      INSERT INTO news (date, category, title, body, image_url, created_at, updated_at)
      VALUES (${n.date}, ${n.category}, ${n.title}, ${n.body}, NULL, ${now}, ${now})
    `;
  }
}

export type NewsMutationPayload = Omit<NewsPost, 'id' | 'created_at' | 'updated_at'>;

export const newsStore = {
  async getAll({ search }: { search?: string } = {}) {
    await seedNewsIfEmpty();
    const { rows } = await sql`SELECT * FROM news ORDER BY date DESC`;
    let posts = rows as NewsPost[];
    if (search) posts = matchSorter(posts, search, { keys: ['title', 'category', 'body'] });
    return posts;
  },
  async getById(id: number) {
    await seedNewsIfEmpty();
    const { rows } = await sql`SELECT * FROM news WHERE id = ${id}`;
    return rows[0] as NewsPost | undefined;
  },
  async create(data: NewsMutationPayload) {
    await ensureSchema();
    const now = new Date().toISOString();
    const { rows } = await sql`
      INSERT INTO news (date, category, title, body, image_url, created_at, updated_at)
      VALUES (${data.date}, ${data.category}, ${data.title}, ${data.body}, ${data.image_url}, ${now}, ${now})
      RETURNING *
    `;
    return rows[0] as NewsPost;
  },
  async update(id: number, data: NewsMutationPayload) {
    await ensureSchema();
    const existing = await this.getById(id);
    if (!existing) return undefined;
    const updated_at = new Date().toISOString();
    await sql`
      UPDATE news SET date=${data.date}, category=${data.category}, title=${data.title}, body=${data.body},
      image_url=${data.image_url}, updated_at=${updated_at} WHERE id=${id}
    `;
    return this.getById(id);
  },
  async remove(id: number) {
    await ensureSchema();
    const { rowCount } = await sql`DELETE FROM news WHERE id = ${id}`;
    return (rowCount ?? 0) > 0;
  }
};

// ---------- Documents (Downloads + Publications) ----------

export type Document = {
  id: number;
  kind: 'download' | 'publication';
  title: string;
  category: string | null;
  doc_type: string;
  size: string | null;
  year: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

const RAW_DOWNLOADS: Omit<
  Document,
  'id' | 'kind' | 'year' | 'description' | 'created_at' | 'updated_at'
>[] = [
  {
    title: 'ABTO Membership Registration Form',
    category: 'Membership',
    size: '186 KB',
    doc_type: 'PDF'
  },
  {
    title: 'Member Directory Update Form',
    category: 'Membership',
    size: '142 KB',
    doc_type: 'PDF'
  },
  {
    title: 'ABTO Articles of Association',
    category: 'Governance',
    size: '398 KB',
    doc_type: 'PDF'
  },
  { title: 'Annual Report 2024', category: 'Governance', size: '3.2 MB', doc_type: 'PDF' },
  {
    title: 'Standard Booking Terms Template',
    category: 'Templates',
    size: '96 KB',
    doc_type: 'DOCX'
  },
  {
    title: 'Trek Client Health Declaration Template',
    category: 'Templates',
    size: '74 KB',
    doc_type: 'DOCX'
  },
  { title: 'Guide Briefing Checklist', category: 'Templates', size: '64 KB', doc_type: 'PDF' },
  { title: 'ABTO Logo & Brand Assets', category: 'Media', size: '8.4 MB', doc_type: 'ZIP' },
  { title: 'Bhutan Tourism Fact Sheet 2025', category: 'Media', size: '512 KB', doc_type: 'PDF' },
  { title: 'Festival Dates 2025–2026', category: 'Media', size: '128 KB', doc_type: 'PDF' }
];

const RAW_PUBLICATIONS: Omit<
  Document,
  'id' | 'kind' | 'category' | 'size' | 'created_at' | 'updated_at'
>[] = [
  {
    title: 'Bhutan Tourism Monitor',
    year: '2024',
    description:
      'The annual statistical review of arrivals, markets, seasonality and length of stay.',
    doc_type: 'Annual'
  },
  {
    title: 'ABTO Annual Report',
    year: '2024',
    description:
      "Board report, audited accounts and the year's activities on behalf of the membership.",
    doc_type: 'Annual'
  },
  {
    title: 'Sustainable Tourism Handbook',
    year: '2023',
    description: 'Practical guidance produced with EU SUSTOUR for Bhutanese operators.',
    doc_type: 'Handbook'
  },
  {
    title: "Guide's Companion to Bhutanese Iconography",
    year: '2022',
    description:
      'A field reference for interpreting dzong murals, statuary and festival mask dances.',
    doc_type: 'Reference'
  },
  {
    title: 'Trekking Routes of Bhutan',
    year: '2023',
    description: 'Route profiles, altitude charts, campsite listings and seasonal windows.',
    doc_type: 'Reference'
  },
  {
    title: 'ABTO Dispatch, Monthly Newsletter',
    year: '2025',
    description: 'Policy changes, festival dates and trade opportunities for the membership.',
    doc_type: 'Newsletter'
  }
];

async function seedDocumentsIfEmpty() {
  await ensureSchema();
  const { rows } = await sql`SELECT COUNT(*)::int AS count FROM documents`;
  if (rows[0].count > 0) return;
  const now = new Date().toISOString();
  for (const d of RAW_DOWNLOADS) {
    await sql`
      INSERT INTO documents (kind, title, category, doc_type, size, year, description, created_at, updated_at)
      VALUES ('download', ${d.title}, ${d.category}, ${d.doc_type}, ${d.size}, NULL, NULL, ${now}, ${now})
    `;
  }
  for (const p of RAW_PUBLICATIONS) {
    await sql`
      INSERT INTO documents (kind, title, category, doc_type, size, year, description, created_at, updated_at)
      VALUES ('publication', ${p.title}, NULL, ${p.doc_type}, NULL, ${p.year}, ${p.description}, ${now}, ${now})
    `;
  }
}

export type DocumentMutationPayload = Omit<Document, 'id' | 'created_at' | 'updated_at'>;

export const documentsStore = {
  async getAll({ search, kind }: { search?: string; kind?: string } = {}) {
    await seedDocumentsIfEmpty();
    const { rows } = await sql`SELECT * FROM documents ORDER BY created_at DESC`;
    let docs = rows as Document[];
    if (kind) docs = docs.filter((d) => d.kind === kind);
    if (search) docs = matchSorter(docs, search, { keys: ['title', 'category', 'doc_type'] });
    return docs;
  },
  async getById(id: number) {
    await seedDocumentsIfEmpty();
    const { rows } = await sql`SELECT * FROM documents WHERE id = ${id}`;
    return rows[0] as Document | undefined;
  },
  async create(data: DocumentMutationPayload) {
    await ensureSchema();
    const now = new Date().toISOString();
    const { rows } = await sql`
      INSERT INTO documents (kind, title, category, doc_type, size, year, description, created_at, updated_at)
      VALUES (${data.kind}, ${data.title}, ${data.category}, ${data.doc_type}, ${data.size}, ${data.year}, ${data.description}, ${now}, ${now})
      RETURNING *
    `;
    return rows[0] as Document;
  },
  async update(id: number, data: DocumentMutationPayload) {
    await ensureSchema();
    const existing = await this.getById(id);
    if (!existing) return undefined;
    const updated_at = new Date().toISOString();
    await sql`
      UPDATE documents SET kind=${data.kind}, title=${data.title}, category=${data.category}, doc_type=${data.doc_type}, size=${data.size},
      year=${data.year}, description=${data.description}, updated_at=${updated_at} WHERE id=${id}
    `;
    return this.getById(id);
  },
  async remove(id: number) {
    await ensureSchema();
    const { rowCount } = await sql`DELETE FROM documents WHERE id = ${id}`;
    return (rowCount ?? 0) > 0;
  }
};

// ---------- Committee ----------

export type CommitteeMember = {
  id: number;
  name: string;
  title: string;
  seat_order: number;
  photo_url: string | null;
  is_vacant: 0 | 1;
  created_at: string;
  updated_at: string;
};

const RAW_COMMITTEE: Omit<CommitteeMember, 'id' | 'created_at' | 'updated_at'>[] = [
  { name: 'Kinley Gyeltshen', title: 'Chairman', seat_order: 0, photo_url: null, is_vacant: 0 },
  { name: 'Checho Wangdi', title: 'Vice Chairman', seat_order: 1, photo_url: null, is_vacant: 0 },
  { name: '', title: 'Secretary General', seat_order: 2, photo_url: null, is_vacant: 1 },
  { name: '', title: 'Treasurer', seat_order: 3, photo_url: null, is_vacant: 1 },
  { name: '', title: 'Executive Committee Member', seat_order: 4, photo_url: null, is_vacant: 1 },
  { name: '', title: 'Executive Committee Member', seat_order: 5, photo_url: null, is_vacant: 1 },
  { name: '', title: 'Executive Committee Member', seat_order: 6, photo_url: null, is_vacant: 1 }
];

async function seedCommitteeIfEmpty() {
  await ensureSchema();
  const { rows } = await sql`SELECT COUNT(*)::int AS count FROM committee`;
  if (rows[0].count > 0) return;
  const now = new Date().toISOString();
  for (const c of RAW_COMMITTEE) {
    await sql`
      INSERT INTO committee (name, title, seat_order, photo_url, is_vacant, created_at, updated_at)
      VALUES (${c.name}, ${c.title}, ${c.seat_order}, ${c.photo_url}, ${c.is_vacant}, ${now}, ${now})
    `;
  }
}

export type CommitteeMutationPayload = Omit<CommitteeMember, 'id' | 'created_at' | 'updated_at'>;

export const committeeStore = {
  async getAll({ search }: { search?: string } = {}) {
    await seedCommitteeIfEmpty();
    const { rows } = await sql`SELECT * FROM committee ORDER BY seat_order ASC`;
    let members = rows as CommitteeMember[];
    if (search) members = matchSorter(members, search, { keys: ['name', 'title'] });
    return members;
  },
  async getById(id: number) {
    await seedCommitteeIfEmpty();
    const { rows } = await sql`SELECT * FROM committee WHERE id = ${id}`;
    return rows[0] as CommitteeMember | undefined;
  },
  async create(data: CommitteeMutationPayload) {
    await ensureSchema();
    const now = new Date().toISOString();
    const { rows } = await sql`
      INSERT INTO committee (name, title, seat_order, photo_url, is_vacant, created_at, updated_at)
      VALUES (${data.name}, ${data.title}, ${data.seat_order}, ${data.photo_url}, ${data.is_vacant}, ${now}, ${now})
      RETURNING *
    `;
    return rows[0] as CommitteeMember;
  },
  async update(id: number, data: CommitteeMutationPayload) {
    await ensureSchema();
    const existing = await this.getById(id);
    if (!existing) return undefined;
    const updated_at = new Date().toISOString();
    await sql`
      UPDATE committee SET name=${data.name}, title=${data.title}, seat_order=${data.seat_order},
      photo_url=${data.photo_url}, is_vacant=${data.is_vacant}, updated_at=${updated_at} WHERE id=${id}
    `;
    return this.getById(id);
  },
  async remove(id: number) {
    await ensureSchema();
    const { rowCount } = await sql`DELETE FROM committee WHERE id = ${id}`;
    return (rowCount ?? 0) > 0;
  }
};

// ---------- Destinations (Bhutan places + Druk Air / Tashi Air gateways) ----------

export type Destination = {
  id: number;
  kind: 'place' | 'druk_air' | 'tashi_air';
  name: string;
  tagline: string | null;
  description: string;
  image_url: string | null;
  seat_order: number;
  created_at: string;
  updated_at: string;
};

const RAW_PLACES: Omit<Destination, 'id' | 'kind' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Paro',
    tagline: 'Gateway to the Kingdom',
    description:
      "Paro is the gateway town home to Bhutan's only international airport, set in a lush valley. It is a hub for trekking, rafting, and mountain biking, and the base for visiting the cliffside Tiger's Nest monastery.",
    image_url: 'https://picsum.photos/seed/abto-paro-valley/1600/1200',
    seat_order: 0
  },
  {
    name: 'Thimphu',
    tagline: 'The Capital',
    description:
      "Bhutan's capital city notably has no traffic lights, and modern development is closely regulated so that even new construction preserves traditional Bhutanese architecture.",
    image_url: 'https://picsum.photos/seed/abto-thimphu-city/1600/1200',
    seat_order: 1
  },
  {
    name: 'Punakha',
    tagline: 'Valley of Rivers',
    description:
      'Punakha is known for the Punakha Dzong, set at the confluence of two rivers, and for its lush valleys and slower pace of life.',
    image_url: 'https://picsum.photos/seed/abto-punakha-dzong/1600/1200',
    seat_order: 2
  },
  {
    name: 'Bumthang',
    tagline: 'Spiritual Heartland',
    description:
      "Considered one of the most spiritual and scenic valleys in Bhutan, Bumthang is home to several of the country's oldest temples.",
    image_url: 'https://picsum.photos/seed/abto-bumthang-valley/1600/1200',
    seat_order: 3
  },
  {
    name: "Tiger's Nest (Paro Taktsang)",
    tagline: 'The Cliffside Monastery',
    description:
      "Built in 1692, Paro Taktsang clings to a cliff roughly 900 meters above the Paro valley floor. According to legend, the monk Guru Padmasambhava meditated here — it's reached via a rewarding hike.",
    image_url: 'https://picsum.photos/seed/abto-tigers-nest/1600/1200',
    seat_order: 4
  }
];

const RAW_DRUK_AIR: Omit<Destination, 'id' | 'kind' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Kathmandu Airport',
    tagline: 'Nepal',
    description:
      "Tribhuvan International Airport connects Bhutan to Nepal's capital, a gateway city rich with Himalayan history and Buddhist heritage.",
    image_url: 'https://picsum.photos/seed/abto-prayerflags/1600/1056',
    seat_order: 0
  },
  {
    name: 'Guwahati Airport',
    tagline: 'India',
    description:
      'Lokpriya Gopinath Bordoloi International Airport serves as a convenient gateway to Bhutan from Northeast India, close to the border town of Phuentsholing.',
    image_url: 'https://picsum.photos/seed/abto-culture-1/1600/1056',
    seat_order: 1
  },
  {
    name: 'Gaya Airport',
    tagline: 'India',
    description:
      "Gaya International Airport is a preferred route for pilgrims and travellers connecting Bodh Gaya's sacred Buddhist sites with Bhutan.",
    image_url: 'https://picsum.photos/seed/abto-monastery-2/1600/1056',
    seat_order: 2
  },
  {
    name: 'Yonphula Airport',
    tagline: 'Bhutan',
    description:
      'Located in eastern Bhutan, Yonphula Airport opens up the remote valleys, monasteries, and villages of the east to travellers seeking Bhutan beyond the well-trodden west.',
    image_url: 'https://picsum.photos/seed/abto-valley/1600/1056',
    seat_order: 3
  }
];

const RAW_TASHI_AIR: Omit<Destination, 'id' | 'kind' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Paro',
    tagline: 'Bhutan',
    description:
      'A historic town with many sacred buildings and historical sites, Paro is also home to the busy international airport of Bhutan — and the gateway to the iconic Tiger’s Nest monastery.',
    image_url: 'https://picsum.photos/seed/abto-monastery-1/1600/1056',
    seat_order: 0
  },
  {
    name: 'Calcutta',
    tagline: 'India',
    description:
      'Kolkata (Calcutta), the cultural capital of India, is a city of grand colonial architecture, vibrant markets, and a deep literary and artistic heritage — a fascinating stopover en route to Bhutan.',
    image_url: 'https://picsum.photos/seed/abto-festival-2/1600/1056',
    seat_order: 1
  },
  {
    name: 'Kathmandu',
    tagline: 'Nepal',
    description:
      'Kathmandu, the capital of Nepal, is a bustling city of ancient Buddhist and Hindu religious sites, where the entwining strands of religion are inextricably linked to everyday life.',
    image_url: 'https://picsum.photos/seed/abto-festival-1/1600/1056',
    seat_order: 2
  },
  {
    name: 'Bangkok',
    tagline: 'Thailand',
    description:
      'Bangkok, the capital of Thailand, is an large city known for ornate shrines and vibrant street life.',
    image_url: 'https://picsum.photos/seed/abto-nature-1/1600/1056',
    seat_order: 3
  },
  {
    name: 'Delhi',
    tagline: 'India',
    description:
      "Delhi, the capital of India and the major gateway to the country, it constitutes a blend of traditional culture along with today's rapidly modernizing ways. Delhi has boasts some of the finest museums, bars and nightlights.",
    image_url: 'https://picsum.photos/seed/abto-airport/1600/1056',
    seat_order: 4
  }
];

async function seedDestinationsIfEmpty() {
  await ensureSchema();
  const { rows } = await sql`SELECT COUNT(*)::int AS count FROM destinations`;
  if (rows[0].count > 0) return;
  const now = new Date().toISOString();
  for (const kind of ['place', 'druk_air', 'tashi_air'] as const) {
    const list = kind === 'place' ? RAW_PLACES : kind === 'druk_air' ? RAW_DRUK_AIR : RAW_TASHI_AIR;
    for (const d of list) {
      await sql`
        INSERT INTO destinations (kind, name, tagline, description, image_url, seat_order, created_at, updated_at)
        VALUES (${kind}, ${d.name}, ${d.tagline}, ${d.description}, ${d.image_url}, ${d.seat_order}, ${now}, ${now})
      `;
    }
  }
}

export type DestinationMutationPayload = Omit<Destination, 'id' | 'created_at' | 'updated_at'>;

export const destinationsStore = {
  async getAll({ search, kind }: { search?: string; kind?: string } = {}) {
    await seedDestinationsIfEmpty();
    const { rows } = await sql`SELECT * FROM destinations ORDER BY kind ASC, seat_order ASC`;
    let items = rows as Destination[];
    if (kind) items = items.filter((d) => d.kind === kind);
    if (search) items = matchSorter(items, search, { keys: ['name', 'tagline', 'description'] });
    return items;
  },
  async getById(id: number) {
    await seedDestinationsIfEmpty();
    const { rows } = await sql`SELECT * FROM destinations WHERE id = ${id}`;
    return rows[0] as Destination | undefined;
  },
  async create(data: DestinationMutationPayload) {
    await ensureSchema();
    const now = new Date().toISOString();
    const { rows } = await sql`
      INSERT INTO destinations (kind, name, tagline, description, image_url, seat_order, created_at, updated_at)
      VALUES (${data.kind}, ${data.name}, ${data.tagline}, ${data.description}, ${data.image_url}, ${data.seat_order}, ${now}, ${now})
      RETURNING *
    `;
    return rows[0] as Destination;
  },
  async update(id: number, data: DestinationMutationPayload) {
    await ensureSchema();
    const existing = await this.getById(id);
    if (!existing) return undefined;
    const updated_at = new Date().toISOString();
    await sql`
      UPDATE destinations SET kind=${data.kind}, name=${data.name}, tagline=${data.tagline}, description=${data.description},
      image_url=${data.image_url}, seat_order=${data.seat_order}, updated_at=${updated_at} WHERE id=${id}
    `;
    return this.getById(id);
  },
  async remove(id: number) {
    await ensureSchema();
    const { rowCount } = await sql`DELETE FROM destinations WHERE id = ${id}`;
    return (rowCount ?? 0) > 0;
  }
};

// ---------- Submissions (Contact form + Membership Apply form) ----------

export type Submission = {
  id: number;
  kind: 'contact' | 'membership';
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

export type SubmissionMutationPayload = Omit<Submission, 'id' | 'created_at'>;

export const submissionsStore = {
  async getAll({ kind }: { kind?: string } = {}) {
    await ensureSchema();
    const { rows } = await sql`SELECT * FROM submissions ORDER BY created_at DESC`;
    let items = rows as Submission[];
    if (kind) items = items.filter((s) => s.kind === kind);
    return items;
  },
  async getById(id: number) {
    await ensureSchema();
    const { rows } = await sql`SELECT * FROM submissions WHERE id = ${id}`;
    return rows[0] as Submission | undefined;
  },
  async create(data: SubmissionMutationPayload) {
    await ensureSchema();
    const now = new Date().toISOString();
    const { rows } = await sql`
      INSERT INTO submissions (kind, name, email, phone, company, message, payload, created_at)
      VALUES (${data.kind}, ${data.name}, ${data.email}, ${data.phone}, ${data.company}, ${data.message}, ${JSON.stringify(data.payload)}::jsonb, ${now})
      RETURNING *
    `;
    return rows[0] as Submission;
  },
  async remove(id: number) {
    await ensureSchema();
    const { rowCount } = await sql`DELETE FROM submissions WHERE id = ${id}`;
    return (rowCount ?? 0) > 0;
  }
};
