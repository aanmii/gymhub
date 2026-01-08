package com.andrea360.gymhub.service;

import com.andrea360.gymhub.dto.AppointmentResponse;
import com.andrea360.gymhub.dto.CreateAppointmentRequest;
import com.andrea360.gymhub.entity.Appointment;
import com.andrea360.gymhub.entity.GymService;
import com.andrea360.gymhub.entity.Location;
import com.andrea360.gymhub.entity.User;
import com.andrea360.gymhub.exception.BadRequestException;
import com.andrea360.gymhub.exception.ResourceNotFoundException;
import com.andrea360.gymhub.repository.AppointmentRepository;
import com.andrea360.gymhub.repository.GymServiceRepository;
import com.andrea360.gymhub.repository.LocationRepository;
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
public class AppointmentService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentService.class);

    private final AppointmentRepository appointmentRepository;
    private final LocationRepository locationRepository;
    private final GymServiceRepository gymServiceRepository;
    private final UserRepository userRepository;

    @Transactional
    public AppointmentResponse createAppointment(CreateAppointmentRequest request, Long employeeId) {
        logger.info("Creating new appointment");

        // Validate times
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));

        GymService gymService = gymServiceRepository.findById(request.getGymServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        Appointment appointment = Appointment.builder()
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .location(location)
                .gymService(gymService)
                .maxCapacity(request.getMaxCapacity())
                .currentBookings(0)
                .createdBy(employee)
                .active(true)
                .build();

        appointment = appointmentRepository.save(appointment);
        logger.info("Appointment created with id: {}", appointment.getId());

        return mapToResponse(appointment);
    }

    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getAppointmentsByLocation(Long locationId) {
        return appointmentRepository.findByLocationIdAndActive(locationId, true).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getUpcomingAppointments(Long locationId) {
        return appointmentRepository.findUpcomingByLocation(locationId, LocalDateTime.now()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getAvailableAppointments() {
        return appointmentRepository.findAvailableAppointments(LocalDateTime.now()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        return mapToResponse(appointment);
    }

    @Transactional
    public AppointmentResponse updateAppointment(Long id, CreateAppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }

        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(request.getEndTime());
        appointment.setMaxCapacity(request.getMaxCapacity());

        appointment = appointmentRepository.save(appointment);
        return mapToResponse(appointment);
    }

    @Transactional
    public void cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.getCurrentBookings() > 0) {
            throw new BadRequestException("Cannot cancel appointment with existing bookings");
        }

        appointment.setActive(false);
        appointmentRepository.save(appointment);
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .startTime(appointment.getStartTime())
                .endTime(appointment.getEndTime())
                .locationId(appointment.getLocation().getId())
                .locationName(appointment.getLocation().getName())
                .gymServiceId(appointment.getGymService().getId())
                .gymServiceName(appointment.getGymService().getName())
                .maxCapacity(appointment.getMaxCapacity())
                .currentBookings(appointment.getCurrentBookings())
                .availableSpots(appointment.getAvailableSpots())
                .isFull(appointment.isFull())
                .createdById(appointment.getCreatedBy().getId())
                .createdByName(appointment.getCreatedBy().getFullName())
                .active(appointment.getActive())
                .createdAt(appointment.getCreatedAt())
                .updatedAt(appointment.getUpdatedAt())
                .build();
    }
}