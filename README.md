# 毕业设计选题管理系统

## 项目简介

本系统是一个基于 Angular + Spring Boot + MySQL 技术栈开发的毕业设计选题管理系统，实现了学生选题、教师审核、论文管理等核心功能。

### 技术栈

- **前端**: Angular 15 + Ng-Zorro-Antd (UI组件库)
- **后端**: Spring Boot 2.7 + Spring Security + JPA
- **数据库**: MySQL 8.0
- **认证方式**: JWT (JSON Web Token)

### 核心功能

1. **权限管理**
   - 用户注册和登录
   - 三种角色：系统管理员、教师、学生
   - 基于角色的权限控制

2. **题目管理**
   - 教师发布、编辑、删除、上下架题目
   - 学生浏览题目列表和详情
   - 题目类型分类管理

3. **选题管理**
   - 学生在线选择题目
   - 教师审核选题申请
   - 选题状态跟踪

4. **论文管理**
   - 学生上传论文（支持多版本）
   - 教师审核论文并给出修改建议
   - 论文状态管理

5. **统计分析**
   - 系统概览统计
   - 题目类型分布统计
   - 教师工作量统计
   - 选题名单导出（Excel）

### 项目结构

```
GraduationProject/
├── backend/                    # 后端项目
│   ├── src/main/java/com/graduation/
│   │   ├── common/            # 通用类（统一响应、分页）
│   │   ├── config/            # 配置类（安全配置）
│   │   ├── controller/        # 控制器层
│   │   ├── dto/               # 数据传输对象
│   │   ├── entity/            # 实体类
│   │   ├── exception/         # 异常处理
│   │   ├── repository/        # 数据访问层
│   │   ├── security/          # 安全认证（JWT）
│   │   └── service/           # 业务逻辑层
│   ├── src/main/resources/
│   │   └── application.yml    # 应用配置
│   └── pom.xml
├── database/                   # 数据库脚本
│   └── init.sql              # 初始化脚本
├── frontend/                   # 前端项目
│   ├── src/app/
│   │   ├── components/        # 组件
│   │   ├── guards/            # 路由守卫
│   │   ├── interceptors/      # HTTP拦截器
│   │   └── services/          # 服务层
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## 环境要求

在开始之前，请确保您的环境已安装以下软件：

| 软件 | 版本要求 | 下载地址 |
|------|----------|----------|
| JDK | 11+ | https://adoptium.net/ |
| Node.js | 16+ | https://nodejs.org/ |
| MySQL | 8.0+ | https://www.mysql.com/ |
| Maven | 3.6+ | https://maven.apache.org/ |
| Angular CLI | 15.x | `npm install -g @angular/cli@15` |

---

## 启动步骤

### 第一步：初始化数据库

1. **登录 MySQL**

```bash
mysql -u root -p
```

2. **执行初始化脚本**

```sql
-- 方式一：在 MySQL 命令行中执行
source d:/Annan/AI/anotherWay/trae/solo/20260427/GraduationProject/database/init.sql

-- 方式二：使用 MySQL Workbench 或 Navicat 等工具直接导入
```

3. **初始化脚本说明**

- 创建数据库 `graduation_project_management`
- 创建 11 张核心数据表
- 插入初始数据（角色、题目类型、测试用户）

### 第二步：配置后端

1. **修改数据库配置**

编辑 `backend/src/main/resources/application.yml` 文件：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/graduation_project_management?useUnicode=true&characterEncoding=utf8mb4&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
    username: root        # 修改为您的 MySQL 用户名
    password: root        # 修改为您的 MySQL 密码
```

2. **（可选）配置 Redis**

如果您的环境没有安装 Redis，可以忽略此配置，或者安装 Redis：

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password:          # 如果有密码请填写
      database: 0
```

### 第三步：启动后端服务

**方式一：使用 Maven 命令行启动**

```bash
cd backend

# 下载依赖并启动
mvn clean install
mvn spring-boot:run
```

**方式二：使用 IDE（IntelliJ IDEA）启动**

1. 用 IDEA 打开 `backend` 目录
2. 等待 Maven 依赖下载完成
3. 找到 `GraduationProjectApplication.java` 文件
4. 右键选择 `Run 'GraduationProjectApplication'`

**验证后端启动**

后端服务默认运行在 `http://localhost:8080`

打开浏览器访问：`http://localhost:8080/api/topics/types`

如果返回 JSON 数据（包含题目类型列表），说明后端启动成功。

### 第四步：启动前端服务

1. **安装依赖**

```bash
cd frontend

# 使用 npm 安装依赖
npm install

# 或者使用 yarn
yarn install
```

2. **启动开发服务器**

```bash
# 启动 Angular 开发服务器
ng serve

# 或者使用 npm 脚本
npm start
```

前端服务默认运行在 `http://localhost:4200`

---

## 访问系统

打开浏览器访问：**http://localhost:4200**

### 默认测试账号

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 系统管理员 | admin | admin123 | 拥有所有权限 |
| 教师 | teacher1 | admin123 | 可以发布题目和审核论文 |
| 教师 | teacher2 | admin123 | 第二个测试教师账号 |
| 学生 | student1 | admin123 | 可以选择题目和提交论文 |
| 学生 | student2 | admin123 | 第二个测试学生账号 |
| 学生 | student3 | admin123 | 第三个测试学生账号 |

---

## 功能验证

### 1. 登录/注册功能验证

**验证步骤：**
1. 访问 http://localhost:4200/login
2. 使用账号 `admin` / `admin123` 登录
3. 验证是否成功跳转到首页
4. 退出登录，使用注册页面创建新账号

