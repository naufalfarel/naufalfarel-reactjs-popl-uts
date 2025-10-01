import React from "react";

const BackgroundPattern = () => {
  return (
    <div className="absolute inset-0 -z-10 flex justify-center items-center h-screen overflow-hidden">
      <svg
        className="w-full h-full flex-none stroke-red-600 opacity-20 animate-pulse"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="pattern"
            width="200"
            height="200"
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 200V.5H200" fill="none"></path>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pattern)" />
      </svg>
    </div>
  );
};

export default BackgroundPattern;
