import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const navItems = [
  { to: "/", label: "Feed" },
  { to: "/report", label: "Report" },
  { to: "/dashboard/public", label: "Dashboard" },
  { to: "/communities", label: "Communities" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/profile", label: "Profile" },
];

function AppShell({ children }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const hasToken = Boolean(localStorage.getItem("raiseit_token"));

  const handleLogout = () => {
    localStorage.removeItem("raiseit_token");
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen transition-colors duration-500">
      <header className="sticky top-0 z-40 border-b border-slate-200/50 dark:border-white/10 bg-white/70 dark:bg-black/70 backdrop-blur-md transition-colors duration-500">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <svg viewBox="0 0 24 24" className="h-10 w-10 drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]">
              <defs>
                <linearGradient id="flame-outer" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e3a8a" />
                  <stop offset="50%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id="flame-inner" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#bae6fd" />
                  <stop offset="60%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>
                <linearGradient id="flame-core" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="80%" stopColor="#e0f2fe" />
                  <stop offset="100%" stopColor="#7dd3fc" />
                </linearGradient>
              </defs>

              <path fill="url(#flame-outer)" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248z" />
              <g transform="translate(3, 4) scale(0.75)">
                <path fill="url(#flame-inner)" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248z" />
              </g>
              <g transform="translate(6, 8.5) scale(0.5)">
                <path fill="url(#flame-core)" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248z" />
              </g>
            </svg>
            <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]">RaiseIt</h1>
          </Link>
          <div className="flex items-center gap-3">
            <nav className="hidden gap-2 md:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive 
                        ? "bg-slate-900 text-white dark:bg-zinc-100 dark:text-black shadow-sm" 
                        : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/10"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <button
              onClick={toggleTheme}
              className="mr-2 rounded-full p-2 text-slate-600 outline-none transition-colors hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              aria-label="Toggle Dark Mode"
            >
              {theme === "dark" ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {!hasToken ? (
              <div className="flex items-center gap-2">
                <NavLink
                  to="/auth/login"
                  className="rounded-md border border-slate-300 dark:border-zinc-800 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/auth/register"
                  className="rounded-md bg-slate-900 dark:bg-white px-3 py-1.5 text-sm font-medium text-white dark:text-black shadow-sm transition-transform hover:scale-105"
                >
                  Register
                </NavLink>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-slate-300 dark:border-zinc-800 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}

export default AppShell;
