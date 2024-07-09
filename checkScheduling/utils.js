import moment from "moment";

/**
 * 类型判断
 * @returns {boolean}
 */
export function Type() {
  const typeFn = {};
  const typeList = ["Number", "String", "Boolean", "Symbol", "Undefined", "Null", "Object", "Array", "Function", "Date"];
  typeList.forEach((type) => {
    typeFn["is" + type] = (obj) => Object.prototype.toString.call(obj) === "[object " + type + "]";
  });
  return typeFn;
}

/**
 * 获取时间区间
 * @param {Date} start
 * @param {Date} end
 * @returns {array}
 */
export function getRangeTime(start, end) {
  if (!((Type().isDate(start) && Type().isDate(end)) || (Type().isDate(new Date(start)) && Type().isDate(new Date(end))))) {
    throw new Error("error type");
  }
  const dayMap = ["zh_sun", "zh_mon", "zh_tue", "zh_wed", "zh_thu", "zh_fri", "zh_sat"];
  const result = [];
  let _start = start;
  while (moment(_start).isSameOrBefore(end, "day")) {
    result.push({
      day: dayMap[moment(_start).day()],
      date: moment(_start).format("YYYY-MM-DD")
    });
    _start = moment(_start).add(1, "day");
  }
  return result;
}
