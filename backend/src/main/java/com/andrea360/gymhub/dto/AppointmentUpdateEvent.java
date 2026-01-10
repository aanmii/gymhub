package com.andrea360.gymhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentUpdateEvent {
    private Long appointmentId;
    private Integer currentParticipants;
    private Integer maxCapacity;
    private String eventType; // BOOKING_CREATED, BOOKING_CANCELLED
    private Long timestamp;
}