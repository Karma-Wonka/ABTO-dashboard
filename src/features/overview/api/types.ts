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

export type OverviewStatsResponse = {
  success: boolean;
  stats: OverviewStats;
};
