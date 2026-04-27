package com.graduation.service;

import com.graduation.common.PageResult;
import com.graduation.dto.SelectionDTO;
import com.graduation.dto.SelectionReviewDTO;
import com.graduation.entity.*;
import com.graduation.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;

@Slf4j
@Service
public class SelectionService {
    
    @Resource
    private SelectionRepository selectionRepository;
    
    @Resource
    private TopicRepository topicRepository;
    
    @Resource
    private AuthService authService;
    
    @Transactional
    public Selection selectTopic(SelectionDTO selectionDTO) {
        Student student = authService.getCurrentStudent();
        
        if (selectionRepository.existsByStudentAndStatus(student, 1)) {
            throw new RuntimeException("您已经有通过审核的选题，无法再选择");
        }
        
        if (selectionRepository.existsByStudentAndStatus(student, 0)) {
            throw new RuntimeException("您已有待审核的选题，请等待审核结果");
        }
        
        Topic topic = topicRepository.findById(selectionDTO.getTopicId())
                .orElseThrow(() -> new RuntimeException("题目不存在"));
        
        if (topic.getStatus() != 1) {
            throw new RuntimeException("该题目已下架");
        }
        
        if (topic.getCurrentStudents() >= topic.getMaxStudents()) {
            throw new RuntimeException("该题目已选满");
        }
        
        Selection selection = new Selection();
        selection.setStudent(student);
        selection.setTopic(topic);
        selection.setTeacher(topic.getTeacher());
        selection.setStatus(0);
        
        return selectionRepository.save(selection);
    }
    
    public PageResult<Selection> getStudentSelections(int page, int size) {
        Student student = authService.getCurrentStudent();
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<Selection> selectionPage = selectionRepository.findByStudent(student, pageable);
        return PageResult.of(selectionPage);
    }
    
    public PageResult<Selection> getTeacherSelections(int page, int size, Integer status) {
        Teacher teacher = authService.getCurrentTeacher();
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        
        Page<Selection> selectionPage;
        if (status != null) {
            selectionPage = selectionRepository.findByTeacherAndStatus(teacher, status, pageable);
        } else {
            selectionPage = selectionRepository.findByTeacher(teacher, pageable);
        }
        return PageResult.of(selectionPage);
    }
    
    @Transactional
    public Selection reviewSelection(SelectionReviewDTO reviewDTO) {
        Selection selection = selectionRepository.findById(reviewDTO.getSelectionId())
                .orElseThrow(() -> new RuntimeException("选题记录不存在"));
        
        Teacher teacher = authService.getCurrentTeacher();
        if (!selection.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("无权审核此选题");
        }
        
        if (selection.getStatus() != 0) {
            throw new RuntimeException("该选题已被审核");
        }
        
        selection.setStatus(reviewDTO.getStatus());
        if (reviewDTO.getStatus() == 2) {
            selection.setReason(reviewDTO.getReason());
        }
        
        if (reviewDTO.getStatus() == 1) {
            Topic topic = selection.getTopic();
            topic.setCurrentStudents(topic.getCurrentStudents() + 1);
            topicRepository.save(topic);
        }
        
        return selectionRepository.save(selection);
    }
    
    public PageResult<Selection> getAllSelections(int page, int size, Integer status) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        
        Page<Selection> selectionPage;
        if (status != null) {
            selectionPage = selectionRepository.findByStatus(status, pageable);
        } else {
            selectionPage = selectionRepository.findAll(pageable);
        }
        return PageResult.of(selectionPage);
    }
    
    public Selection getSelectionById(Long id) {
        return selectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("选题记录不存在"));
    }
}
