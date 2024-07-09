<template>
  <div class="pos-forecast-content" v-loading="loading">
    <div
      v-if="Object.keys(dayValueMap).length == 0"
      class="no-data"
      style="text-align: center; font-size: 13px; color: rgb(106, 120, 133); position: fixed; top: 50%; left: 50%; margin-top: -50px; margin-left: -45px">
      <el-empty :image="OUTER_CDN + '/style/static/image/status2/noData.png'" :description="$t('empty.noData')"></el-empty>
    </div>
    <div class="pos-forecast" ref="posTB" v-if="Object.keys(dayValueMap).length">
      <div class="day-wrapper">
        <wq-tabs v-model="activeDay" @tab-click="handleDayChange">
          <wq-tab-pane v-for="(value, key) in dayValueMap" :key="key" :label="weeksMap[moment(key).format('d')] + '/' + moment(key).format('MM-DD')" :name="key"></wq-tab-pane>
        </wq-tabs>
      </div>
      <div class="day-table">
        <div class="summary-wrap">
          <div class="title">{{ $t("zh_turnover_all") }}</div>
          <div class="summary">
            <el-input class="input" v-model="dayValueMap[currentDate].adjVal" size="small" placeholder="" @change="dayChange(dayValueMap[currentDate])"></el-input>
          </div>
        </div>
        <wq-table :data="getTableData" :max-height="tableHeight" border ref="posForecastTable">
          <el-table-column width="150px" fixed>
            <template slot="header" slot-scope="scope">
              {{ $t("zh_project") }}
            </template>
            <template slot-scope="scope">
              {{ getTypeName }}
            </template>
          </el-table-column>
          <el-table-column v-for="(range, rangeIndex) in rangeArr" :key="rangeIndex" :label="range.range" align="center" width="120px">
            <template slot-scope="scope">
              <el-input
                v-if="currentDate && modifyMap && modifyMap[getTypeName] && modifyMap[getTypeName][range.range]"
                :value="scope.row.period[rangeIndex]"
                @blur="modifyMap[getTypeName][range.range] = false"
                style="width: 80%"
                size="mini"
                @input="rangeChange($event, scope.row.period, rangeIndex)" />
              <div v-else @click="() => currentDate && modifyMap && (modifyMap[getTypeName][range.range] = true)" :style="{cursor: currentDate ? 'pointer' : 'auto'}">
                {{ scope.row.period[rangeIndex] }}
              </div>
            </template>
          </el-table-column>
        </wq-table>
      </div>
      <div class="chart-wrapper">
        <chart v-if="echartShow" ref="chart" :rangeArr="rangeArr" :typeList="getTypeList" :data="getTableData" :chartHeight="chartHeight" :chartWidth="chartWidth" />
      </div>
    </div>
  </div>
</template>

<script>
import api from "../api.js";
import chart from "./chart.vue";

