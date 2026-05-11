import React, { useEffect, useRef, useState } from "react";
import { pollAISearch, startAISearch } from "../api/venues";
import LoadingSpinner from "./LoadingSpinner";
import VenueCard from "./VenueCard";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 30; // 60s timeout

export default function AISearchBar() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | polling | complete | failed
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-gray-900">AI Venue Search</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Describe what you need in plain English — location, size, vibe, must-haves.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. a modern space in central London for a 50-person product launch with good AV"
            className="flex-1 rounded-lg border-gray-300 text-sm py-2.5 focus:ring-brand-500 focus:border-brand-500"
            disabled={status === "loading" || status === "polling"}
          />
          <button
            type="submit"
            disabled={!query.trim() || status === "loading" || status === "polling"}
            className="px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {(status === "loading" || status === "polling") ? (
              <><LoadingSpinner size="sm" className="text-white" /> Searching…</>
            ) : "Search"}
          </button>
          {status !== "idle" && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
            >
              Clear
            </button>
          )}
        </form>

        {status === "polling" && (
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <LoadingSpinner size="sm" />
            Analysing venues with AI…
          </p>
        )}
      </div>

      {status === "failed" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {status === "complete" && results.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          No matching venues found for your query. Try adjusting your description.
        </div>
      )}

      {status === "complete" && results.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mb-3">
            Found <span className="font-medium text-gray-900">{results.length}</span> venue{results.length !== 1 ? "s" : ""}
          </p>
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
