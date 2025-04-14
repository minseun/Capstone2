
export const mapPlannerDTOToEvent = (dto) => ({
    id: dto.scheduleId ? dto.scheduleId.toString() : '',
    title: dto.scheduleTitle,
    start: dto.scheduleStart, // 서버에서 ISO 문자열 형태로 보내는 것을 가정
    end: dto.scheduleEnd,
    memo: dto.scheduleMemo,
    backgroundColor: dto.scheduleColor,
    borderColor: dto.scheduleColor,
    groupId: dto.scheduleId ? dto.scheduleId.toString() : '',
});