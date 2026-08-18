import 'server-only';
import { S3Client } from '@aws-sdk/client-s3';

declare global {
  // eslint-disable-next-line no-var
  var __r2Client: S3Client | undefined;
}

// Cloudflare R2 — same private bucket the public site (../web, lib/r2.ts)
// uploads membership application documents into, under `membership/`. This
// app also writes the signed Festival Calendar PDF here, under
// `Festival Calender/` (src/app/api/festivals/pdf/route.ts). The bucket
// stays private either way — every read (src/app/api/uploads/sign,
// festivals/pdf's viewUrl, and ../web's own festival-calendar route) goes
// through a short-lived presigned GET rather than a public object URL.
export function getR2Client() {
  if (!global.__r2Client) {
    global.__r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? ''
      }
    });
  }
  return global.__r2Client;
}

export const R2_BUCKET = process.env.R2_BUCKET_NAME ?? '';
