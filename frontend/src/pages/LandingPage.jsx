import React from "react";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "AI-Powered Search",
    description: "Describe your event in plain English and our AI instantly finds the best-matched venues with explanations.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
      </svg>
    ),
    title: "Smart Filtering",
    description: "Filter by city, capacity, and price per day to narrow down options across the UK instantly.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
    title: "Shortlist & Compare",
    description: "Save your favourite venues to a personal shortlist and get a summary email to share with your team.",
  },
];

const STATS = [
  { value: "25+", label: "UK Venues" },
  { value: "7", label: "Cities" },
  { value: "AI", label: "Powered Search" },
  { value: "Free", label: "To Use" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center shadow-lg shadow-sky-950/50">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Venuefinder</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-gray-100 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="text-sm font-semibold bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-500 transition-colors shadow-lg shadow-sky-950/50">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[500px] bg-sky-600/6 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-sky-500/12 text-sky-400 text-sm font-medium px-4 py-1.5 rounded-full border border-sky-500/20 mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI-powered venue discovery
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-6">
            Find the perfect venue
            <span className="text-sky-400 block">for your next event</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Venuefinder helps businesses discover and shortlist event spaces across the UK.
            Search naturally with AI, filter by your requirements, and build your shortlist in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-500 transition-colors shadow-xl shadow-sky-950/60 text-base"
            >
              Start for free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/6 text-gray-200 font-semibold rounded-xl hover:bg-white/10 transition-colors border border-white/10 text-base"
            >
              Sign in to your account
            </Link>
          </div>

          <p className="text-sm text-gray-600 mt-4">
            Demo account available · No credit card required
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 border-y border-white/6 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-extrabold text-sky-400">{s.value}</div>
                <div className="text-sm text-gray-600 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white">Everything you need to find the right space</h2>
            <p className="text-gray-500 mt-3 text-lg">Built for PAs, office managers, and event teams who need to move fast.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-gray-900 rounded-2xl border border-white/8 p-6 hover:border-sky-500/25 hover:shadow-lg hover:shadow-sky-950/30 transition-all">
                <div className="w-12 h-12 bg-sky-500/12 rounded-xl flex items-center justify-center text-sky-400 mb-4 ring-1 ring-sky-500/20">
                  {f.icon}
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-sky-600 to-indigo-600 rounded-2xl p-12 text-center relative overflow-hidden shadow-2xl shadow-sky-950/50">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 400 200" fill="none">
                <circle cx="350" cy="-30" r="150" fill="white" />
                <circle cx="50" cy="180" r="120" fill="white" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 relative">Ready to find your venue?</h2>
            <p className="text-sky-100/80 mb-8 text-lg relative">Join and discover venues across London, Manchester, Edinburgh, and more.</p>
            <Link
              to="/register"
              className="relative inline-flex items-center gap-2 px-8 py-3.5 bg-white text-sky-700 font-bold rounded-xl hover:bg-sky-50 transition-colors shadow-lg text-base"
            >
              Create free account
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/6 text-center text-sm text-gray-700">
        © 2026 Venuefinder · B2B Venue Discovery Platform
      </footer>
    </div>
  );
}
