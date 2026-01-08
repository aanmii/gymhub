package com.andrea360.gymhub.repository;

import com.andrea360.gymhub.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {


    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);
    List<Payment> findByMemberId(Long memberId);
    List<Payment> findByMemberIdAndStatus(Long memberId, Payment.PaymentStatus status);
    @Query("SELECT p FROM Payment p WHERE p.member.id = :memberId AND p.createdAt >= :startDate AND p.createdAt <= :endDate ORDER BY p.createdAt DESC")
    List<Payment> findByMemberAndDateRange(@Param("memberId") Long memberId,
                                           @Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate);
    List<Payment> findByGymServiceId(Long gymServiceId);
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.gymService.id = :serviceId AND p.status = 'COMPLETED'")
    Optional<Double> getTotalRevenueByService(@Param("serviceId") Long serviceId);
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.gymService.location.id = :locationId AND p.status = 'COMPLETED'")
    Optional<Double> getTotalRevenueByLocation(@Param("locationId") Long locationId);
}