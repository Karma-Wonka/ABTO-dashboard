// ============================================================
// Site content section catalogue — drives the admin editor UI
// ============================================================
// Adding a new editable section on the public site is: (1) add a
// DEFAULTS key in src/constants/site-content.ts, (2) add one entry here.
// No new table, route, or bespoke form component required — see
// docs/forms.md's "Dynamic array rows" recipe for the underlying pattern.
// ============================================================

export type FieldType = 'text' | 'textarea' | 'email' | 'url' | 'number';

export interface FieldSpec {
  name: string;
  label: string;
  type?: FieldType;
}

export type SectionConfig =
  | {
      key: string;
      kind: 'scalar';
      title: string;
      description?: string;
      fields: FieldSpec[];
    }
  | {
      key: string;
      kind: 'list';
      title: string;
      description?: string;
      fields: FieldSpec[];
      emptyItem: Record<string, unknown>;
      itemLabel: string;
    };

export interface SectionTab {
  value: string;
  label: string;
  sections: SectionConfig[];
}

export const SITE_CONTENT_TABS: SectionTab[] = [
  {
    value: 'home',
    label: 'Home',
    sections: [
      {
        key: 'home.hero',
        kind: 'scalar',
        title: 'Hero',
        description: 'The full-screen banner at the top of the homepage.',
        fields: [
          { name: 'eyebrow', label: 'Eyebrow' },
          { name: 'title', label: 'Headline' },
          { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
          { name: 'image', label: 'Background Image URL', type: 'url' }
        ]
      },
      {
        key: 'home.whoWeAre',
        kind: 'scalar',
        title: '"Who We Are" Section',
        fields: [
          { name: 'eyebrow', label: 'Eyebrow' },
          { name: 'title', label: 'Headline' },
          { name: 'paragraph1', label: 'Paragraph 1', type: 'textarea' },
          { name: 'paragraph2', label: 'Paragraph 2', type: 'textarea' },
          { name: 'image', label: 'Image URL', type: 'url' }
        ]
      },
      {
        key: 'home.statsIntro',
        kind: 'scalar',
        title: 'Stats — Heading',
        fields: [
          { name: 'eyebrow', label: 'Eyebrow' },
          { name: 'title', label: 'Headline' },
          { name: 'disclaimer', label: 'Disclaimer', type: 'textarea' }
        ]
      },
      {
        key: 'home.stats',
        kind: 'list',
        title: 'Stats — Figures',
        itemLabel: 'Stat',
        emptyItem: { value: 0, suffix: '+', label: '' },
        fields: [
          { name: 'value', label: 'Value', type: 'number' },
          { name: 'suffix', label: 'Suffix (e.g. "+")' },
          { name: 'label', label: 'Label' }
        ]
      },
      {
        key: 'home.whyAbtoIntro',
        kind: 'scalar',
        title: '"Why ABTO Matters" — Heading',
        fields: [
          { name: 'eyebrow', label: 'Eyebrow' },
          { name: 'title', label: 'Headline' }
        ]
      },
      {
        key: 'home.whyAbto',
        kind: 'list',
        title: '"Why ABTO Matters" — Cards',
        description:
          'Icon names: ShieldCheck, Leaf, Users, Award, Megaphone, GraduationCap, Handshake.',
        itemLabel: 'Card',
        emptyItem: { icon: 'ShieldCheck', title: '', text: '' },
        fields: [
          { name: 'icon', label: 'Icon Name' },
          { name: 'title', label: 'Title' },
          { name: 'text', label: 'Text', type: 'textarea' }
        ]
      },
      {
        key: 'home.membershipTeaser',
        kind: 'scalar',
        title: 'Membership Teaser',
        fields: [
          { name: 'eyebrow', label: 'Eyebrow' },
          { name: 'title', label: 'Headline' },
          { name: 'text', label: 'Text', type: 'textarea' }
        ]
      },
      {
        key: 'home.membershipBullets',
        kind: 'list',
        title: 'Membership Teaser — Bullets',
        itemLabel: 'Bullet',
        emptyItem: { value: '' },
        fields: [{ name: 'value', label: 'Text' }]
      },
      {
        key: 'home.travelTeaserIntro',
        kind: 'scalar',
        title: 'Travel Teaser — Heading',
        fields: [
          { name: 'eyebrow', label: 'Eyebrow' },
          { name: 'title', label: 'Headline' }
        ]
      },
      {
        key: 'home.travelTeaserCards',
        kind: 'list',
        title: 'Travel Teaser — Cards',
        itemLabel: 'Card',
        emptyItem: { title: '', href: '/travel', image: '' },
        fields: [
          { name: 'title', label: 'Title' },
          { name: 'href', label: 'Link' },
          { name: 'image', label: 'Image URL', type: 'url' }
        ]
      },
      {
        key: 'home.partners',
        kind: 'list',
        title: 'Partner Wordmarks',
        itemLabel: 'Partner',
        emptyItem: { value: '' },
        fields: [{ name: 'value', label: 'Name' }]
      },
      {
        key: 'home.finalCta',
        kind: 'scalar',
        title: 'Final Call to Action',
        fields: [
          { name: 'title', label: 'Headline' },
          { name: 'text', label: 'Text', type: 'textarea' },
          { name: 'image', label: 'Background Image URL', type: 'url' }
        ]
      }
    ]
  },
  {
    value: 'about',
    label: 'About',
    sections: [
      {
        key: 'about.hero',
        kind: 'scalar',
        title: 'Hero Image',
        fields: [{ name: 'image', label: 'Background Image URL', type: 'url' }]
      },
      {
        key: 'about.role',
        kind: 'scalar',
        title: 'Our Role',
        fields: [
          { name: 'title', label: 'Heading' },
          { name: 'text', label: 'Text', type: 'textarea' }
        ]
      },
      {
        key: 'about.mission',
        kind: 'scalar',
        title: 'Our Mission',
        fields: [
          { name: 'title', label: 'Heading' },
          { name: 'text', label: 'Text', type: 'textarea' }
        ]
      },
      {
        key: 'about.whatWeDo',
        kind: 'list',
        title: 'What We Do',
        itemLabel: 'Item',
        emptyItem: { label: '', text: '' },
        fields: [
          { name: 'label', label: 'Label' },
          { name: 'text', label: 'Text', type: 'textarea' }
        ]
      },
      {
        key: 'about.historyNote',
        kind: 'scalar',
        title: 'History Disclaimer',
        fields: [{ name: 'text', label: 'Text', type: 'textarea' }]
      },
      {
        key: 'about.committeeIntro',
        kind: 'scalar',
        title: 'Executive Committee — Heading',
        fields: [
          { name: 'eyebrow', label: 'Eyebrow' },
          { name: 'title', label: 'Headline' },
          { name: 'text', label: 'Text', type: 'textarea' },
          { name: 'notice', label: 'Notice Banner', type: 'textarea' }
        ]
      }
    ]
  },
  {
    value: 'membership',
    label: 'Membership',
    sections: [
      {
        key: 'membership.hero',
        kind: 'scalar',
        title: 'Hero Image',
        fields: [{ name: 'image', label: 'Background Image URL', type: 'url' }]
      },
      {
        key: 'membership.benefits',
        kind: 'list',
        title: 'Benefits',
        description:
          'Icon names: ShieldCheck, Leaf, Users, Award, Megaphone, GraduationCap, Handshake.',
        itemLabel: 'Benefit',
        emptyItem: { icon: 'ShieldCheck', title: '', text: '' },
        fields: [
          { name: 'icon', label: 'Icon Name' },
          { name: 'title', label: 'Title' },
          { name: 'text', label: 'Text', type: 'textarea' }
        ]
      },
      {
        key: 'membership.typesNote',
        kind: 'scalar',
        title: 'Membership Types — Note',
        fields: [{ name: 'text', label: 'Text', type: 'textarea' }]
      },
      {
        key: 'membership.types',
        kind: 'list',
        title: 'Membership Types',
        description: 'Enter benefit points one per line.',
        itemLabel: 'Type',
        emptyItem: { name: '', description: '', points: '' },
        fields: [
          { name: 'name', label: 'Name' },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'points', label: 'Points (one per line)', type: 'textarea' }
        ]
      },
      {
        key: 'membership.requirements',
        kind: 'list',
        title: 'Requirements',
        itemLabel: 'Requirement',
        emptyItem: { value: '' },
        fields: [{ name: 'value', label: 'Text' }]
      },
      {
        key: 'membership.steps',
        kind: 'list',
        title: 'Application Steps',
        itemLabel: 'Step',
        emptyItem: { title: '', text: '' },
        fields: [
          { name: 'title', label: 'Title' },
          { name: 'text', label: 'Text', type: 'textarea' }
        ]
      },
      {
        key: 'membership.faqs',
        kind: 'list',
        title: 'FAQs',
        itemLabel: 'Question',
        emptyItem: { q: '', a: '' },
        fields: [
          { name: 'q', label: 'Question' },
          { name: 'a', label: 'Answer', type: 'textarea' }
        ]
      }
    ]
  },
  {
    value: 'travel',
    label: 'Travel',
    sections: [
      {
        key: 'travel.hero',
        kind: 'scalar',
        title: 'Hero Image',
        fields: [{ name: 'image', label: 'Background Image URL', type: 'url' }]
      },
      {
        key: 'travel.planningFacts',
        kind: 'list',
        title: 'Visa, Fees & Entry Facts',
        itemLabel: 'Fact',
        emptyItem: { title: '', text: '' },
        fields: [
          { name: 'title', label: 'Title' },
          { name: 'text', label: 'Text', type: 'textarea' }
        ]
      },
      {
        key: 'travel.disclaimer',
        kind: 'scalar',
        title: 'Sourcing Disclaimer',
        fields: [{ name: 'text', label: 'Text', type: 'textarea' }]
      }
    ]
  },
  {
    value: 'contact',
    label: 'Contact',
    sections: [
      {
        key: 'contact.info',
        kind: 'scalar',
        title: 'Contact Details',
        fields: [
          { name: 'address', label: 'Address', type: 'textarea' },
          { name: 'phone', label: 'Phone' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'mapEmbedUrl', label: 'Map Embed URL', type: 'url' }
        ]
      }
    ]
  },
  {
    value: 'nav-footer',
    label: 'Nav & Footer',
    sections: [
      {
        key: 'nav.links',
        kind: 'list',
        title: 'Navigation Menu',
        itemLabel: 'Link',
        emptyItem: { label: '', href: '/' },
        fields: [
          { name: 'label', label: 'Label' },
          { name: 'href', label: 'Link' }
        ]
      },
      {
        key: 'footer.brand',
        kind: 'scalar',
        title: 'Footer — Brand',
        fields: [
          { name: 'name', label: 'Name' },
          { name: 'blurb', label: 'Blurb', type: 'textarea' }
        ]
      },
      {
        key: 'footer.social',
        kind: 'list',
        title: 'Social Media Links',
        itemLabel: 'Platform',
        emptyItem: { platform: '', url: '' },
        fields: [
          { name: 'platform', label: 'Platform (Facebook, Twitter / X, Instagram, YouTube)' },
          { name: 'url', label: 'URL', type: 'url' }
        ]
      },
      {
        key: 'footer.partners',
        kind: 'list',
        title: 'Footer Partner Links',
        itemLabel: 'Partner',
        emptyItem: { name: '', url: '' },
        fields: [
          { name: 'name', label: 'Name' },
          { name: 'url', label: 'URL', type: 'url' }
        ]
      },
      {
        key: 'footer.categories',
        kind: 'list',
        title: 'Footer Category Labels',
        itemLabel: 'Category',
        emptyItem: { value: '' },
        fields: [{ name: 'value', label: 'Text' }]
      }
    ]
  },
  {
    value: 'seo',
    label: 'SEO',
    sections: [
      {
        key: 'seo.default',
        kind: 'scalar',
        title: 'Default Site Metadata',
        description: 'Used site-wide unless a page sets its own title/description.',
        fields: [
          { name: 'title', label: 'Title' },
          { name: 'description', label: 'Description', type: 'textarea' }
        ]
      }
    ]
  }
];
