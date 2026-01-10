import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AppointmentsManagement } from '../shared/AppointmentsManagement';
import { BookingsManagement } from '../shared/BookingsManagement';
import { MembersManagement } from '../shared/MembersManagement';
import { ServicesManagement } from '../shared/ServicesManagement';

type Tab = 'bookings' | 'appointments' | 'services' | 'members';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('bookings');

  const tabs: { id: Tab; name: string; icon: string }[] = [
    { id: 'bookings', name: 'Bookings', icon: '📋' },
    { id: 'appointments', name: 'Appointments', icon: '📅' },
    { id: 'services', name: 'Services', icon: '🏋️' },
    { id: 'members', name: 'Members', icon: '👥' },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Employee Dashboard
              </h1>
              <p className="text-gray-400">
                Managing: <span className="text-purple-400 font-semibold">{user?.locationName}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Your Location</p>
                <h3 className="text-2xl font-bold text-white">{user?.locationName}</h3>
              </div>
              <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Your Role</p>
                <h3 className="text-2xl font-bold text-white">Employee</h3>
              </div>
              <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Quick Actions</p>
                <h3 className="text-lg font-bold text-white">Manage</h3>
              </div>
              <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass rounded-2xl p-2 mb-8 inline-flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'gradient-primary text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === 'bookings' && (
            <BookingsManagement locationId={user?.locationId} />
          )}
          {activeTab === 'services' && (
            <ServicesManagement 
              locationId={user?.locationId} 
              canCreate={true}
              canEdit={true}
            />
          )}
          {activeTab === 'appointments' && (
            <AppointmentsManagement 
              locationId={user?.locationId}
              canCreate={true}
              canEdit={true}
            />
          )}
          {activeTab === 'members' && (
            <MembersManagement 
              locationId={user?.locationId}
              canCreate={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};