package com.darkdragon.capstone.Planner.dto;


import com.darkdragon.capstone.Planner.entity.Planner;
import java.time.LocalDateTime;

public class PlannerDTO {

    private Long scheduleId;
    private Long userId;
    private String scheduleTitle;
    private LocalDateTime scheduleStart;
    private LocalDateTime scheduleEnd;
    private String scheduleMemo;
    private String scheduleColor;

    protected PlannerDTO() {
    }

    // 저장용 생성자: userId는 서버에서 Spring Security의 SecurityContextHolder 사용해서 처리하기
    // 클라이언트로부터 받은 JSON 데이터를 자바 객체로 바꾸는 데 사용
    public PlannerDTO(String scheduleTitle, LocalDateTime scheduleStart, LocalDateTime scheduleEnd, String scheduleMemo, String scheduleColor) {
        this.scheduleTitle = scheduleTitle;
        this.scheduleStart = scheduleStart;
        this.scheduleEnd = scheduleEnd;
        this.scheduleMemo = scheduleMemo;
        this.scheduleColor = scheduleColor;
    }

    // DTO → Entity 변환 메서드
    // 컨트롤러나 서비스 계층에서 받은 DTO를 실제 DB에 저장할 수 있는 Planner 엔티티 객체로 바꿔주는 용도
    public Planner toEntity(Long userId) {
        return new Planner(
                userId,
                this.scheduleTitle,
                this.scheduleStart,
                this.scheduleEnd,
                this.scheduleMemo,
                this.scheduleColor
        );
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public Long getUserId() {return userId;}

    public String getScheduleTitle() {
        return scheduleTitle;
    }

    public void setScheduleTitle(String scheduleTitle) { this.scheduleTitle = scheduleTitle; }

    public LocalDateTime getScheduleStart() {
        return scheduleStart;
    }

    public void setScheduleStart(LocalDateTime scheduleStart) {this.scheduleStart = scheduleStart;}

    public LocalDateTime getScheduleEnd() {
        return scheduleEnd;
    }

    public void setScheduleEnd(LocalDateTime scheduleEnd) {this.scheduleEnd = scheduleEnd;}

    public String getScheduleMemo() {
        return scheduleMemo;
    }

    public void setScheduleMemo(String scheduleMemo) {this.scheduleMemo = scheduleMemo;}

    public String getScheduleColor() {
        return scheduleColor;
    }

    public void setScheduleColor(String scheduleColor) {this.scheduleColor = scheduleColor;}

}