import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";
import { getCommunities, joinCommunity } from "../services/communityService";

function CommunitiesPage() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    getCommunities()
      .then(setCommunities)
      .catch((err) => showToast(err.message || "Failed to load communities", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = async (id) => {
    try {
      await joinCommunity(id, false);
      showToast("Joined community", "success");
      setCommunities(await getCommunities());
    } catch (err) {
      showToast(err.message || "Failed to join community", "error");
    }
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent drop-shadow-sm mb-6">Communities</h2>
        {loading && <p className="text-sm text-slate-600">Loading communities...</p>}
        {!loading && communities.length === 0 && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md p-6 text-sm text-slate-600 dark:text-zinc-400 text-center shadow-sm">
            No communities yet. Communities auto-create at 50 upvotes.
          </div>
        )}
        {communities.map((community) => (
          <div key={community._id} className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{community.name}</p>
                <p className="text-sm font-medium text-slate-600 dark:text-zinc-400 mt-1">
                  {community.memberCount} members • {community.sourceIssue?.status}
                </p>
              </div>
              <div className="flex gap-3">
                <button className="rounded-lg border border-slate-300 dark:border-zinc-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => handleJoin(community._id)}>Join</button>
                <Link className="rounded-lg bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors" to={`/communities/${community._id}/chat`}>Open Chat</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

export default CommunitiesPage;
