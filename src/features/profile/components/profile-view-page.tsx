import { auth } from '@/lib/auth';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfileForms } from './profile-forms';

export default async function ProfileViewPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <PageContainer pageTitle='Profile' pageDescription='Manage your account.'>
      <div className='flex w-full max-w-lg flex-col gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>{user?.name || user?.email}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-2 text-sm'>
              <span className='text-muted-foreground'>Role</span>
              {user?.role ? (
                <Badge
                  variant={user.role === 'admin' ? 'default' : 'secondary'}
                  className='capitalize'
                >
                  {user.role}
                </Badge>
              ) : (
                <span className='text-muted-foreground'>—</span>
              )}
            </div>
          </CardContent>
        </Card>

        <ProfileForms initialName={user?.name ?? ''} />
      </div>
    </PageContainer>
  );
}
