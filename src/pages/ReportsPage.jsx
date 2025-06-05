import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, PlusIcon, FunnelIcon } from '@heroicons/react/24/outline'; // Assuming you have these icons
import DashboardLayout from '../layouts/DashboardLayout'; // Assuming ReportsPage is used within DashboardLayout

const ReportsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPriority, setSelectedPriority] = useState('All Priorities');

  // Dummy data for reports
  const allReports = [
    {
      id: 1,
      title: 'Cannot access video content',
      description: "I'm unable to play videos in the React Frontend Development course. The video player shows an error message saying 'Failed to load video'.",
      status: 'in-progress', // Standardized status
      priority: 'high',
      reportedBy: 'John Doe', // Changed to a name
      date: 'Jun 14, 2023',
      category: 'Technical Issue'
    },
    {
      id: 2,
      title: 'Billing issue with course purchase',
      description: 'I was charged twice for the Python Data Science course. The duplicate transaction ID is PRD-87654321.',
      status: 'open',
      priority: 'critical',
      reportedBy: 'Jane Smith',
      date: 'Jun 12, 2023',
      category: 'Billing Issue'
    },
    {
      id: 3,
      title: 'Course material outdated',
      description: 'The JavaScript Fundamentals course uses deprecated methods that no longer work in recent browser versions.',
      status: 'resolved',
      priority: 'medium',
      reportedBy: 'Alice Brown',
      date: 'Jun 10, 2023',
      category: 'Content Issue'
    },
    {
      id: 4,
      title: 'Login issues on mobile',
      description: 'Unable to log in using my mobile phone. Works fine on desktop.',
      status: 'open',
      priority: 'medium',
      reportedBy: 'Bob Johnson',
      date: 'Jun 15, 2023',
      category: 'Technical Issue'
    },
    {
      id: 5,
      title: 'Missing course resources',
      description: 'Some downloadable resources for the Mobile App Development course are missing.',
      status: 'open',
      priority: 'low',
      reportedBy: 'Charlie Green',
      date: 'Jun 13, 2023',
      category: 'Content Issue'
    }
  ];

  const filteredReports = allReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All Statuses' || report.status === selectedStatus.toLowerCase().replace(' ', '-');
    const matchesCategory = selectedCategory === 'All Categories' || report.category === selectedCategory;
    const matchesPriority = selectedPriority === 'All Priorities' || report.priority === selectedPriority.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColorClass = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  return (
    // Assuming this component is rendered within DashboardLayout
    // The DashboardLayout already handles padding for the fixed sidebar.
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Report Issues</h1>
          <p className="text-gray-600">Report problems or request assistance with courses and platform</p>
        </div>
        <button className="bg-e-bosy-purple text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-purple-700">
          <PlusIcon className="h-5 w-5" />
          <span>New Report</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex items-center mb-4 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports..."
            className="w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:ring-e-bosy-purple focus:border-e-bosy-purple"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* You could make this filter icon open a modal or toggle filter visibility if filters were hidden */}
          {/* <FunnelIcon className="ml-3 h-5 w-5 text-gray-400 cursor-pointer hover:text-e-bosy-purple" /> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <select
            className="w-full rounded-md border-gray-300 py-2 px-3 focus:ring-e-bosy-purple focus:border-e-bosy-purple"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option>All Statuses</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>

          {/* Category Filter */}
          <select
            className="w-full rounded-md border-gray-300 py-2 px-3 focus:ring-e-bosy-purple focus:border-e-bosy-purple"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option>All Categories</option>
            <option>Technical Issue</option>
            <option>Billing Issue</option>
            <option>Content Issue</option>
            {/* Add more categories as needed */}
          </select>

          {/* Priority Filter */}
          <select
            className="w-full rounded-md border-gray-300 py-2 px-3 focus:ring-e-bosy-purple focus:border-e-bosy-purple"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option>All Priorities</option>
            <option>High</option>
            <option>Critical</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length > 0 ? (
          filteredReports.map(report => (
            <div key={report.id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-lg font-semibold text-gray-800">{report.title}</h4>
                <div className="flex space-x-2">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColorClass(report.status)}`}>
                    {report.status.replace('-', ' ')} {/* Display status nicely */}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getPriorityColorClass(report.priority)}`}>
                    {report.priority}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 text-sm mb-3">{report.description}</p>
              <p className="text-gray-500 text-xs">
                Reported by {report.reportedBy} • {report.date}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600 text-lg py-10">No reports found matching your criteria.</p>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;