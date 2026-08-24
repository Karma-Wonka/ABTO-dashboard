'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

export default function MembersError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Alert variant='destructive'>
      <Icons.alertCircle className='h-4 w-4' />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className='flex flex-col gap-3'>
        <span>Failed to load this member: {error.message}</span>
        <Button variant='outline' size='sm' className='w-fit' onClick={reset}>
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  );
}
