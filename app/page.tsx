"use client";

import { useState } from "react";
import ListInput from "./components/ListInput";
import CompareButton from "./components/CompareButton";
import ResultBlock from "./components/ResultBlock";
import { compareLists } from "./utils/compareLists";

export default function ListComparatorPage() {
  const [listA, setListA] = useState("");
  const [listB, setListB] = useState("");
  const [results, setResults] = useState<any>({
    uniqueA: [],
    uniqueB: [],
    intersection: [],
    union: [],
  });

  const handleCompare = () => {
    setResults(compareLists(listA, listB));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-8 lg:px-16">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <ListInput label="List A" value={listA} onChange={setListA} />
        <ListInput label="List B" value={listB} onChange={setListB} />
      </div>

      <CompareButton onClick={handleCompare} />

      {/* Always show results section */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ResultBlock
          title="Unique in A"
          data={results.uniqueA}
          color="green"
        />
        <ResultBlock
          title="Unique in B"
          data={results.uniqueB}
          color="blue"
        />
        <ResultBlock
          title="Intersection"
          data={results.intersection}
          color="purple"
        />
        <ResultBlock
          title="Merged"
          data={results.union}
          color="orange"
        />
      </div>

    </div>
  );
}
