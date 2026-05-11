import React, { useState } from "react";
import useAuthStore from "../store/authStore";
import useShortlistStore from "../store/shortlistStore";
import VenueDetailModal from "./VenueDetailModal";

const AMENITY_LABELS = {
  wifi: "WiFi", av: "AV", catering: "Catering", parking: "Parking",
  breakout_rooms: "Breakout Rooms", natural_light: "Natural Light",
  rooftop_terrace: "Rooftop", outdoor_space: "Outdoor Space",
  accessibility: "Accessible", courtyard: "Courtyard",
  bike_storage: "Bike Storage", accommodation: "Accommodation",
  broadcast_studio: "Broadcast Studio", green_room: "Green Room",
};

const CITY_GRADIENTS = {
  London: "from-violet-600 to-purple-700",
  Manchester: "from-rose-600 to-pink-700",
  Edinburgh: "from-amber-500 to-orange-600",
  Birmingham: "from-teal-600 to-cyan-700",
  Bristol: "from-emerald-600 to-green-700",
  Leeds: "from-blue-600 to-indigo-700",
  Glasgow: "from-sky-600 to-blue-700",
};

export default function VenueCard({ venue, explanation }) {
  const [showModal, setShowModal] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { shortlistedIds, toggle } = useShortlistStore();
  const isShortlisted = shortlistedIds.has(venue.id);
  const gradient = CITY_GRADIENTS[venue.city] || "from-gray-600 to-gray-700";

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { alert("Please sign in to shortlist venues."); return; }
    toggle(venue);
  };

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="bg-gray-900 rounded-2xl border border-white/8 hover:border-sky-500/30 hover:shadow-xl hover:shadow-sky-950/40 hover:-translate-y-0.5 transition-all duration-200 flex flex-col cursor-pointer group"
      >
        {/* Colour header */}
        <div className={`h-28 bg-gradient-to-br ${gradient} rounded-t-2xl relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 200 100" fill="none">
              <circle cx="160" cy="-10" r="80" fill="white" />
              <circle cx="20" cy="80" r="60" fill="white" />
            </svg>
          </div>
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 bg-black/25 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/20">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {venue.city}
            </span>
          </div>
          <button
            onClick={handleToggle}
            title={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
              isShortlisted
                ? "bg-white border-white text-sky-600 shadow-md"
                : "bg-black/25 border-white/30 text-white hover:bg-white hover:text-sky-600 hover:border-white"
            }`}
          >
            <svg className="w-4 h-4" fill={isShortlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-gray-100 leading-snug group-hover:text-sky-400 transition-colors mb-1">
            {venue.name}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2 mb-3 leading-relaxed flex-1">
            {venue.description}
          </p>

          {explanation && (
            <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-2.5 mb-3">
              <p className="text-xs font-semibold text-sky-400 mb-0.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Match
              </p>
              <p className="text-xs text-sky-300/80 line-clamp-2">{explanation}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-1 mb-3">
            {(venue.amenities || []).slice(0, 4).map((a) => (
              <span key={a} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/8 text-gray-300 ring-1 ring-white/10">
                {AMENITY_LABELS[a] || a}
              </span>
            ))}
            {venue.amenities?.length > 4 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs text-gray-600 bg-white/4 ring-1 ring-white/6">
                +{venue.amenities.length - 4}
              </span>
            )}
          </div>
        </div>

        <div className="px-4 py-3 bg-white/3 rounded-b-2xl border-t border-white/6 flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
            <span>{venue.capacity.toLocaleString()} guests</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-100">
              £{Number(venue.price_per_day).toLocaleString()}
              <span className="text-xs font-normal text-gray-500">/day</span>
            </span>
            <span className="text-xs text-sky-500 font-semibold group-hover:underline hidden sm:inline">
              View →
            </span>
          </div>
        </div>
      </div>

      {showModal && (
        <VenueDetailModal venue={venue} explanation={explanation} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
