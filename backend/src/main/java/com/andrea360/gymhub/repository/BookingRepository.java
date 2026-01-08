package com.andrea360.gymhub.repository;

import com.andrea360.gymhub.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByMemberId(Long memberId);
    List<Booking> findByAppointmentId(Long appointmentId);
    List<Booking> findByMemberIdAndStatus(Long memberId, Booking.BookingStatus status);
    Boolean existsByAppointmentIdAndMemberId(Long appointmentId, Long memberId);
    Optional<Booking> findByAppointmentIdAndMemberId(Long appointmentId, Long memberId);
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.appointment.id = :appointmentId AND b.status = 'CONFIRMED'")
    Long countConfirmedBookingsByAppointment(@Param("appointmentId") Long appointmentId);
    @Query("SELECT b FROM Booking b WHERE b.appointment.id = :appointmentId AND b.status = 'CONFIRMED'")
    List<Booking> findConfirmedBookingsByAppointment(@Param("appointmentId") Long appointmentId);
}