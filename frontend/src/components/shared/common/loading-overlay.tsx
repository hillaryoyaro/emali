
// components/LoadingOverlay.tsx
import React from "react";

type LoadingOverlayProps = {
  show: boolean;
  text?: string;
};

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ show, text }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-4 rounded shadow-md flex flex-col items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
        {text && <p className="text-gray-700">{text}</p>}
      </div>
    </div>
  );
};

export default LoadingOverlay;

