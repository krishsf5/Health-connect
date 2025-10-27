import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Auto-detect API URL for both development and production
const getApiUrl = () => {
  // In production (Vercel), API routes are at the same domain with /api prefix
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return `${window.location.origin}/api`;
  }
  // For local development
  return import.meta.env.VITE_API_URL || "http://localhost:5000/api";
};

const API = getApiUrl();

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = mode === 'register' ? 'register' : 'login';
      const res = await fetch(`${API}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "register"
            ? { name, email, password }
            : { email, password }
        ),
      });
      const contentType = res.headers.get("content-type") || "";
      let data;
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text.slice(0, 120) || `Unexpected response (${res.status})`);
      }
      if (!res.ok) throw new Error(data.message || "Failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);

      // Navigate to appropriate dashboard based on user role
      if (data.user.role === "doctor") {
        navigate("/doctor");
      } else {
        navigate("/patient");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dashboard-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-2xl mb-4">
            <i data-lucide="heart-pulse" className="w-8 h-8 text-white"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Health Connect</h1>
          <p className="text-gray-600 dark:text-slate-300 mt-2">
            {mode === "login" ? "Sign in to your account" : "Create your patient account"}
          </p>
        </div>

        {/* Login/Register Card */}
        <div className="card card-hover">
          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-500/10 dark:border-red-900/50">
              <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                  Full Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-100 placeholder:text-slate-400"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-100 placeholder:text-slate-400"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-100 placeholder:text-slate-400"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Please wait...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <i data-lucide={mode === "login" ? "log-in" : "user-plus"} className="w-4 h-4 mr-2"></i>
                  {mode === "login" ? "Sign In" : "Create Account"}
                </div>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <div className="mt-6 text-center">
            {mode === "login" ? (
              <p className="text-sm text-gray-600 dark:text-slate-300">
                Don't have an account?{" "}
                <button
                  onClick={() => setMode("register")}
                  className="text-teal-600 hover:text-teal-700 font-medium dark:text-teal-400 dark:hover:text-teal-300"
                >
                  Create one here
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-600 dark:text-slate-300">
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-teal-600 hover:text-teal-700 font-medium dark:text-teal-400 dark:hover:text-teal-300"
                >
                  Sign in instead
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500 dark:text-slate-400">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

