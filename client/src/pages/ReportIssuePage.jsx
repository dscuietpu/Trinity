import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";
import { createIssue } from "../services/issueService";

function ReportIssuePage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Other",
    building: "",
    zone: "",
    isAnonymous: false,
  });
  const [photo, setPhoto] = useState(null);
  const [video, setVideo] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const issue = await createIssue({ ...form, photo, video });
      setMessage("Issue reported successfully");
      showToast("Issue reported successfully", "success");
      setTimeout(() => navigate(`/issues/${issue._id}`), 600);
    } catch (error) {
      setMessage(error.message || "Failed to report issue");
      showToast(error.message || "Failed to report issue", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 pb-12">
        <div className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl p-8 shadow-2xl transition-all duration-500">
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-zinc-100">Report an Issue</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-500 font-medium">Have something to report? Let us know and the community will take care of it.</p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500 ml-1">Title</label>
              <input 
                className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 px-5 py-4 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600" 
                placeholder="What's the issue?" 
                value={form.title} 
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} 
                required 
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500 ml-1">Description</label>
              <textarea 
                className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 px-5 py-4 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600" 
                placeholder="Tell us more about what's happening..." 
                rows={4} 
                value={form.description} 
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} 
                required 
              />
            </div>

            {/* Category & Location */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500 ml-1">Category</label>
                <select 
                  className="w-full appearance-none rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 px-5 py-4 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 dark:text-zinc-100 cursor-pointer"
                  value={form.category} 
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                >
                  {["WiFi", "Canteen", "Parking", "Library", "Hostel", "Sanitation", "Safety", "Other"].map((c) => (
                    <option key={c} value={c} className="bg-white dark:bg-zinc-900">{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500 ml-1">Building</label>
                <input 
                  className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 px-5 py-4 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-sm font-medium placeholder-slate-400 dark:placeholder-zinc-600 text-slate-900 dark:text-zinc-100" 
                  placeholder="Which building?" 
                  value={form.building} 
                  onChange={(e) => setForm((p) => ({ ...p, building: e.target.value }))} 
                />
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500 ml-1">Evidence (Photo)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)} 
                  />
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-white/30 dark:bg-white/[0.02] p-4 text-center transition-all group-hover:border-indigo-500/50 group-hover:bg-indigo-500/[0.02]">
                    <span className="text-xs font-bold text-slate-400 dark:text-zinc-600 truncate block">
                      {photo ? photo.name : "📷 Upload Photo"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500 ml-1">Video Clip</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="video/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => setVideo(e.target.files?.[0] || null)} 
                  />
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-white/30 dark:bg-white/[0.02] p-4 text-center transition-all group-hover:border-indigo-500/50 group-hover:bg-indigo-500/[0.02]">
                    <span className="text-xs font-bold text-slate-400 dark:text-zinc-600 truncate block">
                      {video ? video.name : "🎥 Upload Video"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">Post Anonymously</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-500 font-medium tracking-wide leading-none">Your identity will be hidden from the feed.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={form.isAnonymous} 
                  onChange={(e) => setForm((p) => ({ ...p, isAnonymous: e.target.checked }))} 
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>

            {/* Submit */}
            <button 
              className="w-full rounded-2xl bg-slate-900 dark:bg-zinc-100 py-4 font-black text-white dark:text-black shadow-xl shadow-slate-900/10 dark:shadow-zinc-100/5 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100" 
              type="submit" 
              disabled={submitting}
            >
              {submitting ? "PROCESSSING..." : "SUBMIT REPORT"}
            </button>
          </form>
          {message && <p className="mt-4 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{message}</p>}
        </div>
      </div>
    </AppShell>
  );
}

export default ReportIssuePage;
