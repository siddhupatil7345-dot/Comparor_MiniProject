"use client";

import { useRef } from "react";

interface TextAreaInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function TextAreaInput({
  label,
  value,
  onChange,
  placeholder,
}: TextAreaInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onChange(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col space-y-3 mb-6">
      <label className="text-lg font-semibold text-gray-800">{label}</label>

      {/* Upload Button */}
      <div className="flex gap-2 items-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-sm border border-gray-300 transition"
        >
          📂 Upload File
        </button>
        <input
          type="file"
          accept=".txt,.csv"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />
      </div>

      {/* Text Area */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm text-black placeholder-gray-400 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
      />
    </div>
  );
}
