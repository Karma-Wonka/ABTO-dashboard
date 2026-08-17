import 'server-only';
import { S3Client } from '@aws-sdk/client-s3';

declare global {
  // eslint-disable-next-line no-var
  var __r2Client: S3Client | undefined;
}

// Cloudflare R2 — same bucket the public site (../web, lib/r2.ts) uploads
// membership application documents into. This app only ever reads from it
// (src/app/api/uploads/sign/route.ts issues short-lived presigned GET URLs
// for the dashboard's Submissions viewer); it never writes.
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
