-- ============================================
-- 毕业设计选题管理系统数据库初始化脚本
-- 数据库名称: graduation_project_management
-- 字符集: utf8mb4
-- 排序规则: utf8mb4_unicode_ci
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS graduation_project_management 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

USE graduation_project_management;

-- ============================================
-- 1. 角色表
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '角色名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色代码',
    description VARCHAR(255) COMMENT '角色描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- ============================================
-- 2. 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
    name VARCHAR(100) NOT NULL COMMENT '姓名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '联系电话',
    avatar VARCHAR(255) COMMENT '头像路径',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================
-- 3. 用户角色关联表
-- ============================================
CREATE TABLE IF NOT EXISTS user_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_role (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- ============================================
-- 4. 教师信息表
-- ============================================
CREATE TABLE IF NOT EXISTS teachers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE COMMENT '用户ID',
    teacher_no VARCHAR(50) NOT NULL UNIQUE COMMENT '教师工号',
    department VARCHAR(100) COMMENT '所属院系',
    title VARCHAR(50) COMMENT '职称',
    research_direction VARCHAR(255) COMMENT '研究方向',
    max_students INT DEFAULT 10 COMMENT '最大指导学生数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_teachers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教师信息表';

-- ============================================
-- 5. 学生信息表
-- ============================================
CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE COMMENT '用户ID',
    student_no VARCHAR(50) NOT NULL UNIQUE COMMENT '学号',
    department VARCHAR(100) COMMENT '所属院系',
    major VARCHAR(100) COMMENT '专业',
    class_name VARCHAR(50) COMMENT '班级',
    grade VARCHAR(20) COMMENT '年级',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生信息表';

-- ============================================
-- 6. 题目类型表
-- ============================================
CREATE TABLE IF NOT EXISTS topic_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE COMMENT '类型名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '类型代码',
    description VARCHAR(255) COMMENT '类型描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='题目类型表';

-- ============================================
-- 7. 毕业设计题目表
-- ============================================
CREATE TABLE IF NOT EXISTS topics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT '题目名称',
    description TEXT COMMENT '题目描述',
    type_id BIGINT COMMENT '题目类型ID',
    teacher_id BIGINT NOT NULL COMMENT '发布教师ID',
    max_students INT DEFAULT 1 COMMENT '最大可选学生数',
    current_students INT DEFAULT 0 COMMENT '当前已选学生数',
    status TINYINT DEFAULT 1 COMMENT '状态：0-下架，1-上架',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_topics_type FOREIGN KEY (type_id) REFERENCES topic_types(id) ON DELETE SET NULL,
    CONSTRAINT fk_topics_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='毕业设计题目表';

-- ============================================
-- 8. 选题记录表
-- ============================================
CREATE TABLE IF NOT EXISTS selections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL COMMENT '学生ID',
    topic_id BIGINT NOT NULL COMMENT '题目ID',
    teacher_id BIGINT NOT NULL COMMENT '教师ID',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待审核，1-已通过，2-已拒绝',
    reason VARCHAR(500) COMMENT '拒绝原因',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_student_topic (student_id, topic_id),
    CONSTRAINT fk_selections_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_selections_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    CONSTRAINT fk_selections_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='选题记录表';

-- ============================================
-- 9. 论文表
-- ============================================
CREATE TABLE IF NOT EXISTS theses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL COMMENT '学生ID',
    topic_id BIGINT NOT NULL COMMENT '题目ID',
    title VARCHAR(200) NOT NULL COMMENT '论文标题',
    abstract TEXT COMMENT '论文摘要',
    keywords VARCHAR(500) COMMENT '关键词',
    file_path VARCHAR(255) COMMENT '论文文件路径',
    file_name VARCHAR(255) COMMENT '原始文件名',
    version INT DEFAULT 1 COMMENT '版本号',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待审核，1-已通过，2-需修改',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_theses_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_theses_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='论文表';

-- ============================================
-- 10. 论文审核记录表
-- ============================================
CREATE TABLE IF NOT EXISTS thesis_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    thesis_id BIGINT NOT NULL COMMENT '论文ID',
    teacher_id BIGINT NOT NULL COMMENT '审核教师ID',
    status TINYINT NOT NULL COMMENT '审核结果：1-通过，2-需修改',
    comments TEXT COMMENT '审核意见',
    suggestion TEXT COMMENT '修改建议',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_thesis FOREIGN KEY (thesis_id) REFERENCES theses(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='论文审核记录表';

-- ============================================
-- 11. 毕设进度状态表
-- ============================================
CREATE TABLE IF NOT EXISTS progress_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL COMMENT '学生ID',
    topic_id BIGINT NOT NULL COMMENT '题目ID',
    stage VARCHAR(100) NOT NULL COMMENT '当前阶段',
    status TINYINT DEFAULT 0 COMMENT '状态：0-进行中，1-已完成',
    description TEXT COMMENT '详细描述',
    completed_at DATETIME COMMENT '完成时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_progress_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='毕设进度状态表';

-- ============================================
-- 插入初始数据
-- ============================================

-- 插入角色
INSERT INTO roles (name, code, description) VALUES 
('系统管理员', 'ADMIN', '系统管理员，拥有所有权限'),
('指导教师', 'TEACHER', '指导教师，可以发布题目和审核论文'),
('学生', 'STUDENT', '学生，可以选择题目和提交论文');

-- 插入题目类型
INSERT INTO topic_types (name, code, description) VALUES 
('工程设计类', 'ENGINEERING_DESIGN', '工程设计类题目'),
('理论研究类', 'THEORETICAL_RESEARCH', '理论研究类题目'),
('应用研究类', 'APPLIED_RESEARCH', '应用研究类题目'),
('软件开发类', 'SOFTWARE_DEVELOPMENT', '软件开发类题目'),
('综合实验类', 'COMPREHENSIVE_EXPERIMENT', '综合实验类题目');

-- 插入默认管理员（密码：admin123，使用BCrypt加密）
INSERT INTO users (username, password, name, email, phone, status) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '系统管理员', 'admin@graduation.com', '13800138000', 1);

-- 为管理员分配角色
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);

