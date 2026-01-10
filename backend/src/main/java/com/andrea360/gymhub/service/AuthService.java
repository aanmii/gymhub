package com.andrea360.gymhub.service;

import com.andrea360.gymhub.dto.AuthResponse;
import com.andrea360.gymhub.dto.LoginRequest;
import com.andrea360.gymhub.dto.RegisterRequest;
import com.andrea360.gymhub.dto.UserResponse;
import com.andrea360.gymhub.entity.Location;
import com.andrea360.gymhub.entity.Role;
import com.andrea360.gymhub.entity.User;
import com.andrea360.gymhub.exception.BadRequestException;
import com.andrea360.gymhub.exception.ResourceNotFoundException;
import com.andrea360.gymhub.repository.LocationRepository;
import com.andrea360.gymhub.repository.UserRepository;
import com.andrea360.gymhub.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        logger.info("Registering new user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }

        Location location = null;
        if (request.getRole() == Role.EMPLOYEE || request.getRole() == Role.MEMBER) {
            if (request.getLocationId() == null) {
                throw new BadRequestException("Location is required for " + request.getRole() + " role");
            }
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + request.getLocationId()));
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .phone(request.getPhone())
                .location(location)
                .active(true)
                .build();

        user = userRepository.save(user);
        logger.info("User registered successfully with id: {}", user.getId());

        String token = jwtUtil.generateTokenFromEmail(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .locationId(location != null ? location.getId() : null)
                .locationName(location != null ? location.getName() : null)
                .build();
    }


    public AuthResponse login(LoginRequest request) {
        logger.info("User login attempt with email: {}", request.getEmail());

        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtUtil.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        logger.info("User logged in successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .locationId(user.getLocation() != null ? user.getLocation().getId() : null)
                .locationName(user.getLocation() != null ? user.getLocation().getName() : null)
                .build();
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .phone(user.getPhone())
                .active(user.getActive())
                .locationId(user.getLocation() != null ? user.getLocation().getId() : null)
                .locationName(user.getLocation() != null ? user.getLocation().getName() : null)
                .createdAt(user.getCreatedAt())
                .build();
    }

    public List<UserResponse> getMembersByLocation(Long locationId) {
        return userRepository.findAllByRoleAndLocationId(Role.MEMBER, locationId)
                .stream()
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .role(user.getRole())
                        .active(user.getActive())
                        .locationId(user.getLocation() != null ? user.getLocation().getId() : null)
                        .locationName(user.getLocation() != null ? user.getLocation().getName() : null)
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}