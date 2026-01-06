package com.andrea360.gymhub.dto;

import com.andrea360.gymhub.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private String phone;
    private Boolean active;
    private Long locationId;
    private String locationName;
    private LocalDateTime createdAt;
}