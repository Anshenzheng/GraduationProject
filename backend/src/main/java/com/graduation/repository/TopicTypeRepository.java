package com.graduation.repository;

import com.graduation.entity.TopicType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TopicTypeRepository extends JpaRepository<TopicType, Long> {
    Optional<TopicType> findByCode(String code);
}
