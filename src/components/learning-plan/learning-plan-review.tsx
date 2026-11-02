'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LearningRequestForm } from '@/components/learning-request-form';
import type { ParentOnboarding } from '@/lib/parent-onboarding';

export function LearningPlanReview({ initial, independent, name, canEdit }: { initial: ParentOnboarding; independent: boolean; name: string; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  if (!canEdit) return null;
  const singular = independent ? 'learner' : 'child';
  const plural = independent ? 'learning details' : 'children';
  return <section className="rounded-2xl border bg-card p-5 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-bold">Update your {plural}</h2><p className="mt-1 text-sm text-muted-foreground">Check {independent ? 'your learning details' : "each child's details"} or add another {singular} before choosing teachers.</p></div><Button type="button" variant="outline" onClick={() => setEditing(value => !value)}>{editing ? 'Close editor' : <><Pencil className="mr-2 h-4 w-4" />{independent ? 'Edit learning details' : 'Edit or add children'}</>}</Button></div>{editing && <div className="mt-5 border-t pt-5"><LearningRequestForm initial={initial} independent={independent} name={name} /></div>}</section>;
}
