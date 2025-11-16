import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, FileJson, RotateCcw, Edit3, Lock } from 'lucide-react';

interface Difference {
  path: string;
  type: 'value' | 'missing' | 'type';
  leftValue: any;
  rightValue: any;
  message: string;
}

const JSONDiff = () => {
  const [leftJson, setLeftJson] = useState('');
  const [rightJson, setRightJson] = useState('');
  const [leftError, setLeftError] = useState('');
  const [rightError, setRightError] = useState('');
  const [diffs, setDiffs] = useState<Difference[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  const leftTextareaRef = useRef<HTMLTextAreaElement>(null);
  const rightTextareaRef = useRef<HTMLTextAreaElement>(null);
  const leftOverlayRef = useRef<HTMLDivElement>(null);
  const rightOverlayRef = useRef<HTMLDivElement>(null);

  const sampleData = {
    left: JSON.stringify({
      "name": "John Doe",
      "age": 30,
      "email": "john@example.com",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "zip": "10001"
      },
      "hobbies": ["reading", "gaming", "coding"]
    }, null, 2),
    right: JSON.stringify({
      "name": "John Doe",
      "age": 31,
      "email": "john.doe@example.com",
      "address": {
        "street": "123 Main St",
        "city": "Los Angeles",
        "zip": "90001"
      },
      "hobbies": ["reading", "coding", "traveling"]
    }, null, 2)
  };

  // Sync scroll between textarea and overlay
  useEffect(() => {
    const syncScroll = (textarea: HTMLTextAreaElement | null, overlay: HTMLDivElement | null) => {
      if (!textarea || !overlay) return;
      
      const handleScroll = () => {
        overlay.scrollTop = textarea.scrollTop;
        overlay.scrollLeft = textarea.scrollLeft;
      };
      
      textarea.addEventListener('scroll', handleScroll);
      return () => textarea.removeEventListener('scroll', handleScroll);
    };

    const cleanup1 = syncScroll(leftTextareaRef.current, leftOverlayRef.current);
    const cleanup2 = syncScroll(rightTextareaRef.current, rightOverlayRef.current);

    return () => {
      cleanup1?.();
      cleanup2?.();
    };
  }, [isLocked]);

  const validateJSON = (text: string): { valid: boolean; error: string } => {
    try {
      if (!text.trim()) {
        return { valid: false, error: 'Please enter JSON data' };
      }
      JSON.parse(text);
      return { valid: true, error: '' };
    } catch (e: any) {
      return { valid: false, error: `Invalid JSON: ${e.message}` };
    }
  };

  const getSortedProperties = (obj: any): string[] => {
    return Object.keys(obj).sort((a, b) => a.localeCompare(b));
  };

  const compareJSON = (obj1: any, obj2: any, path: string = ''): Difference[] => {
    const differences: Difference[] = [];

    const type1 = Array.isArray(obj1) ? 'array' : typeof obj1;
    const type2 = Array.isArray(obj2) ? 'array' : typeof obj2;

    if (type1 !== type2) {
      differences.push({
        path: path || '/',
        type: 'type',
        leftValue: type1,
        rightValue: type2,
        message: `Type mismatch: ${type1} vs ${type2}`
      });
      return differences;
    }

    if (obj1 === null || obj2 === null) {
      if (obj1 !== obj2) {
        differences.push({
          path: path || '/',
          type: 'value',
          leftValue: obj1,
          rightValue: obj2,
          message: 'Value mismatch'
        });
      }
      return differences;
    }

    if (typeof obj1 === 'object' && !Array.isArray(obj1)) {
      const keys1 = getSortedProperties(obj1);
      const keys2 = getSortedProperties(obj2);
      const allKeys = [...new Set([...keys1, ...keys2])].sort();

      allKeys.forEach(key => {
        const newPath = path ? `${path}.${key}` : key;
        
        if (!(key in obj1)) {
          differences.push({
            path: newPath,
            type: 'missing',
            leftValue: undefined,
            rightValue: obj2[key],
            message: `Property missing in left object`
          });
        } else if (!(key in obj2)) {
          differences.push({
            path: newPath,
            type: 'missing',
            leftValue: obj1[key],
            rightValue: undefined,
            message: `Property missing in right object`
          });
        } else {
          differences.push(...compareJSON(obj1[key], obj2[key], newPath));
        }
      });
    } else if (Array.isArray(obj1)) {
      const maxLen = Math.max(obj1.length, obj2.length);
      
      for (let i = 0; i < maxLen; i++) {
        const newPath = `${path}[${i}]`;
        
        if (i >= obj1.length) {
          differences.push({
            path: newPath,
            type: 'missing',
            leftValue: undefined,
            rightValue: obj2[i],
            message: 'Element missing in left array'
          });
        } else if (i >= obj2.length) {
          differences.push({
            path: newPath,
            type: 'missing',
            leftValue: obj1[i],
            rightValue: undefined,
            message: 'Element missing in right array'
          });
        } else if (typeof obj1[i] === 'object' && obj1[i] !== null) {
          differences.push(...compareJSON(obj1[i], obj2[i], newPath));
        } else if (obj1[i] !== obj2[i]) {
          differences.push({
            path: newPath,
            type: 'value',
            leftValue: obj1[i],
            rightValue: obj2[i],
            message: 'Value mismatch'
          });
        }
      }
    } else if (obj1 !== obj2) {
      differences.push({
        path: path || '/',
        type: 'value',
        leftValue: obj1,
        rightValue: obj2,
        message: 'Value mismatch'
      });
    }

    return differences;
  };

  const handleCompare = () => {
    setLeftError('');
    setRightError('');

    const leftValidation = validateJSON(leftJson);
    const rightValidation = validateJSON(rightJson);

    if (!leftValidation.valid) {
      setLeftError(leftValidation.error);
      return;
    }
    if (!rightValidation.valid) {
      setRightError(rightValidation.error);
      return;
    }

    setIsComparing(true);

    setTimeout(() => {
      try {
        const left = JSON.parse(leftJson);
        const right = JSON.parse(rightJson);
        
        const differences = compareJSON(left, right);
        setDiffs(differences);
        setShowResults(true);
        setIsLocked(true);
      } catch (error) {
        console.error('Comparison error:', error);
      } finally {
        setIsComparing(false);
      }
    }, 300);
  };

  const handleReset = () => {
    setLeftJson('');
    setRightJson('');
    setLeftError('');
    setRightError('');
    setDiffs([]);
    setShowResults(false);
    setIsLocked(false);
  };

  const handleEdit = () => {
    setIsLocked(false);
    setShowResults(false);
    setDiffs([]);
  };

  const loadSampleData = () => {
    setLeftJson(sampleData.left);
    setRightJson(sampleData.right);
    setShowResults(false);
    setIsLocked(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          if (side === 'left') {
            setLeftJson(result);
          } else {
            setRightJson(result);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const findLineRangeForPath = (jsonStr: string, path: string): Set<number> => {
    const lines = jsonStr.split('\n');
    const lineNumbers = new Set<number>();
    
    try {
      // Parse path into parts
      const pathParts = path.split(/\.|\[/).map(p => p.replace(/\]/g, ''));
      
      // For simple value changes, find the key line
      const lastKey = pathParts[pathParts.length - 1];
      
      lines.forEach((line, index) => {
        // Check if line contains the key we're looking for
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith(`"${lastKey}":`)) {
          lineNumbers.add(index);
        }
      });
      
      return lineNumbers;
    } catch {
      return lineNumbers;
    }
  };

  const getHighlightedLines = (side: 'left' | 'right', jsonStr: string): Set<number> => {
    const highlightedLines = new Set<number>();
    
    if (!showResults || !isLocked || !jsonStr) {
      return highlightedLines;
    }
    
    diffs.forEach(diff => {
      const lineNums = findLineRangeForPath(jsonStr, diff.path);
      lineNums.forEach(num => highlightedLines.add(num));
    });
    
    return highlightedLines;
  };

  const renderHighlightedJSON = (text: string, side: 'left' | 'right', ref: React.RefObject<HTMLDivElement>) => {
    if (!showResults || !isLocked || !text) return null;
    
    const highlightedLines = getHighlightedLines(side, text);
    const lines = text.split('\n');
    
    return (
      <div 
        ref={ref}
        className="absolute inset-0 p-3 font-mono text-sm pointer-events-none overflow-hidden" 
        style={{ lineHeight: '1.5rem' }}
      >
        {lines.map((line, lineIndex) => {
          const shouldHighlight = highlightedLines.has(lineIndex);
          
          return (
            <div key={lineIndex} style={{ lineHeight: '1.5rem' }}>
              {shouldHighlight ? (
                <span className="bg-yellow-300 text-black px-0.5 rounded">{line || '\u00A0'}</span>
              ) : (
                <span className="text-gray-700">{line || '\u00A0'}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const getDiffBorderColor = (type: string) => {
    switch (type) {
      case 'missing':
        return 'border-red-500';
      case 'type':
        return 'border-orange-500';
      case 'value':
        return 'border-yellow-500';
      default:
        return 'border-gray-400';
    }
  };

  const getDiffBgColor = (type: string) => {
    switch (type) {
      case 'missing':
        return 'bg-red-50';
      case 'type':
        return 'bg-orange-50';
      case 'value':
        return 'bg-yellow-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getLeftLineCount = () => {
    return leftJson.split('\n').filter(line => line.trim() !== '').length;
  };

  const getRightLineCount = () => {
    return rightJson.split('\n').filter(line => line.trim() !== '').length;
  };

  const getLeftValidStatus = () => {
    if (!leftJson.trim()) return { valid: null, message: '' };
    const validation = validateJSON(leftJson);
    return { valid: validation.valid, message: validation.error };
  };

  const getRightValidStatus = () => {
    if (!rightJson.trim()) return { valid: null, message: '' };
    const validation = validateJSON(rightJson);
    return { valid: validation.valid, message: validation.error };
  };

  const leftValidStatus = getLeftValidStatus();
  const rightValidStatus = getRightValidStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">JSON Diff Tool</h1>
          <p className="text-gray-600">Compare two JSON documents and find differences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left JSON Input */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-lg font-semibold text-gray-800">
                Left JSON
                {isLocked && (
                  <Lock className="inline-block w-4 h-4 ml-2 text-gray-500" />
                )}
              </label>
              
              <div className="flex gap-2">
                <span
                  title="Total non-empty lines"
                  className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 rounded-full transition-all duration-200 hover:bg-gray-200 hover:border-gray-300 hover:shadow-sm hover:scale-105 cursor-default"
                >
                  🧾 {getLeftLineCount()} {getLeftLineCount() === 1 ? 'line' : 'lines'}
                </span>

                <span
                  title={leftValidStatus.message || "JSON validation status"}
                  className={`px-2 py-0.5 text-xs font-medium border rounded-full transition-all duration-200 hover:shadow-sm hover:scale-105 cursor-default
                    ${
                      leftValidStatus.valid === null
                        ? "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 hover:border-gray-300"
                        : leftValidStatus.valid
                        ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300"
                        : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 hover:border-red-300"
                    }`}
                >
                  {leftValidStatus.valid === null ? "⏺️ No data" : leftValidStatus.valid ? "✅ Valid JSON" : "❌ Invalid JSON"}
                </span>

                {!isLocked && (
                  <label className="cursor-pointer px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full transition-all duration-200 hover:bg-blue-100 hover:border-blue-300 hover:shadow-sm hover:scale-105 flex items-center gap-1">
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => handleFileUpload(e, 'left')}
                      className="hidden"
                    />
                    📁 Upload
                  </label>
                )}
              </div>
            </div>

            <div className="relative">
              {isLocked && renderHighlightedJSON(leftJson, 'left', leftOverlayRef)}
              <textarea
                ref={leftTextareaRef}
                value={leftJson}
                onChange={(e) => setLeftJson(e.target.value)}
                placeholder='Enter your JSON here or upload a file...'
                readOnly={isLocked}
                className={`w-full h-96 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm placeholder-gray-400 shadow-sm transition-all duration-200 hover:shadow-md font-mono relative z-10 ${
                  isLocked ? 'bg-transparent text-transparent caret-transparent selection:bg-transparent' : 'bg-white text-black'
                }`}
                style={{ lineHeight: '1.5rem' }}
              />
            </div>
            {leftError && (
              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{leftError}</span>
              </div>
            )}
          </div>

          {/* Right JSON Input */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-lg font-semibold text-gray-800">
                Right JSON (Differences Highlighted)
                {isLocked && (
                  <Lock className="inline-block w-4 h-4 ml-2 text-gray-500" />
                )}
              </label>
              
              <div className="flex gap-2">
                <span
                  title="Total non-empty lines"
                  className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 rounded-full transition-all duration-200 hover:bg-gray-200 hover:border-gray-300 hover:shadow-sm hover:scale-105 cursor-default"
                >
                  🧾 {getRightLineCount()} {getRightLineCount() === 1 ? 'line' : 'lines'}
                </span>

                <span
                  title={rightValidStatus.message || "JSON validation status"}
                  className={`px-2 py-0.5 text-xs font-medium border rounded-full transition-all duration-200 hover:shadow-sm hover:scale-105 cursor-default
                    ${
                      rightValidStatus.valid === null
                        ? "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 hover:border-gray-300"
                        : rightValidStatus.valid
                        ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300"
                        : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 hover:border-red-300"
                    }`}
                >
                  {rightValidStatus.valid === null ? "⏺️ No data" : rightValidStatus.valid ? "✅ Valid JSON" : "❌ Invalid JSON"}
                </span>

                {!isLocked && (
                  <label className="cursor-pointer px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full transition-all duration-200 hover:bg-blue-100 hover:border-blue-300 hover:shadow-sm hover:scale-105 flex items-center gap-1">
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => handleFileUpload(e, 'right')}
                      className="hidden"
                    />
                    📁 Upload
                  </label>
                )}
              </div>
            </div>

            <div className="relative">
              {isLocked && renderHighlightedJSON(rightJson, 'right', rightOverlayRef)}
              <textarea
                ref={rightTextareaRef}
                value={rightJson}
                onChange={(e) => setRightJson(e.target.value)}
                placeholder='Enter your JSON here or upload a file...'
                readOnly={isLocked}
                className={`w-full h-96 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm placeholder-gray-400 shadow-sm transition-all duration-200 hover:shadow-md font-mono relative z-10 ${
                  isLocked ? 'bg-transparent text-transparent caret-transparent selection:bg-transparent' : 'bg-white text-black'
                }`}
                style={{ lineHeight: '1.5rem' }}
              />
            </div>
            {rightError && (
              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{rightError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3">
            {!isLocked ? (
              <>
                <button
                  onClick={handleCompare}
                  disabled={isComparing}
                  className="bg-blue-400 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl shadow-md transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isComparing ? 'Comparing...' : 'Compare JSON'}
                </button>
                <button
                  onClick={loadSampleData}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Load Sample
                </button>
                <button
                  onClick={handleReset}
                  className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear All
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEdit}
                  className="bg-green-400 hover:bg-green-500 text-white font-semibold px-8 py-3 rounded-xl shadow-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit JSON
                </button>
                <button
                  onClick={handleReset}
                  className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {/* Results Section */}
        {showResults && diffs.length === 0 && (
          <div className="rounded-2xl bg-white shadow-md p-6 border-t-4 border-green-500 text-center">
            <p className="text-xl font-semibold text-green-700">
              ✓ No differences found! The JSON objects are identical.
            </p>
          </div>
        )}

        {showResults && diffs.length > 0 && (
          <div className="rounded-2xl bg-white shadow-md p-4 border-t-4 border-blue-500 text-black">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Differences Found</h3>
                <span
                  title="Total differences detected"
                  className="px-2 py-0.5 text-xs font-medium rounded-full border transition-all duration-200 cursor-default bg-red-100 text-red-700 border-red-200 hover:bg-red-200 hover:border-red-300 hover:shadow-sm hover:scale-105"
                >
                  {diffs.length} {diffs.length === 1 ? 'difference' : 'differences'}
                </span>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {diffs.map((diff, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${getDiffBgColor(diff.type)} ${getDiffBorderColor(diff.type)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                      diff.type === 'missing' ? 'bg-red-200 text-red-800' :
                      diff.type === 'type' ? 'bg-orange-200 text-orange-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {diff.type.toUpperCase()}
                    </span>
                    <div className="font-semibold text-gray-800 text-sm">
                      <span className="font-mono text-xs text-blue-700">{diff.path}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    {diff.message}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Left Value:</span>
                      <pre className="text-xs mt-1 bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                        {JSON.stringify(diff.leftValue, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Right Value:</span>
                      <pre className="text-xs mt-1 bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                        {JSON.stringify(diff.rightValue, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JSONDiff;