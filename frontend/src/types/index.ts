// Roles
export const Role = {
    ADMIN: 'ADMIN',
    EMPLOYEE: 'EMPLOYEE',
    MEMBER: 'MEMBER'
} as const;

export type Role = typeof Role[keyof typeof Role];

// User Types
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

// Location Types
export interface Location {
    id: number;
    name: string;
    address: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LocationResponse extends Location { }

export interface CreateLocationRequest {
    name: string;
    address: string;
}

// Employee Types
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

// Gym Service Types
export interface GymService {
    id: number;
    name: string;
    price: number;
    locationId: number;
    locationName: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface GymServiceResponse extends GymService { }

export interface CreateGymServiceRequest {
    name: string;
    price: number;
    locationId: number;
}

// Appointment Types
export interface Appointment {
    id: number;
    startTime: string;
    endTime: string;
    locationId: number;
    locationName: string;
    gymServiceId: number;
    serviceName: string;
    maxCapacity: number;
    currentParticipants: number;
    createdAt: string;
    updatedAt: string;
}

export interface AppointmentResponse {
    id: number;
    startTime: string;
    endTime: string;
    locationId: number;
    locationName: string;
    gymServiceId: number; 
    serviceName: string;
    maxCapacity: number;
    currentParticipants: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAppointmentRequest {
    startTime: string;
    endTime: string;
    locationId: number;
    gymServiceId: number; 
    maxCapacity: number;
}

// User/Member Types
export interface UserResponse {
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

// Booking Types
export interface Booking {
    id: number;
    userId: number;
    appointmentId: number;
    bookingTime: string;
    status: string;
}

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

export interface CreateBookingRequest {
    appointmentId: number;
    userId?: number;
}

// Payment Types
export interface Payment {
    id: number;
    userId: number;
    gymServiceId: number; 
    amount: number;
    currency: string;
    status: string;
    stripePaymentIntentId: string;
    createdAt: string;
}

export interface PaymentResponse {
    id: number;
    userId: number;
    gymServiceId: number; 
    serviceName: string;
    amount: number;
    currency: string;
    status: string;
    stripePaymentIntentId: string;
    clientSecret?: string;
    createdAt: string;
}

export interface CreatePaymentRequest {
    gymServiceId: number; 
    quantity: number;
}


export interface ErrorResponse {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    details?: Record<string, string>;
}
