import React from 'react';

const ActivityHeatmap = ({ data }) => {
  const activities = data?.activities || [];
  const maxValue = Math.max(...activities.map(a => a.coursesActive), 1);

  return (
    <div className="overflow-x-auto">
      <div className="flex">
        <div className="flex flex-col justify-between mr-1 text-xs text-gray-500">
          <span>Plus</span>
          <span className="mt-auto">Moins</span>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {activities.map((activity, index) => {
            const intensity = activity.coursesActive > 0 
              ? Math.min(4, Math.ceil((activity.coursesActive / maxValue) * 4)) 
              : 0;
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
                data-tip={`${activity.coursesActive} cours actif(s) le ${new Date(activity.date).toLocaleDateString()}`}
              ></div>
            );
          })}
        </div>
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>Il y a 7 jours</span>
        <span>Aujourd'hui</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;