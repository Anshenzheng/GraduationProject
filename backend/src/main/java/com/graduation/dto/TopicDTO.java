package com.graduation.dto;

import lombok.Data;

@Data
public class TopicDTO {
    private String title;
    private String description;
    private Long typeId;
    private Integer maxStudents;
}
