package com.graduation.repository;

import com.graduation.entity.Thesis;
import com.graduation.entity.ThesisReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThesisReviewRepository extends JpaRepository<ThesisReview, Long> {
    Page<ThesisReview> findByThesis(Thesis thesis, Pageable pageable);
    List<ThesisReview> findByThesis(Thesis thesis);
}
