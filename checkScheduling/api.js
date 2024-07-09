import http from "commonRemote/services/http";

// 获取排班校验列表
export function getData(data) {
  return http.post("/api/schedule-task/setting/getScheduleCheckList", data);
}

// 排版校验全量
export function scheduleCheck(data) {
  return http.post("/api/schedule-task/setting/scheduleCheck", data);
}

/**
 * 排版校验批量
 * @param {array[number]} eids  人员id
 * @param {string} yearMonth  年月 (YYYY-MM)
 * @returns
 */
export function scheduleCheckBatch({eids, yearMonth}) {
  return http.post("/api/schedule-task/setting/scheduleCheckForEid", {
    eids,
    yearMonth
  });
}

/**
 * 撤销全部排班校验
 */
export function revocationCheck(data) {
  return http.post("/api/schedule-task/setting/withdrawScheduleAll", data);
}


/**
 * 批量撤销排班校验
 * @param {array[number]} eids  人员id
 * @param {string} yearMonth  年月 (YYYY-MM)
 * @returns
 */
export function revocationCheckBatch({eids, yearMonth}) {
  return http.post("/api/schedule-task/setting/withdrawSchedule", {
    eids,
    yearMonth
  });
}


