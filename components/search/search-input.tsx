"use client";

import * as React from "react";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  loading?: boolean;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, loading, className, placeholder = "Search phones, brands...", ...props }, ref) => (
    <div className={cn("relative flex items-center", className)}>
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <input
        ref={ref}
        type="search"
        role="searchbox"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-10 w-full rounded-md border border-input bg-surface pl-9 pr-9 text-body",
          "placeholder:text-muted-foreground focus-visible:outline-none",
        )}
        {...props}
      />
      {loading ? (
        <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
      ) : value ? (
        <button
          type="button"
          onClick={() => { onChange(""); onClear?.(); }}
          aria-label="Clear search"
          className="absolute right-3 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  ),
);
SearchInput.displayName = "SearchInput";
