package com.graduation.controller;

import com.graduation.common.PageResult;
import com.graduation.common.Result;
import com.graduation.dto.ThesisDTO;
import com.graduation.dto.ThesisReviewDTO;
import com.graduation.entity.Thesis;
import com.graduation.entity.ThesisReview;
import com.graduation.service.ThesisService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import java.util.List;

@RestController
@RequestMapping("/theses")
public class ThesisController {
    
    @Resource
    private ThesisService thesisService;
    
    @PostMapping(value = "/student/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<Thesis> submitThesis(
            @RequestPart("thesis") ThesisDTO thesisDTO,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        Thesis thesis = thesisService.submitThesis(thesisDTO, file);
        return Result.success(thesis);
    }
    
    @GetMapping("/student/list")
    public Result<PageResult<Thesis>> getStudentTheses(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResult<Thesis> result = thesisService.getStudentTheses(page, size);
        return Result.success(result);
    }
    
    @GetMapping("/student/all")
    public Result<List<Thesis>> getStudentAllTheses() {
        List<Thesis> theses = thesisService.getStudentAllTheses();
        return Result.success(theses);
    }
    
    @GetMapping("/{id}")
    public Result<Thesis> getThesisById(@PathVariable Long id) {
        Thesis thesis = thesisService.getThesisById(id);
        return Result.success(thesis);
    }
    
    @PostMapping("/teacher/review")
    public Result<ThesisReview> reviewThesis(@RequestBody ThesisReviewDTO reviewDTO) {
        ThesisReview review = thesisService.reviewThesis(reviewDTO);
        return Result.success(review);
    }
    
    @GetMapping("/{id}/reviews")
    public Result<PageResult<ThesisReview>> getThesisReviews(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResult<ThesisReview> result = thesisService.getThesisReviews(id, page, size);
        return Result.success(result);
    }
    
    @GetMapping("/admin/list")
    public Result<PageResult<Thesis>> getAllTheses(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer status) {
        PageResult<Thesis> result = thesisService.getAllTheses(page, size, status);
        return Result.success(result);
    }
}
