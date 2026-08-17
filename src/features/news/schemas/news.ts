import * as z from 'zod';

export const newsSchema = z.object({
  date: z.string().min(1, 'Date is required.'),
  category: z.string().min(1, 'Please select a category.'),
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  body: z.string().min(10, 'Body must be at least 10 characters.'),
  image_url: z.string()
});

export type NewsFormValues = {
  date: string;
  category: string;
  title: string;
  body: string;
  image_url: string;
};

export const NEWS_CATEGORY_OPTIONS = [
  'Policy',
  'Association',
  'Sustainability',
  'Aviation',
  'Markets',
  'Festivals'
].map((c) => ({ label: c, value: c }));
