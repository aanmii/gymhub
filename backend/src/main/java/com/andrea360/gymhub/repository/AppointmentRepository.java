package com.andrea360.gymhub.repository;

import com.andrea360.gymhub.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByLocationId(Long locationId);
    List<Appointment> findByGymServiceId(Long gymServiceId);
    List<Appointment> findByLocationIdAndActive(Long locationId, Boolean active);
    @Query("SELECT a FROM Appointment a WHERE a.startTime >= :startTime AND a.endTime <= :endTime AND a.active = true")
    List<Appointment> findByTimeRange(@Param("startTime") LocalDateTime startTime,
                                      @Param("endTime") LocalDateTime endTime);
    @Query("SELECT a FROM Appointment a WHERE a.location.id = :locationId AND a.startTime > :now AND a.active = true ORDER BY a.startTime")
    List<Appointment> findUpcomingByLocation(@Param("locationId") Long locationId,
                                             @Param("now") LocalDateTime now);
    @Query("SELECT a FROM Appointment a WHERE a.currentBookings < a.maxCapacity AND a.startTime > :now AND a.active = true ORDER BY a.startTime")
    List<Appointment> findAvailableAppointments(@Param("now") LocalDateTime now);
    List<Appointment> findByCreatedById(Long employeeId);
}