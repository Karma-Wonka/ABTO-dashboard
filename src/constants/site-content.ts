// ============================================================
// Site content store — server-only, Postgres-backed
// ============================================================
// Editable copy for the public website (../web). Every visitor-facing
// block that isn't its own CRUD entity (news/events/members/committee/
// destinations) lives here as a key → JSON value pair, so a brand-new
// section is a data change (add a key + a small admin form config), not
// a schema migration. See src/features/site-content/constants/sections.ts
// for the admin editor's per-key form config, and web/lib/cms.ts for how
// the public site reads these back.
// ============================================================
import 'server-only';
import { ensureSchema, sql } from '@/lib/db';

export type SiteContent = Record<string, unknown>;

// Seeded from the copy that used to be hardcoded directly into the
// public site's page.tsx / content/*.ts files, so turning this on
// doesn't change anything the public site shows until an admin edits it.
const DEFAULTS: SiteContent = {
  // ---------- Home ----------
  'home.hero': {
    eyebrow: 'Association of Bhutanese Tour Operators',
    title: 'Bhutan, Carried Forward',
    subtitle: 'Supporting Sustainable Tourism. Connecting Bhutan to the World.',
    image: 'https://picsum.photos/seed/abto-prayerflags/2400/1584'
  },
  'home.whoWeAre': {
    eyebrow: 'Who We Are',
    title: "The Voice of Bhutan's Tour Operators",
    paragraph1:
      'The Association of Bhutanese Tour Operators is the national body representing licensed tour operators across the Kingdom. We work closely with the Tourism Council of Bhutan and the Royal Government to advocate for policy that sustains Bhutan’s High Value, Low Volume approach to tourism — protecting the culture, environment, and Gross National Happiness philosophy that make Bhutan singular in the world.',
    paragraph2:
      "From training and industry standards to member advocacy, ABTO exists to ensure every visitor's journey through Bhutan is guided with expertise, integrity, and care.",
    image: 'https://picsum.photos/seed/abto-monastery-1/1600/1056'
  },
  'home.statsIntro': {
    eyebrow: 'Bhutan Through Tourism',
    title: 'A Network Built to Last',
    disclaimer: 'Figures shown are illustrative placeholders pending verified data from ABTO.'
  },
  'home.stats': [
    { value: 1200, suffix: '+', label: 'Member Operators' },
    { value: 35, suffix: '+', label: 'Years of Service' },
    { value: 150000, suffix: '+', label: 'Visitors Supported Annually' }
  ],
  'home.whyAbtoIntro': {
    eyebrow: 'Why ABTO Matters',
    title: 'Standing Behind Every Journey Through Bhutan'
  },
  'home.whyAbto': [
    {
      icon: 'ShieldCheck',
      title: 'Advocacy',
      text: "Representing licensed tour operators before the Tourism Council of Bhutan and government, shaping policy that protects the industry's future."
    },
    {
      icon: 'Leaf',
      title: 'Sustainable Tourism',
      text: "Championing Bhutan's High Value, Low Volume philosophy so tourism strengthens, rather than strains, the Kingdom's culture and environment."
    },
    {
      icon: 'Users',
      title: 'Member Support',
      text: 'Training, resources, and a connected community that helps operators of every size deliver world-class experiences.'
    },
    {
      icon: 'Award',
      title: 'Industry Standards',
      text: "Setting and upholding the standards that keep Bhutan's tourism trade trusted, professional, and safe for every traveller."
    }
  ],
  'home.membershipTeaser': {
    eyebrow: 'Membership',
    title: "Join Bhutan's Leading Tourism Network",
    text: 'Gain advocacy, training, and visibility as a licensed member of ABTO — and become part of the community shaping the future of Bhutanese tourism.'
  },
  'home.membershipBullets': [
    { value: 'Policy advocacy with TCB & government' },
    { value: 'Access to training & certifications' },
    { value: 'Member directory visibility' },
    { value: 'Discounted events & partner rates' }
  ],
  'home.travelTeaserIntro': {
    eyebrow: 'Travel Information',
    title: 'Planning Your Way to Bhutan'
  },
  'home.travelTeaserCards': [
    {
      title: 'Planning Your Trip',
      href: '/travel',
      image: 'https://picsum.photos/seed/abto-paro-valley/1200/792'
    },
    {
      title: 'Druk Air Information',
      href: '/travel',
      image: 'https://picsum.photos/seed/abto-temple/1200/792'
    },
    {
      title: 'Tashi Air Information',
      href: '/travel',
      image: 'https://picsum.photos/seed/abto-monastery-1/1200/792'
    }
  ],
  'home.partners': [
    { value: 'TCB' },
    { value: 'ABTO' },
    { value: 'HRAB' },
    { value: 'GAB' },
    { value: 'Dept. of Tourism' }
  ],
  'home.finalCta': {
    title: "Join Bhutan's Leading Tourism Network",
    text: 'Become a member of ABTO and help shape the future of sustainable tourism in the Kingdom.',
    image: 'https://picsum.photos/seed/abto-mountain-2/2000/1320'
  },

  // ---------- About ----------
  'about.hero': { image: 'https://picsum.photos/seed/abto-mountain-1/2000/1320' },
  'about.role': {
    title: 'Our Role',
    text: 'The Association of Bhutanese Tour Operators (ABTO) is the national body representing licensed tour operators across the Kingdom of Bhutan. As the collective voice of the industry, ABTO works closely with the Tourism Council of Bhutan (TCB), the Royal Government, and allied bodies such as the Hotel & Restaurant Association of Bhutan (HRAB) and the Guide Association of Bhutan (GAB) to shape policy, coordinate standards, and support the sustainable growth of tourism.'
  },
  'about.mission': {
    title: 'Our Mission',
    text: "ABTO exists to promote Bhutan's “High Value, Low Volume” approach to tourism — a model that protects the Kingdom's culture, environment, and Gross National Happiness philosophy while delivering meaningful, high-quality experiences to travellers. The Association champions responsible practices among its members, advocates for policy that balances economic opportunity with conservation, and builds the capacity of Bhutan's tourism workforce through training and shared standards."
  },
  'about.whatWeDo': [
    {
      label: 'Advocacy',
      text: 'representing member interests before government and regulatory bodies.'
    },
    {
      label: 'Standards',
      text: 'setting and upholding professional standards for tour operators and guides.'
    },
    {
      label: 'Training',
      text: 'running programmes that raise the skill and safety bar across the industry.'
    },
    {
      label: 'Community',
      text: 'connecting members through events, resources, and shared information.'
    }
  ],
  'about.historyNote': {
    text: "ABTO's exact founding year and detailed institutional history are pending confirmation from the Association and are not included here as placeholder invention. This page reflects ABTO's real, current role as Bhutan's national tour operator association. Please contact ABTO directly for verified historical records."
  },
  'about.committeeIntro': {
    eyebrow: 'ABTO',
    title: 'Executive Committee',
    text: "The Executive Committee guides ABTO's advocacy, standards, and strategy on behalf of its member operators.",
    notice: 'Committee information is being updated. Contact ABTO to confirm current officeholders.'
  },

  // ---------- Membership ----------
  'membership.hero': { image: 'https://picsum.photos/seed/abto-people/2000/1320' },
  'membership.benefits': [
    {
      icon: 'Megaphone',
      title: 'Policy Advocacy',
      text: 'A collective voice before the Tourism Council of Bhutan and government on issues that affect your business.'
    },
    {
      icon: 'GraduationCap',
      title: 'Training & Certification',
      text: 'Access to guide and operator training programmes that raise standards and open new opportunities.'
    },
    {
      icon: 'Handshake',
      title: 'Industry Network',
      text: "Direct connections with fellow operators, guides, hoteliers, and airlines across Bhutan's tourism ecosystem."
    },
    {
      icon: 'ShieldCheck',
      title: 'Credibility & Trust',
      text: 'ABTO membership signals professionalism and compliance to international partners and travellers.'
    }
  ],
  'membership.typesNote': {
    text: "Structure shown is illustrative, pending ABTO's confirmed fee schedule and category definitions."
  },
  'membership.types': [
    {
      name: 'Ordinary Member',
      description:
        'For licensed tour operators actively conducting inbound tourism business in Bhutan.',
      points:
        'Full voting rights\nEligible for committee positions\nComplete access to member benefits'
    },
    {
      name: 'Associate Member',
      description:
        'For allied businesses — hotels, transport providers, and other tourism-related enterprises.',
      points: 'Access to training & events\nMember directory listing\nNo voting rights'
    }
  ],
  'membership.requirements': [
    { value: 'Valid tour operator licence issued by the Tourism Council of Bhutan' },
    { value: 'Registered business entity in good standing in Bhutan' },
    { value: 'Completed ABTO membership application form' },
    { value: 'Payment of applicable membership fee (per current fee schedule)' }
  ],
  'membership.steps': [
    {
      title: 'Submit Application',
      text: 'Complete the online registration form with your company and licensing details.'
    },
    {
      title: 'Document Review',
      text: 'ABTO reviews your licence and business registration for compliance.'
    },
    {
      title: 'Committee Approval',
      text: 'The Executive Committee reviews and approves eligible applications.'
    },
    {
      title: 'Welcome & Onboarding',
      text: 'Approved members receive onboarding materials and directory listing.'
    }
  ],
  'membership.faqs': [
    {
      q: 'Who is eligible to become an ABTO member?',
      a: 'Any business holding a valid tour operator licence from the Tourism Council of Bhutan is eligible to apply as an Ordinary Member. Allied tourism businesses may apply as Associate Members.'
    },
    {
      q: 'How long does the application process take?',
      a: 'Processing times vary depending on committee review cycles. Applicants are notified once a decision has been made. Contact ABTO directly for current timelines.'
    },
    {
      q: 'Is there an annual renewal requirement?',
      a: 'Yes, membership is typically renewed annually alongside licence verification. Exact renewal terms should be confirmed with the ABTO secretariat.'
    },
    {
      q: 'What support does ABTO provide to new members?',
      a: 'New members receive onboarding materials, access to training programmes, and a listing in the ABTO member directory, along with ongoing policy updates.'
    }
  ],

  // ---------- Travel ----------
  'travel.hero': { image: 'https://picsum.photos/seed/abto-tigers-nest/2000/1320' },
  'travel.planningFacts': [
    {
      title: 'Who Needs a Visa',
      text: 'All tourists except visitors from India, Bangladesh, and the Maldives need a visa to enter Bhutan.'
    },
    {
      title: 'Booking Through a Licensed Operator',
      text: 'A visa must be arranged through a licensed Bhutanese tour operator (such as an ABTO member) as part of a booked tour package with a confirmed itinerary. Independent, unguided travel by non-exempt nationalities is not permitted.'
    },
    {
      title: 'Sustainable Development Fee (SDF)',
      text: 'A Sustainable Development Fee of US$100 per person, per night, applies to all visitors except Indian nationals, who pay a separate, lower rate in INR. Children aged 6–12 receive a 50% discount on the SDF, and children aged 5 and under are exempt.'
    },
    {
      title: 'Visa Processing Fee',
      text: 'A separate, one-time, non-refundable visa processing fee of US$40 applies in addition to the SDF.'
    },
    {
      title: 'Where the SDF Goes',
      text: "The SDF funds Bhutan's healthcare, education, and infrastructure, and is central to the country's High Value, Low Volume tourism policy."
    }
  ],
  'travel.disclaimer': {
    text: "Visa and fee figures above are sourced from third-party travel-industry references, not ABTO's own records, and government fee schedules can change. Please confirm current requirements with the Tourism Council of Bhutan or the Department of Immigration before travelling."
  },

  // ---------- Contact ----------
  'contact.info': {
    address: 'Drimey Lam, Thimphu, PO Box 938, Kingdom of Bhutan',
    phone: '+975 2 322 862',
    email: 'info@abto.org.bt',
    mapEmbedUrl:
      'https://www.openstreetmap.org/export/embed.html?bbox=89.5839%2C27.4212%2C89.6839%2C27.5212&layer=mapnik&marker=27.4712%2C89.6339'
  },

  // ---------- Navigation & Footer ----------
  'nav.links': [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Membership', href: '/membership' },
    { label: 'Members', href: '/members' },
    { label: 'News', href: '/news' },
    { label: 'Travel', href: '/travel' },
    { label: 'Contact', href: '/contact' }
  ],
  'footer.brand': {
    name: 'ABTO',
    blurb:
      'Association of Bhutanese Tour Operators — supporting sustainable tourism and connecting Bhutan to the world.'
  },
  'footer.social': [
    { platform: 'Facebook', url: '' },
    { platform: 'Twitter / X', url: '' },
    { platform: 'Instagram', url: '' },
    { platform: 'YouTube', url: '' }
  ],
  'footer.partners': [
    { name: 'Department of Tourism', url: '' },
    { name: 'Tourism Council of Bhutan', url: '' },
    { name: 'Drukair', url: '' },
    { name: 'Tashi Air', url: '' }
  ],
  'footer.categories': [{ value: 'News' }, { value: 'Events' }, { value: 'Travel Information' }],

  // ---------- SEO ----------
  'seo.default': {
    title: 'ABTO | Association of Bhutanese Tour Operators',
    description:
      "The Association of Bhutanese Tour Operators (ABTO) supports sustainable tourism and connects Bhutan to the world by representing the nation's licensed tour operators."
  }
};

async function seedIfEmpty() {
  await ensureSchema();
  const { rows } = await sql`SELECT COUNT(*)::int AS count FROM site_content`;
  if (rows[0].count > 0) return;

  const now = new Date().toISOString();
  for (const [key, value] of Object.entries(DEFAULTS)) {
    await sql`
      INSERT INTO site_content (key, value, updated_at)
      VALUES (${key}, ${JSON.stringify(value)}::jsonb, ${now})
    `;
  }
}

export const siteContentStore = {
  async getAll(): Promise<SiteContent> {
    await seedIfEmpty();
    const { rows } = await sql`SELECT key, value FROM site_content`;
    const content: SiteContent = { ...DEFAULTS };
    for (const row of rows as { key: string; value: unknown }[]) {
      content[row.key] = row.value;
    }
    return content;
  },

  async update(patch: SiteContent): Promise<SiteContent> {
    await ensureSchema();
    const now = new Date().toISOString();
    for (const [key, value] of Object.entries(patch)) {
      await sql`
        INSERT INTO site_content (key, value, updated_at)
        VALUES (${key}, ${JSON.stringify(value)}::jsonb, ${now})
        ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(value)}::jsonb, updated_at = ${now}
      `;
    }
    return this.getAll();
  }
};
