import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import SkeletonCard from "../components/SkeletonCard";
import { useToast } from "../components/ToastProvider";
import { getIssues } from "../services/issueService";

const PAGE_SIZE = 8;

function HomeFeedPage() {
  const [issues, setIssues] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loaderRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getIssues();
        setIssues(data);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load feed");
        showToast(err.message || "Failed to load feed", "error");
      } finally {
        setLoading(false);
      }
    };
    load();

    const interval = setInterval(async () => {
      try {
        const latest = await getIssues();
        setIssues(latest);
      } catch {
        // Silent poll failure; next poll retries.
      }
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, issues.length));
        }
      },
      { threshold: 0.2 },
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [issues.length]);

  const visibleIssues = useMemo(() => issues.slice(0, visibleCount), [issues, visibleCount]);

  const trendingIssues = useMemo(() =>
    [...issues].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0)).slice(0, 5),
    [issues]
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl flex justify-between gap-16 pl-24 pr-4">
        {/* ── Main Feed Column ── */}
        <div className="w-full max-w-2xl space-y-6">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent drop-shadow-sm mb-6">Campus Issue Feed</h2>
          {loading && (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}
          {!loading && error && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/50 backdrop-blur-sm p-4 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}
          {!loading && !error && issues.length === 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md p-6 text-sm text-slate-600 dark:text-zinc-400 text-center shadow-sm">
              No issues yet. Be the first to report one.
            </div>
          )}
          {visibleIssues.map((issue) => (
            <Link
              key={issue._id}
              to={`/issues/${issue._id}`}
              className="block rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{issue.title}</p>
                <span className="rounded-full bg-slate-900 dark:bg-zinc-100 px-3 py-1 text-xs font-semibold text-white dark:text-black shadow-sm">
                  {issue.voteCount} votes
                </span>
              </div>
              <p className="mt-1.5 text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{issue.category}</p>
              <p className="mt-3 text-sm text-slate-700 dark:text-zinc-300 line-clamp-2 leading-relaxed">{issue.description}</p>
              {issue.video && (
                <div className="mt-4 flex w-full justify-center overflow-hidden rounded-2xl border border-slate-200/50 dark:border-white/5 bg-slate-100 dark:bg-black/80">
                  <video
                    className="max-h-[32rem] w-full object-cover"
                    src={issue.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                </div>
              )}
              {!issue.video && issue.photo && (
                <div className="mt-4 flex w-full justify-center overflow-hidden rounded-2xl border border-slate-200/50 dark:border-white/5 bg-slate-100 dark:bg-black/80">
                  <img className="max-h-[32rem] w-full object-cover" src={issue.photo} alt={issue.title} />
                </div>
              )}
            </Link>
          ))}
          <div ref={loaderRef} className="py-6 text-center text-sm font-medium text-slate-500 dark:text-zinc-400">
            {visibleCount >= issues.length ? "End of feed" : "Loading more..."}
          </div>
        </div>

        {/* ── Trending Sidebar ── */}
        <aside className="hidden lg:block w-96 shrink-0">
          <div className="sticky top-20">
            <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200/60 dark:border-white/5">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">🔥 Trending Issues</h3>
                <p className="mt-1 text-xs text-slate-400 dark:text-zinc-600 font-medium">Most upvoted right now</p>
              </div>
              {trendingIssues.length === 0 && (
                <div className="px-6 py-8 text-sm text-slate-500 dark:text-zinc-500 text-center">No trending issues yet.</div>
              )}
              {trendingIssues.map((issue) => (
                <Link
                  key={issue._id}
                  to={`/issues/${issue._id}`}
                  className="block px-6 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100/80 dark:border-white/5 last:border-b-0 group"
                >
                  <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-600 uppercase tracking-widest">{issue.category}</p>
                  <p className="mt-1 text-[15px] font-bold text-slate-900 dark:text-zinc-100 leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{issue.title}</p>
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-500 font-medium">{issue.voteCount} votes</p>
                </Link>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl p-5 shadow-sm">
              <p className="text-xs text-slate-400 dark:text-zinc-600 leading-relaxed">
                Issues with 50+ votes auto-create communities. <Link to="/communities" className="text-indigo-500 hover:underline font-semibold">View communities →</Link>
              </p>
            </div>
          </div>
        </aside>
      </div>

      <Link
        to="/report"
        className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-500 text-3xl font-light text-white shadow-lg shadow-indigo-600/30 hover:scale-110 active:scale-95 transition-all duration-300"
      >
        +
      </Link>
    </AppShell>
  );
}

export default HomeFeedPage;
