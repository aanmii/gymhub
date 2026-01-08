package com.andrea360.gymhub.repository;

import com.andrea360.gymhub.entity.GymService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GymServiceRepository extends JpaRepository<GymService, Long> {

    List<GymService> findByLocationId(Long locationId);
    List<GymService> findByLocationIdAndActive(Long locationId, Boolean active);
    List<GymService> findByActive(Boolean active);
    List<GymService> findByCreatedById(Long employeeId);
    Boolean existsByNameAndLocationId(String name, Long locationId);
}