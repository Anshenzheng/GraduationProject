package com.graduation.repository;

import com.graduation.entity.Teacher;
import com.graduation.entity.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    Page<Topic> findByStatus(Integer status, Pageable pageable);
    Page<Topic> findByTeacher(Teacher teacher, Pageable pageable);
    Page<Topic> findByTeacherAndStatus(Teacher teacher, Integer status, Pageable pageable);
    List<Topic> findByTeacher(Teacher teacher);
}
