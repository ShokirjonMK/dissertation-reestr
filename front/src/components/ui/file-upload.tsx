/**
 * FileUpload — Drag & Drop fayl yuklash komponenti
 *
 * Qabul qilinadigan formatlar: PDF, DOCX, TXT
 * Xususiyatlar:
 * - Drag & Drop
 * - Klik bilan tanlash
 * - Fayl nomi va hajmini ko'rsatish
 * - O'chirish tugmasi
 * - Yuklash progress
 */
"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

type FileUploadProps = {
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  disabled?: boolean;
  className?: string;
};

const ACCEPTED_TYPES: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/msword": "DOC",
  "text/plain": "TXT",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  value,
  onChange,
  accept = ".pdf,.docx,.doc,.txt",
  maxSizeMB = 50,
  label,
  disabled = false,
  className,
}: FileUploadProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (file: File): string | null => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Fayl hajmi ${maxSizeMB} MB dan oshmasligi kerak`;
    }
    if (!Object.keys(ACCEPTED_TYPES).includes(file.type) && !file.name.match(/\.(pdf|docx|doc|txt)$/i)) {
      return `Qabul qilinadigan formatlar: PDF, DOCX, TXT`;
    }
    return null;
  };

  const handleFile = (file: File) => {
    const err = validate(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onChange(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toUpperCase();
    return ext;
  };

  if (value) {
    return (
      <div className={cn("rounded-lg border border-border/60 bg-muted/30 px-4 py-3", className)}>
        {label && <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{value.name}</p>
            <p className="text-xs text-muted-foreground">
              {getFileIcon(value.name)} · {formatBytes(value.size)}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            {!disabled && (
              <button
                type="button"
                onClick={() => { onChange(null); setError(null); }}
                className="rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {label && <p className="text-xs font-medium text-muted-foreground">{label}</p>}
      <div
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 px-6 py-8 text-center transition-colors",
          dragging && "border-primary/60 bg-primary/5",
          !disabled && "hover:border-primary/40 hover:bg-muted/30",
          disabled && "cursor-not-allowed opacity-50",
          error && "border-destructive/60"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <Upload className={cn("h-8 w-8 text-muted-foreground", dragging && "text-primary")} />
        <div>
          <p className="text-sm text-muted-foreground">{t("upload.dragDrop")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground/70">{t("upload.acceptedFormats")}</p>
          <p className="text-xs text-muted-foreground/70">{t("upload.maxSize")}</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={handleInputChange}
          disabled={disabled}
        />
      </div>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}
    </div>
  );
}
