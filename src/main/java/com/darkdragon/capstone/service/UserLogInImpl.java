package com.darkdragon.capstone.service;

import com.darkdragon.capstone.dto.UserDto;
import com.darkdragon.capstone.entity.User;
import com.darkdragon.capstone.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserLogInImpl implements UserLogIn {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // PasswordEncoder 주입


    @Autowired
    public UserLogInImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;


    }

    @Override
    public boolean logIn(String email, String pw) {
        if (userRepository.existsByEmail(email)) {
            User loginUser = userRepository.findByEmail(email);
            if (loginUser != null) {
                // 암호화된 비밀번호와 사용자가 입력한 비밀번호 비교
                if (passwordEncoder.matches(pw, loginUser.getPw())) {
                    return true;
                }
            }
        }
        return false;
    }

    @Override
    public UserDto getUserDto(String email) {
        User user = userRepository.findByEmail(email);
        return user.toUserDto(user);
    }



    }

