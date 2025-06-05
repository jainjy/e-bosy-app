import React from 'react';
import { ClockIcon, UserGroupIcon, StarIcon } from '@heroicons/react/24/outline';

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500">
        {/* Placeholder for image */}
        No Image
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800">{course.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{course.description}</p>
        <p className="text-sm text-gray-500 mt-2">Par {course.teacher}</p>
        <div className="flex items-center text-gray-500 text-sm mt-3 space-x-4">
          <div className="flex items-center space-x-1">
            <ClockIcon className="h-4 w-4" />
            <span>{course.duration} heures</span>
          </div>
          <div className="flex items-center space-x-1">
            <UserGroupIcon className="h-4 w-4" />
            <span>{course.students}</span>
          </div>
          <div className="flex items-center space-x-1">
            <StarIcon className="h-4 w-4 text-yellow-500" />
            <span>{course.rating}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-e-bosy-purple text-xl font-bold">{course.price}€</span>
          <button className="bg-e-bosy-purple text-white px-4 py-2 rounded-md hover:bg-purple-700">
            Voir le cours
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;