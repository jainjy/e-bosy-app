import React from 'react';

const ProgressRadial = ({ value, label, color, icon }) => {
  const validValue = Math.min(100, Math.max(0, value));
  const strokeDasharray = 2 * Math.PI * 40;
  const strokeDashoffset = strokeDasharray * (1 - validValue / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-gray-400 mb-1">
            {icon}
          </div>
          <span className="text-xl font-bold" style={{ color }}>
            {Math.round(validValue)}%
          </span>
        </div>
      </div>
      <p className="mt-2 text-center text-gray-600 text-sm">{label}</p>
    </div>
  );
};

export default ProgressRadial;