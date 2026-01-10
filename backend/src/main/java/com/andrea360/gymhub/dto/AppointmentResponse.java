package com.andrea360.gymhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponse {
    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long locationId;
    private String locationName;
    private Long gymServiceId;
    private String gymServiceName;
    private Integer maxCapacity;
    private Integer currentBookings;
    private Integer availableSpots;
    private Boolean isFull;
    private Long createdById;
    private String createdByName;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}