import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { CreateEmployeeRequest, Location } from '../../types';

export const CreateEmployee = ({ onCreated }: { onCreated: () => void }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState<CreateEmployeeRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    locationId: 0,
  });

  useEffect(() => {
    api.get<Location[]>('/locations').then(res => setLocations(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/admin/employees', formData);
    onCreated();
    setFormData({ ...formData, firstName:'', lastName:'', email:'', password:'', phone:'' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input placeholder="First name" onChange={e => setFormData({...formData, firstName:e.target.value})} />
      <input placeholder="Last name" onChange={e => setFormData({...formData, lastName:e.target.value})} />
      <input placeholder="Email" onChange={e => setFormData({...formData, email:e.target.value})} />
      <input placeholder="Password" type="password" onChange={e => setFormData({...formData, password:e.target.value})} />
      <input placeholder="Phone" onChange={e => setFormData({...formData, phone:e.target.value})} />

      <select
        required
        onChange={e => setFormData({...formData, locationId: Number(e.target.value)})}
      >
        <option value="">Select location</option>
        {locations.map(l => (
          <option key={l.id} value={l.id}>{l.name}</option>
        ))}
      </select>

      <button type="submit" className="gradient-primary px-4 py-2 rounded-xl">
        Create Employee
      </button>
    </form>
  );
};
