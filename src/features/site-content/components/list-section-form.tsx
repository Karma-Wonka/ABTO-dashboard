'use client';

import { useAppForm } from '@/components/ui/tanstack-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateSiteContentMutation } from '../api/mutations';
import type { FieldSpec } from '../constants/sections';

// Generic editor for a site-content key whose value is an array of item
// objects — e.g. stats, FAQs, nav links. Rows can be added, removed, and
// reordered is not needed (order = array order = display order, edited by
// re-adding in the desired sequence). See ScalarSectionForm for the
// non-array counterpart and the `as never` note on dynamic field paths.
export function ListSectionForm({
  sectionKey,
  title,
  description,
  fields,
  emptyItem,
  itemLabel,
  initialItems
}: {
  sectionKey: string;
  title: string;
  description?: string;
  fields: FieldSpec[];
  emptyItem: Record<string, unknown>;
  itemLabel: string;
  initialItems: Record<string, unknown>[];
}) {
  const updateMutation = useMutation({
    ...updateSiteContentMutation,
    onSuccess: () => toast.success(`${title} updated — live on the site within a minute`),
    onError: () => toast.error(`Failed to update ${title}`)
  });

  const form = useAppForm({
    defaultValues: { items: initialItems.length > 0 ? initialItems : [] } as {
      items: Record<string, unknown>[];
    },
    onSubmit: ({ value }) => updateMutation.mutate({ [sectionKey]: value.items })
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form.Form className='space-y-4'>
            <form.AppField name='items' mode='array'>
              {(arrayField) => (
                <div className='space-y-4'>
                  {arrayField.state.value.map((_, i) => (
                    <div key={i} className='space-y-3 rounded-lg border p-4'>
                      <div className='flex items-center justify-between'>
                        <p className='text-muted-foreground text-xs font-medium'>
                          {itemLabel} {i + 1}
                        </p>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => arrayField.removeValue(i)}
                        >
                          <Icons.trash className='h-4 w-4' />
                        </Button>
                      </div>
                      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                        {fields.map((f) => (
                          <form.AppField key={f.name} name={`items[${i}].${f.name}` as never}>
                            {(field) =>
                              f.type === 'url' ? (
                                <div className='md:col-span-2'>
                                  <field.ImageUrlField label={f.label} />
                                </div>
                              ) : (
                                <field.FieldSet
                                  className={f.type === 'textarea' ? 'md:col-span-2' : undefined}
                                >
                                  <field.Field>
                                    <field.FieldLabel>{f.label}</field.FieldLabel>
                                    {f.type === 'textarea' ? (
                                      <Textarea
                                        value={(field.state.value as string) ?? ''}
                                        onChange={(e) =>
                                          field.handleChange(e.target.value as never)
                                        }
                                        onBlur={field.handleBlur}
                                        rows={3}
                                      />
                                    ) : (
                                      <Input
                                        type={
                                          f.type === 'number'
                                            ? 'number'
                                            : f.type === 'email'
                                              ? 'email'
                                              : 'text'
                                        }
                                        value={(field.state.value as string | number) ?? ''}
                                        onChange={(e) =>
                                          field.handleChange(
                                            (f.type === 'number'
                                              ? e.target.valueAsNumber || 0
                                              : e.target.value) as never
                                          )
                                        }
                                        onBlur={field.handleBlur}
                                      />
                                    )}
                                  </field.Field>
                                </field.FieldSet>
                              )
                            }
                          </form.AppField>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => arrayField.pushValue(emptyItem)}
                  >
                    <Icons.add className='mr-2 h-4 w-4' /> Add {itemLabel}
                  </Button>
                </div>
              )}
            </form.AppField>
            <div className='flex justify-end'>
              <form.SubmitButton>Save</form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
