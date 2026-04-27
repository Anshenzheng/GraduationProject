package com.graduation.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "thesis_reviews")
public class ThesisReview {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "thesis_id", nullable = false)
    private Thesis thesis;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;
    
    @Column(columnDefinition = "TINYINT")
    private Integer status;
    
    @Column(columnDefinition = "TEXT")
    private String comments;
    
    @Column(columnDefinition = "TEXT")
    private String suggestion;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
