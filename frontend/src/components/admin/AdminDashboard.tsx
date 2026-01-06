import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CreateLocation } from './CreateLocation';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'locations' | 'employees'>('locations');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome back, {user?.firstName} {user?.lastName}
            </p>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Tab Navigation */}
            <div className="px-4 sm:px-0">
              <div className="sm:hidden">
                <select
                  className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as 'locations' | 'employees')}
                >
                  <option value="locations">Locations</option>
                  <option value="employees">Employees</option>
                </select>
              </div>
              <div className="hidden sm:block">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab('locations')}
                      className={`${
                        activeTab === 'locations'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                    >
                      Locations
                    </button>
                    <button
                      onClick={() => setActiveTab('employees')}
                      className={`${
                        activeTab === 'employees'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                    >
                      Employees
                    </button>
                  </nav>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="mt-8">
              {activeTab === 'locations' && <CreateLocation />}
              {activeTab === 'employees' && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900">Employee Management</h3>
                  <p className="mt-2 text-sm text-gray-500">Coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};