export default {
  name: "pos-forecast",
  components: {
    chart
  },
  props: {
    searchForm: {
      type: Object,
      default: () => ({
        scheduleDate: [],
        scheduleDept: {}
      })
    }
  },
  data() {
    return {
      activeDay: "",
      dateValue: {},
      dateAndBaseValueMap: {}, // 保存原始值，用于后续计算。原始值：页面初始化后日期对应的预测值 | 手动修改(非上下比例调整)
      dateTimeAndRatioMap: {}, // 保存时段值和天值的比例映射，用于后续计算。比例值：每个日期的时间段值相对于对应日期值的所占比例。
      dayAndRatioMap: {}, // 保存天值和总值的比例映射。
      typeDateAndRatioMap: {}, // 保存类型和天值的比例映射。
      timeTypeAndRatioMap: {}, // 保存时段值和类型值的比例映射，用于后续计算。比例值：每个日期的时间段值相对于对应日期的类型的所占比例。
      currentDate: null, // 当前展示的日期(天)
      modifyMap: null, // 更改时段数据的组件显隐映射
      loading: false,
      tableHeight: 0,
      configValue: [],
      maxHeight: 0,
      timeArr: [],
      startRange: "",
      endRange: "",
      step: 60,
      rangeArr: [],
      value: 0,
      dayValueMap: {},
      echartShow: false,
      chartWidth: "0px",
      chartHeight: 0
    };
  },
  computed: {
    OUTER_CDN() {
      return window.OUTER_CDN;
    },
    getTypeList() {
      return [{typeBid: 0, typeName: this.$t("zh_turnover")}];
    },
    getTypeName() {
      const obj = {typeBid: 0, typeName: this.$t("zh_turnover")};
      return obj.typeName;
    },
    getTableData() {
      return (this.dayValueMap[this.currentDate] && this.dayValueMap[this.currentDate].typeValueObjList) || [];
    },
    weeksMap() {
      return {
        0: this.$t("zh_zhou7"),
        1: this.$t("zh_zhou1"),
        2: this.$t("zh_zhou2"),
        3: this.$t("zh_zhou3"),
        4: this.$t("zh_zhou4"),
        5: this.$t("zh_zhou5"),
        6: this.$t("zh_zhou6")
      };
    }
  },
  created() {
    this.initHeight();
    this.search();
  },
  mounted() {
    window.onresize = this.initHeight;
  },
  beforeDestroy() {
    window.onresize = null;
  },
  methods: {
    initHeight() {
      let height = document.documentElement.clientHeight || document.body.clientHeight;
      this.tableHeight = height - 580 < 150 ? 150 : height - 580;
      if (this.$refs.posTB) {
        this.chartHeight = height - 400;
        this.chartHeight = this.chartHeight < 200 ? 200 : this.chartHeight;
        this.chartWidth = this.$refs.posForecastTable.bodyWidth;
        this.echartShow = false;
        this.$refs.posForecastTable.bodyWrapper.removeEventListener("scroll", this.scrollHandler);
        this.$refs.posForecastTable.bodyWrapper.addEventListener("scroll", this.scrollHandler);
        this.$nextTick(() => {
          this.echartShow = true;
          this.$nextTick(() => {
            if (this.$refs.chart) {
              this.$refs.chart.initChart();
            }
          });
        });
      }
    },
    scrollHandler() {
      this.$refs.chart.wrapScroll(this.$refs.posForecastTable.bodyWrapper.scrollLeft);
    },
    findChilds() {
      return new Promise((resolve, reject) => {
        this.http
          .post(api.findChildDids, {
            eqCond: {
              did: [this.searchForm.scheduleDept.did]
            },
            onlyGetDid: true,
            containOwner: false
          })
          .then((res) => {
            const {code, msg, data} = res.data;
            if (code === 0) {
              resolve(data);
            } else {
              this.$message.error(msg);
              reject();
            }
          })
          .catch(() => reject());
      });
    },
    async search(data) {
      const childsData = await this.findChilds();
      const depObj = {
        ...this.searchForm.scheduleDept,
        childDids: childsData[this.searchForm.scheduleDept.did].map((o) => o.did)
      };
      let searchRequest = {
        depTreeQueryList: [
          {
            metaField: "did",
            metaObj: "pos_forecast",
            symbols: ["eq"],
            values: [depObj]
          }
        ],
        employeeCodes: "",
        logic: "and",
        metaQueryList: [
          {
            metaField: "type",
            metaObj: "pos_forecast",
            symbols: ["eq"],
            values: [0]
          },
          {
            metaField: "dateRange",
            metaObj: "pos_query",
            symbols: ["ba"],
            values: this.searchForm.scheduleDate
          },
          {
            metaField: "startDate",
            metaObj: "pos_query",
            symbols: ["ge"],
            values: [this.searchForm.scheduleDate[0]]
          },
          {
            metaField: "endDate",
            metaObj: "pos_query",
            symbols: ["le"],
            values: [this.searchForm.scheduleDate[1]]
          }
        ],
        permission: {usage: "schedule_pos_forecast#view"},
        searchKey: ""
      };
      this.did = this.searchForm.scheduleDept.did;
      this.getSearchData({theme: 1, searchRequest});
    },
    getSearchData(params) {
      this.loading = true;
      this.http.post(api.list, params).then((r) => {
        this.loading = false;
        if (r.data.code !== 0) {
          return this.$message.error(r.data.msg);
        }
        let data = r.data.data;
        this.initData(data);
      });
    },
    initData(data = {}) {
      this.modifyMap = null;
      this.currentDate = null;
      let dayValueList = data.dayValueList || [];
      let dayValueMap = {};
      let totalValue = 0;
      let min = 0;
      let max = 0;
      let timeLen = 0;
      if (data.endHour == 0 && data.endMinute == 0) {
        data.endHour = 24;
      }
      const startHour = data.startHour + data.startMinute / 60;
      const endHour = data.endHour + data.endMinute / 60 + (data.endHour <= data.startHour ? 24 : 0);
      timeLen = Math.ceil((endHour - startHour) / (data.off / 60));
      dayValueList.forEach((item) => {
        item.percent = 0;
        item.isEdit = false;
        item.adjVal = item.adjVal || 0;
        totalValue += item.adjVal;
        item.min = item.min || 0;
        item.max = item.max || 0;
        min += item.min;
        max += item.max;
        let typeValueObjList = item.typeValueObjList || [];
        if (typeValueObjList.length) {
          typeValueObjList.forEach((obj) => {
            // 解析period
            if (obj.period) {
              if (obj.period.indexOf("[") === 0) {
                obj.period = JSON.parse(obj.period);
              } else {
                obj.period = obj.period.split(";");
              }
            } else {
              // 自动生成period结构
              obj.period = [];
              for (let i = 0; i < timeLen; i++) {
                obj.period.push(0);
              }
            }
            obj.oldPeriod = JSON.stringify(obj.period);
          });
        } else {
          // 自生成typeValueObjList结构
          typeValueObjList = [{}];
          typeValueObjList[0]["period"] = [];
          for (let i = 0; i < timeLen; i++) {
            typeValueObjList[0].period.push(0);
          }
          typeValueObjList[0].oldPeriod = JSON.stringify(typeValueObjList[0].period);
          item.typeValueObjList = typeValueObjList;
        }

        dayValueMap[item.date] = item;
        console.log(dayValueMap);
        this.dateAndBaseValueMap[item.date] = item.adjVal || 0;
        console.log("dateAndBaseValueMap", this.dateAndBaseValueMap);
      });
      this.value = totalValue;
      this.max = max;
      this.min = min;
      this.dayValueMap = dayValueMap;
      this.activeDay = Object.keys(this.dayValueMap)[0];
      this.currentDate = this.activeDay;
      let keys = Object.keys(dayValueMap).sort();
      if (dayValueList.length) {
        this.startTime = keys[0];
        this.endTime = keys[keys.length - 1];
        this.step = data.off;
        if (data.endHour <= data.startHour) {
          this.startRange = this.startTime + " " + data.startHour + ":" + data.startMinute + ":00";
          this.endRange = this.moment(this.startTime).add(1, "days").format("YYYY-MM-DD") + " " + data.endHour + ":" + data.endMinute + ":00";
        } else {
          this.startRange = this.startTime + " " + data.startHour + ":" + data.startMinute + ":00";
          this.endRange = this.startTime + " " + data.endHour + ":" + data.endMinute + ":00";
        }
        this.setTimeArr();
        this.setRangeArr();
        this.setDateTimeAndRatioMap();
        this.setDayAndRatioMap();
        this.setModifyMap();
        console.log(this.startRange, this.endRange);
        console.log("dateTimeAndRatioMap", this.dateTimeAndRatioMap);
        console.log("dayValueMap", this.dayValueMap);
        console.log("dayValueList", this.dayValueList);
        console.log("timeArr", this.timeArr);
        console.log("rangeArr", this.rangeArr);
        console.log("tableTypeList", this.tableTypeList);
        console.log("modifyMap", this.modifyMap);
        console.log("dayAndRatioMap", this.dayAndRatioMap);
        console.log("getTableData", this.getTableData);
      }
      this.$nextTick(() => {
        this.initHeight();
      });
    },
    rangeChange(value, period, index) {
      value = Number(value);
      if (String(value) === "NaN") {
        value = 0;
      }
      if (typeof value !== "number") {
        value = 0;
      }
      if (value < 0) {
        value = 0;
      }
      let oldValue = period[index];
      period[index] = value;
      let diffValue = this.round(value - oldValue);
      if (this.currentDate) {
        let adjVal = this.dayValueMap[this.currentDate].adjVal;
        adjVal = Math.round(this.round(adjVal + diffValue));
        this.dayValueMap[this.currentDate].adjVal = adjVal;
        this.value += diffValue;
        this.setDateTimeAndRatioMap();
      } else {
        // 更好汇总时段值
        this.value += diffValue;
      }
      // this.infoChange();
      this.dayValueMap = JSON.parse(JSON.stringify(this.dayValueMap));
    },
    handleDayChange(val) {
      this.currentDate = this.activeDay;
    },
    dayChange(value) {
      this.dayValueChange(value.adjVal, value.date, true);
    },
    dayValueChange(value, day, modifyBase) {
      let delta = value - this.dayValueMap[day]["value"];
      value = Math.round(value);
      this.dayValueMap[day].adjVal = value; // 当前日期总值(展示值)
      if (modifyBase) {
        this.dateAndBaseValueMap[day] = value; // 更新原始值
      }
      this.value = Math.round(this.round(this.value + delta));
      this.periodRadio(day);
      this.dayValueMap = JSON.parse(JSON.stringify(this.dayValueMap));
      // this.infoChange();
    },
    periodRadio(day) {
      let period = this.dayValueMap[day]["typeValueObjList"][0]["period"];
      let newVal = this.dayValueMap[day].adjVal;
      let periodLen = period.length;
      let maxValueIndex = 0;
      let maxValue = 0;
      for (let i = 0; i < periodLen; i++) {
        period[i] = this.round(this.dateTimeAndRatioMap[day][this.rangeArr[i].range] * newVal); // 按比例分配
        if (maxValue < period[i]) {
          maxValue = period[i];
          maxValueIndex = i;
        }
      }
      let newValueSum = period.reduce((res, i) => res + i, 0);
      newValueSum = this.round(newValueSum);
      let diffValue = this.round((newVal * 100 - newValueSum * 100) / 100);
      period[maxValueIndex] = this.round((period[maxValueIndex] * 100 + diffValue * 100) / 100);
    },
    round(num) {
      return Number((parseInt(Math.round(num * 100)) / 100).toFixed(2));
    },
    setRangeArr() {
      var rangeArr = [];
      var startTime = this.moment(this.startRange);
      var func = () => {
        if (!startTime.isBefore(this.moment(this.endRange))) {
          rangeArr[rangeArr.length - 1] = {
            start: rangeArr[rangeArr.length - 1].start,
            end: this.moment(this.endRange).format("HH:mm"),
            range: rangeArr[rangeArr.length - 1].start + "-" + this.moment(this.endRange).format("HH:mm")
          };
          this.rangeArr = rangeArr;
          return;
        }
        var start = startTime.format("HH:mm");
        var end = this.moment(startTime).add(this.step, "m").format("HH:mm");
        rangeArr.push({start, end, range: start + "-" + end});
        startTime.add(this.step, "m");
        func();
      };
      func();
    },
    setTimeArr() {
      var timeArr = [];
      var day = this.moment(this.startTime);
      var func = () => {
        if (day.isAfter(this.moment(this.endTime))) {
          this.timeArr = timeArr;
          return;
        }
        timeArr.push(this.moment(day.format("YYYY-MM-DD")));
        day.add(1, "d");
        func();
      };
      func();
    },
    setModifyMap() {
      let result = {};
      this.getTypeList.forEach((obj) => {
        result[obj.typeName] = {};
        this.rangeArr.forEach((r) => {
          result[obj.typeName][r.range] = false;
        });
      });
      this.modifyMap = result;
    },
    setDateTimeAndRatioMap() {
      this.timeArr.forEach((t, i) => {
        const time = t.format("YYYY-MM-DD");
        const row = this.dayValueMap[time];
        this.dateTimeAndRatioMap[time] = {};
        if (row.typeValueObjList[0].period.every((i) => i === 0)) {
          const ratio = Number((1 / row.typeValueObjList[0].period.length).toFixed(6));
          this.rangeArr.forEach((r, i) => {
            if (i === this.rangeArr.length - 1) {
              this.dateTimeAndRatioMap[time][r.range] = Number((1 - ratio * (this.rangeArr.length - 1)).toFixed(6));
            } else {
              this.dateTimeAndRatioMap[time][r.range] = ratio;
            }
          });
          return;
        }
        this.rangeArr.forEach((r, j) => {
          const range = r.range;
          const value = row.typeValueObjList[0].period[j];
          let ratio = Number((value / row.adjVal).toFixed(6));
          if (String(ratio) === "NaN") {
            ratio = 0;
          }
          this.dateTimeAndRatioMap[time][range] = ratio;
        });
      });
    },
    setDayAndRatioMap() {
      if (this.value === 0) {
        // 平均分配比例
        const length = Object.keys(this.dayValueMap).length;
        let ratio = Number((1 / length).toFixed(6));
        Object.keys(this.dayValueMap).forEach((key, i) => {
          if (i === length - 1) {
            this.dayAndRatioMap[key] = Number((1 - ratio * (length - 1)).toFixed(6));
          } else {
            this.dayAndRatioMap[key] = ratio;
          }
        });
        return;
      }
      // 按手动更改后的值设定各自比例
      Object.keys(this.dayValueMap).forEach((key) => {
        const dayValue = this.dayValueMap[key].adjVal || 0;
        let ratio = Number((dayValue / this.value).toFixed(6));
        if (String(ratio) === "NaN") {
          ratio = 0;
        }
        this.dayAndRatioMap[key] = ratio;
      });
    },
    save(message = true) {
      return new Promise((resolve, reject) => {
        let dayValueList = Object.keys(this.dayValueMap).map((item) => {
          let dayValueMap = JSON.parse(JSON.stringify(this.dayValueMap));
          dayValueMap[item]["adjVal"] = dayValueMap[item]["adjVal"];
          dayValueMap[item]["typeValueObjList"][0]["period"] = JSON.stringify(dayValueMap[item]["typeValueObjList"][0]["period"]);
          return dayValueMap[item];
        });
        this.http
          .post(api.save, {
            dayValueList: dayValueList,
            did: this.did,
            endHour: parseInt(this.endRange.split(" ")[1].split(":")[0]),
            endMinute: parseInt(this.endRange.split(" ")[1].split(":")[1]),
            off: this.step,
            startHour: parseInt(this.startRange.split(" ")[1].split(":")[0]),
            startMinute: parseInt(this.startRange.split(" ")[1].split(":")[1]),
            theme: 1,
            type: 0 // 营业额
          })
          .then((res) => {
            if (res.data.code === 0) {
              message && this.$message.success(this.$t("saveSuccess"));
              resolve();
            } else {
              this.$message.error(res.data.msg);
              reject();
            }
          })
          .catch(() => reject());
      });
    }
  }
};
</script>

