import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import VenueCard from "../components/VenueCard";
import useAuthStore from "../store/authStore";
import useShortlistStore from "../store/shortlistStore";

export default function ShortlistPage() {
  const { isAuthenticated } = useAuthStore();
  const { entries, loading, fetchShortlist } = useShortlistStore();

  useEffect(() => {
    if (isAuthenticated) fetchShortlist();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-16 h-16 bg-gray-900 border border-white/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Sign in to view your shortlist</h2>
        <p className="text-gray-500 mb-6">Save venues you love and come back to compare them later.</p>
        <Link
          to="/login"
          className="inline-flex items-center px-5 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-xl hover:bg-sky-500 transition-colors shadow-lg shadow-sky-950/50"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">My Shortlist</h1>
        <p className="text-gray-500 mt-1">
          {entries.length === 0
            ? "No venues saved yet."
            : `${entries.length} venue${entries.length !== 1 ? "s" : ""} saved`}
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="bg-gray-900 border border-white/8 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-gray-800/60 border border-white/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium mb-4">No venues shortlisted yet.</p>
          <Link
            to="/venues"
            className="text-sm text-sky-400 hover:text-sky-300 font-semibold"
          >
            Browse venues →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map(({ venue, id }) => (
            <VenueCard key={id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  );
}
