import React, { useState } from 'react';

export default function CodeDropdown({ code, maxLinesShown = 20 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const lines = code.split('\n');
  const isLongCode = lines.length > maxLinesShown;
  const displayedCode = isExpanded ? code : lines.slice(0, maxLinesShown).join('\n');
  
  return (
    <div className="w-full">
      <div className="relative">
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
          {displayedCode}
          {isLongCode && !isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none rounded-b-lg"></div>
          )}
        </pre>
      </div>
      
      {isLongCode && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 px-4 py-2 bg-gray-800 text-gray-100 hover:bg-gray-700 rounded font-medium text-sm transition flex items-center gap-2"
        >
          {isExpanded ? (
            <>
              <span>▼</span>
              Hide Code ({lines.length} lines)
            </>
          ) : (
            <>
              <span>▶</span>
              Show All Code ({lines.length} lines)
            </>
          )}
        </button>
      )}
      
      {!isLongCode && (
        <p className="mt-2 text-xs text-gray-500">
          {lines.length} line{lines.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

