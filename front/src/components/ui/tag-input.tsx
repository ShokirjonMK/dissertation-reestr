/**
 * TagInput — Kalit so'zlar uchun tag kiritish komponenti
 *
 * Xususiyatlar:
 * - Enter yoki vergul bilan yangi tag qo'shish
 * - X bilan tag o'chirish
 * - Autocomplete (suggestions ro'yxatidan)
 * - Duplikat tag qo'shilmaydi
 *
 * Foydalanish:
 *   <TagInput
 *     value={keywords}
 *     onChange={setKeywords}
 *     placeholder="Kalit so'z qo'shing..."
 *     suggestions={["blockchain", "fuqarolik", "mediatsiya"]}
 *   />
 */
"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  disabled?: boolean;
  className?: string;
  maxTags?: number;
};

export function TagInput({
  value,
  onChange,
  placeholder = "Kalit so'z kiriting...",
  suggestions = [],
  disabled = false,
  className,
  maxTags = 20,
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions.filter(
    (s) =>
      input.trim().length > 0 &&
      s.toLowerCase().includes(input.toLowerCase()) &&
      !value.includes(s)
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed || value.includes(trimmed) || value.length >= maxTags) return;
    onChange([...value, trimmed]);
    setInput("");
    setShowSuggestions(false);
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex min-h-10 flex-wrap gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Mavjud taglar */}
        {value.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeTag(idx); }}
                className="rounded-full hover:bg-primary/20 p-0.5 transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            )}
          </span>
        ))}

        {/* Kiritish maydoni */}
        {!disabled && value.length < maxTags && (
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              const v = e.target.value;
              // Vergul bilan qo'shish
              if (v.endsWith(",")) {
                addTag(v.slice(0, -1));
                return;
              }
              setInput(v);
              setShowSuggestions(v.trim().length > 0);
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={value.length === 0 ? placeholder : ""}
            className="min-w-24 flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-sm"
          />
        )}
      </div>

      {/* Autocomplete */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
          {filteredSuggestions.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
              className="flex w-full items-center px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Yordam matni */}
      <p className="mt-1 text-xs text-muted-foreground">
        Enter yoki vergul bilan tag qo&apos;shing. Jami: {value.length}/{maxTags}
      </p>
    </div>
  );
}
