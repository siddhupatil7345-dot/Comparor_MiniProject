"use client";

interface CompareButtonProps {
  onClick: () => void;
}

export default function CompareButton({ onClick }: CompareButtonProps) {
  return (
    <div className="text-center mb-10">
      <button
        onClick={onClick}
        className="bg-blue-400 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
      >
        Compare Lists
      </button>
    </div>
  );
}
