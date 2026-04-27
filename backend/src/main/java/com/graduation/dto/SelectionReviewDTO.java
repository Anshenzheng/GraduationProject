package com.graduation.dto;

import lombok.Data;

@Data
public class SelectionReviewDTO {
    private Long selectionId;
    private Integer status;
    private String reason;
}
