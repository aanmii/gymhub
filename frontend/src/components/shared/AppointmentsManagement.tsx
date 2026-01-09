import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import type { AppointmentResponse, CreateAppointmentRequest, GymServiceResponse, Location } from '../../types';

interface AppointmentsManagementProps {
  locationId?: number;
  canCreate?: boolean;
  canEdit?: boolean;
}

export const AppointmentsManagement = ({ 
  locationId, 
  canCreate = true, 
  canEdit = true 
}: AppointmentsManagementProps) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [services, setServices] = useState<GymServiceResponse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentResponse | null>(null);
  const [formData, setFormData] = useState<CreateAppointmentRequest>({
    startTime: '',
    endTime: '',
    locationId: locationId || user?.locationId || 0,
    gymServiceId: 0,
    maxCapacity: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterView, setFilterView] = useState<'all' | 'upcoming' | 'available'>('upcoming');

  useEffect(() => {
    fetchAppointments();
    fetchServices();
    if (!locationId) {
      fetchLocations();
    }
  }, [locationId, filterView]);

  const fetchAppointments = async () => {
    try {
      let endpoint = '/appointments';
      
      if (locationId) {
        if (filterView === 'upcoming') {
          endpoint = `/appointments/location/${locationId}/upcoming`;
        } else {
          endpoint = `/appointments/location/${locationId}`;
        }
      } else if (filterView === 'available') {
        endpoint = '/appointments/available';
      } else if (filterView === 'upcoming') {
        endpoint = locationId ? `/appointments/location/${locationId}/upcoming` : '/appointments';
      }

      const response = await api.get<AppointmentResponse[]>(endpoint);
      setAppointments(response.data);
    } catch (err: any) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const endpoint = locationId ? `/services/location/${locationId}` : '/services';
      const response = await api.get<GymServiceResponse[]>(endpoint);
      setServices(response.data.filter(s => s.active));
    } catch (err: any) {
      console.error('Failed to fetch services:', err);
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
      if (editingAppointment) {
        await api.put(`/appointments/${editingAppointment.id}`, formData);
        setSuccess('Appointment updated successfully! 🎉');
      } else {
        await api.post('/appointments', formData);
        setSuccess('Appointment created successfully! 🎉');
      }
      
      setFormData({
        startTime: '',
        endTime: '',
        locationId: locationId || user?.locationId || 0,
        gymServiceId: 0,
        maxCapacity: 10,
      });
      setShowForm(false);
      setEditingAppointment(null);
      fetchAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment: AppointmentResponse) => {
    setEditingAppointment(appointment);
    setFormData({
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      locationId: appointment.locationId,
      gymServiceId: appointment.gymServiceId,
      maxCapacity: appointment.maxCapacity,
    });
    setShowForm(true);
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await api.delete(`/appointments/${id}`);
      setSuccess('Appointment cancelled successfully!');
      fetchAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxCapacity' || name === 'locationId' || name === 'gymServiceId' 
        ? Number(value) 
        : value,
    }));
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCapacityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Appointments ({appointments.length})
        </h3>

        <div className="flex items-center gap-4">
          {/* Filter Buttons */}
          <div className="glass rounded-xl p-1 inline-flex">
            {(['all', 'upcoming', 'available'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setFilterView(view)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filterView === view
                    ? 'bg-purple-500/30 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>

          {canCreate && (
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingAppointment(null);
                setFormData({
                  startTime: '',
                  endTime: '',
                  locationId: locationId || user?.locationId || 0,
                  gymServiceId: 0,
                  maxCapacity: 10,
                });
              }}
              className="gradient-primary px-4 py-2 rounded-xl text-white font-semibold shadow-lg hover:scale-[1.02] transition-all"
            >
              {showForm ? 'Cancel' : '+ New Appointment'}
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
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

      {/* Create/Edit Form */}
      {showForm && (
        <div className="glass rounded-2xl p-8">
          <h4 className="text-xl font-bold text-white mb-6">
            {editingAppointment ? 'Edit Appointment' : 'Create New Appointment'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.startTime}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.endTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {!locationId && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Location
                  </label>
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

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Service
                </label>
                <select
                  name="gymServiceId"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.gymServiceId}
                  onChange={handleChange}
                >
                  <option value="">Select Service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id} className="bg-slate-900">
                      {service.name} (€{service.price})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Max Capacity
              </label>
              <input
                type="number"
                name="maxCapacity"
                required
                min="1"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.maxCapacity}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary py-3 px-4 rounded-xl text-white font-semibold shadow-lg hover:scale-[1.02] disabled:opacity-50 transition-all"
            >
              {loading ? 'Saving...' : editingAppointment ? 'Update Appointment' : 'Create Appointment'}
            </button>
          </form>
        </div>
      )}

      {/* Appointments List */}
      <div className="glass rounded-2xl p-8">
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-400">No appointments yet. Create your first one! 📅</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="glass-dark rounded-xl p-6 card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">{appointment.serviceName}</h4>
                    <p className="text-sm text-gray-400">{appointment.locationName}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      appointment.currentParticipants >= appointment.maxCapacity
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-green-500/20 text-green-300 border border-green-500/30'
                    }`}
                  >
                    {appointment.currentParticipants >= appointment.maxCapacity ? 'Full' : 'Available'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-300 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDateTime(appointment.startTime)}
                  </p>
                  <p className="text-sm text-gray-300 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className={getCapacityColor(appointment.currentParticipants, appointment.maxCapacity)}>
                      {appointment.currentParticipants} / {appointment.maxCapacity} participants
                    </span>
                  </p>
                </div>

                {canEdit && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="flex-1 px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 border border-purple-500/30 transition-all text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="flex-1 px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 border border-red-500/30 transition-all text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};