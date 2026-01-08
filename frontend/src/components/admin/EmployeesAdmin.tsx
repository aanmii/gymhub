import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { CreateEmployeeRequest, EmployeeResponse, Location } from '../../types';

export const EmployeesAdmin = () => {
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState<CreateEmployeeRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    locationId: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

 
  useEffect(() => {
    fetchEmployees();
    fetchLocations();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get<EmployeeResponse[]>('/admin/employees');
      setEmployees(res.data);
    } catch (err: any) {
      console.error('Failed to fetch employees', err);
      setError('Failed to fetch employees');
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get<Location[]>('/locations');
      setLocations(res.data);
    } catch (err: any) {
      console.error('Failed to fetch locations', err);
      setError('Failed to fetch locations');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'locationId' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.locationId) {
      setError('Please select a location');
      setLoading(false);
      return;
    }

    try {
      // Always send role: 'EMPLOYEE'
      await api.post<EmployeeResponse>('/admin/employees', { ...formData, role: 'EMPLOYEE' });
      setSuccess('Employee created successfully! 🎉');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        locationId: undefined,
      });
      fetchEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* CREATE EMPLOYEE FORM */}
      <div className="glass rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="w-6 h-6 mr-2 text-purple-400">👤</span>
          Create New Employee
        </h3>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-sm text-red-200">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-sm text-green-200">{success}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid md:grid-cols-1 gap-4">
            <select
              name="locationId"
              value={formData.locationId || ''}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Location</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary py-3 rounded-xl text-white font-semibold shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {loading ? 'Creating...' : 'Create Employee'}
          </button>
        </form>
      </div>

      {/* EMPLOYEES LIST */}
      <div className="glass rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="w-6 h-6 mr-2 text-pink-400">👥</span>
          Existing Employees ({employees.length})
        </h3>

        {employees.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No employees yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {employees.map((emp) => (
              <div key={emp.id} className="glass-dark rounded-xl p-6 card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">
                      {emp.firstName} {emp.lastName}
                    </h4>
                    <p className="text-sm text-gray-400">{emp.email}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      emp.active
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {emp.active ? '✓ Active' : '✗ Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Location: {emp.locationName || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
