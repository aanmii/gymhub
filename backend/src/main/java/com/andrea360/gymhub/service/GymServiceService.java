package com.andrea360.gymhub.service;

import com.andrea360.gymhub.dto.CreateGymServiceRequest;
import com.andrea360.gymhub.dto.GymServiceResponse;
import com.andrea360.gymhub.entity.GymService;
import com.andrea360.gymhub.entity.Location;
import com.andrea360.gymhub.entity.User;
import com.andrea360.gymhub.exception.BadRequestException;
import com.andrea360.gymhub.exception.ResourceNotFoundException;
import com.andrea360.gymhub.repository.GymServiceRepository;
import com.andrea360.gymhub.repository.LocationRepository;
import com.andrea360.gymhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GymServiceService {

    private static final Logger logger = LoggerFactory.getLogger(GymServiceService.class);

    private final GymServiceRepository gymServiceRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;

    @Transactional
    public GymServiceResponse createService(CreateGymServiceRequest request, Long employeeId) {
        logger.info("Creating new gym service: {}", request.getName());

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        // Check if service with same name exists at this location
        if (gymServiceRepository.existsByNameAndLocationId(request.getName(), request.getLocationId())) {
            throw new BadRequestException("Service with this name already exists at this location");
        }

        GymService gymService = GymService.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .location(location)
                .createdBy(employee)
                .active(true)
                .build();

        gymService = gymServiceRepository.save(gymService);
        logger.info("Gym service created with id: {}", gymService.getId());

        return mapToResponse(gymService);
    }

    public List<GymServiceResponse> getAllServices() {
        return gymServiceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<GymServiceResponse> getServicesByLocation(Long locationId) {
        return gymServiceRepository.findByLocationIdAndActive(locationId, true).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public GymServiceResponse getServiceById(Long id) {
        GymService service = gymServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        return mapToResponse(service);
    }

    @Transactional
    public GymServiceResponse updateService(Long id, CreateGymServiceRequest request) {
        GymService service = gymServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setPrice(request.getPrice());

        service = gymServiceRepository.save(service);
        return mapToResponse(service);
    }

    @Transactional
    public void deactivateService(Long id) {
        GymService service = gymServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        service.setActive(false);
        gymServiceRepository.save(service);
    }

    private GymServiceResponse mapToResponse(GymService service) {
        return GymServiceResponse.builder()
                .id(service.getId())
                .name(service.getName())
                .description(service.getDescription())
                .price(service.getPrice())
                .locationId(service.getLocation().getId())
                .locationName(service.getLocation().getName())
                .createdById(service.getCreatedBy().getId())
                .createdByName(service.getCreatedBy().getFullName())
                .active(service.getActive())
                .createdAt(service.getCreatedAt())
                .updatedAt(service.getUpdatedAt())
                .build();
    }
}