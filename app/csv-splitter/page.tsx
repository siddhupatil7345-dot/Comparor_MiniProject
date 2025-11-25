"use client";

import { useState } from "react";
import TextAreaInput from "../components/TextAreaInput";
import { splitCSV } from "../utils/csvUtils";

export default function CsvSplitterPage() {
  const [csvText, setCsvText] = useState("");
  const [splitSize, setSplitSize] = useState(100);
  const [files, setFiles] = useState<string[]>([]);
  const [delimiter, setDelimiter] = useState(",");

  const detectDelimiter = (text: string) => {
    const candidates = [",", ";", "|", "\t"];
    const sample = text.split("\n")[0];
    const detected =
      candidates.find((d) => sample.includes(d)) || ",";
    setDelimiter(detected);
  };

  const handleSplit = () => {
    detectDelimiter(csvText);
    const result = splitCSV(csvText, splitSize);
    setFiles(result);
  };

  const downloadFile = (content: string, index: number) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `chunk_${index + 1}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-8 lg:px-16 text-black">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">CSV Splitter</h1>

      <TextAreaInput
        label="Paste your CSV data"
        value={csvText}
        onChange={setCsvText}
        placeholder="Paste CSV here..."
      />

      <div className="flex items-center gap-3 mb-6">
        <label className="font-medium">Rows per file:</label>
        <input
          type="number"
          min="1"
          value={splitSize}
          onChange={(e) => setSplitSize(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
        />
        <button
          onClick={handleSplit}
          className="bg-blue-500 text-white px-5 py-2 rounded-md shadow hover:bg-blue-600 transition"
        >
          Split CSV
        </button>
      </div>

      {files.length > 0 && (
        <div className="space-y-6">
          {files.map((file, idx) => (
            <div key={idx} className="p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Chunk {idx + 1}</h3>
                <button
                  onClick={() => downloadFile(file, idx)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Download CSV
                </button>
              </div>
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap">{file}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
