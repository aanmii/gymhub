import type { CreateEmployeeRequest, Employee } from '../types';
import api from './api';

export const employeeService = {
    getAll: () =>
        api.get<Employee[]>('/admin/employees'),

    getByLocation: (locationId: number) =>
        api.get<Employee[]>(`/admin/employees/location/${locationId}`),

    create: (payload: CreateEmployeeRequest) =>
        api.post<Employee>('/admin/employees', payload),
};
