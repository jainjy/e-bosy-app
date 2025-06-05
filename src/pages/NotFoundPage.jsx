import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl p-8 md:p-12 text-center">
        <div className="absolute top-[-1rem] left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-e-bosy-purple text-white text-2xl font-bold flex items-center justify-center">
          404
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mt-6 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          We couldn't find the page you were looking for. The page might have
          been moved or deleted.
        </p>
        <Link
          to="/"
          className="bg-e-bosy-purple text-white py-2 px-6 rounded-md hover:bg-purple-700 flex items-center gap-2 mx-auto"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
