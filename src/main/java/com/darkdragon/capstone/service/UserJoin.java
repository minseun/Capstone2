package com.darkdragon.capstone.service;

import com.darkdragon.capstone.dto.UserDto;

public interface UserJoin {
    boolean join(UserDto userDto);

    boolean checkUser(String email);
}