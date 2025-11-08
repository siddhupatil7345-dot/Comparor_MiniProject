"use client";

import { useState } from "react";

interface ResultBlockProps {
  title: string;
  data: string[];
  color: string;
}

export default function ResultBlock({ title, data, color }: ResultBlockProps) {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const filtered = data.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = () => {
    if (!data.length) return;
    navigator.clipboard.writeText(data.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl bg-white shadow-md p-4 border-t-4 border-${color}-500 text-black transition-all duration-200`}
    >
      {/* Header: title + count + copy button */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{title}</h3>

          {/* Count badge */}
          <span
            title="Total records in this result"
            className={`px-2 py-0.5 text-xs font-medium rounded-full border transition-all duration-200 cursor-default
              bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:border-gray-300 hover:shadow-sm hover:scale-105`}
          >
            {data.length} {data.length === 1 ? "item" : "items"}
          </span>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          disabled={!data.length}
          className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md border transition
            ${
              copied
                ? "text-green-600 bg-green-50 border-green-300"
                : "text-black bg-gray-100 hover:bg-gray-200 border-gray-300"
            }
            ${!data.length ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {copied ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.778 7.778a1 1 0 0 1-1.414 0L3.293 9.86a1 1 0 0 1 1.414-1.414l3.808 3.808 7.071-7.071a1 1 0 0 1 1.414 0Z"
                  clipRule="evenodd"
                />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Search box */}
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-2 py-1 mb-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 text-black placeholder-gray-400"
      />

      {/* Results */}
      <div className="max-h-64 overflow-y-auto text-sm space-y-1">
        {filtered.length > 0 ? (
          filtered.map((item, index) => (
            <div
              key={index}
              className={`p-1 rounded-md hover:bg-${color}-50 transition text-black`}
            >
              {item}
            </div>
          ))
        ) : (
          <p className="text-gray-400 italic">No matching items</p>
        )}
      </div>
    </div>
  );
}
