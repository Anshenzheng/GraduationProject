package com.graduation.repository;

import com.graduation.entity.Student;
import com.graduation.entity.Teacher;
import com.graduation.entity.Thesis;
import com.graduation.entity.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ThesisRepository extends JpaRepository<Thesis, Long> {
    Page<Thesis> findByStudent(Student student, Pageable pageable);
    Page<Thesis> findByTopic(Topic topic, Pageable pageable);
    Page<Thesis> findByStatus(Integer status, Pageable pageable);
    Optional<Thesis> findTopByStudentOrderByVersionDesc(Student student);
    List<Thesis> findByStudent(Student student);
}
