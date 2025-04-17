import axios from "axios";
const BASE_URL = "/planner";
//const data = await plannerAPI.loadEvents(calendarApi);
//setEvents(data);

class plannerAPI {

    // 일정 불러오기
    static async loadEvents(calendar) {
        try {
        const response = await axios.get(`${BASE_URL}/loadSchedule`);
            //데이터가 있다면 api로 들고온 데이터를 캘린더에 넣을 수 있는 데이이터로 변환하는 과정
            if (response.data) {
              const events = response.data.map(event => ({
                id: event.scheduleId,
                title: event.scheduleTitle,
                start: event.scheduleStart,
                end: event.scheduleEnd,
                memo: event.scheduleMemo,
                color: event.scheduleColor
              }));
              calendar.addEventSource(events); //위의 map을 calendar객체에 추가함
              console.log("응답 전체:", response);
              console.log("받은 event:", event);
              return events;
            } else {
              console.error("응답 데이터가 배열이 아님 또는 없음:", response.data);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("일정 불러오는는 중 오류가 발생");
        }
    }

    // 일정 추가
    static async createEvent(eventData) {
        try {
        const response = await axios.post(`${BASE_URL}/saveSchedule`, eventData);
        console.log("Success:", response.data);
        } catch (error) {
            console.error("Error:", error);
            alert("일정 저장 중 오류가 발생");
        }
    }

    // 일정 수정
    static async updateEvent(calendarId, eventData) {
        try {
        const response = await axios.put(`${BASE_URL}/calendarUpdate?id=${calendarId}`, eventData);
        console.log("Success:", response.data);
        } catch (error) {
            console.error("Error:", error);
            alert("일정 수정 중 오류 발생");
        }
    }

    //일정 삭제
    static async deleteEvent(calendarId) {
        try {
        const response = await axios.delete(`${BASE_URL}/calendarDelete?id=${calendarId}`);
        console.log("Event deleted successfully");
        } catch (error) {
            console.error("Error:", error);
            alert("일정 삭제 실패:", response.data);
        }
    }

}

export default plannerAPI;