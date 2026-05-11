import React from "react";
import AISearchBar from "../components/AISearchBar";

export default function AISearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI-Powered Search</h1>
        <p className="text-gray-500 mt-1">
          Describe your ideal venue in plain English. Our AI will analyse all available venues and
          return the best matches with explanations.
        </p>
      </div>
      <AISearchBar />
    </div>
  );
}
