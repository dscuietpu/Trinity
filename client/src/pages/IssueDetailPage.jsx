import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";
import { createComment, getIssueComments } from "../services/commentService";
import { getIssueById, upvoteIssue, deleteIssue, resolveIssue } from "../services/issueService";
import { getCurrentUser } from "../services/authService";

function IssueDetailPage() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const [issueData, commentData] = await Promise.all([getIssueById(id), getIssueComments(id)]);
      setIssue(issueData);
      setComments(commentData);
      try {
        const u = await getCurrentUser();
        setUser(u?.user || u);
      } catch (err) {
        // Not logged in or error
      }
    };
    load();
  }, [id]);

  const handleUpvote = async () => {
    try {
      const updated = await upvoteIssue(id);
      setIssue(updated);
      showToast("Upvoted successfully", "success");
    } catch (err) {
      showToast(err.message || "Failed to upvote", "error");
    }
  };

  const handleComment = async (replyTo = null) => {
    if (!commentText.trim()) return;
    setBusy(true);
    try {
      await createComment({ issueId: id, content: commentText, replyTo });
      setCommentText("");
      setComments(await getIssueComments(id));
      showToast("Comment posted", "success");
    } catch (err) {
      showToast(err.message || "Failed to post comment", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;
    try {
      await deleteIssue(id);
      showToast("Issue deleted successfully", "success");
      navigate("/");
    } catch (err) {
      showToast(err.message || "Failed to delete issue", "error");
    }
  };

  const handleResolve = async () => {
    if (!window.confirm("Mark this issue as resolved?")) return;
    setBusy(true);
    try {
      const updated = await resolveIssue(id);
      setIssue(updated);
      showToast("Issue marked as resolved!", "success");
    } catch (err) {
      showToast(err.message || "Failed to resolve issue", "error");
    } finally {
      setBusy(false);
    }
  };

  if (!issue) return <AppShell><p className="text-zinc-500 p-8">Loading issue...</p></AppShell>;

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto py-6">
        <div className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">{issue.title}</h2>
          <p className="mt-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            {issue.category} • {issue.status}
          </p>
          <p className="mt-4 text-base text-slate-700 dark:text-zinc-300 leading-relaxed">{issue.description}</p>
          {issue.video && (
            <div className="mt-5 flex w-full justify-center overflow-hidden rounded-2xl border border-slate-200/50 dark:border-white/5 bg-slate-100 dark:bg-black/80">
              <video className="max-h-[40rem] w-full object-cover" src={issue.video} autoPlay muted loop playsInline />
            </div>
          )}
          {!issue.video && issue.photo && (
            <div className="mt-5 flex w-full justify-center overflow-hidden rounded-2xl border border-slate-200/50 dark:border-white/5 bg-slate-100 dark:bg-black/80">
              <img className="max-h-[40rem] w-full object-cover" src={issue.photo} alt={issue.title} />
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-xl bg-slate-900 dark:bg-zinc-100 px-6 py-2.5 font-bold text-white dark:text-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all" onClick={handleUpvote}>
              Upvote ({issue.voteCount})
            </button>
            {(user?._id === issue.reportedBy?._id || user?.role === "admin") && (
              <button className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 px-6 py-2.5 font-bold text-red-600 dark:text-red-400 shadow-sm hover:bg-red-100 dark:hover:bg-red-900/40 hover:scale-[1.02] active:scale-95 transition-all" onClick={handleDelete} disabled={busy}>
                Delete Issue
              </button>
            )}
            {user?._id === issue.reportedBy?._id && issue.status !== "Resolved" && (
              <button className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-6 py-2.5 font-bold text-emerald-600 dark:text-emerald-400 shadow-sm hover:bg-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all" onClick={handleResolve} disabled={busy}>
                Mark as Resolved
              </button>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl p-8 shadow-2xl">
          <h3 className="mb-4 text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">Comments</h3>
          <div className="mb-6 flex gap-3">
            <input className="flex-1 rounded-xl border border-slate-300 dark:border-zinc-800 bg-white/50 dark:bg-black/50 px-4 py-3 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-zinc-100" placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
            <button className="rounded-xl bg-slate-900 dark:bg-zinc-100 px-6 py-3 font-bold text-white dark:text-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:hover:scale-100" onClick={() => handleComment()} disabled={busy}>Post</button>
          </div>
          <div className="space-y-4">
            {comments.length === 0 && (
              <p className="rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-white/5 p-6 text-center text-sm font-medium text-slate-500 dark:text-zinc-400">
                No comments yet.
              </p>
            )}
            {comments.map((comment) => (
              <div key={comment._id} className="rounded-2xl border border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-[#0a0a0a]/50 p-5 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-white/5">
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-1">{comment.author?.name || "User"}</p>
                <p className="text-base font-medium text-slate-700 dark:text-zinc-300 leading-relaxed">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default IssueDetailPage;
