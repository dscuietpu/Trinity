import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import SkeletonCard from "../components/SkeletonCard";
import { getCurrentUser } from "../services/authService";
import { getMyRewards } from "../services/rewardService";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const me = await getCurrentUser();
      setUser(me?.user || null);
      setRewards(await getMyRewards());
      setLoading(false);
    };
    load();
  }, []);

  return (
    <AppShell>
      <div className="grid gap-4 lg:grid-cols-3">
        {loading && (
          <>
            <SkeletonCard />
            <div className="lg:col-span-2">
              <SkeletonCard />
            </div>
          </>
        )}
        <div className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl p-8 shadow-2xl lg:col-span-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md text-2xl font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{user?.name}</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">{user?.email}</p>
            </div>
          </div>
          <p className="mt-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider inline-block">{user?.role}</p>
        </div>
        <div className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl p-8 shadow-2xl lg:col-span-2">
          <h3 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent drop-shadow-sm mb-4">Rewards & Badges</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {!loading && rewards.length === 0 && (
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">No rewards earned yet.</p>
            )}
            {rewards.map((reward) => (
              <div key={reward._id} className="relative overflow-hidden rounded-2xl border border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 p-5 hover:shadow-md transition-all">
                <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-indigo-500/10 blur-xl pointer-events-none"></div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">{reward.type}</p>
                <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">{reward.reason || "No reason added"}</p>
                <p className="mt-3 inline-block rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 font-bold text-emerald-700 dark:text-emerald-400 text-xs tracking-wider">+{reward.pointsAwarded} points</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default ProfilePage;
