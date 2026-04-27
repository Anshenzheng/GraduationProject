package com.graduation.controller;

import com.graduation.common.Result;
import com.graduation.dto.LoginDTO;
import com.graduation.dto.RegisterDTO;
import com.graduation.entity.User;
import com.graduation.service.AuthService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @Resource
    private AuthService authService;
    
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody LoginDTO loginDTO) {
        Map<String, Object> result = authService.login(loginDTO);
        return Result.success(result);
    }
    
    @PostMapping("/register")
    public Result<User> register(@RequestBody RegisterDTO registerDTO) {
        User user = authService.register(registerDTO);
        user.setPassword(null);
        return Result.success(user);
    }
    
    @GetMapping("/current")
    public Result<User> getCurrentUser() {
        User user = authService.getCurrentUser();
        user.setPassword(null);
        return Result.success(user);
    }
}
