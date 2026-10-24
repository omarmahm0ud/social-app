import { useEffect, useRef, useState } from "react";
import { Bookmark, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface OptionsMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleSave?: () => void;
  saved?: boolean;
}

export default function OptionsMenu({
  onEdit,
  onDelete,
  onToggleSave,
  saved = false,
}: OptionsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!onEdit && !onDelete && !onToggleSave) return null;

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        aria-label="More options"
        onClick={() => setOpen((value) => !value)}
        className="flex size-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
      >
        <MoreHorizontal size={21} />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {onToggleSave && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onToggleSave();
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
              {saved ? "Unsave post" : "Save post"}
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Pencil size={16} />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
