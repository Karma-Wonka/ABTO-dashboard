'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import type { Document } from '../api/types';
import DocumentForm from './document-form';
import { documentByIdOptions } from '../api/queries';
import { useRole } from '@/hooks/use-role';
import { Card, CardContent } from '@/components/ui/card';

export default function DocumentViewPage({ documentId }: { documentId: string }) {
  const { can, isLoading } = useRole();
  if (isLoading) return null;
  if (!can('documents:write')) {
    return (
      <Card className='mx-auto w-full max-w-lg'>
        <CardContent className='py-10 text-center'>
          <p className='text-lg font-medium'>Not authorized</p>
          <p className='text-muted-foreground mt-1 text-sm'>
            Only the secretariat can manage documents.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (documentId === 'new') {
    return <DocumentForm initialData={null} pageTitle='Add Document' />;
  }
  return <EditDocumentView documentId={Number(documentId)} />;
}

function EditDocumentView({ documentId }: { documentId: number }) {
  const { data } = useSuspenseQuery(documentByIdOptions(documentId));
  if (!data?.success || !data?.document) notFound();
  return <DocumentForm initialData={data.document as Document} pageTitle='Edit Document' />;
}
