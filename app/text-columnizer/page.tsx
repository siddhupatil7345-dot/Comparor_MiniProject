"use client";

import { useState } from "react";
import TextAreaInput from "../components/TextAreaInput";
import { columnizeText } from "../utils/columnizerUtils";

export default function TextColumnizerPage() {
  const [text, setText] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [columns, setColumns] = useState<string[][]>([]);

  const detectDelimiter = (text: string) => {
    const candidates = [",", "|", "\t", ";"];
    const sample = text.split("\n")[0];
    return candidates.find((d) => sample.includes(d)) || ",";
  };

  const handleColumnize = () => {
    const autoDelimiter = detectDelimiter(text);
    setDelimiter(autoDelimiter);
    setColumns(columnizeText(text, autoDelimiter));
  };

  const handleCopy = () => {
    const csv = columns.map((r) => r.join(delimiter)).join("\n");
    navigator.clipboard.writeText(csv);
  };

  const handleDownload = () => {
    const csv = columns.map((r) => r.join(delimiter)).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "columnized.csv";
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-8 lg:px-16 text-black">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">
        Text Columnizer
      </h1>

      <TextAreaInput
        label="Enter your text"
        value={text}
        onChange={setText}
        placeholder="Paste text separated by commas, tabs, or pipes..."
      />

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleColumnize}
          className="bg-blue-500 text-white px-5 py-2 rounded-md shadow hover:bg-blue-600 transition"
        >
          Auto Columnize
        </button>

        {columns.length > 0 && (
          <>
            <button
              onClick={handleCopy}
              className="bg-green-500 text-white px-5 py-2 rounded-md shadow hover:bg-green-600 transition"
            >
              Copy All
            </button>
            <button
              onClick={handleDownload}
              className="bg-orange-500 text-white px-5 py-2 rounded-md shadow hover:bg-orange-600 transition"
            >
              Download CSV
            </button>
          </>
        )}
      </div>

      {columns.length > 0 && (
        <>
          <p className="text-sm text-gray-600 mb-3">
            Detected delimiter: <strong>{delimiter === "\t" ? "Tab" : delimiter}</strong>{" "}
            | Columns per row: <strong>{columns[0]?.length}</strong>
          </p>

          <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow">
            <table className="w-full text-sm border-collapse">
              <tbody>
                {columns.map((row, i) => (
                  <tr key={i} className="odd:bg-gray-50">
                    {row.map((cell, j) => (
                      <td key={j} className="border border-gray-300 px-3 py-1">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
