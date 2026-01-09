import { useState } from 'react';
import api from '../../services/api';
import type { GymServiceResponse, PaymentResponse } from '../../types';

interface PurchaseCreditsModalProps {
  service: GymServiceResponse;
  onClose: () => void;
}

export const PurchaseCreditsModal = ({ service, onClose }: PurchaseCreditsModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [, setPaymentIntentId] = useState<string | null>(null);

  const totalAmount = service.price * quantity;

  const handlePurchase = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      
      const response = await api.post<PaymentResponse>('/payments', {
  gymServiceId: service.id,
  quantity: quantity,
});


      setPaymentIntentId(response.data.stripePaymentIntentId);

      // For testing/demo, we'll auto-confirm the payment
      //todo: fix later
      await api.post(`/payments/confirm/${response.data.stripePaymentIntentId}`);

      setSuccess(`Successfully purchased ${quantity} credit${quantity > 1 ? 's' : ''} for ${service.name}! 🎉`);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Purchase Credits
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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

        <div className="space-y-6">
          {/* Service Info */}
          <div className="glass-dark rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Service</span>
              <span className="text-white font-semibold">{service.name}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Price per credit</span>
              <span className="text-purple-400 font-semibold">€{service.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Location</span>
              <span className="text-gray-300 text-sm">{service.locationName}</span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Number of Credits
            </label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-center font-bold text-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={() => setQuantity(Math.min(50, quantity + 1))}
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                disabled={quantity >= 50}
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Maximum 50 credits per purchase</p>
          </div>

          {/* Total */}
          <div className="glass-dark rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-white">Total Amount</span>
              <span className="text-3xl font-bold text-purple-400">€{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-200">
                <p className="font-semibold mb-1">Test Mode Active</p>
                <p className="text-xs text-blue-300">
                  Use test card: 4242 4242 4242 4242 | Any future date | Any 3 digits
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={loading || !!success}
              className="flex-1 gradient-primary py-3 px-6 rounded-xl text-white font-semibold shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : success ? (
                '✓ Purchased!'
              ) : (
                `Pay €${totalAmount.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};