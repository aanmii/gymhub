import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { GymServiceResponse, PaymentResponse } from '../../types';

interface CreditSummary {
  gymServiceId: number;
  serviceName: string;
  availableCredits: number;
}

export const MyCredits = () => {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [credits, setCredits] = useState<CreditSummary[]>([]);
  const [, setServices] = useState<GymServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch payments history
      const paymentsResponse = await api.get<PaymentResponse[]>('/payments/my');
      setPayments(paymentsResponse.data);

      // Fetch services to get credit info
      const servicesResponse = await api.get<GymServiceResponse[]>('/services');
      setServices(servicesResponse.data);

      // Fetch available credits for each service
      const creditsPromises = servicesResponse.data.map(async (service) => {
        try {
          const creditResponse = await api.get<{ availableCredits: number }>(
            `/payments/credits/${service.id}`
          );
          return {
            gymServiceId: service.id,
            serviceName: service.name,
            availableCredits: creditResponse.data.availableCredits,
          };
        } catch (err) {
          return {
            gymServiceId: service.id,
            serviceName: service.name,
            availableCredits: 0,
          };
        }
      });

      const creditsData = await Promise.all(creditsPromises);
      setCredits(creditsData.filter(c => c.availableCredits > 0));
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load credits and payment history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const totalCredits = credits.reduce((sum, c) => sum + c.availableCredits, 0);
  const totalSpent = payments
    .filter(p => p.status.toLowerCase() === 'succeeded' || p.status.toLowerCase() === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading your credits...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          My Credits & Payments
        </h3>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-sm text-red-200">{error}</div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Total Credits</p>
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-white">{totalCredits}</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Total Spent</p>
            <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-white">€{totalSpent.toFixed(2)}</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Transactions</p>
            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-white">{payments.length}</p>
        </div>
      </div>

      {/* Available Credits */}
      <div className="glass rounded-2xl p-8">
        <h4 className="text-xl font-bold text-white mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Available Credits by Service
        </h4>

        {credits.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">You don't have any credits yet.</p>
            <p className="text-sm text-gray-500 mt-2">Purchase credits from the "Browse Services" tab!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {credits.map((credit) => (
              <div key={credit.gymServiceId} className="glass-dark rounded-xl p-4">
                <h5 className="font-semibold text-white mb-2">{credit.serviceName}</h5>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-purple-400">{credit.availableCredits}</span>
                  <span className="text-gray-400 ml-2">credits</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="glass rounded-2xl p-8">
        <h4 className="text-xl font-bold text-white mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Payment History
        </h4>

        {payments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No payment history yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="glass-dark rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h5 className="font-semibold text-white">{payment.serviceName}</h5>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {payment.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{formatDate(payment.createdAt)}</span>
                    <span>•</span>
                    <span>ID: {payment.stripePaymentIntentId.slice(0, 16)}...</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    €{payment.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">EUR</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};