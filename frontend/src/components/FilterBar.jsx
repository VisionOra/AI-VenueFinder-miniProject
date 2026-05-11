import React, { useState } from "react";

const CITIES = ["London", "Manchester", "Edinburgh", "Birmingham", "Bristol", "Leeds", "Glasgow"];

export default function FilterBar({ onFilter }) {
  const [city, setCity] = useState("");
  const [minCapacity, setMinCapacity] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (city) params.city = city;
    if (minCapacity) params.min_capacity = minCapacity;
    if (maxCapacity) params.max_capacity = maxCapacity;
    if (maxPrice) params.max_price = maxPrice;
    onFilter(params);
  };

  const handleClear = () => {
    setCity(""); setMinCapacity(""); setMaxCapacity(""); setMaxPrice("");
    onFilter({});
  };

  const inputCls = "w-full rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm py-2 px-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 placeholder-gray-600 transition-colors hover:border-gray-600";
  const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider";

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl border border-white/8 p-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className={labelCls}>City</label>
          <select value={city} onChange={(e) => setCity(e.target.value)} className={inputCls}>
            <option value="">All cities</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Min Capacity</label>
          <input type="number" min="1" placeholder="e.g. 50" value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Max Capacity</label>
          <input type="number" min="1" placeholder="e.g. 500" value={maxCapacity}
            onChange={(e) => setMaxCapacity(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Max Price/Day (£)</label>
          <input type="number" min="0" placeholder="e.g. 5000" value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)} className={inputCls} />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button type="button" onClick={handleClear}
          className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-200 transition-colors">
          Clear
        </button>
        <button type="submit"
          className="px-4 py-1.5 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-500 transition-colors font-semibold shadow-lg shadow-sky-950/40">
          Apply Filters
        </button>
      </div>
    </form>
  );
}