<style lang="less" scoped>
@bdcolor: #eaedf2;
@bd: 1px solid @bdcolor;
@bgcolor: #f6f8fa;
@color: #3c5266;
@colorlight: #6a7885;
.pos-forecast-content {
  height: calc(100vh - 170px);
  .pos-forecast {
    padding: 0 20px;
    .day-wrapper {
      // display: flex;
      // flex-direction: row;
      width: 100%;
      overflow: auto;
      padding: 5px 0;
      .day-total {
        padding-right: 24px;
        border-right: 1.5px solid rgba(234, 237, 242, 1);
      }
      .days {
        display: flex;
        flex-wrap: nowrap;
        .day {
          margin-left: 24px;
        }
      }
    }
    .day-table {
      z-index: 0;
      .summary-wrap {
        display: flex;
        flex-direction: row;
        background-color: #f8f9fa;
        width: 510px;
        border: 1px solid #eaedf2;
        .title {
          width: 284px;
          border-right: 1px solid #eaedf2;
          padding: 5px 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #9ca3a9;
          font-size: 14px;
          font-weight: bold;
        }
        .summary {
          width: 226px;
          padding: 5px 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
      :deep(.el-table) {
        .el-table__fixed {
          bottom: 10px !important;
        }
        .el-table__body-wrapper {
          &::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }
          &::-webkit-scrollbar-track {
            border-radius: 10px;
            background: rgba(0, 0, 0, 0.03);
            -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.03);
          }
          &::-webkit-scrollbar-thumb {
            border-radius: 3px;
            background: rgba(180, 187, 197, 0.6);
            -webkit-box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
          }
          &::-webkit-scrollbar-thumb:hover {
            background: rgba(180, 187, 197, 0.8);
          }
          &::-webkit-scrollbar-thumb:active {
            background: rgba(180, 187, 197, 1);
          }
        }
      }
    }
    .chart-wrapper {
      z-index: 999;
      // width: calc(100% - 52px);
      width: 100%;
      position: relative;
      bottom: 0px;
      background-color: #ffffff;
      margin-top: 30px;
    }
  }
}
</style>
