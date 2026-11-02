'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function ProfileImageUpload({ value, name, onChange, disabled = false }: {
  value?: string;
  name: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const initials = name.trim().split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() || '?';

  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch('/api/profile-image', { method: 'POST', body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to upload image');
      onChange(result.url);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to upload image');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return <div className="flex items-center gap-4 rounded-xl border bg-muted/20 p-4">
    <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
      {value && <AvatarImage src={value} alt={`${name}'s profile`} />}
      <AvatarFallback className="bg-primary/10 font-semibold text-primary">{initials}</AvatarFallback>
    </Avatar>
    <div className="min-w-0 space-y-1">
      <p className="font-medium">Profile photo <span className="font-normal text-muted-foreground">(optional)</span></p>
      <p className="text-xs text-muted-foreground">A clear square image works best. JPG, PNG or WebP, up to 5 MB.</p>
      <div className="flex flex-wrap gap-2 pt-1">
        <input ref={inputRef} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" disabled={disabled || uploading} onChange={event => upload(event.target.files?.[0])} />
        <Button type="button" variant="outline" size="sm" disabled={disabled || uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-1 h-4 w-4" />}
          {uploading ? 'Uploading…' : value ? 'Replace photo' : 'Upload photo'}
        </Button>
        {value && <Button type="button" variant="ghost" size="sm" disabled={disabled || uploading} onClick={() => onChange('')}><X className="mr-1 h-4 w-4" />Remove</Button>}
      </div>
    </div>
  </div>;
}
