package com.andrea360.gymhub.service;

import com.andrea360.gymhub.dto.CreatePaymentRequest;
import com.andrea360.gymhub.dto.PaymentResponse;
import com.andrea360.gymhub.entity.GymService;
import com.andrea360.gymhub.entity.MemberCredit;
import com.andrea360.gymhub.entity.Payment;
import com.andrea360.gymhub.entity.User;
import com.andrea360.gymhub.exception.BadRequestException;
import com.andrea360.gymhub.exception.ResourceNotFoundException;
import com.andrea360.gymhub.repository.GymServiceRepository;
import com.andrea360.gymhub.repository.MemberCreditRepository;
import com.andrea360.gymhub.repository.PaymentRepository;
import com.andrea360.gymhub.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final GymServiceRepository gymServiceRepository;
    private final UserRepository userRepository;
    private final MemberCreditRepository memberCreditRepository;

    @Value("${stripe.api.secret-key}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request, Long memberId) throws StripeException {
        logger.info("Creating payment for member: {}", memberId);

        GymService gymService = gymServiceRepository.findById(request.getGymServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        // Calculate total amount
        BigDecimal totalAmount = gymService.getPrice().multiply(BigDecimal.valueOf(request.getQuantity()));

        // Create Stripe Payment Intent
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(totalAmount.multiply(BigDecimal.valueOf(100)).longValue()) // Convert EUR to cents
                .setCurrency("eur")
                .putMetadata("memberId", memberId.toString())
                .putMetadata("gymServiceId", gymService.getId().toString())
                .putMetadata("quantity", request.getQuantity().toString())
                .setDescription("Purchase of " + request.getQuantity() + "x " + gymService.getName())
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        // Create payment record
        Payment payment = Payment.builder()
                .member(member)
                .gymService(gymService)
                .quantity(request.getQuantity())
                .amount(totalAmount)
                .stripePaymentIntentId(paymentIntent.getId())
                .status(Payment.PaymentStatus.PENDING)
                .build();

        payment = paymentRepository.save(payment);
        logger.info("Payment created with id: {}", payment.getId());

        return PaymentResponse.builder()
                .id(payment.getId())
                .memberId(member.getId())
                .memberName(member.getFullName())
                .gymServiceId(gymService.getId())
                .gymServiceName(gymService.getName())
                .quantity(request.getQuantity())
                .amount(totalAmount)
                .stripePaymentIntentId(paymentIntent.getId())
                .clientSecret(paymentIntent.getClientSecret())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    @Transactional
    public void confirmPayment(String paymentIntentId) {
        logger.info("Confirming payment: {}", paymentIntentId);

        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            logger.warn("Payment already completed: {}", paymentIntentId);
            return;
        }

        // Update payment status
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setCompletedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // Create member credits
        List<MemberCredit> credits = new ArrayList<>();
        for (int i = 0; i < payment.getQuantity(); i++) {
            MemberCredit credit = MemberCredit.builder()
                    .member(payment.getMember())
                    .gymService(payment.getGymService())
                    .payment(payment)
                    .used(false)
                    .build();
            credits.add(credit);
        }

        memberCreditRepository.saveAll(credits);
        logger.info("Created {} credits for member: {}", credits.size(), payment.getMember().getId());
    }

    public List<PaymentResponse> getMyPayments(Long memberId) {
        return paymentRepository.findByMemberId(memberId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Long getAvailableCredits(Long memberId, Long serviceId) {
        return memberCreditRepository.countUnusedCreditsByMemberAndService(memberId, serviceId);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .memberId(payment.getMember().getId())
                .memberName(payment.getMember().getFullName())
                .gymServiceId(payment.getGymService().getId())
                .gymServiceName(payment.getGymService().getName())
                .quantity(payment.getQuantity())
                .amount(payment.getAmount())
                .stripePaymentIntentId(payment.getStripePaymentIntentId())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .completedAt(payment.getCompletedAt())
                .build();
    }
}