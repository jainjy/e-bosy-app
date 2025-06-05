import React from 'react';
import { 
  UsersIcon, 
  BookOpenIcon, 
  CurrencyDollarIcon, 
  ComputerDesktopIcon, 
  DocumentTextIcon, 
  Cog6ToothIcon, 
  PlusIcon 
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const AdminOverviewPage = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back! Here's an overview of your platform.</p>

      {/* Tabs */}
      <div className="mb-8">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">Select a tab</label>
          <select id="tabs" name="tabs" className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-e-bosy-purple focus:outline-none focus:ring-e-bosy-purple sm:text-sm">
            <option>Overview</option>
            <option>Users</option>
            <option>Courses</option>
            <option>System</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <a href="#" className="border-b-2 border-e-bosy-purple px-1 py-4 text-sm font-medium text-e-bosy-purple">Overview</a>
            <a href="#" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium">Users</a>
            <a href="#" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium">Courses</a>
            <a href="#" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium">System</a>
          </nav>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-lg shadow flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">2,834</p>
            <p className="text-sm text-green-500 mt-1">
              <span className="inline-block transform rotate-45 mr-1">↑</span> +12.5% from last month
            </p>
          </div>
          <UsersIcon className="h-8 w-8 text-gray-400" />
        </div>

        {/* Active Courses */}
        <div className="bg-white p-6 rounded-lg shadow flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm">Active Courses</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">147</p>
            <p className="text-sm text-green-500 mt-1">
              <span className="inline-block transform rotate-45 mr-1">↑</span> +4.3% from last month
            </p>
          </div>
          <BookOpenIcon className="h-8 w-8 text-gray-400" />
        </div>

        {/* Revenue */}
        <div className="bg-white p-6 rounded-lg shadow flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm">Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">$28,419</p>
            <p className="text-sm text-green-500 mt-1">
              <span className="inline-block transform rotate-45 mr-1">↑</span> +8.2% from last month
            </p>
          </div>
          <CurrencyDollarIcon className="h-8 w-8 text-gray-400" />
        </div>

        {/* System Health */}
        <div className="bg-white p-6 rounded-lg shadow flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm">System Health</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">98.7%</p>
            <p className="text-sm text-red-500 mt-1">
              <span className="inline-block transform rotate-135 mr-1">↓</span> -0.3% from last month
            </p>
          </div>
          <ComputerDesktopIcon className="h-8 w-8 text-gray-400" />
        </div>
      </div>

      {/* User Statistics & Course Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">User Statistics</h3>
          <div className="mb-4">
            <p className="text-gray-600 mb-2">Active Users</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-e-bosy-purple h-2.5 rounded-full" style={{ width: '76%' }}></div>
            </div>
            <span className="text-sm text-gray-500 float-right">76%</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center mt-6">
            <div>
              <p className="text-xl font-bold text-gray-900">2834</p>
              <p className="text-gray-500 text-sm">Total Users</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">187</p>
              <p className="text-gray-500 text-sm">New This Month</p>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-gray-600 mb-2">User Distribution</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Students: 2451</span>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Teachers: 312</span>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Admins: 71</span>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link to="/dashboard/users" className="text-e-bosy-purple hover:underline text-sm">View All Users</Link>
          </div>
        </div>

        {/* Course Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Statistics</h3>
          <div className="mb-4">
            <p className="text-gray-600 mb-2">Active Courses</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-e-bosy-purple h-2.5 rounded-full" style={{ width: '92%' }}></div>
            </div>
            <span className="text-sm text-gray-500 float-right">92%</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center mt-6">
            <div>
              <p className="text-xl font-bold text-gray-900">147</p>
              <p className="text-gray-500 text-sm">Total</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">8</p>
              <p className="text-gray-500 text-sm">Pending</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">4</p>
              <p className="text-gray-500 text-sm">Drafts</p>
            </div>
          </div>
          <div className="mt-6">
            <h4 className="text-gray-600 mb-2">Popular Courses</h4>
            <ul className="space-y-2 text-sm text-gray-800">
              <li className="flex justify-between items-center">Web Development Bootcamp <span>485 students</span></li>
              <li className="flex justify-between items-center">Python for Data Science <span>412 students</span></li>
              <li className="flex justify-between items-center">Mobile App Development <span>378 students</span></li>
            </ul>
          </div>
          <div className="mt-6 text-center">
            <Link to="/dashboard/courses" className="text-e-bosy-purple hover:underline text-sm">View All Courses</Link>
          </div>
        </div>
      </div>

      {/* Recent Issues & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Issues */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Issues</h3>
          <div className="space-y-4">
            {/* Issue 1 */}
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-800 font-medium">Video playback failing on iOS devices</span>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">High</span>
              </div>
              <p className="text-gray-600 text-sm">
                <span className="text-e-bosy-purple mr-1">•</span> Open <span className="mx-1">•</span> 2 hours ago
              </p>
            </div>
            {/* Issue 2 */}
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-800 font-medium">Payment gateway timeout</span>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">Critical</span>
              </div>
              <p className="text-gray-600 text-sm">
                <span className="text-e-bosy-purple mr-1">•</span> In Progress <span className="mx-1">•</span> 5 hours ago
              </p>
            </div>
            {/* Issue 3 */}
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-800 font-medium">Certificate generation error</span>
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-0.5 rounded-full">Medium</span>
              </div>
              <p className="text-gray-600 text-sm">
                <span className="text-e-bosy-purple mr-1">•</span> Open <span className="mx-1">•</span> 12 hours ago
              </p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link to="/dashboard/reports" className="text-e-bosy-purple hover:underline text-sm">View All Issues</Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/dashboard/users" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
              <UsersIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
              <span className="text-gray-700 text-sm">Add User</span>
            </Link>
            <Link to="/dashboard/courses" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
              <BookOpenIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
              <span className="text-gray-700 text-sm">Add Course</span>
            </Link>
            <Link to="/dashboard/reports" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
              <DocumentTextIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
              <span className="text-gray-700 text-sm">View Reports</span>
            </Link>
            <Link to="/dashboard/settings" className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-200">
              <Cog6ToothIcon className="h-6 w-6 text-e-bosy-purple mb-2" />
              <span className="text-gray-700 text-sm">Settings</span>
            </Link>
          </div>
          <div className="mt-6">
            <button className="w-full flex items-center justify-center bg-e-bosy-purple text-white py-3 rounded-md hover:bg-purple-700">
              <span className="mr-2">📈</span>
              <span>System Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;