import React from 'react';

const ActivityHeatmap = ({ data }) => {
  // Structure de données par défaut
  const defaultData = {
    last30Days: Array(30).fill(0),
    days: ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  };

  const activityData = data || defaultData;
  const maxValue = Math.max(...activityData.last30Days, 1);

  return (
    <div className="overflow-x-auto">
      <div className="flex">
        <div className="flex flex-col justify-between mr-1 text-xs text-gray-500">
          <span>Plus</span>
          <span className="mt-auto">Moins</span>
        </div>
        
        <div className="grid grid-cols-30 gap-1">
          {activityData.last30Days.map((value, index) => {
            const intensity = value > 0 ? Math.min(4, Math.ceil((value / maxValue) * 4)) : 0;
            const bgClass = [
              'bg-gray-100',
              'bg-blue-100',
              'bg-blue-300',
              'bg-blue-500',
              'bg-blue-700'
            ][intensity];
            
            return (
              <div 
                key={index} 
                className={`w-3 h-3 rounded-sm ${bgClass} tooltip`}
                data-tip={`${value} min le ${activityData.days[index % 7]}`}
              ></div>
            );
          })}
        </div>
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>Il y a 30 jours</span>
        <span>Aujourd'hui</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;