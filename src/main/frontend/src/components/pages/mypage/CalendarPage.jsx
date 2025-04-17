import React, {useEffect, useRef, useState} from "react";
import "./CalendarPage.css";
import Modal from "react-modal";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction"; // 일정 추가 기능
import Sidebar from "../../layouts/sidebar.jsx"// 사이드바 추가
import Topbar from "../../layouts/Topbar.jsx";
import {mapPlannerDTOToEvent} from "./CalendarMapping.jsx";
import axios from "axios";
import plannerAPI from "../../../plannerAPI.js";


Modal.setAppElement("#root");


// 기능 및 흐름 정리
// 1. 일정 추가
// 2. 추가된 일정을 분할하여 캘린더 각 날짜에 표시
// 3. 각 날짜를 선택하여 수정할 수 있음. (제목, 날짜, 색깔, 메모)
// 4. 각 날짜를 선택하여 그 날의 일정 목록을 확인할 수 있음.
// 4-1. 라디오 버튼은 처음엔 비활성화, 클릭한 이후에는 한번에 하나만 수정 및 삭제하도록 설정함.
// 4-2. 삭제는 여러 개를 할 수 있도록 구상해보았으나, 수정은 하나만 가능하므로 모순 발생. 이게 가능하려면 조건문이 또 추가되어야함.
// 4-3. 따라서 유지보수 및 디버깅 오류를 최대한 줄이기 위해 한 번에 한 이벤트만 선택하도록 함.
// 5. 수정하고 저장할 경우 변경된 사항을 반영하여 일정을 다시 분할하여 각 날짜(셀)에 추가
// 6. 로그 상의 날짜 -1 문제는 라이브러리 특성 상 exclusive 하여 표현되는 것이므로 현재 단계에서 크게 문제가 되지 않음.
// 7. 대신, 실제로 일정을 추가하고 수정할 때는 이 문제를 해결하여 보여주도록 설정하였음.

// * To-Do 란의 체크박스 및 수행한 일정 줄글 표시는 아직 개발하지 않음.
// * FullCalendar 라이브러리 특성 상 하나의 이벤트는 하나의 일정으로 표현되기 때문에, 분할 로직이 생김
// * hover 툴팁 표시할 때에, 또 각 셀 별로 날짜를 분할해서 보여주고 있음.
// * FullCalendar 라이브러리는 Color 보다는 backgroundColor, borderColor 을 활용하여 색깔을 표현하는 것을 권장하므로 그렇게 설정함.
// * DB 객체와 프론트에서 사용하는 객체에 차이가 있으므로, 임시로 매핑파일을 만들어 두었음.

//서버로 보낼 데이터 --> 변수 명 일치 확인필요

