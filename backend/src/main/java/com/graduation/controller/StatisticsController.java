package com.graduation.controller;

import com.graduation.common.Result;
import com.graduation.service.StatisticsService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/statistics")
public class StatisticsController {
    
    @Resource
    private StatisticsService statisticsService;
    
    @GetMapping("/overview")
    public Result<Map<String, Object>> getOverviewStatistics() {
        Map<String, Object> statistics = statisticsService.getOverviewStatistics();
        return Result.success(statistics);
    }
    
    @GetMapping("/topic-types")
    public Result<Map<String, Object>> getTopicTypeStatistics() {
        Map<String, Object> statistics = statisticsService.getTopicTypeStatistics();
        return Result.success(statistics);
    }
    
    @GetMapping("/teachers")
    public Result<Map<String, Object>> getTeacherStatistics() {
        Map<String, Object> statistics = statisticsService.getTeacherStatistics();
        return Result.success(statistics);
    }
    
    @GetMapping("/export/selections")
    public ResponseEntity<byte[]> exportSelections() throws IOException {
        byte[] data = statisticsService.exportSelectionsToExcel();
        
        String fileName = URLEncoder.encode("选题名单_" + System.currentTimeMillis() + ".xlsx", StandardCharsets.UTF_8.toString());
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + fileName)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }
}
