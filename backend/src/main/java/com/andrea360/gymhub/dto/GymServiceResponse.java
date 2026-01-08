package com.andrea360.gymhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GymServiceResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Long locationId;
    private String locationName;
    private Long createdById;
    private String createdByName;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}