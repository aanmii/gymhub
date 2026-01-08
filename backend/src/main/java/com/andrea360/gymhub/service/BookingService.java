package com.andrea360.gymhub.service;

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


        if (bookingRepository.existsByAppointmentIdAndMemberId(appointment.getId(), memberId)) {
            throw new BadRequestException("You have already booked this appointment");
        }

        if (appointment.getStartTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot book past appointments");
        }

        MemberCredit credit = memberCreditRepository
                .findFirstByMemberIdAndGymServiceIdAndUsedFalseOrderByPurchasedAtAsc(memberId, appointment.getGymService().getId())
                .orElseThrow(() -> new BadRequestException("No available credits for this service. Please purchase credits first."));

        Booking booking = Booking.builder()
                .appointment(appointment)
                .member(member)
                .usedCredit(credit)
                .status(Booking.BookingStatus.CONFIRMED)
                .build();

        booking = bookingRepository.save(booking);

        // Mark credit as used
        credit.setUsed(true);
        credit.setUsedAt(LocalDateTime.now());
        memberCreditRepository.save(credit);

        // Increment appointment bookings count
        appointment.incrementBookings();
        appointmentRepository.save(appointment);

        logger.info("Booking created with id: {}", booking.getId());

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
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getMember().getId().equals(memberId)) {
            throw new BadRequestException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        // Check if appointment is in the past
        if (booking.getAppointment().getStartTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot cancel past bookings");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        bookingRepository.save(booking);

        // Return credit to member
        MemberCredit credit = booking.getUsedCredit();
        credit.setUsed(false);
        credit.setUsedAt(null);
        memberCreditRepository.save(credit);

        // Decrement appointment bookings
        Appointment appointment = booking.getAppointment();
        appointment.decrementBookings();
        appointmentRepository.save(appointment);

        logger.info("Booking cancelled: {}", bookingId);
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