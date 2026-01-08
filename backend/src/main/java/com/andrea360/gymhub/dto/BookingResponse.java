package com.andrea360.gymhub.dto;

import com.andrea360.gymhub.entity.Booking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {
    private Long id;
    private Long appointmentId;
    private LocalDateTime appointmentStartTime;
    private LocalDateTime appointmentEndTime;
    private String serviceName;
    private String locationName;
    private Long memberId;
    private String memberName;
    private Booking.BookingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime cancelledAt;
}