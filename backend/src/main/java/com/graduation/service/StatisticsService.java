package com.graduation.service;

import com.graduation.entity.Selection;
import com.graduation.entity.Thesis;
import com.graduation.entity.Topic;
import com.graduation.repository.SelectionRepository;
import com.graduation.repository.ThesisRepository;
import com.graduation.repository.TopicRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class StatisticsService {
    
    @Resource
    private TopicRepository topicRepository;
    
    @Resource
    private SelectionRepository selectionRepository;
    
    @Resource
    private ThesisRepository thesisRepository;
    
    public Map<String, Object> getOverviewStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        
        List<Topic> allTopics = topicRepository.findAll();
        long totalTopics = allTopics.size();
        long activeTopics = allTopics.stream().filter(t -> t.getStatus() == 1).count();
        
        List<Selection> allSelections = selectionRepository.findAll();
        long totalSelections = allSelections.size();
        long approvedSelections = allSelections.stream().filter(s -> s.getStatus() == 1).count();
        long pendingSelections = allSelections.stream().filter(s -> s.getStatus() == 0).count();
        
        List<Thesis> allTheses = thesisRepository.findAll();
        long totalTheses = allTheses.size();
        long approvedTheses = allTheses.stream().filter(t -> t.getStatus() == 1).count();
        
        statistics.put("totalTopics", totalTopics);
        statistics.put("activeTopics", activeTopics);
        statistics.put("totalSelections", totalSelections);
        statistics.put("approvedSelections", approvedSelections);
        statistics.put("pendingSelections", pendingSelections);
        statistics.put("totalTheses", totalTheses);
        statistics.put("approvedTheses", approvedTheses);
        
        return statistics;
    }
    
    public Map<String, Object> getTopicTypeStatistics() {
        Map<String, Object> result = new HashMap<>();
        
        List<Topic> allTopics = topicRepository.findAll();
        
        Map<String, Long> typeCount = new HashMap<>();
        Map<String, Long> typeSelected = new HashMap<>();
        
        for (Topic topic : allTopics) {
            String typeName = topic.getType() != null ? topic.getType().getName() : "未分类";
            typeCount.put(typeName, typeCount.getOrDefault(typeName, 0L) + 1);
            
            if (topic.getCurrentStudents() > 0) {
                typeSelected.put(typeName, typeSelected.getOrDefault(typeName, 0L) + topic.getCurrentStudents());
            }
        }
        
        result.put("typeCount", typeCount);
        result.put("typeSelected", typeSelected);
        
        return result;
    }
    
    public Map<String, Object> getTeacherStatistics() {
        Map<String, Object> result = new HashMap<>();
        
        List<Topic> allTopics = topicRepository.findAll();
        
        Map<String, Long> teacherTopicCount = new HashMap<>();
        Map<String, Long> teacherStudentCount = new HashMap<>();
        
        for (Topic topic : allTopics) {
            String teacherName = topic.getTeacher().getUser().getName();
            teacherTopicCount.put(teacherName, teacherTopicCount.getOrDefault(teacherName, 0L) + 1);
            
            if (topic.getCurrentStudents() > 0) {
                teacherStudentCount.put(teacherName, teacherStudentCount.getOrDefault(teacherName, 0L) + topic.getCurrentStudents());
            }
        }
        
        result.put("teacherTopicCount", teacherTopicCount);
        result.put("teacherStudentCount", teacherStudentCount);
        
        return result;
    }
    
    public byte[] exportSelectionsToExcel() throws IOException {
        List<Selection> selections = selectionRepository.findByStatus(1);
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("选题名单");
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {"学号", "学生姓名", "题目名称", "指导教师", "选题时间"};
            
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 20 * 256);
            }
            
            int rowNum = 1;
            for (Selection selection : selections) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(selection.getStudent().getStudentNo());
                row.createCell(1).setCellValue(selection.getStudent().getUser().getName());
                row.createCell(2).setCellValue(selection.getTopic().getTitle());
                row.createCell(3).setCellValue(selection.getTeacher().getUser().getName());
                row.createCell(4).setCellValue(selection.getCreatedAt().toString());
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }
}
