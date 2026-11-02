'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function ListSearch({ value, onValueChange, placeholder = 'Search...' }: { value: string; onValueChange: (value: string) => void; placeholder?: string }) {
  return <div className="relative w-full sm:max-w-sm"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={placeholder} className="pl-9" placeholder={placeholder} value={value} onChange={(event) => onValueChange(event.target.value)} /></div>;
}
