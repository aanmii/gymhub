import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Employee } from '../../types';
import { CreateEmployee } from './CreateEmployee';

export const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const fetchEmployees = async () => {
    const res = await api.get<Employee[]>('/admin/employees');
    setEmployees(res.data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="space-y-8">
      <CreateEmployee onCreated={fetchEmployees} />

      <div className="grid md:grid-cols-2 gap-4">
        {employees.map(e => (
          <div key={e.id} className="glass-dark p-6 rounded-xl">
            <h4 className="text-lg font-bold">{e.firstName} {e.lastName}</h4>
            <p className="text-sm text-gray-400">{e.email}</p>
            <p className="text-xs text-purple-400">{e.locationName}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
