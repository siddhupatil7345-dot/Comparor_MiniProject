import React, { useState } from 'react';
import { AlertCircle, FileJson, RotateCcw } from 'lucide-react';

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
  };

  const loadSampleData = () => {
    setLeftJson(sampleData.left);
    setRightJson(sampleData.right);
    setShowResults(false);
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

  const isLineHighlighted = (line: string, side: 'left' | 'right'): { highlighted: boolean; type: string } => {
    for (const diff of diffs) {
      const pathParts = diff.path.split(/[.\[\]]/).filter(Boolean);
      
      for (const part of pathParts) {
        if (line.includes(`"${part}"`)) {
          const value = side === 'left' ? diff.leftValue : diff.rightValue;
          if (value !== undefined) {
            const valueStr = JSON.stringify(value);
            if (line.includes(valueStr)) {
              return { highlighted: true, type: diff.type };
            }
          }
          return { highlighted: true, type: diff.type };
        }
      }
    }
    return { highlighted: false, type: '' };
  };

  const renderHighlightedJSON = (jsonText: string, side: 'left' | 'right') => {
    if (!jsonText || !showResults) return null;

    const lines = jsonText.split('\n');
    
    return (
      <div className="absolute inset-0 pointer-events-none font-mono text-sm leading-6 whitespace-pre overflow-hidden">
        {lines.map((line, index) => {
          const { highlighted, type } = isLineHighlighted(line, side);
          
          const bgColor = highlighted 
            ? type === 'missing' 
              ? 'bg-green-200/60' 
              : type === 'type'
              ? 'bg-green-300/70'
              : 'bg-green-200/60'
            : '';

          return (
            <div key={index} className={`${bgColor} px-4 leading-6`}>
              {line || '\u00A0'}
            </div>
          );
        })}
      </div>
    );
  };

  const getDiffBorderColor = (type: string) => {
    switch (type) {
      case 'missing':
        return 'border-green-500';
      case 'type':
        return 'border-green-600';
      case 'value':
        return 'border-green-400';
      default:
        return 'border-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileJson className="w-12 h-12 text-blue-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JSON Diff Tool
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Compare two JSON documents and find semantic differences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-lg font-semibold text-gray-700">Left JSON</label>
                <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => handleFileUpload(e, 'left')}
                    className="hidden"
                  />
                  <FileJson className="w-4 h-4" />
                  Upload File
                </label>
              </div>
              <div className="relative">
                {renderHighlightedJSON(leftJson, 'left')}
                <textarea
                  value={leftJson}
                  onChange={(e) => setLeftJson(e.target.value)}
                  placeholder='Enter your JSON here or upload a file...'
                  className="w-full h-96 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none text-black bg-transparent relative z-10"
                  style={{ lineHeight: '1.5rem' }}
                />
              </div>
              {leftError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{leftError}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-lg font-semibold text-gray-700">Right JSON</label>
                <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => handleFileUpload(e, 'right')}
                    className="hidden"
                  />
                  <FileJson className="w-4 h-4" />
                  Upload File
                </label>
              </div>
              <div className="relative">
                {renderHighlightedJSON(rightJson, 'right')}
                <textarea
                  value={rightJson}
                  onChange={(e) => setRightJson(e.target.value)}
                  placeholder='Enter your JSON here or upload a file...'
                  className="w-full h-96 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none text-black bg-transparent relative z-10"
                  style={{ lineHeight: '1.5rem' }}
                />
              </div>
              {rightError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{rightError}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleCompare}
              disabled={isComparing}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isComparing ? 'Comparing...' : 'Compare JSON'}
            </button>
            <button
              onClick={loadSampleData}
              className="px-6 py-3 bg-gray-100 text-gray-700 text-lg font-semibold rounded-lg hover:bg-gray-200 transition-all"
            >
              Load Sample Data
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-red-100 text-red-700 text-lg font-semibold rounded-lg hover:bg-red-200 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Clear All
            </button>
          </div>

          {showResults && diffs.length === 0 && (
            <div className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-xl text-center">
              <p className="text-xl font-semibold text-green-700">
                ✓ No differences found! The JSON objects are identical.
              </p>
            </div>
          )}

          {showResults && diffs.length > 0 && (
            <div className="mt-8">
              <div className="bg-white text-black rounded-xl shadow-lg p-6 border-2 border-green-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  <span className="text-green-600">{diffs.length}</span> Difference{diffs.length !== 1 ? 's' : ''} Found
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {diffs.map((diff, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 bg-green-50 ${getDiffBorderColor(diff.type)}`}>
                      <div className="font-semibold text-gray-800 mb-1">
                        Path: <span className="font-mono text-sm text-green-700">{diff.path}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {diff.message}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-semibold text-gray-500">Left Value:</span>
                          <pre className="text-xs mt-1 bg-white p-2 rounded border border-gray-200">
                            {JSON.stringify(diff.leftValue, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500">Right Value:</span>
                          <pre className="text-xs mt-1 bg-white p-2 rounded border border-gray-200">
                            {JSON.stringify(diff.rightValue, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Features</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Semantic comparison (not just text diff)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Detects type mismatches
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Finds missing properties
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Array comparison
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                File upload support
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Inline green highlighting
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JSONDiff;