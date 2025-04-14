package com.darkdragon.capstone.controller;

import com.darkdragon.capstone.dto.LoginDto;
import com.darkdragon.capstone.dto.UserDto;
import com.darkdragon.capstone.service.UserJoinImpl;
import com.darkdragon.capstone.service.UserLogInImpl;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserLogInImpl userLogInService;
    private final UserJoinImpl userJoinService;

    @Autowired
    public UserController(UserLogInImpl userLogInService, UserJoinImpl userJoinService) {
        this.userLogInService = userLogInService;
        this.userJoinService = userJoinService;
    }

    @PostMapping("/checkEmail")
    public ResponseEntity<Void> checkEmail(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (userJoinService.checkUser(email)) {
            return ResponseEntity.status(HttpStatus.CREATED).build();  // 201
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();  // 409
        }
    }


    @PostMapping("/signup")
    public ResponseEntity<Void> join(@RequestBody UserDto userDto) {
        if (userJoinService.checkUser(userDto.getEmail())) {
            userJoinService.join(userDto);
            return ResponseEntity.status(HttpStatus.CREATED).build();  // 201
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();  // 409
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Void> login(@RequestBody LoginDto loginDto, HttpSession session) {
        if (userLogInService.logIn(loginDto.getEmail(), loginDto.getPw())) {
            UserDto userDto = userLogInService.getUserDto(loginDto.getEmail());
            session.setAttribute("loginUser", userDto);
            return ResponseEntity.ok().build();  // 200
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();  // 401
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.noContent().build();  // 204 No Content
    }
}
