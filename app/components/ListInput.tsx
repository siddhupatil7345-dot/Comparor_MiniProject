"use client";

interface ListInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function ListInput({ label, value, onChange }: ListInputProps) {
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  const totalCount = lines.length;

  // Count duplicates
  const duplicateCount = (() => {
    const seen = new Set<string>();
    const dupes = new Set<string>();
    for (const line of lines) {
      if (seen.has(line)) dupes.add(line);
      seen.add(line);
    }
    return dupes.size;
  })();

  return (
    <div className="flex flex-col space-y-2 transition-all duration-200">
      {/* Header with label + stats */}
      <div className="flex items-center justify-between">
        <label className="text-lg font-semibold text-gray-800">{label}</label>

        <div className="flex gap-2">
          <span
            title="Total non-empty lines"
            className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 rounded-full transition-all duration-200 hover:bg-gray-200 hover:border-gray-300 hover:shadow-sm hover:scale-105 cursor-default"
          >
            🧾 {totalCount} {totalCount === 1 ? "item" : "items"}
          </span>

          <span
            title="Duplicate entries detected"
            className={`px-2 py-0.5 text-xs font-medium border rounded-full transition-all duration-200 hover:shadow-sm hover:scale-105 cursor-default
              ${
                duplicateCount > 0
                  ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 hover:border-red-300"
                  : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300"
              }`}
          >
            {duplicateCount > 0 ? `⚠️ ${duplicateCount} dupliactes` : "✅ No dupliactes"}
          </span>
        </div>
      </div>

      {/* Text area */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter one item per line..."
        className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm text-black placeholder-gray-400 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
      />
    </div>
  );
}
