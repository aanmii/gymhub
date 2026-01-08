package com.andrea360.gymhub.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmployeeResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Long locationId;
    private String locationName;
    private Boolean active;
}
