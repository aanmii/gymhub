
export const Role = {
    ADMIN: 'ADMIN',
    EMPLOYEE: 'EMPLOYEE',
    MEMBER: 'MEMBER'
} as const;

export type Role = typeof Role[keyof typeof Role];

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    phone?: string;
    active: boolean;
    locationId?: number;
    locationName?: string;
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    type: string;
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    locationId?: number;
    locationName?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
    phone?: string;
    locationId?: number;
}

export interface Location {
    id: number;
    name: string;
    address: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLocationRequest {
    name: string;
    address: string;
}

export interface ErrorResponse {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    details?: Record<string, string>;
}

export interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    locationId: number;
    locationName: string;
    createdAt: string;
}

export interface CreateEmployeeRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    locationId?: number;
}

export interface EmployeeResponse {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: 'EMPLOYEE' | 'ADMIN';
    locationName: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}