import React from 'react';

const PlatformHealthCard = ({ title, value, status, icon }) => {
  const getStatusColor = () => {
    if (status === 'excellent') return 'bg-green-100 text-green-800';
    if (status === 'good') return 'bg-blue-100 text-blue-800';
    if (status === 'warning') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = () => {
    if (status === 'excellent') return 'Excellent';
    if (status === 'good') return 'Bon';
    if (status === 'warning') return 'Attention';
    return 'Critique';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-800">{title}</h3>
        <span className={`text-xs px-2 py-1 rounded ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      <div className="mt-4 flex items-end">
        <span className="text-3xl font-bold text-gray-900">{value}%</span>
        <div className="ml-4 text-gray-400">
          {icon}
        </div>
      </div>
      
      <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${
            value >= 80 ? 'bg-green-500' : 
            value >= 60 ? 'bg-blue-500' : 
            value >= 40 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
};

export default PlatformHealthCard;