-- 插入示例教师数据
INSERT INTO users (username, password, name, email, phone, status) VALUES 
('teacher1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '张教授', 'zhang@university.com', '13800138001', 1),
('teacher2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '李教授', 'li@university.com', '13800138002', 1);

INSERT INTO teachers (user_id, teacher_no, department, title, research_direction, max_students) VALUES 
(2, 'T2024001', '计算机科学与技术学院', '教授', '人工智能、机器学习', 15),
(3, 'T2024002', '计算机科学与技术学院', '副教授', '软件工程、大数据', 10);

INSERT INTO user_roles (user_id, role_id) VALUES (2, 2), (3, 2);

-- 插入示例学生数据
INSERT INTO users (username, password, name, email, phone, status) VALUES 
('student1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '张三', 'zhangsan@student.com', '13800138011', 1),
('student2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '李四', 'lisi@student.com', '13800138012', 1),
('student3', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '王五', 'wangwu@student.com', '13800138013', 1);

INSERT INTO students (user_id, student_no, department, major, class_name, grade) VALUES 
(4, 'S2024001', '计算机科学与技术学院', '软件工程', '软件1班', '2020级'),
(5, 'S2024002', '计算机科学与技术学院', '计算机科学与技术', '计科1班', '2020级'),
(6, 'S2024003', '计算机科学与技术学院', '人工智能', '智能1班', '2020级');

INSERT INTO user_roles (user_id, role_id) VALUES (4, 3), (5, 3), (6, 3);

-- 插入示例题目数据
INSERT INTO topics (title, description, type_id, teacher_id, max_students, current_students, status) VALUES 
('基于深度学习的图像识别系统设计', '本课题旨在研究深度学习在图像识别领域的应用，设计并实现一个高性能的图像识别系统。', 4, 1, 3, 0, 1),
('大数据分析平台的设计与实现', '研究大数据技术在企业中的应用，设计并实现一个可扩展的大数据分析平台。', 4, 2, 2, 0, 1),
('人工智能在医疗诊断中的应用研究', '探索人工智能技术在医疗诊断领域的应用，特别是在影像诊断方面的研究。', 3, 1, 2, 0, 1),
('移动应用开发中的用户体验优化研究', '研究移动应用开发中的用户体验设计原则，提出优化策略并进行实际验证。', 1, 2, 2, 0, 1);
