package com.graduation.service;

import com.graduation.dto.LoginDTO;
import com.graduation.dto.RegisterDTO;
import com.graduation.entity.Role;
import com.graduation.entity.Student;
import com.graduation.entity.Teacher;
import com.graduation.entity.User;
import com.graduation.repository.RoleRepository;
import com.graduation.repository.StudentRepository;
import com.graduation.repository.TeacherRepository;
import com.graduation.repository.UserRepository;
import com.graduation.security.JwtTokenUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
public class AuthService {
    
    @Resource
    private AuthenticationManager authenticationManager;
    
    @Resource
    private UserRepository userRepository;
    
    @Resource
    private RoleRepository roleRepository;
    
    @Resource
    private TeacherRepository teacherRepository;
    
    @Resource
    private StudentRepository studentRepository;
    
    @Resource
    private PasswordEncoder passwordEncoder;
    
    @Resource
    private JwtTokenUtil jwtTokenUtil;
    
    public Map<String, Object> login(LoginDTO loginDTO) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDTO.getUsername(),
                        loginDTO.getPassword()
                )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        User user = userRepository.findByUsername(loginDTO.getUsername())
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("name", user.getName());
        
        Set<String> roles = new HashSet<>();
        for (Role role : user.getRoles()) {
            roles.add(role.getCode());
        }
        claims.put("roles", roles);
        
        String token = jwtTokenUtil.generateToken(user.getUsername(), claims);
        
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", buildUserInfo(user));
        
        return result;
    }
    
    @Transactional
    public User register(RegisterDTO registerDTO) {
        if (userRepository.existsByUsername(registerDTO.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }
        
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setName(registerDTO.getName());
        user.setEmail(registerDTO.getEmail());
        user.setPhone(registerDTO.getPhone());
        user.setStatus(1);
        
        Set<Role> roles = new HashSet<>();
        String roleCode = registerDTO.getRoleCode() != null ? registerDTO.getRoleCode() : "STUDENT";
        
        Role role = roleRepository.findByCode(roleCode)
                .orElseThrow(() -> new RuntimeException("角色不存在: " + roleCode));
        roles.add(role);
        user.setRoles(roles);
        
        user = userRepository.save(user);
        
        if ("TEACHER".equals(roleCode)) {
            if (registerDTO.getTeacherNo() == null) {
                throw new RuntimeException("教师工号不能为空");
            }
            if (teacherRepository.existsByTeacherNo(registerDTO.getTeacherNo())) {
                throw new RuntimeException("教师工号已存在");
            }
            
            Teacher teacher = new Teacher();
            teacher.setUser(user);
            teacher.setTeacherNo(registerDTO.getTeacherNo());
            teacher.setDepartment(registerDTO.getDepartment());
            teacher.setTitle(registerDTO.getTitle());
            teacher.setResearchDirection(registerDTO.getResearchDirection());
            teacher.setMaxStudents(10);
            teacherRepository.save(teacher);
        } else if ("STUDENT".equals(roleCode)) {
            if (registerDTO.getStudentNo() == null) {
                throw new RuntimeException("学号不能为空");
            }
            if (studentRepository.existsByStudentNo(registerDTO.getStudentNo())) {
                throw new RuntimeException("学号已存在");
            }
            
            Student student = new Student();
            student.setUser(user);
            student.setStudentNo(registerDTO.getStudentNo());
            student.setDepartment(registerDTO.getDepartment());
            student.setMajor(registerDTO.getMajor());
            student.setClassName(registerDTO.getClassName());
            student.setGrade(registerDTO.getGrade());
            studentRepository.save(student);
        }
        
        return user;
    }
    
    private Map<String, Object> buildUserInfo(User user) {
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("username", user.getUsername());
        userInfo.put("name", user.getName());
        userInfo.put("email", user.getEmail());
        userInfo.put("phone", user.getPhone());
        userInfo.put("status", user.getStatus());
        
        Set<String> roles = new HashSet<>();
        for (Role role : user.getRoles()) {
            roles.add(role.getCode());
        }
        userInfo.put("roles", roles);
        
        return userInfo;
    }
    
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new RuntimeException("用户未登录");
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }
    
    public Teacher getCurrentTeacher() {
        User user = getCurrentUser();
        return teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("当前用户不是教师"));
    }
    
    public Student getCurrentStudent() {
        User user = getCurrentUser();
        return studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("当前用户不是学生"));
    }
}
