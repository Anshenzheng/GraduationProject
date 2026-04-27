package com.graduation.common;

import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
public class PageResult<T> {
    
    private List<T> records;
    private long total;
    private int current;
    private int size;
    private int pages;
    
    public static <T> PageResult<T> of(Page<T> page) {
        PageResult<T> result = new PageResult<>();
        result.setRecords(page.getContent());
        result.setTotal(page.getTotalElements());
        result.setCurrent(page.getNumber() + 1);
        result.setSize(page.getSize());
        result.setPages(page.getTotalPages());
        return result;
    }
    
    public static <T> PageResult<T> of(List<T> records, long total, int current, int size) {
        PageResult<T> result = new PageResult<>();
        result.setRecords(records);
        result.setTotal(total);
        result.setCurrent(current);
        result.setSize(size);
        result.setPages((int) Math.ceil((double) total / size));
        return result;
    }
}
