package com.andrea360.gymhub.repository;

import com.andrea360.gymhub.entity.MemberCredit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberCreditRepository extends JpaRepository<MemberCredit, Long> {

    List<MemberCredit> findByMemberId(Long memberId);

    List<MemberCredit> findByMemberIdAndUsed(Long memberId, Boolean used);

    List<MemberCredit> findByMemberIdAndGymServiceIdAndUsed(Long memberId, Long gymServiceId, Boolean used);

    Optional<MemberCredit> findFirstByMemberIdAndGymServiceIdAndUsedFalseOrderByPurchasedAtAsc(
            Long memberId,
            Long gymServiceId
    );

    @Query("SELECT COUNT(mc) FROM MemberCredit mc WHERE mc.member.id = :memberId AND mc.gymService.id = :serviceId AND mc.used = false")
    Long countUnusedCreditsByMemberAndService(@Param("memberId") Long memberId,
                                              @Param("serviceId") Long serviceId);

    List<MemberCredit> findByPaymentId(Long paymentId);
}
