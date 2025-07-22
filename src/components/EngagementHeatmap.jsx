import React from 'react';

const EngagementHeatmap = ({ data }) => {
  const hourlyEngagement = data?.hourlyEngagement || [];
  const maxActivityCount = Math.max(...hourlyEngagement.map(h => h.activityCount), 1);

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col">
        <div className="flex">
          <div className="flex flex-col justify-between mr-1 text-xs text-gray-500">
            <span>Élevé</span>
            <span className="mt-auto">Faible</span>
          </div>
          <div className="grid grid-cols-24 gap-1">
            {hourlyEngagement.map((hour, index) => {
              const intensity = hour.activityCount > 0 
                ? Math.min(4, Math.ceil((hour.activityCount / maxActivityCount) * 4)) 
                : 0;
              const bgClass = [
                'bg-gray-100',
                'bg-green-100',
                'bg-green-300',
                'bg-green-500',
                'bg-green-700'
              ][intensity];
              
              return (
                <div 
                  key={index} 
                  className={`w-3 h-3 rounded-sm ${bgClass} tooltip`}
                  data-tip={`${hour.activityCount} activités à ${hour.hour}h`}
                ></div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>0h</span>
          <span>23h</span>
        </div>
      </div>
    </div>
  );
};

export default EngagementHeatmap;