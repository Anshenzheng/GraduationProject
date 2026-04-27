package com.graduation.repository;

import com.graduation.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByUserId(Long userId);
    Optional<Teacher> findByTeacherNo(String teacherNo);
    boolean existsByTeacherNo(String teacherNo);
}
