package com.graduation.dto;

import lombok.Data;

@Data
public class ThesisReviewDTO {
    private Long thesisId;
    private Integer status;
    private String comments;
    private String suggestion;
}
