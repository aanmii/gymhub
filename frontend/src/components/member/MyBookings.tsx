import { useEffect, useState } from 'react';
import api from '../../services/api';

export interface BookingResponse {
  id: number;
  appointmentId: number;
  appointmentStartTime: string;
  appointmentEndTime: string;
  serviceName: string;
  locationName: string;
  memberId: number;
  memberName?: string;
  status: string;
  createdAt: string;
  cancelledAt?: string;
}

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
    if (!window.confirm('Are you sure you want to cancel this booking? Your credit will be refunded.')) return;

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
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return 'N/A';

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
      <h3 className="text-2xl font-bold text-white">
        My Bookings ({bookings.length})
      </h3>

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
        <p className="text-gray-400">You haven't booked any appointments yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {bookings.map((booking) => {
            const isCancelling = cancellingId === booking.id;
            const canCancel = booking.status.toLowerCase() === 'confirmed';

            return (
              <div key={booking.id} className="glass-dark rounded-2xl p-6 card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1">
                      {booking.serviceName} @ {booking.locationName}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {formatDateTime(booking.appointmentStartTime)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>

                {canCancel ? (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    disabled={isCancelling}
                    className="w-full px-4 py-3 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 border border-red-500/30 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                ) : (
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
