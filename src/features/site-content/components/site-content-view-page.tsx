'use client';

import { useRole } from '@/hooks/use-role';
import { Card, CardContent } from '@/components/ui/card';
import SiteContentForm from './site-content-form';

export default function SiteContentViewPage() {
  const { isAdmin, isLoading } = useRole();
  if (isLoading) return null;
  if (!isAdmin) {
    return (
      <Card className='mx-auto w-full max-w-lg'>
        <CardContent className='py-10 text-center'>
          <p className='text-lg font-medium'>Not authorized</p>
          <p className='text-muted-foreground mt-1 text-sm'>
            Only the secretariat can edit the public site content.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <SiteContentForm />;
}