const CalendarPage = () => {

    console.log(plannerAPI);  // plannerAPI가 정상적으로 로드되었는지 확인

    const calendarRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [todayTodos, setTodayTodos] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: "",
        start: "",
        end: "",
        backgroundColor: "original",
        borderColor: "original",
        memo: ""
    });
    const [selectedEvents, setSelectedEvents] = useState([]); // 클릭한 일정 정보 저장
    const [isListModalOpen, setIsListModalOpen] = useState(false); // 기존 상세 모달 대체
    const [checkedEventIds, setCheckedEventIds] = useState(null);

    // 마우스 커서 반응을 위해 상태 추가
    const [hoveredEvent, setHoveredEvent] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const [editingEvent, setEditingEvent] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [targetDeleteId, setTargetDeleteId] = useState(null);

    // 날짜 클릭 시 새로운 일정 추가 (초기값 셋팅)
    const handleDateClick = (arg) => {
        setNewEvent({
            title: "",
            start: arg.dateStr,
            end: arg.dateStr,
            backgroundColor: "original",
            borderColor: "original",
            memo:""
        });
        setModalIsOpen(true);
    };

    // toISOString() 은 UTC 기준이므로 한국 시간 기준 문자열 생성
    const formatLocalDateTime = (date) => {
        const pad = (n) => n.toString().padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    // UTC 문제 방지용: 문자열을 로컬 Date 객체로 파싱
    const parseLocalDateTime = (dateTimeStr) => {
        const [datePart, timePart] = dateTimeStr.split("T");
        const [year, month, day] = datePart.split("-").map(Number);
        const [hour, minute] = timePart.split(":").map(Number);
        return new Date(year, month - 1, day, hour, minute);
    };


    // 사용자가 등록하는 multi day 일정 분할 처리 및 시간 포맷하여 addEvent 함수로 전달됨
    const splitEventWithTime = (event) => {
        const startDateTime = parseLocalDateTime(event.start);
        const endDateTime = parseLocalDateTime(event.end);
        const groupId = event.id;
        const splitEvents = [];

        // 날짜 수 계산
        const startDateOnly = new Date(startDateTime);
        const endDateOnly = new Date(endDateTime);
        startDateOnly.setHours(0, 0, 0, 0);
        endDateOnly.setHours(0, 0, 0, 0);

        const dayCount = Math.floor((endDateOnly - startDateOnly) / (1000 * 60 * 60 * 24)) + 1;

        for (let index = 0; index < dayCount; index++) {
            const currentDate = new Date(startDateOnly);
            currentDate.setDate(startDateOnly.getDate() + index);

            const isStartDay = currentDate.toDateString() === startDateTime.toDateString();
            const isEndDay = currentDate.toDateString() === endDateTime.toDateString();

            const newStart = isStartDay
                ? formatLocalDateTime(startDateTime)
                : formatLocalDateTime(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0));

            const newEnd = isEndDay
                ? formatLocalDateTime(endDateTime)
                : formatLocalDateTime(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59));

            const displayTime = isStartDay
                ? `${padTime(startDateTime.getHours())}:${padTime(startDateTime.getMinutes())} ~ 23:59`
                : isEndDay
                    ? `00:00 ~ ${padTime(endDateTime.getHours())}:${padTime(endDateTime.getMinutes())}`
                    : `00:00 ~ 23:59`;

            // 분할하는 것이므로 title 필요 없음
            splitEvents.push({
                ...event,
                start: newStart,
                end: newEnd,
                id: `${event.id}-${index}`,
                groupId,
                memo: event.memo,
                backgroundColor: event.backgroundColor,
                borderColor: event.borderColor,
                className: event.className,
                extendedProps: {
                    ...(event.extendedProps || {}),
                    displayTime,
                    groupIndex: index,
                    groupSize: dayCount,
                    isStart: isStartDay,
                    isEnd: isEndDay,
                },
            });
        }

        console.log("[SPLIT DEBUG] 원본 start:", event.start, "end:", event.end);
        return splitEvents;
    };

    // 추후 삭제 요망
    const padTime = (n) => n.toString().padStart(2, '0');

//-----------------------DB시작---------------------------

//-----------------------일정 추가 api 시작---------------------
    // 일정 추가
    const addEvent = async () => {
        if (newEvent.title.trim() && newEvent.start) {
            const formattedStart = newEvent.start.includes("T")
                ? newEvent.start
                : `${newEvent.start}T00:00:00`;

            const formattedEnd = newEvent.end
                ? (newEvent.end.includes("T") ? newEvent.end : `${newEvent.end}T23:59:59`)
                : formattedStart;

            const baseEvent = {
                id: Date.now().toString(),
                title: newEvent.title,
                start: formattedStart,
                end: formattedEnd,
                backgroundColor: newEvent.backgroundColor,
                borderColor: newEvent.borderColor,
                className: newEvent.backgroundColor,
                memo: newEvent.memo,
                groupId: editingEvent?.groupId || Date.now().toString(),// groupId 항상 설정
            };

            const eventData = { //내가 넣은거
                scheduleTitle: newEvent.title,
                scheduleStart: formattedStart,
                scheduleEnd: formattedEnd,
                scheduleMemo: newEvent.memo,
                scheduleColor: newEvent.backgroundColor
            };

            const splitEvents = splitEventWithTime(baseEvent);

            setEvents(prevEvents => {
                if (editingEvent) {
                    return prevEvents.filter(ev => ev.groupId !== editingEvent.groupId)
                        .concat(splitEvents);
                } else {
                    return [...prevEvents, ...splitEvents];
                }
            });
            setModalIsOpen(false);

            try {
                console.log("선택된 일정의 ID:", newEvent.backgroundColor);
                const createEvent = await axios.post(`/planner/saveSchedule`, eventData);
                if(createEvent.status===200) {console.log("일정 저장 성공");}
                console.log("저장 결과:", createEvent);
            } catch (error) {
                console.error("저장 API 호출 에러:", error);
            }
        }
    };
