"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

type BrandDropdownOption = {
  value: string;
  label: string;
  flagCode?: string;
  flagImageUrl?: string;
};

function OptionLabel({ option }: { option: BrandDropdownOption }) {
  return <span className="flex min-w-0 items-center gap-2">
    {option.flagCode && (option.flagImageUrl
      ? <span
          aria-hidden="true"
          className="relative inline-flex h-[15px] w-5 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-muted text-[8px] font-bold uppercase leading-none text-muted-foreground"
        >
          <span>{option.flagCode}</span>
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            data-country-flag={option.flagCode.toUpperCase()}
            height={15}
            loading="lazy"
            onError={event => { event.currentTarget.style.display = 'none'; }}
            src={option.flagImageUrl}
            width={20}
          />
        </span>
      : <span
          aria-hidden="true"
          className="react-tel-input shrink-0"
          style={{ display: 'inline-block', height: 11, width: 16 }}
        >
          <span
            className={`flag ${option.flagCode}`}
            data-country-flag={option.flagCode.toUpperCase()}
            style={{ display: 'block' }}
          />
        </span>
    )}
    <span className="truncate">{option.label}</span>
  </span>;
}

export function BrandDropdown({ id, label, value, onChange, options, disabled = false }: {
  id?: string; label: string; value: string; onChange: (value: string) => void;
  options: BrandDropdownOption[]; disabled?: boolean;
}) {
  const selected = options.find(option => option.value === value);

  return <Select value={value} onValueChange={onChange} disabled={disabled}>
    <SelectTrigger id={id} aria-label={label} className="h-11 cursor-pointer rounded-xl border-input bg-background px-3 text-foreground shadow-sm transition-colors hover:border-primary/60 hover:bg-accent/20 focus:border-primary focus:ring-primary/30 data-[state=open]:border-primary data-[state=open]:bg-accent/20 data-[state=open]:ring-2 data-[state=open]:ring-primary/20 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:bg-muted">
      <SelectValue placeholder={label}>{selected ? <OptionLabel option={selected} /> : undefined}</SelectValue>
    </SelectTrigger>
    <SelectContent className="max-h-72 rounded-xl border-secondary/20 p-1 shadow-xl">
      {options.map(option => <SelectItem key={option.value} value={option.value} className="my-0.5 min-h-10 cursor-pointer rounded-lg focus:bg-secondary/10 focus:text-secondary data-[state=checked]:bg-primary/15 data-[state=checked]:font-semibold"><OptionLabel option={option} /></SelectItem>)}
    </SelectContent>
  </Select>;
}
