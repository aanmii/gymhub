import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import api from '../../services/api';
import type { AppointmentResponse } from '../../types';
import { getCapacityColor, normalizeAppointments } from '../../utils/appointmentMapper';

export const BrowseAppointments = () => {
  const { user: _user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bookingLoading, setBookingLoading] = useState<number | null>(null);
  const [userCredits, setUserCredits] = useState<Map<number, number>>(new Map());

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<AppointmentResponse[]>('/appointments/available');
      setAppointments(normalizeAppointments(response.data));

      const creditsMap = new Map<number, number>();
      for (const apt of response.data) {
        try {
          const creditResponse = await api.get<{ availableCredits: number }>(
            `/payments/credits/${apt.gymServiceId}`
          );
          creditsMap.set(apt.gymServiceId, creditResponse.data.availableCredits);
        } catch (err) {
          creditsMap.set(apt.gymServiceId, 0);
        }
      }
      setUserCredits(creditsMap);
    } catch (err: any) {
      console.error('Failed to fetch appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAppointmentUpdate = useCallback((update: {
    appointmentId: number;
    currentParticipants: number;
    maxCapacity: number;
    eventType: string;
  }) => {
    console.log('🔄 Real-time update received:', update);

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
  }, [fetchAppointments]);

  const handleBook = async (appointment: AppointmentResponse) => {
    const credits = userCredits.get(appointment.gymServiceId) || 0;

    if (credits <= 0) {
      setError('You need to purchase credits for this service first!');
      setTimeout(() => setError(''), 5000);
      return;
    }

    setBookingLoading(appointment.id);
    setError('');
    setSuccess('');

    try {
      await api.post('/bookings', { appointmentId: appointment.id });

      setSuccess(`Successfully booked ${appointment.gymServiceName}! 🎉`);

 
      try {
        const creditResponse = await api.get<{ availableCredits: number }>(
          `/payments/credits/${appointment.gymServiceId}`
        );
        setUserCredits(prev => new Map(prev).set(appointment.gymServiceId, creditResponse.data.availableCredits));
      } catch (err) {
        console.error('Failed to refresh credits:', err);
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment');
      setTimeout(() => setError(''), 5000);
    } finally {
      setBookingLoading(null);
    }
  };


  const getCapacityColorHelper = (current: number, max: number) => {
    return getCapacityColor(current, max);
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Available Appointments ({appointments.length})
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

      {appointments.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-400">No available appointments at the moment. Check back later!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {appointments.map((appointment) => {
            const credits = userCredits.get(appointment.gymServiceId) || 0;
            const isFull = appointment.isFull === true;
            const canBook = credits > 0 && !isFull;
            const isBooking = bookingLoading === appointment.id;

            return (
              <div
                key={appointment.id}
                className="glass-dark rounded-2xl p-6 card-hover transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1">{appointment.gymServiceName}</h4>
                    <p className="text-sm text-gray-400 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {appointment.locationName}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                      isFull
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-green-500/20 text-green-300 border border-green-500/30'
                    }`}
                  >
                    {isFull ? 'Full' : 'Available'}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <p className="text-sm text-gray-300 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {appointment.startTime}
                  </p>
                  <p className="text-sm text-gray-300 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className={getCapacityColorHelper(appointment.currentBookings || 0, appointment.maxCapacity)}>
                      {appointment.currentBookings || 0} / {appointment.maxCapacity} spots taken
                    </span>
                  </p>
                  <p className="text-sm text-gray-300 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Your credits: <span className="font-bold text-white ml-1">{credits}</span>
                  </p>
                </div>

                <button
                  onClick={() => handleBook(appointment)}
                  disabled={!canBook || isBooking}
                  className="w-full gradient-primary py-3 px-4 rounded-xl text-white font-semibold shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isBooking ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Booking...
                    </span>
                  ) : isFull ? (
                    'Full - Cannot Book'
                  ) : !credits ? (
                    'No Credits - Purchase First'
                  ) : (
                    'Book This Appointment'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};