//-----------------------일정 추가 api 끝---------------------

    // 비동기 문제로 인하여 add 와 update 사이에 위치해야함
    // 위치 수정 시 주의
    // 일단 살려둠 아래 코드에 문제가 없다면 차후 삭제 요망
    // 없으면 투두 안 나옴. 없앨거면 일정 삽입/불러오기 부분에 따로 추가
     useEffect(() => {
         updateTodayTodos();
     }, [events]);

//---------------일정 불러오기 시작----------
    // 원래 투두함수를 호출했는데, 이렇게 설정하면 자동으로 호출되는 것 같으나..
    // 확인이 안 됨 ㅠ-ㅠ
    useEffect(() => {
        // 컴포넌트 마운트 시 전체 스케줄 불러오기
        const fetchSchedules = async () => {
            try {
                const calendar = calendarRef.current.getApi();
                const response = await axios.get(`/planner/loadSchedule`);

                //api get으로 들고온 데이터를 캘린더에 넣을 수 있는 데이이터로 변환하는 과정
                //여기에 문제 있음
                const events = response.data.map(event => ({
                    id: event.scheduleId,
                    title: event.scheduleTitle,
                    start: event.scheduleStart,
                    end: event.scheduleEnd,
                    memo: event.scheduleMemo,
                    color: event.scheduleColor,
                }));
                calendar.addEventSource(events); //위의 map을 calendar객체에 추가함
                setEvents(events);

                // 여기서 각 이벤트 ID 출력 -> 제대로 들고옴. 문제 없음.
                events.forEach(event => {
                    console.log("일정 번호:", event.id, event.title);
                });

            } catch (error) {
                console.error("스케줄 불러오기 에러:", error);
            }
        };
        fetchSchedules();
    }, []);
//---------------일정 불러오기 끝----------


    // 같은 날인지 비교
    const isSameDate = (d1, d2) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();


    // To-Do List 갱신
    const updateTodayTodos = (customEvents = events) => {
        const today = new Date();
        const todayEvents = customEvents.filter(event => {
            const start = new Date(event.start);
            const end = event.end ? new Date(event.end) : start;

            // 일정이 하루짜리라면 start 와 today 가 같은 날짜인지 확인
            if (isSameDate(start, end)) {
                return isSameDate(start, today);
            }

            // 일정이 여러 날에 걸친 경우, today 가 그 사이에 포함되는지 확인
            const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
            const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            return todayOnly >= startOnly && todayOnly <= endOnly;
        });

        console.log("오늘 날짜:", today); // F12에서 콘솔 창 확인을 위한 코드이므로 차후 수정해도 상관없음
        console.log("오늘 포함된 이벤트:", todayEvents);

        setTodayTodos(todayEvents);
    };


    // 마우스 커서 핸들러 함수 추가
    const handleEventMouseEnter = (info) => {
        setHoveredEvent({
            title: info.event.title,
            memo: info.event.extendedProps.memo,
            start: info.event.start,
            end: info.event.end,
        });

        setTooltipPosition({ x: info.jsEvent.pageX, y: info.jsEvent.pageY });
    };

    const handleEventMouseLeave = () => {
        setHoveredEvent(null);
    };

    // 일정 툴팁 확인 시 조건부 포맷 적용을 위한 함수 작성
    // YYYY:MM:DD:HH -> HH:MM
    const formatTime = (date) =>
        new Date(date).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
        });

    // 툴팁에서 multi-day 분할
    const isMultiDay = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return (
            startDate.getFullYear() !== endDate.getFullYear() ||
            startDate.getMonth() !== endDate.getMonth() ||
            startDate.getDate() !== endDate.getDate()
        );
    };

    const findOriginalEvent = (clickedEvent, allEvents) => {
        const groupId = clickedEvent.groupId || clickedEvent.id.split("-")[0];

        const groupEvents = allEvents.filter(ev => ev.groupId === groupId);
        if (groupEvents.length === 0) return null;
        return groupEvents.reduce((earliest, curr) =>
            new Date(earliest.start) < new Date(curr.start) ? earliest : curr
        );
    };

    // 수정 버튼을 누르면 실행
    const handleEdit = (eventId) => {
        console.log("수정 버튼 클릭됨:", eventId);

        const clickedEvent = events.find(event => event.id === eventId);
        if (!clickedEvent) {
            console.warn("클릭된 이벤트를 전체 이벤트에서 찾을 수 없습니다.");
            return;
        }

        const originalEvent = findOriginalEvent(clickedEvent, events);
        if (!originalEvent) {
            console.warn("원본 이벤트를 찾지 못했습니다.");
            return;
        }

        console.log("✅ 원본 이벤트 찾음:", originalEvent);
        console.log("🛠️ editingEvent:", clickedEvent);
        console.log("📅 수정용 날짜 생성:", originalEvent.start, originalEvent.end);

        setEditingEvent({
            ...originalEvent,
            start: originalEvent.start,
            end: clickedEvent.end,
            memo: clickedEvent.memo || originalEvent.memo || "",
            backgroundColor: clickedEvent.backgroundColor || originalEvent.backgroundColor || "original",
            borderColor: clickedEvent.borderColor || originalEvent.borderColor || "original",
            className: clickedEvent.className || originalEvent.className || "original",
        });

        setIsEditModalOpen(true);

    };


