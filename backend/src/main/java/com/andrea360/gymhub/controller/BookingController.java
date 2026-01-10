package com.andrea360.gymhub.controller;

import com.andrea360.gymhub.dto.BookingResponse;
import com.andrea360.gymhub.dto.CreateBookingRequest;
import com.andrea360.gymhub.security.UserDetailsImpl;
import com.andrea360.gymhub.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/bookings")
@Tag(name = "Bookings", description = "Booking/reservation management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('MEMBER') or hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "Create booking", description = "Book an appointment (requires available credit)")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        BookingResponse response = bookingService.createBooking(request, userDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('MEMBER') or hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "Get my bookings", description = "Get all bookings for the current user")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<BookingResponse> bookings = bookingService.getMyBookings(userDetails.getId());
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "Get appointment bookings", description = "Get all bookings for an appointment (Employee/Admin only)")
    public ResponseEntity<List<BookingResponse>> getAppointmentBookings(@PathVariable Long appointmentId) {
        List<BookingResponse> bookings = bookingService.getAppointmentBookings(appointmentId);
        return ResponseEntity.ok(bookings);
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MEMBER') or hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "Cancel booking", description = "Cancel a booking (returns credit to member)")
    public ResponseEntity<Void> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        bookingService.cancelBooking(id, userDetails.getId(), userDetails.getRole());
        return ResponseEntity.noContent().build();
    }
}