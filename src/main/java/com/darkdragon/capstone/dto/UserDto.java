package com.darkdragon.capstone.dto;

import com.darkdragon.capstone.entity.User;

public class UserDto {
    long userId;
    String email;
    String pw;
    String name;
    String birth;
    String nickName;

    public UserDto(String email, String pw, String name, String birth, String nickName) {
        this.email = email;
        this.pw = pw;
        this.name = name;
        this.birth = birth;
        this.nickName = nickName;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPw() {
        return pw;
    }

    public void setPw(String pw) {
        this.pw = pw;
    }

    public String getBirth() {
        return birth;
    }

    public void setBirth(String birth) {
        this.birth = birth;
    }

    public String getNickName() {
        return nickName;
    }

    public void setNickName(String nickName) {
        this.nickName = nickName;
    }

    public User toUserEntity(UserDto userDto) {
        String nickName = userDto.getNickName();
        if (nickName == null || nickName.trim().isEmpty()) {
            nickName = userDto.getName(); // 비어있으면 이름으로 대체
        }

        return new User(
                userDto.getEmail(),
                userDto.getPw(),
                userDto.getName(),
                userDto.getBirth(),
                nickName
        );
    }
}