//--------------------------일정 수정 api 시작--------------------

    // 저장 버튼을 눌러 일정 업데이트
    const handleUpdate = async (info) => {
        e.preventDefault();
        if (!editingEvent) return;

        const groupId = editingEvent.groupId || editingEvent.id.split("-")[0];
        const groupEvents = events.filter(event => event.groupId === groupId);

        const calendarId = info.event.id; //디비 아이디 들고오기
        console.log("선택된 일정의 ID:", calendarId);

        if (groupEvents.length === 0) {
            console.warn("해당 groupId의 이벤트들을 찾을 수 없습니다.");
            return;
        }

        // 원본 이벤트를 새로 구성 (시간은 기존 그룹 전체 기준, 내용은 editingEvent 기준)
        const updatedBaseEvent = {
            ...editingEvent,
            start: editingEvent.start,
            end: editingEvent.end,
            memo: editingEvent.memo,
            backgroundColor: editingEvent.backgroundColor,
            borderColor: editingEvent.borderColor,
            className: editingEvent.className,
            id: groupId, // 새 분할 시 기준 ID로 사용
        };

        const eventData = { //디비로 보낼 수정된 데이터 구성
            scheduleTitle: newEvent.title,
            scheduleStart: editingEvent.start,
            scheduleEnd: editingEvent.end,
            scheduleMemo: editingEvent.memo,
            scheduleColor: editingEvent.backgroundColor
        };

        // 새로 분할
        const updatedSplitEvents = splitEventWithTime(updatedBaseEvent);
        console.log("📆 새로 분할된 이벤트 목록:", updatedSplitEvents);
        console.log("✅ setEvents 직후 전체 이벤트 수:", updatedSplitEvents.length);

        setEvents(prevEvents => { //언니 꺼임?
            const filtered = prevEvents.filter(ev => ev.groupId !== groupId);
            console.log("🧹 기존 그룹 제거 후:", filtered.length);
            const combined = filtered.concat(updatedSplitEvents);
            console.log("✅ 최종 반영될 이벤트 수:", combined.length);

            // 수정한 후 updateTodayTodos 호출 (setEvents 는 비동기이므로)
            updateTodayTodos(combined);

            return combined;
        });

        try {
            const updateEvent = await axios.put(`/planner/calendarUpdate?id=${calendarId}`, eventData);
            if(updateEvent.status===200) {console.log("일정 수정 성공");}
            console.log("수정 결과:", updateEvent);
        } catch (error) {
            console.error("수정 API 호출 에러:", error);
        }

        setIsEditModalOpen(false);
        setIsListModalOpen(false);
    };

//--------------------------일정 수정 api 끝--------------------


    // 수정 모달에서 Date 객체를 로컬 타임존 기준으로 변환
    function toDatetimeLocalString(date) {
        if (!date) return "";
        const d = new Date(date);
        const offset = d.getTimezoneOffset();
        const localDate = new Date(d.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 16);
    }


//--------------------------일정 삭제 api 시작--------------------

    // 일정 삭제
    const handleDelete = async (eventId, info) => {

        const calendarId = info.event.id; //디비에 저장된 id들고오기
        console.log("선택된 일정의 ID:", calendarId);

        const groupId = eventId.split("-")[0];

        setEvents(prev => {
            const filtered = prev.filter(ev => ev.groupId !== groupId);
            updateTodayTodos(filtered);
            return filtered;
        });

        try {
            const deleteEvent = await axios.delete(`/planner/deleteSchedule/${calendarId}`);
            if(deleteEvent.status===200) {console.log("일정 삭제 성공");}
            console.log("삭제 결과:", deleteEvent);
        } catch (error) {
            console.error("삭제 API 호출 에러:", error);
        }
    };

