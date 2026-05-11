import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useShortlistStore from "../store/shortlistStore";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { shortlistedIds } = useShortlistStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        pathname === to
          ? "bg-sky-500/15 text-sky-400 font-semibold ring-1 ring-sky-500/30"
          : "text-gray-400 hover:text-gray-100 hover:bg-white/5"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-gray-950/90 backdrop-blur-md border-b border-white/8 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center shadow-lg shadow-sky-900/40">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Venuefinder</span>
          </Link>

          {isAuthenticated && (
            <div className="hidden sm:flex items-center gap-1">
              {navLink("/venues", "Venues")}
              <Link
                to="/shortlist"
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/shortlist"
                    ? "bg-sky-500/15 text-sky-400 font-semibold ring-1 ring-sky-500/30"
                    : "text-gray-400 hover:text-gray-100 hover:bg-white/5"
                }`}
              >
                Shortlist
                {shortlistedIds.size > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-sky-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                    {shortlistedIds.size}
                  </span>
                )}
              </Link>
            </div>
          )}

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-2 mr-2">
                  <div className="w-7 h-7 bg-sky-600/25 rounded-full flex items-center justify-center ring-1 ring-sky-500/40">
                    <span className="text-xs font-bold text-sky-400 uppercase">
                      {user?.username?.[0] || "U"}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-300">{user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-400 hover:text-gray-100 border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/5 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-gray-100 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="text-sm font-semibold bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-500 transition-colors shadow-lg shadow-sky-900/40">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
