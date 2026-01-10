import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import type { CreateGymServiceRequest, GymServiceResponse, Location } from '../../types';

interface ServicesManagementProps {
  locationId?: number; 
  canCreate?: boolean;
  canEdit?: boolean;
}

export const ServicesManagement = ({ 
  locationId, 
  canCreate = true, 
  canEdit = true 
}: ServicesManagementProps) => {
  const { user } = useAuth();
  const [services, setServices] = useState<GymServiceResponse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<GymServiceResponse | null>(null);
  const [formData, setFormData] = useState<CreateGymServiceRequest>({
    name: '',
    price: 0,
    locationId: locationId || user?.locationId || 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchServices();
    if (!locationId) {
      fetchLocations();
    }
  }, [locationId]);

  const fetchServices = async () => {
    try {
      const endpoint = locationId 
        ? `/services/location/${locationId}` 
        : '/services';
      const response = await api.get<GymServiceResponse[]>(endpoint);
      setServices(response.data);
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
      if (editingService) {
        await api.put(`/services/${editingService.id}`, formData);
        setSuccess('Service updated successfully! 🎉');
      } else {
        await api.post('/services', formData);
        setSuccess('Service created successfully! 🎉');
      }
      
      setFormData({ name: '', price: 0, locationId: locationId || user?.locationId || 0 });
      setShowForm(false);
      setEditingService(null);
      fetchServices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: GymServiceResponse) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: service.price,
      locationId: service.locationId,
    });
    setShowForm(true);
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'locationId' ? Number(value) : value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Gym Services ({services.length})
        </h3>
        {canCreate && (
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingService(null);
              setFormData({ name: '', price: 0, locationId: locationId || user?.locationId || 0 });
            }}
            className="gradient-primary px-4 py-2 rounded-xl text-white font-semibold shadow-lg hover:scale-[1.02] transition-all"
          >
            {showForm ? 'Cancel' : '+ New Service'}
          </button>
        )}
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
            {editingService ? 'Edit Service' : 'Create New Service'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Service Name
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., CrossFit, Yoga, Pilates"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Price (EUR)
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 15.00"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

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

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary py-3 px-4 rounded-xl text-white font-semibold shadow-lg hover:scale-[1.02] disabled:opacity-50 transition-all"
            >
              {loading ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
            </button>
          </form>
        </div>
      )}

      {/* Services List */}
      <div className="glass rounded-2xl p-8">
        {services.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-400">No services yet. Create your first one! 💪</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="glass-dark rounded-xl p-6 card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-1">{service.name}</h4>
                    <p className="text-2xl font-bold text-purple-400">€{service.price.toFixed(2)}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      service.active
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {service.active ? '✓ Active' : '✗ Inactive'}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-400 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {service.locationName}
                  </p>
                </div>

                {canEdit && service.active && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="flex-1 px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 border border-purple-500/30 transition-all text-sm font-semibold"
                    >
                      Edit
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