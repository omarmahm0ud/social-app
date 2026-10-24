import type { ComponentType, InputHTMLAttributes } from "react";
import type { LucideProps } from "lucide-react";
import { Input } from "@heroui/react";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ComponentType<LucideProps>;
}

export default function AuthField({ icon: Icon, className, ...props }: AuthFieldProps) {
  return (
    <div className="relative">
      <Icon
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <Input
        {...props}
        className={`h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 text-base ${className ?? ""}`}
      />
    </div>
  );
}
