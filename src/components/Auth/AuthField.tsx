import type { ComponentPropsWithRef, ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { Input } from "@heroui/react";

interface AuthFieldProps extends ComponentPropsWithRef<"input"> {
  icon: ComponentType<LucideProps>;
  error?: string;
}

function AuthField({ icon: Icon, error, ...props }: AuthFieldProps) {
  return (
    <div>
      <div className="relative">
        <Icon
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <Input
          {...props}
          className={`h-14 w-full rounded-2xl border bg-slate-50 pl-12 text-base ${
            error ? "border-red-400" : "border-slate-200"
          }`}
        />
      </div>
      {error && <p className="mt-1.5 px-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default AuthField;
