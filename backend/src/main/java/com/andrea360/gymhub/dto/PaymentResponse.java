package com.andrea360.gymhub.dto;

import com.andrea360.gymhub.entity.Payment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private Long id;
    private Long memberId;
    private String memberName;
    private Long gymServiceId;
    private String gymServiceName;
    private Integer quantity;
    private BigDecimal amount;
    private String stripePaymentIntentId;
    private String clientSecret; // For Stripe frontend
    private Payment.PaymentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}