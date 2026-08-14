
'use client';

import React, { useState } from 'react';

export default function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex items-center ml-1"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span
        tabIndex={0}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="flex items-center justify-center w-4 h-4 text-[10px] font-bold text-gray-500 bg-gray-200 rounded-full cursor-help select-none"
      >
        ?
      </span>

      {show && (
        <span className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg">
          {text}
          {/* little arrow */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </span>
      )}
    </span>
  );
}