package com.andrea360.gymhub.controller;

import com.andrea360.gymhub.dto.CreateEmployeeRequest;
import com.andrea360.gymhub.dto.EmployeeResponse;
import com.andrea360.gymhub.service.EmployeeService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/employees")
@Tag(name = "Employees")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeResponse create(@Valid @RequestBody CreateEmployeeRequest request) {
        return employeeService.createEmployee(request);
    }

    @GetMapping
    public List<EmployeeResponse> getAll() {
        return employeeService.getAllEmployees();
    }

    @GetMapping("/location/{locationId}")
    public List<EmployeeResponse> getByLocation(@PathVariable Long locationId) {
        return employeeService.getEmployeesByLocation(locationId);
    }
}
