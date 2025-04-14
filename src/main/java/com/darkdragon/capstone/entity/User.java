package com.darkdragon.capstone.entity;

import com.darkdragon.capstone.dto.UserDto;
import jakarta.persistence.*;

@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column
    private String email;
    @Column
    private String pw;
    @Column
    private String name;
    @Column
    private String birth;
    @Column
    private String nickName;

    public long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getPw() {
        return pw;
    }

    public String getName() {
        return name;
    }

    public String getBirth() {
        return birth;
    }

    public String getNickName() {
        return nickName;
    }

    public User(){};

    public User(String email, String pw, String name, String birth, String nickName) {
        this.email = email;
        this.pw = pw;
        this.name = name;
        this.birth = birth;
        this.nickName = nickName;
    }

    public UserDto toUserDto(User user) {
        return new UserDto(
                user.getEmail(),
                user.getPw(),
                user.getName(),
                user.getBirth(),
                user.getNickName()
        );
    }
}

