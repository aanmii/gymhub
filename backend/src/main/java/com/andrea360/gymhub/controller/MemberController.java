package com.andrea360.gymhub.controller;

import com.andrea360.gymhub.dto.AuthResponse;
import com.andrea360.gymhub.dto.RegisterRequest;
import com.andrea360.gymhub.dto.UserResponse;
import com.andrea360.gymhub.entity.Role;
import com.andrea360.gymhub.security.UserDetailsImpl;
import com.andrea360.gymhub.service.AuthService;
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


@RestController
@RequestMapping("/members")
@Tag(name = "Members", description = "Member management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class MemberController {

    private final AuthService authService;

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "Create member", description = "Create a new member (Employee/Admin only)")
    public ResponseEntity<AuthResponse> createMember(
            @Valid @RequestBody RegisterRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {


        request.setRole(Role.MEMBER);

        if (request.getLocationId() == null && userDetails.getLocationId() != null) {
            request.setLocationId(userDetails.getLocationId());
        }

        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/location/{locationId}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "Get members by location", description = "Get all members for a location")
    public ResponseEntity<?> getMembersByLocation(@PathVariable Long locationId) {
        // This will be implemented by UserService - for now return placeholder
        return ResponseEntity.ok().build();
    }
}