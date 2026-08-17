'use client';

import { useAppForm } from '@/components/ui/tanstack-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateSiteContentMutation } from '../api/mutations';
import type { FieldSpec } from '../constants/sections';

// Generic editor for a site-content key whose value is a flat object of
// scalar fields (strings/numbers) — e.g. hero copy, contact details.
// Field names are data-driven (see constants/sections.ts), so field paths
// can't be statically narrowed to a DeepKeys union — hence the `as never`
// casts below. See docs/forms.md's "Dynamic array rows" recipe, which this
// mirrors for a flat (non-array) shape.
export function ScalarSectionForm({
  sectionKey,
  title,
  description,
  fields,
  initialValue
}: {
  sectionKey: string;
  title: string;
  description?: string;
  fields: FieldSpec[];
  initialValue: Record<string, unknown>;
}) {
  const updateMutation = useMutation({
    ...updateSiteContentMutation,
    onSuccess: () => toast.success(`${title} updated — live on the site within a minute`),
    onError: () => toast.error(`Failed to update ${title}`)
  });

  const defaults: Record<string, unknown> = {};
  for (const f of fields)
    defaults[f.name] = initialValue?.[f.name] ?? (f.type === 'number' ? 0 : '');

  const form = useAppForm({
    defaultValues: defaults,
    onSubmit: ({ value }) => updateMutation.mutate({ [sectionKey]: value })
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
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {fields.map((f) => (
                <form.AppField key={f.name} name={f.name as never}>
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
                              onChange={(e) => field.handleChange(e.target.value as never)}
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
            <div className='flex justify-end'>
              <form.SubmitButton>Save</form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