**预期结果：**
- 登录成功后显示首页
- 可以看到用户信息
- 左侧菜单根据角色显示不同功能

### 2. 学生功能验证

**使用账号：** `student1` / `admin123`

**可访问功能：**
1. **首页** - 显示欢迎信息和快捷操作
2. **题目浏览** - 浏览所有上架的题目
   - 点击「浏览题目」查看题目列表
   - 点击「查看详情」查看题目详细信息
   - 点击「选择此题」提交选题申请

3. **我的选题** - 查看选题记录
   - 显示所有选题申请记录
   - 显示审核状态（待审核/已通过/已拒绝）

4. **论文提交** - 提交毕业论文
   - 点击「提交论文」上传论文
   - 填写论文标题、关键词、摘要
   - 上传论文文件（doc/docx/pdf）

### 3. 教师功能验证

**使用账号：** `teacher1` / `admin123`

**可访问功能：**
1. **我的题目** - 管理发布的题目
   - 点击「发布新题目」创建题目
   - 编辑、删除、上下架题目
   - 查看题目被选情况

2. **选题审核** - 审核学生选题申请
   - 查看待审核的选题申请
   - 选择「通过」或「拒绝」
   - 拒绝时需要填写原因

3. **论文审核** - 审核学生论文
   - 查看待审核的论文
   - 点击「通过」或「需修改」
   - 填写审核意见和修改建议

### 4. 管理员功能验证

**使用账号：** `admin` / `admin123`

**可访问功能：**
1. **首页** - 系统概览统计
   - 总题目数、上架题目数
   - 总选题数、已通过选题数、待审核选题数
   - 总论文数

2. **统计分析** - 数据统计
   - 系统概览卡片
   - 题目类型分布（进度条展示）
   - 教师工作量统计
   - 点击「导出选题名单」下载 Excel 文件

---

## API 接口说明

### 基础路径

后端 API 基础路径：`http://localhost:8080/api`

### 认证接口

| 方法 | 路径 | 说明 | 是否需要登录 |
|------|------|------|--------------|
| POST | /auth/login | 用户登录 | 否 |
| POST | /auth/register | 用户注册 | 否 |
| GET | /auth/current | 获取当前用户 | 是 |

### 题目接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /topics/public/list | 获取公开题目列表 | 所有人 |
| GET | /topics/public/{id} | 获取题目详情 | 所有人 |
| GET | /topics/teacher/list | 获取教师题目列表 | 教师 |
| POST | /topics/teacher/create | 创建题目 | 教师 |
| PUT | /topics/teacher/{id} | 更新题目 | 教师 |
| DELETE | /topics/teacher/{id} | 删除题目 | 教师 |
| GET | /topics/types | 获取题目类型列表 | 所有人 |

### 选题接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /selections/student/select | 选择题目 | 学生 |
| GET | /selections/student/list | 获取学生选题记录 | 学生 |
| GET | /selections/teacher/list | 获取教师选题列表 | 教师 |
| POST | /selections/teacher/review | 审核选题 | 教师 |

### 论文接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /theses/student/submit | 提交论文 | 学生 |
| GET | /theses/student/list | 获取学生论文列表 | 学生 |
| POST | /theses/teacher/review | 审核论文 | 教师 |
| GET | /theses/admin/list | 获取所有论文列表 | 管理员 |

### 统计接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /statistics/overview | 获取概览统计 | 管理员 |
| GET | /statistics/topic-types | 获取题目类型统计 | 管理员 |
| GET | /statistics/teachers | 获取教师统计 | 管理员 |
| GET | /statistics/export/selections | 导出选题名单 | 管理员 |

---

## 常见问题

### Q1: 后端启动失败，提示数据库连接错误

**解决方案：**
1. 确认 MySQL 服务已启动
2. 检查 `application.yml` 中的数据库配置
3. 确认已执行 `init.sql` 初始化脚本

### Q2: 前端启动失败，提示依赖缺失

**解决方案：**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Q3: 登录时提示密码错误

**解决方案：**
- 确认使用的是正确的测试账号
- 数据库中的密码是 BCrypt 加密后的，默认密码 `admin123` 加密后存储
- 如果修改了密码，需要使用 BCrypt 重新加密

### Q4: 文件上传失败

**解决方案：**
1. 检查后端配置的上传目录权限
2. 确认文件大小不超过 50MB
3. 检查文件格式（支持 doc、docx、pdf）

### Q5: 跨域问题

**解决方案：**
- 后端已配置允许跨域（允许所有来源）
- 前端开发服务器代理配置（如有需要）

---

## 技术亮点

1. **安全性**
   - JWT 无状态认证
   - BCrypt 密码加密
   - 基于角色的权限控制（RBAC）
   - API 接口权限验证

2. **可扩展性**
   - 分层架构（Controller/Service/Repository）
   - 统一响应格式
   - 全局异常处理

3. **用户体验**
   - 响应式设计
   - 分页展示所有列表
   - 友好的错误提示
   - 加载状态提示

4. **学术风格**
   - 简洁正式的 UI 设计
   - 清晰的功能划分
   - 专业的数据展示

---

## 后续优化建议

1. **功能扩展**
   - 添加邮件通知功能
   - 实现消息推送
   - 添加日志审计
   - 实现文件预览功能

2. **性能优化**
   - 添加 Redis 缓存
   - 实现数据库读写分离
   - 添加接口限流

3. **安全性增强**
   - 添加验证码
   - 实现登录失败锁定
   - 敏感操作二次确认

---

## 联系方式

如有问题，请联系项目开发者。
