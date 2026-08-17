import { membersStore, type Member } from '@/constants/abto-data';
import { NextRequest, NextResponse } from 'next/server';

// Public and unauthenticated on purpose — see src/app/api/public/news/route.ts.
//
// Unlike the internal /api/members route (which returns full rows to
// signed-in members/admins), this only exposes what a public trade
// directory should show. `email`, `phone`, and `status` are intentionally
// omitted, and pending (not-yet-approved) members are filtered out.
function toPublicMember(member: Member) {
  return {
    id: member.id,
    name: member.name,
    region: member.region,
    specialties: member.specialties,
    languages: member.languages,
    website: member.website,
    member_since: member.member_since
  };
}

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search') ?? undefined;
  const members = await membersStore.getAll({ search });
  const publicMembers = members.filter((m) => m.status === 'active').map(toPublicMember);
  return NextResponse.json(
    { success: true, members: publicMembers },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    }
  );
}
