package com.andrea360.gymhub.controller;

import com.andrea360.gymhub.dto.CreateGymServiceRequest;
import com.andrea360.gymhub.dto.GymServiceResponse;
import com.andrea360.gymhub.security.UserDetailsImpl;
import com.andrea360.gymhub.service.GymServiceService;
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
@RequestMapping("/services")
@Tag(name = "Gym Services", description = "Gym service/class management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class GymServiceController {

    private final GymServiceService gymServiceService;

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "Create gym service", description = "Create a new gym service (Employee/Admin only)")
    public ResponseEntity<GymServiceResponse> createService(
            @Valid @RequestBody CreateGymServiceRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        GymServiceResponse response = gymServiceService.createService(request, userDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get all services", description = "Get all gym services")
    public ResponseEntity<List<GymServiceResponse>> getAllServices() {
        List<GymServiceResponse> services = gymServiceService.getAllServices();
        return ResponseEntity.ok(services);
    }

    @GetMapping("/location/{locationId}")
    @Operation(summary = "Get services by location", description = "Get all services for a specific location")
    public ResponseEntity<List<GymServiceResponse>> getServicesByLocation(@PathVariable Long locationId) {
        List<GymServiceResponse> services = gymServiceService.getServicesByLocation(locationId);
        return ResponseEntity.ok(services);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get service by ID", description = "Get service details by ID")
    public ResponseEntity<GymServiceResponse> getServiceById(@PathVariable Long id) {
        GymServiceResponse service = gymServiceService.getServiceById(id);
        return ResponseEntity.ok(service);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "Update service", description = "Update service details (Employee/Admin only)")
    public ResponseEntity<GymServiceResponse> updateService(
            @PathVariable Long id,
            @Valid @RequestBody CreateGymServiceRequest request) {
        GymServiceResponse response = gymServiceService.updateService(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate service", description = "Deactivate a service (Admin only)")
    public ResponseEntity<Void> deactivateService(@PathVariable Long id) {
        gymServiceService.deactivateService(id);
        return ResponseEntity.noContent().build();
    }
}