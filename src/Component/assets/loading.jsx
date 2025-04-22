import React from "react";

export const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center space-x-1">
      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      <div
        className="w-2 h-2 bg-white rounded-full animate-pulse"
        style={{ animationDelay: "0.2s" }}
      ></div>
      <div
        className="w-2 h-2 bg-white rounded-full animate-pulse"
        style={{ animationDelay: "0.4s" }}
      ></div>
    </div>
  );
};

export const LoadingSmall = () => {
  return (
    <div className="flex justify-center items-center my-6">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-blue-400 rounded-full loading-dot"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full loading-dot"></div>
        <div className="w-3 h-3 bg-blue-600 rounded-full loading-dot"></div>
      </div>
    </div>
  );
};

export const LoadingBig = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full"></div>
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin absolute top-0 left-0"></div>
        <div className="mt-6 text-center text-blue-700">Loading...</div>
      </div>
    </div>
  );
};
