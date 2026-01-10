package com.andrea360.gymhub.service;

import com.andrea360.gymhub.dto.AppointmentUpdateEvent;
import com.andrea360.gymhub.dto.BookingResponse;
import com.andrea360.gymhub.dto.CreateBookingRequest;
import com.andrea360.gymhub.entity.Appointment;
import com.andrea360.gymhub.entity.Booking;
import com.andrea360.gymhub.entity.MemberCredit;
import com.andrea360.gymhub.entity.User;
import com.andrea360.gymhub.exception.BadRequestException;
import com.andrea360.gymhub.exception.ResourceNotFoundException;
import com.andrea360.gymhub.repository.AppointmentRepository;
import com.andrea360.gymhub.repository.BookingRepository;
import com.andrea360.gymhub.repository.MemberCreditRepository;
import com.andrea360.gymhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepository;
    private final AppointmentRepository appointmentRepository;
    private final MemberCreditRepository memberCreditRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, Long memberId) {
        logger.info("Creating booking for member: {} and appointment: {}", memberId, request.getAppointmentId());

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        if (appointment.isFull()) {
            throw new BadRequestException("Appointment is full");
        }

        Boolean alreadyBooked = bookingRepository.existsByAppointmentIdAndMemberIdAndStatus(
                appointment.getId(),
                memberId
        );

        if (Boolean.TRUE.equals(alreadyBooked)) {
            logger.warn("Member {} already booked appointment {}", memberId, request.getAppointmentId());
            throw new BadRequestException("You have already booked this appointment");
        }

        if (appointment.getStartTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot book past appointments");
        }


        MemberCredit credit = memberCreditRepository
                .findFirstByMemberIdAndGymServiceIdAndUsedFalseOrderByPurchasedAtAsc(
                        memberId,
                        appointment.getGymService().getId()
                )
                .orElseThrow(() -> new BadRequestException("No available credits for this service. Please purchase credits first."));

        logger.info("All validations passed. Creating booking...");


        Booking booking = Booking.builder()
                .appointment(appointment)
                .member(member)
                .usedCredit(credit)
                .status(Booking.BookingStatus.CONFIRMED)
                .build();

        try {
            booking = bookingRepository.save(booking);
            logger.info("Booking saved with id: {}", booking.getId());
        } catch (Exception e) {
            logger.error("Failed to save booking: {}", e.getMessage(), e);
            throw new BadRequestException("Failed to create booking. Please try again.");
        }

        try {
            credit.setUsed(true);
            credit.setUsedAt(LocalDateTime.now());
            memberCreditRepository.save(credit);
            logger.info("Credit marked as used: {}", credit.getId());
        } catch (Exception e) {
            logger.error("Failed to mark credit as used: {}", e.getMessage(), e);
            appointment.decrementBookings();
            appointmentRepository.save(appointment);
            bookingRepository.delete(booking);
            throw new BadRequestException("Failed to process credit. Booking cancelled.");
        }


        try {
            appointment.incrementBookings();
            appointmentRepository.save(appointment);
            logger.info("Appointment bookings updated: {}/{}",
                    appointment.getCurrentBookings(),
                    appointment.getMaxCapacity());
        } catch (Exception e) {
            logger.error("Failed to update appointment bookings: {}", e.getMessage(), e);

            credit.setUsed(false);
            credit.setUsedAt(null);
            memberCreditRepository.save(credit);
            bookingRepository.delete(booking);
            throw new BadRequestException("Failed to update appointment. Booking cancelled.");
        }


        try {
            sendAppointmentUpdate(appointment, "BOOKING_CREATED");
        } catch (Exception e) {
            logger.warn("Failed to send WebSocket update: {}", e.getMessage());

        }

        logger.info("✅ Booking successfully created with id: {}", booking.getId());
        return mapToResponse(booking);
    }

    public List<BookingResponse> getMyBookings(Long memberId) {
        return bookingRepository.findByMemberIdAndStatus(memberId, Booking.BookingStatus.CONFIRMED).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAppointmentBookings(Long appointmentId) {
        return bookingRepository.findByAppointmentId(appointmentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelBooking(Long bookingId, Long memberId) {
        logger.info("Cancelling booking: {} for member: {}", bookingId, memberId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getMember().getId().equals(memberId)) {
            throw new BadRequestException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        if (booking.getAppointment().getStartTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot cancel past bookings");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        bookingRepository.save(booking);
        logger.info("Booking marked as cancelled: {}", bookingId);

        MemberCredit credit = booking.getUsedCredit();
        credit.setUsed(false);
        credit.setUsedAt(null);
        memberCreditRepository.save(credit);
        logger.info("Credit returned to member: {}", credit.getId());


        Appointment appointment = booking.getAppointment();
        appointment.decrementBookings();
        appointmentRepository.save(appointment);
        logger.info("Appointment bookings decremented: {}/{}",
                appointment.getCurrentBookings(),
                appointment.getMaxCapacity());

        try {
            sendAppointmentUpdate(appointment, "BOOKING_CANCELLED");
        } catch (Exception e) {
            logger.warn("Failed to send WebSocket update: {}", e.getMessage());
        }

        logger.info("✅ Booking successfully cancelled: {}", bookingId);
    }

    private void sendAppointmentUpdate(Appointment appointment, String eventType) {
        AppointmentUpdateEvent event = AppointmentUpdateEvent.builder()
                .appointmentId(appointment.getId())
                .currentParticipants(appointment.getCurrentBookings())
                .maxCapacity(appointment.getMaxCapacity())
                .eventType(eventType)
                .timestamp(System.currentTimeMillis())
                .build();

        messagingTemplate.convertAndSend(
                "/topic/appointments/" + appointment.getId(),
                event
        );

        messagingTemplate.convertAndSend("/topic/appointments", event);

        logger.info("📡 WebSocket update sent - Appointment {}: {} (participants: {}/{})",
                appointment.getId(),
                eventType,
                appointment.getCurrentBookings(),
                appointment.getMaxCapacity());
    }

    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .appointmentId(booking.getAppointment().getId())
                .appointmentStartTime(booking.getAppointment().getStartTime())
                .appointmentEndTime(booking.getAppointment().getEndTime())
                .serviceName(booking.getAppointment().getGymService().getName())
                .locationName(booking.getAppointment().getLocation().getName())
                .memberId(booking.getMember().getId())
                .memberName(booking.getMember().getFullName())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .cancelledAt(booking.getCancelledAt())
                .build();
    }
}