package com.graduation.controller;

import com.graduation.common.PageResult;
import com.graduation.common.Result;
import com.graduation.dto.SelectionDTO;
import com.graduation.dto.SelectionReviewDTO;
import com.graduation.entity.Selection;
import com.graduation.service.SelectionService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

@RestController
@RequestMapping("/selections")
public class SelectionController {
    
    @Resource
    private SelectionService selectionService;
    
    @PostMapping("/student/select")
    public Result<Selection> selectTopic(@RequestBody SelectionDTO selectionDTO) {
        Selection selection = selectionService.selectTopic(selectionDTO);
        return Result.success(selection);
    }
    
    @GetMapping("/student/list")
    public Result<PageResult<Selection>> getStudentSelections(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResult<Selection> result = selectionService.getStudentSelections(page, size);
        return Result.success(result);
    }
    
    @GetMapping("/teacher/list")
    public Result<PageResult<Selection>> getTeacherSelections(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer status) {
        PageResult<Selection> result = selectionService.getTeacherSelections(page, size, status);
        return Result.success(result);
    }
    
    @PostMapping("/teacher/review")
    public Result<Selection> reviewSelection(@RequestBody SelectionReviewDTO reviewDTO) {
        Selection selection = selectionService.reviewSelection(reviewDTO);
        return Result.success(selection);
    }
    
    @GetMapping("/admin/list")
    public Result<PageResult<Selection>> getAllSelections(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer status) {
        PageResult<Selection> result = selectionService.getAllSelections(page, size, status);
        return Result.success(result);
    }
    
    @GetMapping("/{id}")
    public Result<Selection> getSelectionById(@PathVariable Long id) {
        Selection selection = selectionService.getSelectionById(id);
        return Result.success(selection);
    }
}
