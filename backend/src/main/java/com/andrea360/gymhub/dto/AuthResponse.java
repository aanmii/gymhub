package com.andrea360.gymhub.dto;

import com.andrea360.gymhub.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;

    @Builder.Default
    private String type = "Bearer";

    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private Long locationId;
    private String locationName;
}