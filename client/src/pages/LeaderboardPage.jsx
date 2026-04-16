import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { getIssues } from "../services/issueService";

const TrophyIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9C4.34315 9 3 7.65685 3 6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6C21 7.65685 19.6569 9 18 9M6 9V11C6 14.3137 8.68629 17 12 17C15.3137 17 18 14.3137 18 11V9M6 9H18M12 17V21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MedalIcon = ({ className, rank }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="2"/>
    <path d="M9 14L7 21L12 19L17 21L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="12" y="10" fontSize="4" fontWeight="bold" textAnchor="middle" fill="currentColor">{rank}</text>
  </svg>
);

function LeaderboardPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIssues()
      .then(setIssues)
      .finally(() => setLoading(false));
  }, []);

  const leaders = useMemo(() => {
    const map = new Map();
    issues.forEach((issue) => {
      const user = issue.reportedBy;
      if (!user?._id) return;
      const item = map.get(user._id) || { name: user.name, score: 0, issues: 0 };
      item.score += issue.voteCount || 0;
      item.issues += 1;
      map.set(user._id, item);
    });
    return Array.from(map.values()).sort((a, b) => b.score - a.score).slice(0, 20);
  }, [issues]);

  return (
    <AppShell secondaryNav={
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
        <span>Global Statistics</span>
        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-zinc-700"></span>
        <span className="text-indigo-500 dark:text-indigo-400">Live Coverage</span>
      </div>
    }>
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-12">
        {/* Modern Header */}
        <div className="relative text-center space-y-3">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 blur-[100px] rounded-full -z-10"></div>
          <h1 className="text-5xl font-black tracking-tight bg-gradient-to-b from-slate-900 to-slate-700 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            Top contributors
          </h1>
          <p className="max-w-md mx-auto text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
            The most impactful community members leading the way in issue resolution and civic engagement.
          </p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-400 animate-pulse uppercase tracking-widest">Synchronizing Leaderboard</p>
          </div>
        )}

        {/* Featured Top 3 Section */}
        {!loading && leaders.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-12">
            {/* 2nd Place - Silver */}
            <div className="order-2 md:order-1 relative group">
              <div className="absolute inset-0 bg-slate-400/10 dark:bg-slate-400/5 blur-2xl group-hover:bg-slate-400/20 transition-all rounded-3xl"></div>
              <div className="relative flex flex-col items-center p-8 rounded-[2rem] border border-slate-300/50 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl shadow-2xl transition-transform hover:-translate-y-1">
                <div className="absolute -top-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-200 to-slate-400 border border-slate-300 dark:border-white/20 shadow-lg text-white">
                  <MedalIcon className="w-6 h-6" rank={2} />
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-slate-200 via-slate-400 to-slate-300 p-1 mb-4 shadow-lg">
                  <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden font-black text-2xl text-slate-400 dark:text-slate-300">
                    {leaders[1].name.charAt(0)}
                  </div>
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white text-center line-clamp-1">{leaders[1].name}</h3>
                <div className="mt-4 flex items-center gap-4 text-center">
                  <div>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{leaders[1].score}</p>
                    <p className="text-[10px] uppercase tracking-tighter font-bold text-slate-400">Votes</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200 dark:bg-white/10"></div>
                  <div>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{leaders[1].issues}</p>
                    <p className="text-[10px] uppercase tracking-tighter font-bold text-slate-400">Issues</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 1st Place - Gold */}
            <div className="order-1 md:order-2 relative group md:-mt-8">
              <div className="absolute inset-0 bg-yellow-500/20 dark:bg-yellow-500/10 blur-3xl group-hover:bg-yellow-500/30 transition-all rounded-3xl"></div>
              <div className="relative flex flex-col items-center p-10 rounded-[2.5rem] border-2 border-yellow-400/30 dark:border-yellow-500/20 bg-white/80 dark:bg-white/[0.05] backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(251,191,36,0.2)] transition-transform hover:-translate-y-2 ring-1 ring-white/50 dark:ring-white/10">
                <div className="absolute -top-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 shadow-xl shadow-yellow-500/50 text-white">
                  <TrophyIcon className="w-8 h-8" />
                </div>
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-300 via-amber-500 to-yellow-600 p-1 mb-5 shadow-xl">
                  <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden font-black text-3xl text-amber-500">
                    {leaders[0].name.charAt(0)}
                  </div>
                </div>
                <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white text-center line-clamp-1">{leaders[0].name}</h3>
                <div className="mt-6 flex items-center gap-6 text-center">
                  <div>
                    <p className="text-3xl font-black text-amber-600 dark:text-yellow-500">{leaders[0].score}</p>
                    <p className="text-[10px] uppercase tracking-widest font-black text-amber-600/60 dark:text-yellow-500/60">Total Impact</p>
                  </div>
                </div>
                <div className="mt-6 px-4 py-1.5 rounded-full bg-yellow-100 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 text-xs font-black text-yellow-700 dark:text-yellow-500 uppercase tracking-widest">
                  Grand Champion
                </div>
              </div>
            </div>

            {/* 3rd Place - Bronze */}
            <div className="order-3 relative group">
              <div className="absolute inset-0 bg-orange-700/10 dark:bg-orange-900/5 blur-2xl group-hover:bg-orange-700/20 transition-all rounded-3xl"></div>
              <div className="relative flex flex-col items-center p-8 rounded-[2rem] border border-orange-200/50 dark:border-white/5 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl shadow-2xl transition-transform hover:-translate-y-1">
                <div className="absolute -top-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-orange-600 to-orange-800 border border-orange-500/30 dark:border-orange-500/20 shadow-lg text-white font-bold">
                  <MedalIcon className="w-6 h-6" rank={3} />
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-400 via-orange-600 to-orange-800 p-1 mb-4 shadow-lg">
                  <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden font-black text-2xl text-orange-600 dark:text-orange-500">
                    {leaders[2].name.charAt(0)}
                  </div>
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white text-center line-clamp-1">{leaders[2].name}</h3>
                <div className="mt-4 flex items-center gap-4 text-center">
                  <div>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{leaders[2].score}</p>
                    <p className="text-[10px] uppercase tracking-tighter font-bold text-slate-400">Votes</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200 dark:bg-white/10"></div>
                  <div>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{leaders[2].issues}</p>
                    <p className="text-[10px] uppercase tracking-tighter font-bold text-slate-400">Issues</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remaining List Redesign */}
        {!loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-8 py-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500">Rising Contributors</h4>
              <div className="flex gap-12 mr-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Strength</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Volume</span>
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] backdrop-blur-2xl shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-white/[0.02]">
              {leaders.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-medium">
                  Initializing impact metrics... check back shortly.
                </div>
              ) : (
                leaders.slice(leaders.length >= 3 ? 3 : 0).map((leader, i) => {
                  const rank = (leaders.length >= 3 ? 3 : 0) + i + 1;
                  return (
                    <div
                      key={`${leader.name}-${rank}`}
                      className="group flex items-center justify-between px-8 py-5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-6">
                        <span className="w-8 text-lg font-black text-slate-300 dark:text-zinc-600 group-hover:text-indigo-500 transition-colors">
                          {rank.toString().padStart(2, '0')}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-white/5 group-hover:scale-110 transition-transform">
                          {leader.name.charAt(0)}
                        </div>
                        <p className="font-extrabold text-slate-900 dark:text-zinc-100">{leader.name}</p>
                      </div>
                      <div className="flex items-center gap-12">
                        <div className="w-16 text-right">
                          <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{leader.score}</p>
                        </div>
                        <div className="w-16 text-right">
                          <p className="text-sm font-black text-slate-600 dark:text-zinc-400">{leader.issues}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default LeaderboardPage;
