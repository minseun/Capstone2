package com.darkdragon.capstone.service;


import com.darkdragon.capstone.dto.UserDto;
import com.darkdragon.capstone.entity.User;

public interface UserLogIn {
    boolean logIn(String email, String pw);
    UserDto getUserDto(String email);


}