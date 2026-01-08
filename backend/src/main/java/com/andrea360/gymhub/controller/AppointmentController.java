package com.andrea360.gymhub.controller;

import com.andrea360.gymhub.dto.AppointmentResponse;
import com.andrea360.gymhub.dto.CreateAppointmentRequest;
import com.andrea360.gymhub.security.UserDetailsImpl;
import com.andrea360.gymhub.service.AppointmentService;
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
@RequestMapping("/appointments")
@Tag(name = "Appointments", description = "Appointment/class session management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "Create appointment", description = "Create a new appointment (Employee/Admin only)")
    public ResponseEntity<AppointmentResponse> createAppointment(
            @Valid @RequestBody CreateAppointmentRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        AppointmentResponse response = appointmentService.createAppointment(request, userDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get all appointments", description = "Get all appointments")
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {
        List<AppointmentResponse> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/location/{locationId}")
    @Operation(summary = "Get appointments by location", description = "Get all appointments for a specific location")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByLocation(@PathVariable Long locationId) {
        List<AppointmentResponse> appointments = appointmentService.getAppointmentsByLocation(locationId);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/location/{locationId}/upcoming")
    @Operation(summary = "Get upcoming appointments", description = "Get upcoming appointments for a location")
    public ResponseEntity<List<AppointmentResponse>> getUpcomingAppointments(@PathVariable Long locationId) {
        List<AppointmentResponse> appointments = appointmentService.getUpcomingAppointments(locationId);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/available")
    @Operation(summary = "Get available appointments", description = "Get all available appointments (not full)")
    public ResponseEntity<List<AppointmentResponse>> getAvailableAppointments() {
        List<AppointmentResponse> appointments = appointmentService.getAvailableAppointments();
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get appointment by ID", description = "Get appointment details by ID")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable Long id) {
        AppointmentResponse appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointment);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "Update appointment", description = "Update appointment details (Employee/Admin only)")
    public ResponseEntity<AppointmentResponse> updateAppointment(
            @PathVariable Long id,
            @Valid @RequestBody CreateAppointmentRequest request) {
        AppointmentResponse response = appointmentService.updateAppointment(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "Cancel appointment", description = "Cancel an appointment (Employee/Admin only)")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Long id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.noContent().build();
    }
}