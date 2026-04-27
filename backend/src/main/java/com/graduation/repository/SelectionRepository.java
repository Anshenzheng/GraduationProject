package com.graduation.repository;

import com.graduation.entity.Selection;
import com.graduation.entity.Student;
import com.graduation.entity.Teacher;
import com.graduation.entity.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SelectionRepository extends JpaRepository<Selection, Long> {
    Page<Selection> findByTeacher(Teacher teacher, Pageable pageable);
    Page<Selection> findByTeacherAndStatus(Teacher teacher, Integer status, Pageable pageable);
    Page<Selection> findByStudent(Student student, Pageable pageable);
    Page<Selection> findByTopic(Topic topic, Pageable pageable);
    Page<Selection> findByStatus(Integer status, Pageable pageable);
    Optional<Selection> findByStudentAndTopic(Student student, Topic topic);
    Optional<Selection> findByStudentAndStatus(Student student, Integer status);
    boolean existsByStudentAndStatus(Student student, Integer status);
    List<Selection> findByTopic(Topic topic);
    List<Selection> findByStatus(Integer status);
}
