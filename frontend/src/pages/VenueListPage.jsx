import React, { useEffect, useRef, useState } from "react";
import { listVenues, pollAISearch, startAISearch } from "../api/venues";
import FilterBar from "../components/FilterBar";
import LoadingSpinner from "../components/LoadingSpinner";
import VenueCard from "../components/VenueCard";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 30;

// ─── AI Search panel ────────────────────────────────────────────────────────
function AISearchPanel() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("idle");
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);
  const pollCountRef = useRef(0);

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    pollCountRef.current = 0;
  };

  useEffect(() => () => stopPolling(), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setStatus("loading");
    setResults([]);
    setError(null);
    stopPolling();

    try {
      const { data } = await startAISearch(query.trim());
      const jobId = data.job_id;
      setStatus("polling");

      pollRef.current = setInterval(async () => {
        pollCountRef.current += 1;
        if (pollCountRef.current > MAX_POLLS) {
          stopPolling();
          setStatus("failed");
          setError("Search timed out. Please try again.");
          return;
        }
        try {
          const { data: job } = await pollAISearch(jobId);
          if (job.status === "complete") {
            stopPolling();
            setResults(job.results || []);
            setStatus("complete");
          } else if (job.status === "failed") {
            stopPolling();
            setStatus("failed");
            setError(job.error || "Search failed. Please try again.");
          }
        } catch {
          stopPolling();
          setStatus("failed");
          setError("Failed to retrieve results.");
        }
      }, POLL_INTERVAL_MS);
    } catch (err) {
      setStatus("failed");
      setError(err.response?.data?.detail || "Failed to start search.");
    }
  };

  const handleClear = () => {
    stopPolling();
    setQuery("");
    setStatus("idle");
    setResults([]);
    setError(null);
  };

  const isSearching = status === "loading" || status === "polling";

  return (
    <div className="space-y-6">
      {/* Search input card */}
      <div className="bg-gradient-to-br from-sky-500/8 to-indigo-500/8 rounded-2xl border border-sky-500/20 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-sky-950/50">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI-Powered Search</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Describe your ideal venue in plain English. Our AI reads all venues and finds the best matches with explanations.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            rows={2}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='e.g. "a modern space in central London for a 50-person product launch with good AV and catering"'
            className="w-full rounded-xl bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-600 text-sm py-3 px-4 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
            disabled={isSearching}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!query.trim() || isSearching}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-xl hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-sky-950/40"
            >
              {isSearching ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Analysing venues…</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search with AI</span>
                </>
              )}
            </button>
            {status !== "idle" && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2.5 text-sm text-gray-400 hover:text-gray-100 border border-white/10 rounded-xl bg-white/5 hover:bg-white/8 transition-colors"
              >
                Clear
              </button>
            )}
            {isSearching && (
              <span className="text-xs text-sky-500 animate-pulse font-medium">
                AI is finding your best matches…
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Error */}
      {status === "failed" && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Empty results */}
      {status === "complete" && results.length === 0 && (
        <div className="bg-gray-900 border border-white/8 rounded-xl p-12 text-center">
          <svg className="w-10 h-10 text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400 font-medium">No matching venues found.</p>
          <p className="text-sm text-gray-600 mt-1">Try a different description or broaden your requirements.</p>
        </div>
      )}

      {/* Results */}
      {status === "complete" && results.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 text-sm font-semibold px-3 py-1 rounded-full ring-1 ring-emerald-500/25">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {results.length} AI match{results.length !== 1 ? "es" : ""} found
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map(({ venue, explanation }) => (
              <VenueCard key={venue.id} venue={venue} explanation={explanation} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Browse panel ─────────────────────────────────────────────────────────────
function BrowsePanel() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  const fetchVenues = async (params, currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await listVenues({ ...params, page: currentPage });
      setVenues(data.results);
      setPagination({ count: data.count, next: data.next, previous: data.previous });
    } catch {
      setError("Failed to load venues. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues(filters, page);
  }, [filters, page]);

  const handleFilter = (params) => {
    setPage(1);
    setFilters(params);
  };

  return (
    <div className="space-y-5">
      <FilterBar onFilter={handleFilter} />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : venues.length === 0 ? (
        <div className="bg-gray-900 border border-white/8 rounded-xl p-12 text-center text-gray-500">
          No venues match your filters. Try adjusting your criteria.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>

          {(pagination.next || pagination.previous) && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                disabled={!pagination.previous}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 text-sm border border-white/10 rounded-lg disabled:opacity-30 hover:bg-white/5 text-gray-400 hover:text-gray-100 transition-colors"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-600">Page {page} of {Math.ceil(pagination.count / 12)}</span>
              <button
                disabled={!pagination.next}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 text-sm border border-white/10 rounded-lg disabled:opacity-30 hover:bg-white/5 text-gray-400 hover:text-gray-100 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function VenueListPage() {
  const [activeTab, setActiveTab] = useState("browse");

  const tabs = [
    {
      id: "browse",
      label: "Browse Venues",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      id: "ai",
      label: "AI Search",
      badge: "NEW",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Find Your Venue</h1>
        <p className="text-gray-500 mt-1">Search across venues in London, Manchester, Edinburgh and more.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-gray-900 rounded-xl w-fit border border-white/8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-gray-800 text-sky-400 shadow-sm ring-1 ring-white/10"
                : "text-gray-500 hover:text-gray-200"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span className="bg-sky-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "browse" ? <BrowsePanel /> : <AISearchPanel />}
    </div>
  );
}
