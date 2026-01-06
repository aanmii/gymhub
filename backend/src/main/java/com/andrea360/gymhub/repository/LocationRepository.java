package com.andrea360.gymhub.repository;

import com.andrea360.gymhub.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

    Optional<Location> findByName(String name);
    List<Location> findByActive(Boolean active);
    Boolean existsByName(String name);
}