import * as z from 'zod';

export const documentSchema = z.object({
  kind: z.string().min(1, 'Please select a kind.'),
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  category: z.string(),
  doc_type: z.string().min(1, 'Please select a document type.'),
  size: z.string(),
  year: z.string(),
  description: z.string(),
  image_key: z.string(),
  file_key: z.string()
});

export type DocumentFormValues = {
  kind: string;
  title: string;
  category: string;
  doc_type: string;
  size: string;
  year: string;
  description: string;
  image_key: string;
  file_key: string;
};

export const KIND_OPTIONS = [
  { label: 'Download (form, template, asset)', value: 'download' },
  { label: 'Publication (report, handbook)', value: 'publication' }
];

export const DOC_TYPE_OPTIONS = [
  'PDF',
  'DOCX',
  'ZIP',
  'Annual',
  'Handbook',
  'Reference',
  'Newsletter'
].map((t) => ({
  label: t,
  value: t
}));

export const DOWNLOAD_CATEGORY_OPTIONS = ['Membership', 'Governance', 'Templates', 'Media'].map(
  (c) => ({
    label: c,
    value: c
  })
);
