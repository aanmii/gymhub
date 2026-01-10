import { Client } from '@stomp/stompjs';
import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';

interface AppointmentUpdate {
    appointmentId: number;
    currentParticipants: number;
    maxCapacity: number;
    eventType: 'BOOKING_CREATED' | 'BOOKING_CANCELLED';
    timestamp: number;
}

export const useWebSocket = (
    onAppointmentUpdate: (update: AppointmentUpdate) => void
) => {
    const [connected, setConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);
    const onUpdateRef = useRef(onAppointmentUpdate);

    useEffect(() => {
        onUpdateRef.current = onAppointmentUpdate;
    }, [onAppointmentUpdate]);

    useEffect(() => {
        const socket = new SockJS(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/ws`
        );

        const stompClient = new Client({
            webSocketFactory: () => socket as any,
            debug: (str) => {
                console.log('STOMP:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        stompClient.onConnect = () => {
            setConnected(true);

       
            stompClient.subscribe('/topic/appointments', (message) => {
                try {
                    const update = JSON.parse(message.body) as AppointmentUpdate;

                    onUpdateRef.current(update);
                } catch (error) {
                    
                }
            });

        
        };

        stompClient.onStompError = () => {
            setConnected(false);
        };

        stompClient.onDisconnect = () => {
            setConnected(false);
        };

        stompClient.activate();
        clientRef.current = stompClient;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, []);

    return { connected };
};