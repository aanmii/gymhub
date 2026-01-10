

import type { AppointmentResponse } from '../types';

export const normalizeAppointmentResponse = (
    appointment: any
): AppointmentResponse => {
    return {
        id: appointment.id,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        locationId: appointment.locationId,
        locationName: appointment.locationName,
        gymServiceId: appointment.gymServiceId,
        gymServiceName: appointment.gymServiceName || appointment.serviceName || '',
        maxCapacity: appointment.maxCapacity,
        currentBookings: appointment.currentBookings ?? appointment.currentParticipants ?? 0,
        availableSpots: appointment.availableSpots ??
            (appointment.maxCapacity - (appointment.currentBookings ?? appointment.currentParticipants ?? 0)),
        isFull: appointment.isFull ??
            ((appointment.currentBookings ?? appointment.currentParticipants ?? 0) >= appointment.maxCapacity),
        createdById: appointment.createdById,
        createdByName: appointment.createdByName,
        active: appointment.active !== false, 
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
    };
};


export const normalizeAppointments = (appointments: any[]): AppointmentResponse[] => {
    return appointments.map(normalizeAppointmentResponse);
};


export const getCapacityColor = (current: number, max: number): string => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-green-400';
};


export const formatDateTimeEU = (dateTimeString: string): string => {
    const date = new Date(dateTimeString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};


