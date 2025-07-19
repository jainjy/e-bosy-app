import React from 'react';

const EngagementHeatmap = ({ data }) => {
  const activities = data?.activities || [];
  const maxSessionCount = Math.max(...activities.map(a => a.sessionCount), 1);
  const maxStudentActivity = Math.max(...activities.map(a => a.studentActivityCount), 1);

  return (
    <div className="overflow-x-auto">
      <div className="flex">
        <div className="flex flex-col justify-between mr-1 text-xs text-gray-500">
          <span>Élevé</span>
          <span className="mt-auto">Faible</span>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {activities.map((activity, index) => {
            const intensity = Math.max(
              activity.sessionCount > 0 ? Math.min(4, Math.ceil((activity.sessionCount / maxSessionCount) * 4)) : 0,
              activity.studentActivityCount > 0 ? Math.min(4, Math.ceil((activity.studentActivityCount / maxStudentActivity) * 4)) : 0
            );
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
                data-tip={`${activity.sessionCount} session(s), ${activity.studentActivityCount} activité(s) étudiante(s) le ${new Date(activity.date).toLocaleDateString()}`}
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

export default EngagementHeatmap;