import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { getPublicDashboard } from "../services/dashboardService";
import AppShell from "../components/AppShell";

const COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#14b8a6"];

const StatCard = ({ title, value, hint }) => (
  <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">{title}</p>
    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">{value}</p>
    <p className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{hint}</p>
  </div>
);

function PublicDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const payload = await getPublicDashboard();
        setData(payload);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const mapCenter = useMemo(() => {
    const points = data?.map?.points || [];
    if (!points.length) return [28.6139, 77.209];
    const lat = points.reduce((sum, p) => sum + (p.location?.coords?.lat || 0), 0) / points.length;
    const lng = points.reduce((sum, p) => sum + (p.location?.coords?.lng || 0), 0) / points.length;
    return [lat, lng];
  }, [data]);

  if (loading) {
    return <div className="p-8 text-slate-600">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  const summary = data?.summary || { weekly: {}, monthly: {} };
  const charts = data?.charts || {
    monthlyTrend: [],
    categoryBreakdown: [],
    statusBreakdown: [],
  };
  const mapData = data?.map || { points: [], hotspots: [] };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 p-8 text-white shadow-2xl border border-white/10">
          <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
          <h1 className="text-4xl font-bold tracking-tight relative z-10">RaiseIt Public Dashboard</h1>
          <p className="mt-3 text-base text-slate-200 relative z-10 max-w-2xl">
            Live campus issue intelligence with trends, categories, and hotspot mapping.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Weekly Raised"
            value={summary.weekly.raised || 0}
            hint="Issues created this week"
          />
          <StatCard
            title="Weekly Resolved"
            value={summary.weekly.resolved || 0}
            hint="Issues resolved this week"
          />
          <StatCard
            title="Monthly Raised"
            value={summary.monthly.raised || 0}
            hint="Issues created this month"
          />
          <StatCard
            title="Monthly Resolved"
            value={summary.monthly.resolved || 0}
            hint="Issues resolved this month"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Issues Raised vs Resolved</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                  <XAxis dataKey="label" stroke="#71717a" tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
                  <Tooltip wrapperStyle={{ borderRadius: '8px', overflow: 'hidden' }} contentStyle={{ backgroundColor: 'rgb(24 24 27 / 0.9)', border: '1px solid rgb(63 63 70)', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="raised" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="resolved" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Category Breakdown</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.categoryBreakdown} dataKey="value" nameKey="name" outerRadius={110} innerRadius={60} stroke="#09090b" strokeWidth={2}>
                    {charts.categoryBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip wrapperStyle={{ borderRadius: '8px', overflow: 'hidden' }} contentStyle={{ backgroundColor: 'rgb(24 24 27 / 0.9)', border: '1px solid rgb(63 63 70)', color: '#fff' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Status Distribution</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.statusBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
                  <Tooltip wrapperStyle={{ borderRadius: '8px', overflow: 'hidden' }} contentStyle={{ backgroundColor: 'rgb(24 24 27 / 0.9)', border: '1px solid rgb(63 63 70)', color: '#fff' }} />
                  <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={4} activeDot={{ r: 8, fill: "#8b5cf6", stroke: "#000", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Hotspot Clusters</h2>
            <div className="space-y-3">
              {(mapData.hotspots || []).slice(0, 6).map((spot) => (
                <div
                  key={`${spot.lat}-${spot.lng}`}
                  className="flex items-center justify-between rounded border border-slate-200 px-3 py-2"
                >
                  <span className="text-sm text-slate-700">
                    {spot.lat.toFixed(2)}, {spot.lng.toFixed(2)}
                  </span>
                  <span className="rounded bg-slate-900 px-2 py-1 text-xs text-white">
                    {spot.count} issues
                  </span>
                </div>
              ))}
              {(!mapData.hotspots || mapData.hotspots.length === 0) && (
                <p className="text-sm text-slate-500">No dense hotspots yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md p-6 shadow-xl">
          <h2 className="mb-4 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Campus Map Heat & Hotspots</h2>
          <div className="h-[480px] overflow-hidden rounded-lg">
            <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapData.points.map((issue) => (
                <CircleMarker
                  key={issue._id}
                  center={[issue.location.coords.lat, issue.location.coords.lng]}
                  radius={Math.min(18, 6 + (issue.voteCount || 0) / 8)}
                  pathOptions={{
                    color: issue.status === "Resolved" ? "#64748b" : "#111827",
                    fillOpacity: 0.35,
                  }}
                >
                  <Popup>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold">{issue.title}</p>
                      <p>{issue.category}</p>
                      <p>Status: {issue.status}</p>
                      <p>Votes: {issue.voteCount}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
              {(mapData.hotspots || []).map((spot) => (
                <CircleMarker
                  key={`hot-${spot.lat}-${spot.lng}`}
                  center={[spot.lat, spot.lng]}
                  radius={Math.min(30, 10 + spot.count * 2)}
                  pathOptions={{ color: "#ef4444", fillOpacity: 0.15 }}
                >
                  <Popup>
                    <p className="text-sm font-semibold">{spot.count} nearby issues</p>
                    <p className="text-xs text-slate-600">Votes: {spot.totalVotes}</p>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default PublicDashboard;
