function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="h-5 w-2/3 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-1/4 rounded bg-slate-200" />
      <div className="mt-3 h-4 w-full rounded bg-slate-200" />
      <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
      <div className="mt-4 h-40 rounded bg-slate-200" />
    </div>
  );
}

export default SkeletonCard;
