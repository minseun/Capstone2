package com.darkdragon.capstone.Planner.controller;

/*
import com.darkdragon.capstone.security.CustomUserDetails;
*/
import com.darkdragon.capstone.Planner.dto.PlannerDTO;
import com.darkdragon.capstone.Planner.entity.Planner;
import com.darkdragon.capstone.Planner.service.PlannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/planner")
public class PlannerController {

    private final PlannerService plannerService;

    @Autowired
    public PlannerController(PlannerService plannerService) {
        this.plannerService = plannerService;
    }


    // 조회(불러오기)
    @GetMapping("/loadSchedule")
    public ResponseEntity<List<Planner>> loadSchedule() {
        try {
            List<Planner> events = plannerService.getAllSchedule();
            return ResponseEntity.ok(events); //200
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); //500
        }
    }

    //저장
    @PostMapping("/saveSchedule")
    public ResponseEntity<?> saveSchedule(@RequestBody PlannerDTO plannerDTO/*, @AuthenticationPrincipal CustomUserDetails userDetails*/) {
        try {
            //Long userId = userDetails.getUserId();
            Long userId = 1L;
            plannerService.saveAllSchedule(plannerDTO, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "Failed to save event"));//500
        }
    }

    //수정
    @PutMapping("/updateSchedule")
    public ResponseEntity<?> updateEvent(@RequestParam Long id, @RequestBody PlannerDTO plannerDTO) {
        try {
            plannerService.updateSchedule(id, plannerDTO);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "Failed to update event"));//500
        }
    }

    // 삭제
    @DeleteMapping("/deleteSchedule/{id}")
    public ResponseEntity<?> calendarDelete(@PathVariable Long id){
        try {
            plannerService.calendarDelete(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "Failed to delete event"));//500
        }
    }

    /*
     await axios.delete(`/planner/calendarDelete?id=${calendarId}`);
    @DeleteMapping("/deleteSchedule")
    public ResponseEntity<?> calendarDelete(@RequestParam Long id) {
        try {
            plannerService.calendarDelete(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "Failed to delete event"));//500
        }
    }
     */

}