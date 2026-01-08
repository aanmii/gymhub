package com.andrea360.gymhub.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;


@Entity
@Table(name = "member_credits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberCredit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    @ToString.Exclude
    private User member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gym_service_id", nullable = false)
    @ToString.Exclude
    private GymService gymService;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    @ToString.Exclude
    private Payment payment;

    @Column(nullable = false)
    @Builder.Default
    private Boolean used = false;

    @Column
    private LocalDateTime usedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime purchasedAt;
}