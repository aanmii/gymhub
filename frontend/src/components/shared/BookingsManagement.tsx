import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { AppointmentResponse, BookingResponse } from '../../types';

interface BookingsManagementProps {
  locationId?: number;
}

export const BookingsManagement = ({ locationId }: BookingsManagementProps) => {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CONFIRMED' | 'CANCELLED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [locationId]);

  useEffect(() => {
    if (selectedAppointment) {
      fetchBookingsForAppointment(selectedAppointment);
    }
  }, [selectedAppointment]);

  const fetchAppointments = async () => {
    try {
      const endpoint = locationId 
        ? `/appointments/location/${locationId}/upcoming`
        : '/appointments';
      
      const response = await api.get<AppointmentResponse[]>(endpoint);
      setAppointments(response.data);
      if (response.data.length > 0) {
        setSelectedAppointment(response.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      setAppointments([]);
    }
  };

  const fetchBookingsForAppointment = async (appointmentId: number) => {
    setLoading(true);
    try {
      const response = await api.get<BookingResponse[]>(`/bookings/appointment/${appointmentId}`);
      setBookings(response.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking? The credit will be returned to the member.')) {
      return;
    }

    try {
      await api.delete(`/bookings/${bookingId}`);
      
      if (selectedAppointment) {
        fetchBookingsForAppointment(selectedAppointment);
      }
      
      alert('Booking cancelled successfully!');
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const selectedAppointmentData = appointments.find(a => a.id === selectedAppointment);
  
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'ALL' || booking.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      (booking.memberName && booking.memberName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const confirmedCount = bookings.filter(b => b.status === 'CONFIRMED').length;
  const cancelledCount = bookings.filter(b => b.status === 'CANCELLED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">📋 Bookings Management</h2>
        <p className="text-gray-400">Track and manage appointment reservations</p>
      </div>

      {/* Appointment Selector */}
      <div className="glass rounded-2xl p-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Select Appointment
        </label>
        <select
          value={selectedAppointment || ''}
          onChange={(e) => setSelectedAppointment(Number(e.target.value))}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {appointments.map((apt) => (
            <option key={apt.id} value={apt.id} className="bg-gray-900">
              {new Date(apt.startTime).toLocaleString()} - {apt.gymServiceName} ({apt.locationName})
            </option>
          ))}
        </select>

        {/* Appointment Details */}
        {selectedAppointmentData && (
          <div className="mt-4 grid md:grid-cols-4 gap-4">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <p className="text-xs text-purple-300 mb-1">Service</p>
              <p className="text-lg font-bold text-white">{selectedAppointmentData.gymServiceName}</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-xs text-blue-300 mb-1">Max Capacity</p>
              <p className="text-lg font-bold text-white">{selectedAppointmentData.maxCapacity}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <p className="text-xs text-green-300 mb-1">Confirmed</p>
              <p className="text-lg font-bold text-white">{confirmedCount}</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
              <p className="text-xs text-orange-300 mb-1">Available Spots</p>
              <p className="text-lg font-bold text-white">
                {selectedAppointmentData.maxCapacity - confirmedCount}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-6">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filter by Status
            </label>
            <div className="flex space-x-2">
              {(['ALL', 'CONFIRMED', 'CANCELLED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterStatus === status
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Member
            </label>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <span className="text-gray-400">
            Total: <span className="text-white font-semibold">{bookings.length}</span>
          </span>
          <span className="text-gray-400">
            Confirmed: <span className="text-green-400 font-semibold">{confirmedCount}</span>
          </span>
          <span className="text-gray-400">
            Cancelled: <span className="text-red-400 font-semibold">{cancelledCount}</span>
          </span>
          <span className="text-gray-400">
            Showing: <span className="text-purple-400 font-semibold">{filteredBookings.length}</span>
          </span>
        </div>
      </div>

      {/* Bookings List */}
      <div className="glass rounded-2xl p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="text-gray-400 mt-4">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-400 text-lg">No bookings found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {booking.memberName ? booking.memberName.charAt(0).toUpperCase() : 'M'}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{booking.memberName || 'Unknown Member'}</h3>
                        <p className="text-sm text-gray-400">{booking.locationName}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">Service:</span>
                        <span className="text-white ml-2 font-medium">{booking.serviceName}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Booked At:</span>
                        <span className="text-white ml-2 font-medium">
                          {new Date(booking.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded-lg font-medium ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
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