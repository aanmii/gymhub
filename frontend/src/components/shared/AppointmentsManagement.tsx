import { useCallback, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import api from '../../services/api';
import type { AppointmentResponse, CreateAppointmentRequest, GymServiceResponse, Location } from '../../types';
import { formatDateTimeEU, getCapacityColor, normalizeAppointments } from '../../utils/appointmentMapper';

interface AppointmentsManagementProps {
  locationId?: number;
  canCreate?: boolean;
  canEdit?: boolean;
}

export const AppointmentsManagement = ({
  locationId,
  canCreate = true,
  canEdit = true,
}: AppointmentsManagementProps) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [services, setServices] = useState<GymServiceResponse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentResponse | null>(null);

  const [formData, setFormData] = useState<CreateAppointmentRequest & {
    date: Date | null;
    startTimeObj: Date | null;
    endTimeObj: Date | null;
  }>({
    startTime: '',
    endTime: '',
    locationId: locationId || user?.locationId || 0,
    gymServiceId: 0,
    maxCapacity: 10,
    date: null,
    startTimeObj: null,
    endTimeObj: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterView] = useState<'all' | 'upcoming' | 'available'>('upcoming');

  
  const handleAppointmentUpdate = useCallback((update: {
    appointmentId: number;
    currentParticipants: number;
    maxCapacity: number;
    eventType: string;
  }) => {
    console.log('🔄 Employee view - Real-time update received:', update);

    setAppointments(prev =>
      prev.map(apt =>
        apt.id === update.appointmentId
          ? {
              ...apt,
              currentBookings: update.currentParticipants,
              maxCapacity: update.maxCapacity,
              availableSpots: update.maxCapacity - update.currentParticipants,
              isFull: update.currentParticipants >= update.maxCapacity,
            }
          : apt
      )
    );
  }, []);

  const { connected } = useWebSocket(handleAppointmentUpdate);

  useEffect(() => {
    fetchAppointments();
    fetchServices();
    if (!locationId) fetchLocations();
  }, [locationId, filterView]);

  const fetchAppointments = useCallback(async () => {
    try {
      let endpoint = '/appointments';
      if (locationId) {
        endpoint = filterView === 'upcoming'
          ? `/appointments/location/${locationId}/upcoming`
          : `/appointments/location/${locationId}`;
      } else if (filterView === 'available') {
        endpoint = '/appointments/available';
      }

      const response = await api.get<AppointmentResponse[]>(endpoint);
      setAppointments(normalizeAppointments(response.data));
    } catch (err: any) {
      console.error('Failed to fetch appointments:', err);
      setError('Failed to load appointments');
    }
  }, [locationId, filterView]);

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

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const handleStartTimeChange = (time: Date | null) => {
    setFormData(prev => ({ ...prev, startTimeObj: time }));
    // Resetuj end time ako je pre novog start time
    if (time && formData.endTimeObj && formData.endTimeObj <= time) {
      setFormData(prev => ({ ...prev, endTimeObj: null }));
    }
  };

  const handleEndTimeChange = (time: Date | null) => {
    setFormData(prev => ({ ...prev, endTimeObj: time }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.date || !formData.startTimeObj || !formData.endTimeObj) {
      setError('Date and time must be selected');
      setLoading(false);
      return;
    }

    if (formData.endTimeObj <= formData.startTimeObj) {
      setError('End time must be after start time');
      setLoading(false);
      return;
    }

    const year = formData.date.getFullYear();
    const month = String(formData.date.getMonth() + 1).padStart(2, '0');
    const day = String(formData.date.getDate()).padStart(2, '0');
    const startHour = String(formData.startTimeObj.getHours()).padStart(2, '0');
    const startMinute = String(formData.startTimeObj.getMinutes()).padStart(2, '0');
    const endHour = String(formData.endTimeObj.getHours()).padStart(2, '0');
    const endMinute = String(formData.endTimeObj.getMinutes()).padStart(2, '0');

    const payload: CreateAppointmentRequest = {
      startTime: `${year}-${month}-${day}T${startHour}:${startMinute}:00`,
      endTime: `${year}-${month}-${day}T${endHour}:${endMinute}:00`,
      locationId: formData.locationId,
      gymServiceId: formData.gymServiceId,
      maxCapacity: formData.maxCapacity,
    };

    try {
      if (editingAppointment) {
        await api.put(`/appointments/${editingAppointment.id}`, payload);
        setSuccess('Appointment updated successfully! 🎉');
      } else {
        await api.post('/appointments', payload);
        setSuccess('Appointment created successfully! 🎉');
      }

      resetForm();
      fetchAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      startTime: '',
      endTime: '',
      locationId: locationId || user?.locationId || 0,
      gymServiceId: 0,
      maxCapacity: 10,
      date: null,
      startTimeObj: null,
      endTimeObj: null,
    });
    setShowForm(false);
    setEditingAppointment(null);
  };

  const handleEdit = (appointment: AppointmentResponse) => {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);

    setEditingAppointment(appointment);
    setFormData({
      locationId: appointment.locationId,
      gymServiceId: appointment.gymServiceId,
      maxCapacity: appointment.maxCapacity,
      date: start,
      startTimeObj: start,
      endTimeObj: end,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
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

  const formatDateTimeEUHelper = (dateTimeString: string) => {
    return formatDateTimeEU(dateTimeString);
  };

  const getCapacityColorHelper = (current: number, max: number) => {
    return getCapacityColor(current, max);
  };

  const today = new Date();
  const minStartTime = new Date(today);
  minStartTime.setHours(6,0,0,0);
  const maxTime = new Date(today);
  maxTime.setHours(23,0,0,0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Appointments ({appointments.length})
          {connected && (
            <span className="ml-3 flex items-center">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="ml-2 text-xs text-green-400">Live</span>
            </span>
          )}
        </h3>

        <div className="flex items-center gap-4">
          {canCreate && (
            <button
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setShowForm(true);
                }
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
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Date</label>
                <DatePicker
                  selected={formData.date}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholderText="dd/mm/yyyy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Start Time</label>
                <DatePicker
                  selected={formData.startTimeObj}
                  onChange={handleStartTimeChange}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  timeCaption="Time"
                  dateFormat="HH:mm"
                  minTime={minStartTime}
                  maxTime={maxTime}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">End Time</label>
                <DatePicker
                  selected={formData.endTimeObj}
                  onChange={handleEndTimeChange}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  timeCaption="Time"
                  dateFormat="HH:mm"
                  minTime={formData.startTimeObj ? new Date(formData.startTimeObj.getTime() + 30*60000) : minStartTime}
                  maxTime={maxTime}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {!locationId && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Location</label>
                  <select
                    name="locationId"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.locationId}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, locationId: Number(e.target.value) }))
                    }
                  >
                    <option value="">Select Location</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id} className="bg-slate-900">
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Service</label>
                <select
                  name="gymServiceId"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.gymServiceId}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, gymServiceId: Number(e.target.value) }))
                  }
                >
                  <option value="">Select Service</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id} className="bg-slate-900">
                      {service.name} (€{service.price})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Max Capacity</label>
              <input
                type="number"
                name="maxCapacity"
                required
                min="1"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.maxCapacity}
                onChange={e =>
                  setFormData(prev => ({ ...prev, maxCapacity: Number(e.target.value) }))
                }
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
            {appointments.map(appointment => (
              <div key={appointment.id} className="glass-dark rounded-xl p-6 card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">{appointment.gymServiceName}</h4>
                    <p className="text-sm text-gray-400">{appointment.locationName}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    appointment.isFull
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-green-500/20 text-green-300 border border-green-500/30'
                  }`}>
                    {appointment.isFull ? 'Full' : 'Available'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-300 flex items-center">
                    {formatDateTimeEUHelper(appointment.startTime)}
                  </p>
                  <p className="text-sm text-gray-300 flex items-center">
                    <span className={getCapacityColorHelper(appointment.currentBookings || 0, appointment.maxCapacity)}>
                      {appointment.currentBookings || 0} / {appointment.maxCapacity} participants
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