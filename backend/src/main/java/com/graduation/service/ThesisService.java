package com.graduation.service;

import com.graduation.common.PageResult;
import com.graduation.dto.ThesisDTO;
import com.graduation.dto.ThesisReviewDTO;
import com.graduation.entity.*;
import com.graduation.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class ThesisService {
    
    @Value("${file.upload.path}")
    private String uploadPath;
    
    @Resource
    private ThesisRepository thesisRepository;
    
    @Resource
    private ThesisReviewRepository thesisReviewRepository;
    
    @Resource
    private SelectionRepository selectionRepository;
    
    @Resource
    private AuthService authService;
    
    @Transactional
    public Thesis submitThesis(ThesisDTO thesisDTO, MultipartFile file) {
        Student student = authService.getCurrentStudent();
        
        Optional<Selection> selectionOpt = selectionRepository.findByStudentAndStatus(student, 1);
        if (selectionOpt.isEmpty()) {
            throw new RuntimeException("您还没有通过审核的选题，无法提交论文");
        }
        
        Selection selection = selectionOpt.get();
        Topic topic = selection.getTopic();
        
        Optional<Thesis> lastThesisOpt = thesisRepository.findTopByStudentOrderByVersionDesc(student);
        int nextVersion = lastThesisOpt.map(thesis -> thesis.getVersion() + 1).orElse(1);
        
        Thesis thesis = new Thesis();
        thesis.setStudent(student);
        thesis.setTopic(topic);
        thesis.setTitle(thesisDTO.getTitle() != null ? thesisDTO.getTitle() : topic.getTitle());
        thesis.setAbstractText(thesisDTO.getAbstractText());
        thesis.setKeywords(thesisDTO.getKeywords());
        thesis.setVersion(nextVersion);
        thesis.setStatus(0);
        
        if (file != null && !file.isEmpty()) {
            try {
                String fileName = saveFile(file, student);
                thesis.setFilePath(fileName);
                thesis.setFileName(file.getOriginalFilename());
            } catch (IOException e) {
                throw new RuntimeException("文件上传失败: " + e.getMessage());
            }
        }
        
        return thesisRepository.save(thesis);
    }
    
    private String saveFile(MultipartFile file, Student student) throws IOException {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : "";
        String fileName = student.getStudentNo() + "_" + UUID.randomUUID().toString() + extension;
        String relativePath = "theses/" + dateStr + "/" + fileName;
        
        File destFile = new File(uploadPath + relativePath);
        if (!destFile.getParentFile().exists()) {
            destFile.getParentFile().mkdirs();
        }
        
        file.transferTo(destFile);
        return relativePath;
    }
    
    public PageResult<Thesis> getStudentTheses(int page, int size) {
        Student student = authService.getCurrentStudent();
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<Thesis> thesisPage = thesisRepository.findByStudent(student, pageable);
        return PageResult.of(thesisPage);
    }
    
    public Thesis getThesisById(Long id) {
        return thesisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("论文不存在"));
    }
    
    @Transactional
    public ThesisReview reviewThesis(ThesisReviewDTO reviewDTO) {
        Thesis thesis = thesisRepository.findById(reviewDTO.getThesisId())
                .orElseThrow(() -> new RuntimeException("论文不存在"));
        
        Teacher teacher = authService.getCurrentTeacher();
        
        if (thesis.getStatus() != 0) {
            throw new RuntimeException("该论文已被审核");
        }
        
        thesis.setStatus(reviewDTO.getStatus());
        thesisRepository.save(thesis);
        
        ThesisReview review = new ThesisReview();
        review.setThesis(thesis);
        review.setTeacher(teacher);
        review.setStatus(reviewDTO.getStatus());
        review.setComments(reviewDTO.getComments());
        review.setSuggestion(reviewDTO.getSuggestion());
        
        return thesisReviewRepository.save(review);
    }
    
    public PageResult<ThesisReview> getThesisReviews(Long thesisId, int page, int size) {
        Thesis thesis = thesisRepository.findById(thesisId)
                .orElseThrow(() -> new RuntimeException("论文不存在"));
        
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<ThesisReview> reviewPage = thesisReviewRepository.findByThesis(thesis, pageable);
        return PageResult.of(reviewPage);
    }
    
    public PageResult<Thesis> getAllTheses(int page, int size, Integer status) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        
        Page<Thesis> thesisPage;
        if (status != null) {
            thesisPage = thesisRepository.findByStatus(status, pageable);
        } else {
            thesisPage = thesisRepository.findAll(pageable);
        }
        return PageResult.of(thesisPage);
    }
    
    public List<Thesis> getStudentAllTheses() {
        Student student = authService.getCurrentStudent();
        return thesisRepository.findByStudent(student);
    }
}
