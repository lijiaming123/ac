<template>
  <div class="print">
    <el-dialog :title="$t('zh_print_schedule')" v-if="printDialogVisible" :visible.sync="printDialogVisible" @before-close="isClose" width="80%" @opened="preloadPrint = false">
      <iframe border="0" frameboder="0" width="0" height="0" ref="iframe" id="iframe" style="visibility: hidden"></iframe>
      <div id="printWrapper" class="print-wrapper" style="max-height: 500px; overflow-y: auto">
        <div style="width: 100%; overflow: hidden; display: flex; flex-direction: row; flex-wrap: nowrap; size: A4 landscape">
          <!-- 左侧 人名 合计板块 -->
          <div class="person-area" style="width: 23%; border-top: 0.5px solid #cccccc; border-bottom: 0.5px solid #cccccc; z-index: 10; background: #fff">
            <template v-for="(item, index) in printAllData">
              <div
                class="head"
                v-if="index === 0 || index % 18 === 0"
                :key="index + 'head'"
                :style="index && 'border-top: .5px solid #ccc'"
                style="display: flex; flex-direction: row; background: #eef2f6; padding: 0">
                <div
                  class="cell"
                  style="
                    border-left: 1px solid #ccc;
                    border-right: 0.5px solid #cccccc;
                    position: relative;
                    font-size: 12px;
                    height: 50px;
                    flex: 1;
                    overflow: hidden;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">
                  {{ dep }}
                </div>
                <div
                  class="cell"
                  style="
                    border-right: 0.5px solid #cccccc;
                    position: relative;
                    font-size: 12px;
                    height: 50px;
                    line-height: 50px;
                    flex: 1;
                    overflow: hidden;
                    word-break: break-word;
                    text-align: center;
                  ">
                  {{ $t("zh_total") }}
                </div>
              </div>
              <div class="row" :key="index" :style="getStyle(index)" style="height: 50px; width: 100%; border-top: 0.5px solid #cccccc; display: flex; flex-direction: row">
                <div
                  class="cell"
                  style="border-right: 0.5px solid #cccccc; font-size: 12px; height: 50px; flex: 1; overflow: hidden; word-break: break-word; text-align: center; border-left: 1px solid #ccc">
                  <span style="display: block" :style="{'margin-top': item.profile.post ? '8px' : '18px'}">
                    {{ item.profile.name }}
                  </span>
                  <span style="color: #c2c2c2; display: block">
                    {{ item.profile.post }}
                  </span>
                </div>
                <div class="cell" style="border-right: 0.5px solid #cccccc; font-size: 12px; height: 50px; line-height: 50px; flex: 1; overflow: hidden; word-break: break-word; text-align: center">
                  {{ (utils.getTotalShiftTimeLengthByEmp({Emp: item, start: timeArr[0].format("YYYY-MM-DD"), end: timeArr[timeArr.length - 1].format("YYYY-MM-DD")}) / 60).toFixed(2) }}H
                </div>
              </div>
            </template>
          </div>

          <!-- 右侧 天数 任务 -->
          <div class="shift-area" style="width: 77%; border-top: 0.5px solid #cccccc; border-bottom: 0.5px solid #cccccc; z-index: 0">
            <template v-for="(item, i) in printAllData">
              <!-- 天数 -->
              <div
                class="head"
                v-if="i === 0 || i % 18 === 0"
                :key="i + 'head'"
                :style="i && 'border-top: .5px solid #ccc'"
                style="display: flex; flex-direction: row; background: #eef2f6; padding: 0">
                <div
                  class="cell"
                  v-for="(v, index) in timeArr"
                  :key="index"
                  style="border-right: 0.5px solid #cccccc; font-size: 12px; font-size: 12px; height: 50px; flex: 1; overflow: hidden; word-break: break-word; text-align: center">
                  <span class="mon-day" style="margin-top: 8px; display: block">
                    {{ dayNum(v) }}
                  </span>
                  <span class="mon-week" v-if="timeArr.length < 15">
                    {{ weekNum(v) }}
                  </span>
                </div>
              </div>

              <!-- 任务 -->
              <div class="row" :key="i" :style="getStyle(i)" style="height: 50px; width: 100%; border-top: 0.5px solid #cccccc; display: flex; flex-direction: row; position: relative">
                <div
                  class="cell"
                  v-for="(day, index) in timeArr"
                  :key="index"
                  style="border-right: 0.5px solid #cccccc; height: 50px; line-height: 32px; flex: 1; overflow: hidden; text-align: center">
                  <div
                    style="
                      left: 0%;
                      width: 100%;
                      border-color: rgb(194, 194, 194);
                      background-image: repeating-linear-gradient(-45deg, rgb(224, 229, 230), rgb(245, 245, 245) 1px, rgb(245, 245, 245) 3px, rgb(224, 229, 230) 4px);
                      opacity: 1;
                      margin-top: 10px;
                      border-left: 1px solid rgb(194, 194, 194);
                      box-sizing: border-box;
                      font-size: 12px;
                    "
                    v-if="item.tasks && item.tasks.length && item.tasks.some((v) => moment(v.gmtStart).format('YYYY-MM-DD') == day['_i'])">
                    <template v-if="item.taskSortObj[day['_i']][item.taskSortObj[day['_i']].length - 1].sourceType == 0">
                      <div :style="weightFn(item.taskSortObj[day['_i']])" style="color: rgb(106, 120, 133)">休息</div>
                    </template>
                    <template v-else>
                      <div style="height: 16px; line-height: 16px">
                        <span style="color: rgb(106, 120, 133); display: inline-block; vertical-align: top; line-height: 16px" :style="weightFn(item.taskSortObj[day['_i']])">
                          {{ item.taskSortObj[day["_i"]][item.taskSortObj[day["_i"]].length - 1].st }}
                        </span>
                        <span style="color: rgb(106, 120, 133); display: inline-block; vertical-align: top; line-height: 16px">-</span>
                        <span style="color: rgb(106, 120, 133); display: inline-block; vertical-align: top; line-height: 16px" :style="weightFn(item.taskSortObj[day['_i']])">
                          {{ item.taskSortObj[day["_i"]][0].et }}
                        </span>
                      </div>
                      <div style="height: 16px; line-height: 16px">
                        <span style="color: rgb(106, 120, 133); display: inline-block; vertical-align: top; line-height: 16px">
                          {{ getTimeH(day, i) }}
                        </span>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="initPrint">
          {{ $t("zh_print") }}
        </el-button>
        <el-button @click="printDialogVisible = false">
          {{ $t("zh_task_cancel") }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {utils} from "../../scheduleComponents/utils.js";

export default {
  components: {},
  props: {},
  created() {
    this.$eventBus.$on("printMes", (mes) => {
      this.printAllData = mes.viewData ? JSON.parse(JSON.stringify(mes.viewData)) : [];
      this.timeArr = mes.timeArr ? mes.timeArr : [];
      // 数据处理

      // 过滤掉 支援任务
      this.printAllData.forEach((item1) => {
        if (item1.tasks) {
          item1.tasks = item1.tasks.filter((v) => v.sourceType != 5);
        }
      });

      // 过滤之后的任务进行处理
      this.printAllData.forEach((item) => {
        item.taskSortObj = {};
        item.tasks &&
          item.tasks.length &&
          item.tasks.forEach((v) => {
            v.st = this.moment(v.gmtStart).format("HH:mm");
            v.et = this.moment(v.gmtEnd).format("HH:mm") == "00:00" ? "24:00" : this.moment(v.gmtEnd).format("HH:mm");

            if (v.st.substr(0, 1) == "0") {
              v.st = v.st.substr(1);
            }
            if (v.et.substr(0, 1) == "0") {
              v.et = v.et.substr(1);
            }

            var timeLong = this.moment(v.gmtEnd).diff(this.moment(v.gmtStart), "minutes");
            v.timeLong = timeLong > 0 ? timeLong / 60 : (timeLong + 1440) / 60;

            // 定位每一天的所有任务
            var startT = this.moment(v.gmtStart).format("YYYY-MM-DD");
            if (!item.taskSortObj[startT]) {
              item.taskSortObj[startT] = [v];
            } else {
              item.taskSortObj[startT].push(v);
            }
          });
      });
      this.printDialogVisible = true;

      this.printAllData[0].profile && (this.dep = this.printAllData[0].profile.dep);
    });
  },
  mounted() {},
  data() {
    return {
      worktime: "", // 当月已排班时数
      preloadPrint: false,
      printDialogVisible: false,
      printAllData: [],
      timeArr: [],
      dep: "",
      utils
    };
  },
  computed: {},
  methods: {
    getTimeH(day, index) {
      const start = this.moment(day["_i"]);
      const tasks = this.printAllData[index].tasks.filter((task) => task.sourceType != 5 && start.isSame(task.gmtStart, "day"));
      const round = (num) => {
        return Number((parseInt(Math.round(num * 100)) / 100).toFixed(2));
      };
      const time = tasks.reduce((acc, task) => {
        return round(acc + Number(this.getShiftTimeLength(task)));
      }, 0);

      console.log(time);
      return "(" + time + "H)";
    },
    getShiftTimeLength(data) {
      return this.getShiftTime(data);
    },
    round(num) {
      return Number((parseInt(Math.round(num * 100)) / 100).toFixed(2));
    },
    getShiftTime(data) {
      if (data.sourceType === 3 && (data.duration || data.duration == 0)) {
        return this.round(data.duration / 60).toFixed(2);
      } else if (data.ranges && data.ranges.length) {
        let dur = 0;
        data.ranges.forEach((obj) => {
          dur += obj.rest ? 0 : obj.duration;
        });
        return this.round(dur / 60).toFixed(2);
      } else if (data.sourceType === 4 && data.taskInfo && "type" in data.taskInfo && data.taskInfo.type === 3) {
        // 任务类型-休息任务 直接返回 0
        return 0;
      } else {
        // 4.999722222222222 用toFixed(2)会返回 5.00
        return this.round(this.moment(data.gmtEnd).diff(this.moment(data.gmtStart), "hours", true)).toFixed(2);
      }
    },

    weightFn(item) {
      var st = item[item.length - 1].gmtStart;
      var et = item[0].gmtEnd;

      var s = item[0].tasksBakSatrt.every((v) => +new Date(st) <= +new Date(v));
      var e = item[0].tasksBakEnd.every((v) => +new Date(et) >= +new Date(v));
      if (s || e) {
        return "font-weight: 900";
      } else {
        return "font-weight: 400";
      }
    },
    initPrint() {
      let printDom = document.getElementById("printWrapper");
      let iframe = document.getElementById("iframe");
      iframe.contentWindow.document.write(printDom.innerHTML);
      iframe.contentWindow.focus();
      iframe.contentWindow.document.close();
      iframe.contentWindow.print();
      return;
    },
    getStyle(index) {
      if (index && (index + 1) % 18 === 0) {
        return "page-break-after: always;border-bottom: .5px solid #ccc";
      } else {
        return "";
      }
    },
    weekNum(v) {
      return v.format("ddd");
    },
    dayNum(v) {
      if (this.$store.state.schedule.timeArr.length > 10) {
        return v.format("DD");
      }
      return v.format("M/DD");
    },
    isClose() {
      document.getElementById("iframe").contentWindow.document.body.innerHTML = "";
      this.printDialogVisible = false;
    }
  }
};
</script>

<style lang="less" scoped></style>
