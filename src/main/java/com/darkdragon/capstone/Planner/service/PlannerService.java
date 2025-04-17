package com.darkdragon.capstone.Planner.service;

import com.darkdragon.capstone.Planner.dto.PlannerDTO;
import com.darkdragon.capstone.Planner.entity.Planner;
import com.darkdragon.capstone.Planner.repository.PlannerRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PlannerService {

    private final PlannerRepository plannerRepository;

    @Autowired
    public PlannerService(PlannerRepository plannerRepository) {
        this.plannerRepository = plannerRepository;
    }


    // 조회(불러오기)
    public List<Planner> getAllSchedule() {
        return plannerRepository.findAll();
    }

    //삽입
    public void saveAllSchedule(PlannerDTO plannerDTO, Long userId) {
        Planner planner = plannerDTO.toEntity(userId);
        plannerRepository.save(planner);
    }

    //수정
    public void updateSchedule(Long id, PlannerDTO plannerDTO) throws Exception {
        Optional<Planner> optionalPlanner  = plannerRepository.findById(id);
        if (optionalPlanner .isPresent()) {
            Planner planner = optionalPlanner .get();

            planner.setScheduleTitle(plannerDTO.getScheduleTitle());
            planner.setScheduleStart(plannerDTO.getScheduleStart());
            planner.setScheduleEnd(plannerDTO.getScheduleEnd());
            planner.setScheduleMemo(plannerDTO.getScheduleMemo());
            planner.setScheduleColor(plannerDTO.getScheduleColor());

            plannerRepository.save(planner);
        } else {
            throw new Exception("Event not found with ID: " + id);
        }
    }

    // 삭제
    public void calendarDelete(Long id) throws Exception {
        Optional<Planner> planner = plannerRepository.findById(id);
        if (planner.isPresent()) {
            plannerRepository.deleteById(id);
        } else {
            throw new Exception("Event not found with ID: " + id);
        }
    }

}