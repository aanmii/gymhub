import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { BookingResponse } from '../../types';

export const MyBookings = () => {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get<BookingResponse[]>('/bookings/my');
      setBookings(response.data);
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Your credit will be refunded.')) {
      return;
    }

    setCancellingId(bookingId);
    setError('');
    setSuccess('');

    try {
      await api.delete(`/bookings/${bookingId}`);
      setSuccess('Booking cancelled successfully! Your credit has been refunded. 🎉');
      await fetchBookings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
      setTimeout(() => setError(''), 5000);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          My Bookings ({bookings.length})
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

      {bookings.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p className="text-gray-400 mb-2">You haven't booked any appointments yet.</p>
          <p className="text-sm text-gray-500">Head to "Book Appointments" to get started!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {bookings.map((booking) => {
            const isCancelling = cancellingId === booking.id;
            const canCancel = booking.status.toLowerCase() === 'confirmed';

            return (
              <div
                key={booking.id}
                className="glass-dark rounded-2xl p-6 card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-white mb-1">
                      {booking.appointmentDetails}
                    </h4>
                    <p className="text-sm text-gray-400">Booking ID: {booking.id}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <p className="text-sm text-gray-300 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Booked: {formatDateTime(booking.bookingTime)}
                  </p>
                  <p className="text-sm text-gray-300 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Booked by: {booking.userName}
                  </p>
                </div>

                {canCancel && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    disabled={isCancelling}
                    className="w-full px-4 py-3 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 border border-red-500/30 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCancelling ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cancelling...
                      </span>
                    ) : (
                      'Cancel Booking'
                    )}
                  </button>
                )}

                {!canCancel && (
                  <div className="w-full px-4 py-3 bg-gray-500/20 text-gray-400 rounded-xl border border-gray-500/30 text-center text-sm">
                    Cannot cancel {booking.status.toLowerCase()} booking
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};