package com.andrea360.gymhub.service;

import com.andrea360.gymhub.dto.CreateLocationRequest;
import com.andrea360.gymhub.dto.LocationResponse;
import com.andrea360.gymhub.entity.Location;
import com.andrea360.gymhub.exception.BadRequestException;
import com.andrea360.gymhub.exception.ResourceNotFoundException;
import com.andrea360.gymhub.repository.LocationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;


@Service
public class LocationService {

    private static final Logger logger = LoggerFactory.getLogger(LocationService.class);

    private final LocationRepository locationRepository;

    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }


    @Transactional
    public LocationResponse createLocation(CreateLocationRequest request) {
        logger.info("Creating new location: {}", request.getName());

        // Check if location name already exists
        if (locationRepository.existsByName(request.getName())) {
            throw new BadRequestException("Location with name '" + request.getName() + "' already exists");
        }

        Location location = Location.builder()
                .name(request.getName())
                .address(request.getAddress())
                .active(true)
                .build();

        location = locationRepository.save(location);
        logger.info("Location created successfully with id: {}", location.getId());

        return mapToResponse(location);
    }


    public List<LocationResponse> getAllLocations() {
        return locationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public LocationResponse getLocationById(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));
        return mapToResponse(location);
    }

    @Transactional
    public LocationResponse updateLocation(Long id, CreateLocationRequest request) {
        logger.info("Updating location with id: {}", id);

        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));

        // Check if new name conflicts with existing location
        if (!location.getName().equals(request.getName()) &&
                locationRepository.existsByName(request.getName())) {
            throw new BadRequestException("Location with name '" + request.getName() + "' already exists");
        }

        location.setName(request.getName());
        location.setAddress(request.getAddress());

        location = locationRepository.save(location);
        logger.info("Location updated successfully");

        return mapToResponse(location);
    }

    private LocationResponse mapToResponse(Location location) {
        return LocationResponse.builder()
                .id(location.getId())
                .name(location.getName())
                .address(location.getAddress())
                .active(location.getActive())
                .createdAt(location.getCreatedAt())
                .updatedAt(location.getUpdatedAt())
                .build();
    }
}