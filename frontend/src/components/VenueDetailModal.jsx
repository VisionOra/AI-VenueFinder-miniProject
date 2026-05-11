import React, { useEffect } from "react";
import useAuthStore from "../store/authStore";
import useShortlistStore from "../store/shortlistStore";

const AMENITY_LABELS = {
  wifi: "WiFi",
  av: "AV Equipment",
  catering: "Catering",
  parking: "Parking",
  breakout_rooms: "Breakout Rooms",
  natural_light: "Natural Light",
  rooftop_terrace: "Rooftop Terrace",
  outdoor_space: "Outdoor Space",
  accessibility: "Accessible",
  courtyard: "Courtyard",
  bike_storage: "Bike Storage",
  accommodation: "Accommodation",
  broadcast_studio: "Broadcast Studio",
  green_room: "Green Room",
};

const AMENITY_ICONS = {
  wifi: "📶", av: "🎬", catering: "🍽️", parking: "🚗",
  breakout_rooms: "🚪", natural_light: "☀️", rooftop_terrace: "🌇",
  outdoor_space: "🌳", accessibility: "♿", courtyard: "🏛️",
  bike_storage: "🚲", accommodation: "🛏️", broadcast_studio: "📡", green_room: "🎭",
};

export default function VenueDetailModal({ venue, explanation, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const { isAuthenticated } = useAuthStore();
  const { shortlistedIds, toggle } = useShortlistStore();
  const isShortlisted = shortlistedIds.has(venue.id);

  const handleToggle = () => {
    if (!isAuthenticated) {
      alert("Please sign in to shortlist venues.");
      return;
    }
    toggle(venue);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal panel */}
      <div className="relative bg-gray-900 border border-white/10 w-full sm:max-w-2xl sm:rounded-2xl shadow-2xl shadow-black/60 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/8 flex-shrink-0">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 bg-sky-500/15 text-sky-400 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ring-sky-500/25">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {venue.city}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">{venue.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-white/8 hover:bg-white/12 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {/* Key stats */}
          <div className="grid grid-cols-2 gap-4 p-6 bg-black/20 border-b border-white/8">
            <div className="bg-gray-800/60 rounded-xl p-4 border border-white/8 text-center">
              <div className="text-2xl font-extrabold text-white">
                £{Number(venue.price_per_day).toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">per day</div>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-4 border border-white/8 text-center">
              <div className="text-2xl font-extrabold text-white">
                {venue.capacity.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">max attendees</div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* AI Match explanation */}
            {explanation && (
              <div className="bg-gradient-to-br from-sky-500/10 to-indigo-500/10 rounded-xl p-4 border border-sky-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-sky-600 rounded-md flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-sky-400">Why AI matched this venue</span>
                </div>
                <p className="text-sm text-sky-200/80 leading-relaxed">{explanation}</p>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About this venue</h3>
              <p className="text-gray-300 leading-relaxed">{venue.description}</p>
            </div>

            {/* Amenities */}
            {venue.amenities?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {venue.amenities.map((a) => (
                    <div
                      key={a}
                      className="flex items-center gap-2.5 bg-gray-800/50 rounded-lg px-3 py-2.5 border border-white/8"
                    >
                      <span className="text-base">{AMENITY_ICONS[a] || "✓"}</span>
                      <span className="text-sm text-gray-300 font-medium">{AMENITY_LABELS[a] || a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="text-xs text-gray-500 pt-2 border-t border-white/6">
              Listed {new Date(venue.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-5 border-t border-white/8 bg-gray-900 flex-shrink-0 flex gap-3">
          <button
            onClick={handleToggle}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
              isShortlisted
                ? "bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-950/50"
                : "bg-white/8 text-gray-200 hover:bg-white/12 ring-1 ring-white/10"
            }`}
          >
            <svg className="w-4 h-4" fill={isShortlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {isShortlisted ? "Saved to Shortlist" : "Add to Shortlist"}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl font-semibold text-sm text-gray-400 border border-white/10 hover:bg-white/5 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
