import { submissionsStore } from '@/constants/abto-data';
import { isRateLimited } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';

// Public and unauthenticated on purpose — this is the equivalent of a
// public contact form / membership application form. Guarded by a
// honeypot field and a best-effort per-IP rate limit (see
// src/lib/rate-limit.ts) rather than auth, since real visitors are never
// signed in when they submit these.
const submissionSchema = z.object({
  kind: z.enum(['contact', 'membership']),
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Enter a valid email.'),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
  // Hidden field real users never fill in; bots that autofill every
  // field trip it. Non-empty => silently drop without storing.
  honeypot: z.string().optional()
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, message: 'Too many submissions. Please try again later.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid submission' },
      { status: 400 }
    );
  }

  if (parsed.data.honeypot) {
    return NextResponse.json({ success: true }, { status: 201 });
  }

  const { kind, name, email, phone, company, message, payload } = parsed.data;
  await submissionsStore.create({
    kind,
    name,
    email,
    phone: phone || null,
    company: company || null,
    message: message || null,
    payload: payload ?? {}
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
