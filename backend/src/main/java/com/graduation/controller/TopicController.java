package com.graduation.controller;

import com.graduation.common.PageResult;
import com.graduation.common.Result;
import com.graduation.dto.TopicDTO;
import com.graduation.entity.Topic;
import com.graduation.entity.TopicType;
import com.graduation.service.TopicService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

@RestController
@RequestMapping("/topics")
public class TopicController {
    
    @Resource
    private TopicService topicService;
    
    @GetMapping("/public/list")
    public Result<PageResult<Topic>> getPublicTopics(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResult<Topic> result = topicService.getPublicTopics(page, size);
        return Result.success(result);
    }
    
    @GetMapping("/public/{id}")
    public Result<Topic> getPublicTopicById(@PathVariable Long id) {
        Topic topic = topicService.getTopicById(id);
        return Result.success(topic);
    }
    
    @GetMapping("/teacher/list")
    public Result<PageResult<Topic>> getTeacherTopics(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResult<Topic> result = topicService.getTeacherTopics(page, size);
        return Result.success(result);
    }
    
    @PostMapping("/teacher/create")
    public Result<Topic> createTopic(@RequestBody TopicDTO topicDTO) {
        Topic topic = topicService.createTopic(topicDTO);
        return Result.success(topic);
    }
    
    @PutMapping("/teacher/{id}")
    public Result<Topic> updateTopic(@PathVariable Long id, @RequestBody TopicDTO topicDTO) {
        Topic topic = topicService.updateTopic(id, topicDTO);
        return Result.success(topic);
    }
    
    @DeleteMapping("/teacher/{id}")
    public Result<Void> deleteTopic(@PathVariable Long id) {
        topicService.deleteTopic(id);
        return Result.success();
    }
    
    @PutMapping("/teacher/{id}/toggle")
    public Result<Topic> toggleTopicStatus(@PathVariable Long id) {
        Topic topic = topicService.toggleTopicStatus(id);
        return Result.success(topic);
    }
    
    @GetMapping("/types")
    public Result<List<TopicType>> getAllTopicTypes() {
        List<TopicType> types = topicService.getAllTopicTypes();
        return Result.success(types);
    }
    
    @GetMapping("/admin/list")
    public Result<PageResult<Topic>> getAllTopics(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResult<Topic> result = topicService.getAllTopics(page, size);
        return Result.success(result);
    }
}
