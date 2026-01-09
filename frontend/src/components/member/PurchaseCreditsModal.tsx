import { useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import type { GymServiceResponse, PaymentResponse } from '../../types';

interface PurchaseCreditsModalProps {
  service: GymServiceResponse;
  onClose: () => void;
}

declare global {
  interface Window {
    Stripe: any;
  }
}

export const PurchaseCreditsModal = ({ service, onClose }: PurchaseCreditsModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stripe, setStripe] = useState<any>(null);
  const [cardElement, setCardElement] = useState<any>(null);
  const cardElementRef = useRef<HTMLDivElement>(null);

  const totalAmount = service.price * quantity;

  useEffect(() => {
    if (!window.Stripe) {
      setError('Stripe failed to load. Please refresh the page.');
      return;
    }

    const stripeInstance = window.Stripe('pk_test_51Sn1R61NcJJ73H3jRZKEba0PiIaN7IwjnL4BpREz537HTDD8ojNxMr0ZWwMcQEoSejxxWb6qS7Y7VQ4yHL4sxzMi00H4tSwwUY');
    setStripe(stripeInstance);

    const elements = stripeInstance.elements();
    const card = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#ffffff',
          '::placeholder': {
            color: '#9ca3af',
          },
          backgroundColor: 'transparent',
        },
        invalid: {
          color: '#ef4444',
          iconColor: '#ef4444',
        },
      },
      hidePostalCode: true,
    });

    if (cardElementRef.current) {
      card.mount(cardElementRef.current);
      setCardElement(card);

      card.on('change', (event: any) => {
        if (event.error) {
          setError(event.error.message);
        } else {
          setError('');
        }
      });
    }

    return () => {
      if (card) {
        card.destroy();
      }
    };
  }, []);

  const handlePurchase = async () => {
    if (!stripe || !cardElement) {
      setError('Stripe is not ready. Please wait or refresh the page.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      
      const paymentResponse = await api.post<PaymentResponse>('/payments', {
        gymServiceId: service.id,
        quantity: quantity,
      });

      const clientSecret = paymentResponse.data.clientSecret;
      
      if (!clientSecret) {
        throw new Error('Failed to initialize payment. Please try again.');
      }

      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
   
        await api.post(`/payments/confirm/${paymentIntent.id}`);

        setSuccess(`Successfully purchased ${quantity} credit${quantity > 1 ? 's' : ''} for ${service.name}! 🎉`);
     
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error(`Payment failed with status: ${paymentIntent?.status || 'unknown'}`);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
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
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-red-200">{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-xl p-4 backdrop-blur-sm animate-pulse">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-green-200">{success}</div>
            </div>
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
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={quantity <= 1 || loading}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-center font-bold text-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                disabled={loading}
              />
              <button
                onClick={() => setQuantity(Math.min(50, quantity + 1))}
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={quantity >= 50 || loading}
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

          {/* Card Input */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Card Information
            </label>
            <div 
              ref={cardElementRef}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus-within:ring-2 focus-within:ring-purple-500 transition-all min-h-[44px]"
            />
            <p className="text-xs text-gray-400 mt-2">
              Your payment information is secure and encrypted.
            </p>
          </div>

          {/* Test Card Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-200">
                <p className="font-semibold mb-1">Test Mode Active</p>
                <p className="text-xs text-blue-300 mb-1">
                  <span className="font-semibold">Card:</span> <span className="font-mono">4242 4242 4242 4242</span>
                </p>
                <p className="text-xs text-blue-300">
                  <span className="font-semibold">Expiry:</span> Any future date | <span className="font-semibold">CVC:</span> Any 3 digits
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={loading || !!success || !stripe || !cardElement}
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