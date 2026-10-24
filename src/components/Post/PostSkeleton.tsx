export default function PostSkeleton() {
  return (
    <div className="mx-auto my-3 w-full max-w-2xl animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="size-11 rounded-full bg-slate-200" />
        <div className="space-y-2">
          <div className="h-3 w-32 rounded bg-slate-200" />
          <div className="h-3 w-20 rounded bg-slate-200" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-slate-200" />
        <div className="h-3 w-2/3 rounded bg-slate-200" />
      </div>
      <div className="mt-4 h-40 rounded-lg bg-slate-200" />
    </div>
  );
}
