package com.andrea360.gymhub.repository;

import com.andrea360.gymhub.entity.Role;
import com.andrea360.gymhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByLocationId(Long locationId);
    List<User> findByLocationIdAndRole(Long locationId, Role role);
    List<User> findByActive(Boolean active);

}