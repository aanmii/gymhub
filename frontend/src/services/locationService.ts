import type { CreateLocationRequest, Location } from '../types';
import api from './api';

export const locationService = {
    getAll: () =>
        api.get<Location[]>('/locations'),

    create: (payload: CreateLocationRequest) =>
        api.post('/locations', payload),
};
