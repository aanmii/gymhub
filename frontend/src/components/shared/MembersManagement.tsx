import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import type { Location, RegisterRequest, UserResponse } from '../../types';
import { Role } from '../../types';

interface MembersManagementProps {
  locationId?: number;
  canCreate?: boolean;
}

export const MembersManagement = ({ 
  locationId, 
  canCreate = true 
}: MembersManagementProps) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<UserResponse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<RegisterRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: Role.MEMBER,
    locationId: locationId || user?.locationId,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMembers();
    if (!locationId) {
      fetchLocations();
    }
  }, [locationId]);

  const fetchMembers = async () => {
    try {
      const endpoint = locationId ? `/members/location/${locationId}` : '/members';
      const response = await api.get(endpoint);
      const membersArray: UserResponse[] = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.data)
        ? response.data.data
        : [];
      const membersWithLocation = membersArray.map(m => ({
        ...m,
        locationName: m.locationName || locations.find(l => l.id === m.locationId)?.name || ''
      }));
      setMembers(membersWithLocation);
    } catch (err: any) {
      console.error('Failed to fetch members:', err);
      setMembers([]);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await api.get<Location[]>('/locations');
      setLocations(response.data);
    } catch (err: any) {
      console.error('Failed to fetch locations:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/members', { ...formData, role: Role.MEMBER });
      setSuccess('Member created successfully! 🎉');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: Role.MEMBER,
        locationId: locationId || user?.locationId,
      });
      setShowForm(false);
      fetchMembers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create member');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'locationId' ? Number(value) : value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Members ({members.length})
        </h3>
        {canCreate && (
          <button
            onClick={() => {
              setShowForm(!showForm);
              setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                phone: '',
                role: Role.MEMBER,
                locationId: locationId || user?.locationId,
              });
            }}
            className="gradient-primary px-4 py-2 rounded-xl text-white font-semibold shadow-lg hover:scale-[1.02] transition-all"
          >
            {showForm ? 'Cancel' : '+ New Member'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-sm text-red-200">{error}</div>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-sm text-green-200">{success}</div>
        </div>
      )}

      {showForm && (
        <div className="glass rounded-2xl p-8">
          <h4 className="text-xl font-bold text-white mb-6">Create New Member</h4>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Phone (optional)</label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="+123456789"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {!locationId && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Location</label>
                  <select
                    name="locationId"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.locationId}
                    onChange={handleChange}
                  >
                    <option value="">Select Location</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id} className="bg-slate-900">
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary py-3 px-4 rounded-xl text-white font-semibold shadow-lg hover:scale-[1.02] disabled:opacity-50 transition-all"
            >
              {loading ? 'Creating...' : 'Create Member'}
            </button>
          </form>
        </div>
      )}

      <div className="glass rounded-2xl p-8">
        {members.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-gray-400">No members yet. Create your first one! 👥</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div key={member.id} className="glass-dark rounded-xl p-6 card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center font-bold text-white shadow-lg">
                      {member.firstName[0]}{member.lastName[0]}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{member.firstName} {member.lastName}</h4>
                      <p className="text-sm text-gray-400">{member.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {member.phone && (
                    <p className="text-sm text-gray-300 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {member.phone}
                    </p>
                  )}

                  {member.locationName && (
                    <p className="text-sm text-gray-300 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {member.locationName}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className={`px-2 py-1 rounded-full ${member.active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      {member.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
