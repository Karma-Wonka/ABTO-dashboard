// ============================================================
// Dashboard overview aggregates — server-only
// ============================================================
// Real numbers derived from the same members/events/news/documents
// stores the rest of the dashboard reads and writes. No demo/placeholder
// data — every figure here traces back to an actual row.
// ============================================================
import 'server-only';
import { membersStore, eventsStore, newsStore, documentsStore } from '@/constants/abto-data';

export type CountByLabel = { label: string; count: number };

export type OverviewStats = {
  members: {
    total: number;
    active: number;
    pending: number;
    newThisYear: number;
  };
  events: {
    total: number;
    upcoming: number;
    nextEvent: { title: string; date: string } | null;
  };
  news: {
    total: number;
    latest: { title: string; date: string } | null;
  };
  documents: {
    total: number;
    downloads: number;
    publications: number;
  };
  membersByRegion: CountByLabel[];
  membershipGrowth: { year: string; members: number }[];
  membersBySpecialty: CountByLabel[];
};

function topN(counts: Map<string, number>, n: number): CountByLabel[] {
  return Array.from(counts, ([label, count]) => ({ label, count }))
    .toSorted((a, b) => b.count - a.count)
    .slice(0, n);
}

export async function getOverviewStats(): Promise<OverviewStats> {
  const [members, events, news, documents] = await Promise.all([
    membersStore.getAll(),
    eventsStore.getAll(),
    newsStore.getAll(),
    documentsStore.getAll()
  ]);

  const currentYear = new Date().getUTCFullYear();

  // ---- Members ----
  const active = members.filter((m) => m.status === 'active').length;
  const pending = members.length - active;
  const newThisYear = members.filter((m) => m.member_since === currentYear).length;

  const byRegion = new Map<string, number>();
  const bySpecialty = new Map<string, number>();
  const byYear = new Map<number, number>();

  for (const member of members) {
    byRegion.set(member.region, (byRegion.get(member.region) ?? 0) + 1);
    byYear.set(member.member_since, (byYear.get(member.member_since) ?? 0) + 1);
    for (const specialty of member.specialties) {
      bySpecialty.set(specialty, (bySpecialty.get(specialty) ?? 0) + 1);
    }
  }

  const years = Array.from(byYear.keys()).toSorted((a, b) => a - b);
  let cumulative = 0;
  const membershipGrowth = years.map((year) => {
    cumulative += byYear.get(year) ?? 0;
    return { year: String(year), members: cumulative };
  });

  // ---- Events ----
  const upcoming = events.filter((e) => e.is_past === 0);
  const nextEvent = upcoming.toSorted((a, b) => a.date.localeCompare(b.date))[0];

  // ---- News ----
  const latestNews = news.toSorted((a, b) => b.date.localeCompare(a.date))[0];

  // ---- Documents ----
  const downloads = documents.filter((d) => d.kind === 'download').length;
  const publications = documents.filter((d) => d.kind === 'publication').length;

  return {
    members: { total: members.length, active, pending, newThisYear },
    events: {
      total: events.length,
      upcoming: upcoming.length,
      nextEvent: nextEvent ? { title: nextEvent.title, date: nextEvent.date } : null
    },
    news: {
      total: news.length,
      latest: latestNews ? { title: latestNews.title, date: latestNews.date } : null
    },
    documents: { total: documents.length, downloads, publications },
    membersByRegion: topN(byRegion, 8),
    membershipGrowth,
    membersBySpecialty: topN(bySpecialty, 5)
  };
}
