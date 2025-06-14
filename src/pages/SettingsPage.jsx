import React, { useState } from 'react';
import { UserCircleIcon, KeyIcon, BellAlertIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'account', 'notifications', 'preferences'

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Parametres</h2>
      <p className="text-gray-600 mb-8">Manage your account settings and preferences.</p>

      <div className="flex space-x-6 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 flex items-center space-x-2 ${activeTab === 'profile' ? 'text-e-bosy-purple border-b-2 border-e-bosy-purple font-semibold' : 'text-gray-600 hover:text-e-bosy-purple'}`}
        >
          <UserCircleIcon className="h-5 w-5" />
          <span>Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`px-4 py-2 flex items-center space-x-2 ${activeTab === 'account' ? 'text-e-bosy-purple border-b-2 border-e-bosy-purple font-semibold' : 'text-gray-600 hover:text-e-bosy-purple'}`}
        >
          <KeyIcon className="h-5 w-5" />
          <span>Account</span>
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 flex items-center space-x-2 ${activeTab === 'notifications' ? 'text-e-bosy-purple border-b-2 border-e-bosy-purple font-semibold' : 'text-gray-600 hover:text-e-bosy-purple'}`}
        >
          <BellAlertIcon className="h-5 w-5" />
          <span>Notifications</span>
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 flex items-center space-x-2 ${activeTab === 'preferences' ? 'text-e-bosy-purple border-b-2 border-e-bosy-purple font-semibold' : 'text-gray-600 hover:text-e-bosy-purple'}`}
        >
          <Cog6ToothIcon className="h-5 w-5" />
          <span>Preferences</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'profile' && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Profile Information</h3>
            <p className="text-gray-600 mb-6">Update your personal information</p>

            <div className="flex items-center space-x-6 mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-3xl font-semibold text-gray-600">
                JD
              </div>
              <div>
                <button className="text-e-bosy-purple hover:underline mb-2">Upload Image</button>
                <button className="text-red-500 hover:underline">Remove</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  defaultValue="John"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-e-bosy-purple focus:border-e-bosy-purple"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  defaultValue="Doe"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-e-bosy-purple focus:border-e-bosy-purple"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  defaultValue="john.doe@example.com"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-e-bosy-purple focus:border-e-bosy-purple"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  id="username"
                  defaultValue="johndoe"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-e-bosy-purple focus:border-e-bosy-purple"
                />
                <p className="mt-2 text-sm text-gray-500">Your username will be displayed on your certificates and in discussion forums.</p>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button className="bg-e-bosy-purple text-white px-6 py-2 rounded-md hover:bg-purple-700">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Account Security</h3>
            <p className="text-gray-600 mb-6">Manage your password and security settings</p>

            <div className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-e-bosy-purple focus:border-e-bosy-purple"
                  placeholder="Enter your current password"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-e-bosy-purple focus:border-e-bosy-purple"
                  placeholder="Enter your new password"
                />
                <p className="mt-2 text-sm text-gray-500">Password must be at least 8 characters long.</p>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-e-bosy-purple focus:border-e-bosy-purple"
                  placeholder="Confirm your new password"
                />
              </div>
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700">Status: <span className="font-medium">Disabled</span></p>
                    <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account.</p>
                  </div>
                  <button className="bg-e-bosy-purple text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button className="bg-e-bosy-purple text-white px-6 py-2 rounded-md hover:bg-purple-700">
                Update Password
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Notification Preferences</h3>
            <p className="text-gray-600 mb-6">Configure how you receive notifications</p>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Email Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-medium">Course updates</p>
                      <p className="text-sm text-gray-500">Receive notifications about course updates and new content</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-e-bosy-purple/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-e-bosy-purple"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-medium">Assignment deadlines</p>
                      <p className="text-sm text-gray-500">Get reminders about upcoming assignment deadlines</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-e-bosy-purple/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-e-bosy-purple"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-medium">Discussion replies</p>
                      <p className="text-sm text-gray-500">Notify me when someone replies to my discussions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-e-bosy-purple/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-e-bosy-purple"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Push Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-medium">Important announcements</p>
                      <p className="text-sm text-gray-500">Receive urgent notifications from instructors</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-e-bosy-purple/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-e-bosy-purple"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-medium">Course recommendations</p>
                      <p className="text-sm text-gray-500">Get personalized course suggestions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-e-bosy-purple/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-e-bosy-purple"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Notification Frequency</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input id="frequency-daily" name="frequency" type="radio" className="h-4 w-4 border-gray-300 text-e-bosy-purple focus:ring-e-bosy-purple" defaultChecked />
                    <label htmlFor="frequency-daily" className="ml-3 block text-sm font-medium text-gray-700">
                      Daily digest
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input id="frequency-weekly" name="frequency" type="radio" className="h-4 w-4 border-gray-300 text-e-bosy-purple focus:ring-e-bosy-purple" />
                    <label htmlFor="frequency-weekly" className="ml-3 block text-sm font-medium text-gray-700">
                      Weekly summary
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input id="frequency-real" name="frequency" type="radio" className="h-4 w-4 border-gray-300 text-e-bosy-purple focus:ring-e-bosy-purple" />
                    <label htmlFor="frequency-real" className="ml-3 block text-sm font-medium text-gray-700">
                      Real-time
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button className="bg-e-bosy-purple text-white px-6 py-2 rounded-md hover:bg-purple-700">
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">General Preferences</h3>
            <p className="text-gray-600 mb-6">Customize your application experience</p>

            <div className="space-y-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Language & Region</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700">Language</label>
                    <select
                      id="language"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-e-bosy-purple focus:border-e-bosy-purple"
                      defaultValue="en"
                    >
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">Timezone</label>
                    <select
                      id="timezone"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-e-bosy-purple focus:border-e-bosy-purple"
                      defaultValue="UTC+1"
                    >
                      <option value="UTC-5">UTC-5 (Eastern Time)</option>
                      <option value="UTC-6">UTC-6 (Central Time)</option>
                      <option value="UTC-7">UTC-7 (Mountain Time)</option>
                      <option value="UTC-8">UTC-8 (Pacific Time)</option>
                      <option value="UTC+0">UTC+0 (London)</option>
                      <option value="UTC+1">UTC+1 (Paris, Berlin)</option>
                      <option value="UTC+2">UTC+2 (Cairo)</option>
                      <option value="UTC+8">UTC+8 (Beijing)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Display Preferences</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-medium">Dark Mode</p>
                      <p className="text-sm text-gray-500">Switch between light and dark theme</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-e-bosy-purple/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-e-bosy-purple"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-medium">Font Size</p>
                      <p className="text-sm text-gray-500">Adjust the text size for better readability</p>
                    </div>
                    <select
                      className="mt-1 block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-e-bosy-purple focus:border-e-bosy-purple"
                      defaultValue="medium"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Data & Privacy</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-medium">Data Collection</p>
                      <p className="text-sm text-gray-500">Allow us to collect anonymous usage data</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-e-bosy-purple/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-e-bosy-purple"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 font-medium">Personalized Ads</p>
                      <p className="text-sm text-gray-500">Show ads based on your interests</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-e-bosy-purple/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-e-bosy-purple"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button className="bg-e-bosy-purple text-white px-6 py-2 rounded-md hover:bg-purple-700">
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;