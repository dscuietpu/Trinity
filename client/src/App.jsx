import { lazy, Suspense, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { loginUser, registerUser, googleLogin } from "./services/authService";
import ChatRoomPage from "./pages/ChatRoomPage";
import CommunitiesPage from "./pages/CommunitiesPage";
import HomeFeedPage from "./pages/HomeFeedPage";
import IssueDetailPage from "./pages/IssueDetailPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import ReportIssuePage from "./pages/ReportIssuePage";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
const PublicDashboard = lazy(() => import("./pages/PublicDashboard"));

const PageLoader = () => (
  <div className="min-h-screen bg-slate-100 px-6 py-10 text-slate-700">
    Loading page...
  </div>
);

const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500 px-4 py-8 flex flex-col items-center justify-center">
    <div className="w-full max-w-[360px] flex flex-col items-center">
      <h1 className="mb-10 text-5xl font-black text-center text-slate-900 dark:text-zinc-100 tracking-[-0.04em] antialiased">
        RaiseIt
      </h1>
      <div className="w-full">
        {children}
      </div>
    </div>
  </div>
);

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await loginUser(formData);
      setMessage(`Logged in as ${data.user.role}`);
      window.location.href = "/";
    } catch (error) {
      setMessage(error.message || "Login failed");
    }
  };

  return (
    <AuthLayout>
      <div className="mb-5 flex flex-col items-center">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              await googleLogin(credentialResponse.credential);
              window.location.href = "/";
            } catch (err) {
              setMessage(err.message || "Google sign-in failed");
            }
          }}
          onError={() => setMessage("Google sign-in failed")}
          width="360"
          size="large"
          shape="pill"
          text="signin_with"
          theme="outline"
        />
        <button type="button" className="mt-3 w-full flex items-center justify-center gap-3 rounded-full bg-white dark:bg-white text-black px-5 py-2.5 font-bold shadow-sm hover:opacity-90 transition-all text-[15px] border border-slate-300 dark:border-transparent">
          <svg className="h-[20px] w-[20px] -mt-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.87 3.66-.8 1.48.06 2.53.53 3.2 1.34-2.8 1.64-2.34 5.33.27 6.37-1.12 2.76-2.58 4.54-4.21 5.26M12.03 7.25c-.15-2.26 1.77-4.14 4.02-4.25.32 2.38-1.92 4.38-4.02 4.25z"/>
          </svg>
          Sign in with Apple
        </button>
      </div>
      <div className="flex items-center gap-3 mb-5 px-2">
        <div className="h-px bg-slate-200 dark:bg-zinc-800 flex-1"></div>
        <span className="text-slate-500 dark:text-zinc-500 text-sm font-medium leading-none">or</span>
        <div className="h-px bg-slate-200 dark:bg-zinc-800 flex-1"></div>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        <input
          className="w-full rounded-[4px] border border-slate-300 dark:border-[#333639] bg-transparent px-4 py-3.5 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-500 dark:placeholder-[#71767b]"
          type="email"
          placeholder="Email address"
          value={formData.email}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, email: event.target.value }))
          }
          required
        />
        <input
          className="w-full rounded-[4px] border border-slate-300 dark:border-[#333639] bg-transparent px-4 py-3.5 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-500 dark:placeholder-[#71767b]"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, password: event.target.value }))
          }
          required
        />
        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-slate-900 dark:bg-zinc-100 px-5 py-3 font-bold text-white dark:text-black shadow-sm hover:opacity-90 transition-all text-[15px]"
        >
          Sign in
        </button>
      </form>
      {message && <p className="mt-4 text-center text-sm font-medium text-slate-600 dark:text-zinc-400">{message}</p>}
      <div className="mt-8">
        <p className="text-slate-600 dark:text-[#71767b] font-medium text-sm mb-4">Don't have an account?</p>
        <button
          onClick={() => window.location.href = "/auth/register"}
          className="w-full rounded-full bg-transparent border border-slate-300 dark:border-[#536471] px-5 py-2.5 font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all text-[15px]"
        >
          Sign up
        </button>
      </div>
    </AuthLayout>
  );
};

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    role: "student",
  });
  const [message, setMessage] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await registerUser(formData);
      setMessage(`Registered as ${data.user.role}`);
      window.location.href = "/";
    } catch (error) {
      setMessage(error.message || "Registration failed");
    }
  };

  return (
    <AuthLayout>
      <div className="mb-5 flex flex-col items-center">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              await googleLogin(credentialResponse.credential);
              window.location.href = "/";
            } catch (err) {
              setMessage(err.message || "Google sign-up failed");
            }
          }}
          onError={() => setMessage("Google sign-up failed")}
          width="360"
          size="large"
          shape="pill"
          text="signup_with"
          theme="outline"
        />
        <button type="button" className="mt-3 w-full flex items-center justify-center gap-3 rounded-full bg-white dark:bg-white text-black px-5 py-2.5 font-bold shadow-sm hover:opacity-90 transition-all text-[15px] border border-slate-300 dark:border-transparent">
          <svg className="h-[20px] w-[20px] -mt-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.87 3.66-.8 1.48.06 2.53.53 3.2 1.34-2.8 1.64-2.34 5.33.27 6.37-1.12 2.76-2.58 4.54-4.21 5.26M12.03 7.25c-.15-2.26 1.77-4.14 4.02-4.25.32 2.38-1.92 4.38-4.02 4.25z"/>
          </svg>
          Sign up with Apple
        </button>
      </div>
      <div className="flex items-center gap-3 mb-5 px-2">
        <div className="h-px bg-slate-200 dark:bg-zinc-800 flex-1"></div>
        <span className="text-slate-500 dark:text-zinc-500 text-sm font-medium leading-none">or</span>
        <div className="h-px bg-slate-200 dark:bg-zinc-800 flex-1"></div>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        <input
          className="w-full rounded-[4px] border border-slate-300 dark:border-[#333639] bg-transparent px-4 py-3.5 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-500 dark:placeholder-[#71767b]"
          type="text"
          placeholder="Full name"
          value={formData.name}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, name: event.target.value }))
          }
          required
        />
        <input
          className="w-full rounded-[4px] border border-slate-300 dark:border-[#333639] bg-transparent px-4 py-3.5 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-500 dark:placeholder-[#71767b]"
          type="email"
          placeholder="Email address"
          value={formData.email}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, email: event.target.value }))
          }
          required
        />
        <input
          className="w-full rounded-[4px] border border-slate-300 dark:border-[#333639] bg-transparent px-4 py-3.5 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-500 dark:placeholder-[#71767b]"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, password: event.target.value }))
          }
          required
        />
        <input
          className="w-full rounded-[4px] border border-slate-300 dark:border-[#333639] bg-transparent px-4 py-3.5 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-500 dark:placeholder-[#71767b]"
          type="text"
          placeholder="College"
          value={formData.college}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, college: event.target.value }))
          }
          required
        />
        <select
          className="w-full rounded-[4px] border border-slate-300 dark:border-[#333639] bg-transparent px-4 py-3.5 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-500 dark:placeholder-[#71767b] appearance-none"
          value={formData.role}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, role: event.target.value }))
          }
        >
          <option className="bg-white dark:bg-black" value="student">Student Account</option>
          <option className="bg-white dark:bg-black" value="authority">Authority Account</option>
          <option className="bg-white dark:bg-black" value="admin">Administrator</option>
        </select>
        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-slate-900 dark:bg-zinc-100 px-5 py-3 font-bold text-white dark:text-black shadow-sm hover:opacity-90 transition-all text-[15px]"
        >
          Sign up
        </button>
      </form>
      {message && <p className="mt-4 text-center text-sm font-medium text-slate-600 dark:text-zinc-400">{message}</p>}
      <div className="mt-8">
        <p className="text-slate-600 dark:text-[#71767b] font-medium text-sm mb-4">Already have an account?</p>
        <button
          onClick={() => window.location.href = "/auth/login"}
          className="w-full rounded-full bg-transparent border border-slate-300 dark:border-[#536471] px-5 py-2.5 font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all text-[15px]"
        >
          Sign in
        </button>
      </div>
    </AuthLayout>
  );
};

const HomePage = () => <HomeFeedPage />;

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/feed" element={<HomeFeedPage />} />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <ReportIssuePage />
              </ProtectedRoute>
            }
          />
          <Route path="/issues/:id" element={<IssueDetailPage />} />
          <Route path="/dashboard/public" element={<PublicDashboard />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route
            path="/communities/:id/chat"
            element={
              <ProtectedRoute>
                <ChatRoomPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
