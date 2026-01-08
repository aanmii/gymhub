package com.andrea360.gymhub.service;

import com.andrea360.gymhub.dto.CreateEmployeeRequest;
import com.andrea360.gymhub.dto.EmployeeResponse;
import com.andrea360.gymhub.entity.Location;
import com.andrea360.gymhub.entity.Role;
import com.andrea360.gymhub.entity.User;
import com.andrea360.gymhub.exception.BadRequestException;
import com.andrea360.gymhub.exception.ResourceNotFoundException;
import com.andrea360.gymhub.repository.LocationRepository;
import com.andrea360.gymhub.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeService {

    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeResponse createEmployee(CreateEmployeeRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Location not found with id: " + request.getLocationId()));

        User employee = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.EMPLOYEE)
                .location(location)
                .active(true)
                .build();

        userRepository.save(employee);

        return map(employee);
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {
        return userRepository.findByRole(Role.EMPLOYEE)
                .stream()
                .map(this::map)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getEmployeesByLocation(Long locationId) {
        return userRepository.findByLocationIdAndRole(locationId,Role.EMPLOYEE)
                .stream()
                .map(this::map)
                .toList();
    }

    private EmployeeResponse map(User user) {
        return EmployeeResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .locationId(user.getLocation().getId())
                .locationName(user.getLocation().getName())
                .active(user.getActive())
                .build();
    }
}
