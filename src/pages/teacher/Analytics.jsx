import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts"; // Assuming you have react-apexcharts installed
import { BookOpenIcon } from '@heroicons/react/24/outline';
const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    averageRating: 0,
    completionRate: 0,
    monthlyRevenue: [],
    coursePerformance: [],
    studentDemographics: {
      topCountries: [],
      ageGroups: [],
      experienceLevels: [],
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // In a real application, you'd fetch the teacher's ID from authentication context
  const teacherId = "current_teacher_id_from_auth"; // Placeholder

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        // Replace with actual API calls to your backend
        // const response = await fetch(`/api/teacher/${teacherId}/analytics`);
        // const data = await response.json();

        // Mock data for demonstration, based on your images
        const mockData = {
          totalRevenue: 24360,
          totalStudents: 1248,
          averageRating: 4.8,
          completionRate: 63.5,
          monthlyRevenue: [
            { month: "Jan", revenue: 1200 },
            { month: "Feb", revenue: 1500 },
            { month: "Mar", revenue: 1650 },
            { month: "Apr", revenue: 1800 },
            { month: "May", revenue: 1750 },
            { month: "Jun", revenue: 1900 },
            { month: "Jul", revenue: 1850 },
            { month: "Aug", revenue: 2100 },
            { month: "Sep", revenue: 2300 },
            { month: "Oct", revenue: 2400 },
            { month: "Nov", revenue: 2700 },
            { month: "Dec", revenue: 2500 }, // Example, adjust to match image trend
          ],
          coursePerformance: [
            {
              title: "Advanced JavaScript for Developers",
              students: 485,
              revenue: 14550,
              rating: 4.8,
              status: "Popular", // Custom field for UI
            },
            {
              title: "React Frontend Masterclass",
              students: 312,
              revenue: 9810,
              rating: 4.9,
              status: "Trending", // Custom field for UI
            },
            {
              title: "Vue.js for Beginners",
              students: null, // No students yet
              revenue: null,
              rating: null,
              status: "Draft", // Custom field for UI
              completion: 65, // Example completion rate for draft/in-progress
              launchEstimate: "3 weeks",
            },
          ],
          studentDemographics: {
            topCountries: [
              { country: "United States", percentage: 42 },
              { country: "India", percentage: 18 },
              { country: "United Kingdom", percentage: 8 },
              { country: "Canada", percentage: 7 },
              { country: "Germany", percentage: 6 },
            ],
            ageGroups: [
              { range: "18-24", percentage: 23 },
              { range: "25-34", percentage: 45 },
              { range: "35-44", percentage: 22 },
              { range: "45-54", percentage: 7 },
              { range: "55+", percentage: 3 },
            ],
            experienceLevels: [
              { level: "Beginner", percentage: 35 },
              { level: "Intermediate", percentage: 48 },
              { level: "Advanced", percentage: 17 },
            ],
          },
        };

        setAnalyticsData(mockData); // In a real app, use 'data' from API
      } catch (err) {
        setError("Failed to fetch analytics data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [teacherId]);

  if (loading) return <div className="p-4">Loading analytics...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  // ApexCharts options and series for Revenue Overview
  const revenueChartOptions = {
    chart: {
      id: "monthly-revenue-chart",
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: analyticsData.monthlyRevenue.map((data) => data.month),
    },
    yaxis: {
      min: 1200, // Based on image's y-axis starting point
      max: 2700, // Based on image's y-axis ending point
      tickAmount: 5,
      labels: {
        formatter: function (value) {
          return "$" + value;
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#6366F1"], // A purple-like color
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 100],
        colorStops: [
            {
                offset: 0,
                color: "#6366F1", // Start color of the gradient
                opacity: 0.7
            },
            {
                offset: 100,
                color: "#EDE9FE", // End color of the gradient (lighter purple/almost white)
                opacity: 0.1
            }
        ]
      }
    },
    grid: {
      show: true,
      borderColor: '#f2f2f2',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    tooltip: {
        y: {
            formatter: function (val) {
                return "$" + val
            }
        }
    }
  };

  const revenueChartSeries = [
    {
      name: "Revenue",
      data: analyticsData.monthlyRevenue.map((data) => data.revenue),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Course Analytics</h1>
      <p className="text-gray-600 mb-8">Track the performance of your courses and student engagement.</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-800">${analyticsData.totalRevenue.toLocaleString()}</p>
            <p className="text-green-500 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              +12.5% <span className="text-gray-500 ml-1">from last month</span>
            </p>
          </div>
          <span className="text-gray-400 text-3xl font-semibold">$</span>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Total Students</p>
            <p className="text-3xl font-bold text-gray-800">{analyticsData.totalStudents.toLocaleString()}</p>
            <p className="text-green-500 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              +8.3% <span className="text-gray-500 ml-1">from last month</span>
            </p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h2a2 2 0 002-2V8a2 2 0 00-2-2h-2M4 18h2a2 2 0 002-2V8a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 002 2h2m-5-11V3l-3 3m0 0l-3-3" />
          </svg>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Average Rating</p>
            <p className="text-3xl font-bold text-gray-800">{analyticsData.averageRating}/5</p>
            <p className="text-green-500 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              +0.2 <span className="text-gray-500 ml-1">from last month</span>
            </p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.565-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Completion Rate</p>
            <p className="text-3xl font-bold text-gray-800">{analyticsData.completionRate}%</p>
            <p className="text-red-500 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              -2.1% <span className="text-gray-500 ml-1">from last month</span>
            </p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs for Revenue, Enrollments, Ratings, Engagement */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex border-b border-gray-200 mb-4">
          <button className="px-4 py-2 text-e-bosy-purple border-b-2 border-e-bosy-purple font-medium">Revenue</button>
          <button className="px-4 py-2 text-gray-600 hover:text-e-bosy-purple">Enrollments</button>
          <button className="px-4 py-2 text-gray-600 hover:text-e-bosy-purple">Ratings</button>
          <button className="px-4 py-2 text-gray-600 hover:text-e-bosy-purple">Engagement</button>
        </div>

        {/* Revenue Overview Chart */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenue Overview</h2>
        <p className="text-gray-600 mb-4">Monthly revenue for your courses</p>
        <div className="h-80"> {/* Set a height for the chart container */}
          <Chart options={revenueChartOptions} series={revenueChartSeries} type="area" height="100%" />
        </div>
      </div>

      {/* Course Performance and Student Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Performance */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Course Performance</h2>
          <p className="text-gray-600 mb-4">How your courses are performing</p>
          <div className="space-y-4">
            {analyticsData.coursePerformance.map((course, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 flex items-center">
                    <BookOpenIcon className="h-5 w-5 mr-2 text-e-bosy-purple" />
                    {course.title}
                    {course.status && (
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                        course.status === "Popular" ? "bg-green-100 text-green-800" :
                        course.status === "Trending" ? "bg-purple-100 text-purple-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {course.status}
                      </span>
                    )}
                  </h3>
                  <div className="mt-2 text-sm text-gray-600 flex items-center space-x-4">
                    {course.students !== null && (
                        <span>Students: <span className="font-semibold">{course.students}</span></span>
                    )}
                    {course.revenue !== null && (
                        <span>Revenue: <span className="font-semibold">${course.revenue.toLocaleString()}</span></span>
                    )}
                    {course.rating !== null && (
                        <span className="flex items-center">Rating: <span className="font-semibold ml-1">{course.rating}/5</span> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 ml-1" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.565-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" /></svg></span>
                    )}
                    {course.status === "Draft" && (
                        <>
                            <span>Completion: <span className="font-semibold">{course.completion}%</span></span>
                            <span>Status: <span className="font-semibold">{course.status}</span></span>
                            <span>Launch: <span className="font-semibold">{course.launchEstimate}</span></span>
                        </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Demographics */}
        <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Student Demographics</h2>
                <p className="text-gray-600 mb-4">Where your students are from</p>
                <div className="space-y-4">
                    {/* Top Countries */}
                    <div>
                        <h3 className="font-medium text-gray-700 mb-2">Top Countries</h3>
                        <ul className="space-y-1">
                            {analyticsData.studentDemographics.topCountries.map((data, index) => (
                                <li key={index} className="flex justify-between items-center text-sm text-gray-600">
                                    <span>{data.country}</span>
                                    <span className="font-semibold">{data.percentage}%</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Age Groups */}
                    <div>
                        <h3 className="font-medium text-gray-700 mb-2">Age Groups</h3>
                        <ul className="space-y-1">
                            {analyticsData.studentDemographics.ageGroups.map((data, index) => (
                                <li key={index} className="flex justify-between items-center text-sm text-gray-600">
                                    <span>{data.range}</span>
                                    <span className="font-semibold">{data.percentage}%</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Student Experience Level */}
                    <div>
                        <h3 className="font-medium text-gray-700 mb-2">Student Experience Level</h3>
                        <ul className="space-y-1">
                            {analyticsData.studentDemographics.experienceLevels.map((data, index) => (
                                <li key={index} className="text-sm text-gray-600">
                                    <div className="flex justify-between mb-1">
                                        <span>{data.level}</span>
                                        <span className="font-semibold">{data.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-e-bosy-purple h-2.5 rounded-full"
                                            style={{ width: `${data.percentage}%` }}
                                        ></div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;