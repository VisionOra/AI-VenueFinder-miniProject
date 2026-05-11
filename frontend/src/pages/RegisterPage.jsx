import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, register } from "../api/auth";
import useAuthStore from "../store/authStore";
import useShortlistStore from "../store/shortlistStore";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();
  const { fetchShortlist } = useShortlistStore();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      const { data } = await login(form.username, form.password);
      storeLogin({ username: form.username }, data.access, data.refresh);
      await fetchShortlist();
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const messages = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" · ");
        setError(messages);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full rounded-xl bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-600 text-sm py-2.5 px-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all hover:border-gray-600";

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-sky-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 600" fill="none">
            <circle cx="50" cy="100" r="200" fill="white" />
            <circle cx="350" cy="500" r="180" fill="white" />
          </svg>
        </div>
        <div className="max-w-md text-white relative">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">Start finding venues in minutes</h2>
          <p className="text-indigo-100/80 text-lg leading-relaxed mb-8">
            Create your free account and get immediate access to AI-powered venue search across the UK.
          </p>
          <div className="bg-white/10 rounded-2xl p-5 border border-white/20">
            <p className="text-sm text-indigo-100/70 font-medium mb-3">What you get for free:</p>
            <div className="space-y-2">
              {[
                "Unlimited venue browsing",
                "AI semantic search",
                "Personal shortlist",
                "Shortlist summary email",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-indigo-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-indigo-100/80">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gray-950">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <span className="font-bold text-white">Venuefinder</span>
          </Link>

          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-gray-500 mb-8">Free forever · No credit card required</p>

          <div className="bg-gray-900 rounded-2xl border border-white/8 shadow-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1.5">Username</label>
                <input
                  type="text" required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className={inputCls}
                  placeholder="Choose a username"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1.5">
                  Email <span className="font-normal text-gray-600">(optional)</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputCls}
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1.5">Password</label>
                <input
                  type="password" required minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={inputCls}
                  placeholder="Min. 8 characters"
                />
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3 bg-sky-600 text-white text-sm font-bold rounded-xl hover:bg-sky-500 disabled:opacity-50 transition-colors shadow-lg shadow-sky-950/50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> Creating account…</>
                ) : "Create free account"}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-600 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
