import { useRef, useState } from "react";
import {
  Upload,
  CheckCircle2,
  X,
  FileText,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ACCEPTED_FILE_TYPES, MAX_FILE_BYTES, UploadedFile } from "./types";

type Props = {
  label: string;
  hint?: string;
  value: UploadedFile | null;
  onChange: (f: UploadedFile | null) => void;
  error?: string;
};

const formatBytes = (b: number) => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
};

export const FileUpload = ({ label, hint, value, onChange, error }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setLocalError(null);

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setLocalError("Only PDF, JPG or PNG allowed");
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setLocalError("File must be 10MB or smaller");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const uploaded: UploadedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: String(reader.result || ""),
      };

      // ✅ FIX: ensure consistent object shape always
      onChange(uploaded);
    };

    reader.onerror = () => setLocalError("Could not read file. Try again.");
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const isImage = value?.type?.startsWith("image/");
  const displayedError = error || localError;

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center gap-3 rounded-xl border-2 border-success/40 bg-success/5 p-4">
          {isImage ? (
            <Image
              src={value.dataUrl}
              alt={value.name}
              width={56}
              height={56}
              className="h-14 w-14 rounded-lg object-cover border border-border"
            />
          ) : (
            <div className="h-14 w-14 rounded-lg bg-primary/10 grid place-items-center text-primary">
              <FileText className="h-6 w-6" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              <span className="font-semibold text-sm truncate">
                {value.name}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {formatBytes(value.size)} · {value.type.split("/")[1].toUpperCase()}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="h-8 w-8 rounded-lg grid place-items-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-smooth"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border-2 border-dashed p-5 text-left transition-smooth",
            displayedError
              ? "border-destructive/50 bg-destructive/5"
              : dragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5"
          )}
        >
          <div className="h-11 w-11 rounded-xl grid place-items-center bg-primary/10 text-primary">
            <Upload className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <div className="font-semibold text-sm">{label}</div>
            <div className="text-xs text-muted-foreground">
              {hint || "PDF, JPG or PNG · max 10MB · drag & drop or click"}
            </div>
          </div>

          <ImageIcon className="h-4 w-4 text-muted-foreground/60" />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {displayedError && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          {displayedError}
        </div>
      )}
    </div>
  );
};
