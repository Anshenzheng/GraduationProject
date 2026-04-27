package com.graduation.service;

import com.graduation.common.PageResult;
import com.graduation.dto.TopicDTO;
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
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class TopicService {
    
    @Resource
    private TopicRepository topicRepository;
    
    @Resource
    private TopicTypeRepository topicTypeRepository;
    
    @Resource
    private AuthService authService;
    
    @Resource
    private SelectionRepository selectionRepository;
    
    public PageResult<Topic> getPublicTopics(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<Topic> topicPage = topicRepository.findByStatus(1, pageable);
        return PageResult.of(topicPage);
    }
    
    public PageResult<Topic> getTeacherTopics(int page, int size) {
        Teacher teacher = authService.getCurrentTeacher();
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<Topic> topicPage = topicRepository.findByTeacher(teacher, pageable);
        return PageResult.of(topicPage);
    }
    
    public Topic getTopicById(Long id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("题目不存在"));
    }
    
    @Transactional
    public Topic createTopic(TopicDTO topicDTO) {
        Teacher teacher = authService.getCurrentTeacher();
        
        Topic topic = new Topic();
        topic.setTitle(topicDTO.getTitle());
        topic.setDescription(topicDTO.getDescription());
        topic.setTeacher(teacher);
        topic.setMaxStudents(topicDTO.getMaxStudents() != null ? topicDTO.getMaxStudents() : 1);
        topic.setCurrentStudents(0);
        topic.setStatus(1);
        
        if (topicDTO.getTypeId() != null) {
            Optional<TopicType> typeOpt = topicTypeRepository.findById(topicDTO.getTypeId());
            typeOpt.ifPresent(topic::setType);
        }
        
        return topicRepository.save(topic);
    }
    
    @Transactional
    public Topic updateTopic(Long id, TopicDTO topicDTO) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("题目不存在"));
        
        Teacher teacher = authService.getCurrentTeacher();
        if (!topic.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("无权修改此题目");
        }
        
        topic.setTitle(topicDTO.getTitle());
        topic.setDescription(topicDTO.getDescription());
        topic.setMaxStudents(topicDTO.getMaxStudents() != null ? topicDTO.getMaxStudents() : topic.getMaxStudents());
        
        if (topicDTO.getTypeId() != null) {
            Optional<TopicType> typeOpt = topicTypeRepository.findById(topicDTO.getTypeId());
            typeOpt.ifPresent(topic::setType);
        }
        
        return topicRepository.save(topic);
    }
    
    @Transactional
    public void deleteTopic(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("题目不存在"));
        
        Teacher teacher = authService.getCurrentTeacher();
        if (!topic.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("无权删除此题目");
        }
        
        if (topic.getCurrentStudents() > 0) {
            throw new RuntimeException("该题目已有学生选择，无法删除");
        }
        
        topicRepository.delete(topic);
    }
    
    @Transactional
    public Topic toggleTopicStatus(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("题目不存在"));
        
        Teacher teacher = authService.getCurrentTeacher();
        if (!topic.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("无权操作此题目");
        }
        
        topic.setStatus(topic.getStatus() == 1 ? 0 : 1);
        return topicRepository.save(topic);
    }
    
    public List<TopicType> getAllTopicTypes() {
        return topicTypeRepository.findAll();
    }
    
    public PageResult<Topic> getAllTopics(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<Topic> topicPage = topicRepository.findAll(pageable);
        return PageResult.of(topicPage);
    }
}
