package com.andrea360.gymhub.controller;

import com.andrea360.gymhub.dto.CreatePaymentRequest;
import com.andrea360.gymhub.dto.PaymentResponse;
import com.andrea360.gymhub.security.UserDetailsImpl;
import com.andrea360.gymhub.service.PaymentService;
import com.stripe.exception.StripeException;
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
import java.util.Map;


@RestController
@RequestMapping("/payments")
@Tag(name = "Payments", description = "Payment and credit management endpoints (Stripe)")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @PreAuthorize("hasRole('MEMBER') or hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "Create payment", description = "Create a payment intent to purchase credits (Stripe)")
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody CreatePaymentRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) throws StripeException {
        PaymentResponse response = paymentService.createPayment(request, userDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/webhook")
    @Operation(summary = "Stripe webhook", description = "Handle Stripe webhook events")
    public ResponseEntity<Void> handleStripeWebhook(@RequestBody String payload) {
        // This will be called by Stripe when payment is completed
        // For now, just a placeholder - you'll need to verify signature
        return ResponseEntity.ok().build();
    }

    @PostMapping("/confirm/{paymentIntentId}")
    @PreAuthorize("hasRole('MEMBER') or hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "Confirm payment", description = "Manually confirm payment (for testing)")
    public ResponseEntity<Void> confirmPayment(@PathVariable String paymentIntentId) {
        paymentService.confirmPayment(paymentIntentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('MEMBER') or hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "Get my payments", description = "Get all payments for the current user")
    public ResponseEntity<List<PaymentResponse>> getMyPayments(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<PaymentResponse> payments = paymentService.getMyPayments(userDetails.getId());
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/credits/{serviceId}")
    @PreAuthorize("hasRole('MEMBER') or hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "Get available credits", description = "Get number of available credits for a service")
    public ResponseEntity<Map<String, Long>> getAvailableCredits(
            @PathVariable Long serviceId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long credits = paymentService.getAvailableCredits(userDetails.getId(), serviceId);
        return ResponseEntity.ok(Map.of("availableCredits", credits));
    }
}