//--------------------------일정 삭제 api 끝--------------------

//---------------------------DB끝----------------------------

    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            <Topbar />
        <div style={{ display: "flex", height: "100vh" , padding: "0px", gap: "20px", marginTop: "10vh" }}>
            {/* 왼쪽 사이드바 */}
            <Sidebar />

            {/* 캘린더 & 투두 리스트 컨테이너 */}
            <div style={{ display: "flex", flex: 1, gap: "20px", width: "100%" }} >

                {/* 캘린더 */}
                <div style={{ flex: 4, padding: "20px",
                    background: "#ffffff", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", minWidth: "600px" }}>
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        displayEventTime={false} // 시간 감춤
                        ref={calendarRef}
                        events={events}
                        dateClick={handleDateClick}
                        height="90vh"
                        timeZone="local"
                        key={events.length}
                        eventClassNames={() => "fc-custom-style"}
                        eventContent={(arg) => {
                            const wrapper = document.createElement("div");
                            wrapper.className = "fc-custom-event";

                            const titleDiv = document.createElement("div");
                            titleDiv.className = "fc-event-title";
                            titleDiv.textContent = arg.event.title;

                            wrapper.appendChild(titleDiv);

                            return { domNodes: [wrapper] };
                        }}

                        // multi day 일정을 처리할 때, 사용자에게 하나의 일정으로 보이도록 트릭 설정
                        // groupIndex, groupSize 는 row 에만 적용되도록 해야 함
                        // FullCalendar 는 index 를 위로 쌓는 특징이 있음
                        // 트릭 포기.. 너무 힘듬 FullCalendar 의 본래 일정 렌더링과 모순될 뿐더러 이를 해결하려면
                        // 마우스 좌표 기반 날짜 역계산, 각 셀마다 고의로 DOM 엘리먼트를 넣는 등의 로직을 추가해야 함.
                        eventDidMount={(info) => {
                            const el = info.el;
                            const event = info.event;

                            // 날짜만 잘라내기 위한 유틸
                            const formatDateOnly = (date) =>
                                new Date(date.getFullYear(), date.getMonth(), date.getDate());

                            // 시작/종료 날짜 처리
                            const start = new Date(event.start);
                            const startOnly = formatDateOnly(start);

                            // 셀 날짜 가져오기
                            const cell = el.closest("[data-date]");
                            const cellDateStr = cell?.getAttribute("data-date");
                            if (!cellDateStr) return;

                            // 셀 날짜 객체로 파싱
                            const cellDate = formatDateOnly(new Date(cellDateStr));

                            // 시작일/종료일인지 체크
                            const isStartDate = cellDate.getTime() === startOnly.getTime();

                            // 제목 표시 (시작일에만)
                            const titleEl = el.querySelector(".fc-event-title");
                            if (titleEl) {
                                titleEl.classList.remove("fc-event-title-visible", "fc-event-title-hidden");
                                titleEl.classList.add(isStartDate ? "fc-event-title-visible" : "fc-event-title-hidden");
                            }

                            // 모서리 스타일 처리
                            el.style.borderRadius = "0";

                            console.log(`[DEBUG] ${event.title}`);
                            console.log(`cellDate: ${cellDate.toISOString().slice(0, 10)}`);
                            console.log(`startOnly: ${startOnly.toISOString().slice(0, 10)}`);
                            console.log(`isStartDate? ${isStartDate}`);

                        }}
                        headerToolbar={{
                            start: "today",
                            center: "title",
                            end: "prev next"
                        }}
                        eventMouseEnter={handleEventMouseEnter}
                        eventMouseLeave={handleEventMouseLeave}
                        eventOrder="groupIndex,start"
                        eventClick={(info) => {
                            function formatDate(date) {
                                const d = new Date(date);
                                d.setHours(0, 0, 0, 0);
                                return d;
                            }

                            const clickedDate = formatDate(info.event.start);

                            const filtered = events.filter((event) => {
                                const startDate = formatDate(event.start);
                                let endDate = formatDate(event.end || event.start);

                                const isIncluded =
                                    clickedDate >= startDate && clickedDate <= endDate;

                                console.log(
                                    `[FILTER DEBUG] clicked: ${clickedDate.toISOString().slice(0,10)}`,
                                    `event: ${event.title}`,
                                    `start: ${startDate.toISOString().slice(0,10)}`,
                                    `end: ${endDate.toISOString().slice(0,10)}`,
                                    `-> included? ${isIncluded}`
                                );

                                return isIncluded;

                            });

                            setSelectedEvents(filtered);
                            console.log("✅ 필터링 완료된 selectedEvents:", filtered);
                            setIsListModalOpen(true);
                        }}

                    />

                </div>

                {/* 투두리스트 */}
                <div style={{
                    flex: 1,
                    padding: "20px",
                    background: "#f8f9fa",
                    borderRadius: "10px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    minWidth: "250px",
                    height: "45vh"
                }}>
                    <h3 style={{ textAlign: "center" }}>To-Do List</h3>
                    <ul style={{ listStyle: "none", paddingLeft: "10px" }}>
                        {todayTodos.length > 0 ? (
                            todayTodos.map((event, index) => <li key={index}> ✔ {event.title}</li>)
                        ) : (
                            <li>오늘 일정이 없습니다.</li>
                        )}
                    </ul>
                </div>
            </div>

            {/* 일정 추가 모달 */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                className="custom-modal"
                overlayClassName="custom-overlay"
            >
                <h2>일정 추가</h2>
                <label>제목: </label>
                <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
                <label>시작 날짜 및 시간: </label>
                <input
                    type="datetime-local"
                    value={newEvent.start}
                    onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                />
                <label>종료 날짜 및 시간: </label>
                <input
                    type="datetime-local"
                    value={newEvent.end}
                    onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                />
                <label>일정 내용: </label>
                <input
                    type="text"
                    value={newEvent.memo}
                    onChange={(e) => setNewEvent({ ...newEvent, memo: e.target.value})}
                />
                <label>일정 색상: </label>
                <select
                    value={newEvent.backgroundColor}
                    onChange={(e) =>
                        setNewEvent({
                            ...newEvent,
                            backgroundColor: e.target.value,
                            borderColor: e.target.value
                        })
                    }
                >
                    <option value="original">기본</option>
                    <option value="red">빨강색</option>
                    <option value="blue">파랑색</option>
                    <option value="green">초록색</option>
                    <option value="yellow">노랑색</option>
                    <option value="orange">주황색</option>
                    <option value="purple">보라색</option>
                </select>
                <button onClick={addEvent}>추가</button>
                <button onClick={() => setModalIsOpen(false)}>취소</button>
            </Modal>

            {/*hover 시 생성되는 툴팁 UI 작성 */}
            {hoveredEvent && (
                <div
                    className="calendar-tooltip"
                    style={{
                        top: tooltipPosition.y + 10,
                        left: tooltipPosition.x + 10,
                    }}
                >
                    <div><strong>제목:</strong> {hoveredEvent.title}</div>
                    <div><strong>메모:</strong> {hoveredEvent.memo || "없음"}</div>
                    <div>
                        <strong>시간:</strong>{" "}
                        {hoveredEvent.allDay ? (
                            "종일"
                        ) : isMultiDay(hoveredEvent.start, hoveredEvent.end) ? (
                            `${formatTime(hoveredEvent.start)} ~ ${formatTime(hoveredEvent.end)}`
                        ) : (
                            `${formatTime(hoveredEvent.start)} ~ ${formatTime(hoveredEvent.end)}`
                        )}
                    </div>
                </div>
            )}

            {/*/일정 리스트 모달 */}
            <Modal
                isOpen={isListModalOpen}
                onRequestClose={() => setIsListModalOpen(false)}
                className="custom-modal"
                overlayClassName="custom-overlay"
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                    }}
                >
                    <h2>📅 일정 목록</h2>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            disabled={checkedEventIds == null}
                            onClick={() => {
                                console.log("checkedEventIds:", checkedEventIds, typeof checkedEventIds);
                                handleEdit(checkedEventIds)
                            }}
                        >
                            ✏️ 수정
                        </button>
                        <button
                            disabled={!checkedEventIds}
                            onClick={() => {
                                setTargetDeleteId(checkedEventIds);
                                setIsDeleteModalOpen(true);
                            }}
                        >
                            🗑️ 삭제
                        </button>
                    </div>
                </div>

                <ul>
                    {selectedEvents.map((event) => (
                        <li key={event.id ?? `${event.title}-${event.start}`}
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                padding: "4px 0",
                            }}
                        >
                            <input
                                type="radio"
                                name="eventCheckbox"
                                checked={checkedEventIds === event.id}
                                onChange={() => {
                                    console.log("라디오 선택됨:", event.id);
                                    setCheckedEventIds(event.id);
                                }}
                                style={{
                                    marginTop: "4px",
                                    marginRight: "40px",
                                    width: "14px",
                                    height: "14px",
                                    flexShrink: 0,
                                }}
                            />
                            <div
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "2px",
                                    wordBreak: "break-word",
                                }}
                            >
                                <div><strong>제목:</strong> {event.title}</div>
                                <div>
                                    <strong>시간:</strong>{" "}
                                    {event.allDay ? (
                                        "종일"
                                    ) : isMultiDay(event.start, event.end) ? (
                                        `${formatTime(event.start)} ~ ${formatTime(event.end)}`
                                    ) : (
                                        `${formatTime(event.start)} ~ ${formatTime(event.end)}`
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                <button onClick={() => setIsListModalOpen(false)}>닫기</button>
            </Modal>

            {/* 일정 수정 모달 */}
            <Modal
                isOpen={isEditModalOpen}
                onRequestClose={() => setIsEditModalOpen(false)}
                className="custom-modal"
                overlayClassName="custom-overlay"
            >
                <h2>✏️ 일정 수정</h2>
                <form onSubmit={handleUpdate}>
                    <label>제목</label>
                    <input
                        type="text"
                        value={editingEvent?.title || ""}
                        onChange={(e) =>
                            setEditingEvent({ ...editingEvent, title: e.target.value })
                        }
                        required
                    />

                    <label>시작</label>
                    <input
                        type="datetime-local"
                        value={toDatetimeLocalString(editingEvent?.start)}
                        onChange={(e) =>
                            setEditingEvent({ ...editingEvent, start: e.target.value })
                        }
                        required
                    />

                    <label>종료</label>
                    <input
                        type="datetime-local"
                        value={toDatetimeLocalString(editingEvent?.end)}
                        onChange={(e) =>
                            setEditingEvent({ ...editingEvent, end: e.target.value })
                        }
                        required
                    />

                    {/* 메모 추가 */}
                    <label>일정 내용</label>
                    <input
                        type="text"
                        value={editingEvent?.memo || ""}
                        onChange={(e) =>
                            setEditingEvent({ ...editingEvent, memo: e.target.value })
                        }
                    />
                    <label>일정 색상</label>
                    <select
                        value={editingEvent?.backgroundColor || "original"}
                        onChange={(e) =>
                            setEditingEvent({
                                ...editingEvent,
                                backgroundColor: e.target.value,
                                borderColor: e.target.value,
                                className: e.target.value
                            })
                        }
                    >
                        <option value="original">기본</option>
                        <option value="red">빨강색</option>
                        <option value="blue">파랑색</option>
                        <option value="green">초록색</option>
                        <option value="yellow">노랑색</option>
                        <option value="orange">주황색</option>
                        <option value="purple">보라색</option>
                    </select>


                    <button type="submit">저장</button>
                    <button type="button" onClick={() => {
                        setIsEditModalOpen(false);
                        setIsListModalOpen(false); }}>
                        취소
                    </button>
                </form>
            </Modal>

            {/*/일정 삭제 모달 */}
            <Modal
                isOpen={isDeleteModalOpen}
                onRequestClose={() => setIsDeleteModalOpen(false)}
                className="custom-modal"
                overlayClassName="custom-overlay"
            >
                <h2>❗일정 삭제</h2>
                <p>해당 일정을 삭제하시겠습니까?</p>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                    <button
                        onClick={() => {
                            if (targetDeleteId) handleDelete(targetDeleteId);
                            setIsDeleteModalOpen(false);
                            setIsListModalOpen(false);
                        }}
                    >
                        예
                    </button>
                    <button onClick={() =>
                        setIsDeleteModalOpen(false)}>아니오</button>
                </div>
            </Modal>

        </div>
        </div>
    );
};

export default CalendarPage;
