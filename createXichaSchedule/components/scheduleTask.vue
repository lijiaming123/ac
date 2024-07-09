<template>
  <div class="sch-task-wrap" v-loading.fullscreen.lock="viewLoading1" @click.native="globalBlurEvent">
    <!-- <div class="datepicker" @click="initPersonSelect" 
        style="display:none">
      <el-button class="btn-left" icon="el-icon-arrow-left" :disabled="searchDate === searchForm.scheduleDate[0] || disableDate" @click="dateChange(-1)"></el-button> -->
    <!-- <div
    class="sch-task-wrap"
    v-loading.fullscreen.lock="viewLoading1"
    @click.native="globalBlurEvent"
  > -->
    <el-dialog width="800" custom-class="demo-drawer1" :visible.sync="$store.state.schedule.visableDialog" top="10%" @close="handleClose">
      <div class="titleStyle">
        <i class="el-icon-warning"></i>
        <h1>{{ $t("fabu_error") }}</h1>
      </div>
      <div class="titleColor">
        {{ $t("yixia_text") }}
        <span>{{ $store.state.schedule.formList.length || 0 }}</span>
        {{ $t("yuangong_text") }}
      </div>
      <el-table :data="$store.state.schedule.formList" style="width: 100%">
        <el-table-column prop="name" label="员工" width="160">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="名称" width="500">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" placement="top">
              <div slot="content" class="tooltipCon" style="max-width: 300px; word-break: break-all">
                {{ scope.row.date }}
              </div>
              <span class="oneOver" style="display: inline-block; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
                {{ scope.row.date }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- <el-button type="primary" @click="okBtn" >{{$t('hisearch_sure')}}</el-button> -->
      <div class="btnStyle">
        <el-button type="primary" @click="okBtn">
          {{ $t("zhidao_btn") }}
        </el-button>
      </div>
    </el-dialog>
    <div class="datepicker" @click="initPersonSelect" style="display: none">
      <el-button class="btn-left" icon="el-icon-arrow-left" :disabled="searchDate === searchForm.scheduleDate[0] || disableDate" @click="dateChange(-1)"></el-button>

      <el-date-picker
        v-model="searchDate"
        type="date"
        :clearable="false"
        :editable="false"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        :picker-options="pickerOptions"
        :placeholder="$t('zh_choice_time')"></el-date-picker>
      <el-button class="btn-right" icon="el-icon-arrow-right" :disabled="searchDate === searchForm.scheduleDate[1] || disableDate" @click="dateChange(1)"></el-button>

      <!-- SCH-1514 【需要紧急发布】喜茶版-智能排班文案调整 位置修改 -->
      <!-- <el-button v-if="this.$parent.currentStep === 3 || this.$parent.currentStep === 4" size="medium" @click="getViewData()">{{$t('zh_week_view')}}</el-button> -->
    </div>
    <div class="schedule-by-task-xc" @click="click" @contextmenu="contextmenu">
      <div class="wrap" :style="'height:calc(100vh - ' + 169 + 'px)'">
        <tableCharts ref="tabs" :tabsConHeight="tabsConHeight" :isLineShow="isLineShow" :useChart="false" useCache @toggle="initHeight('task')" />
        <div class="main" :style="'height:calc(100% - ' + ($store.state.schedule.tabHeight + 10) + 'px);margin-top: 10px;'">
          <div class="fixed-x" :style="{width: $store.state.schedule.columnWidth.info}">
            <tableHead :total="total" XCCreate />
          </div>
          <div
            class="scroll-x"
            :style="{
              width:
                $store.state.schedule.ISXICHA && $store.state.schedule.XCCreate
                  ? $store.state.schedule.schEmpIcon
                    ? 'calc(100vw - 322px)'
                    : 'calc(100vw - 370px)'
                  : 'calc(100vw - ' + ($store.state.schedule.columnWidth.info + 32) + 'px)'
            }">
            <div
              class="time-line-gutter"
              @mousemove="$eventBus.$emit('resizeColumnMousemove', $event)"
              @mouseup="$eventBus.$emit('resizeColumnMouseup', $event)"
              :style="'margin-right:' + ($store.state.schedule.scrollY ? $store.state.schedule.scrollBarWidth : 0) + 'px'">
              <timeLine ref="timeLine" :show-scale="showScale" :searchForm="searchForm" :disableDate="disableDate" :leftMenu="false" />
            </div>
            <person
              ref="person"
              XCCreate
              @memoSure="memoSure"
              :emptyMsg="emptyMsg"
              :leftMenu="false"
              :readonly="readonly"
              :style="'height: calc(100% - ' + ($store.state.schedule.readOnly || !$store.state.schedule.isOpenTaskShowInTask ? 60 : 60) + 'px);'" />
          </div>
        </div>
      </div>
      <context-menu-batch v-if="$store.state.schedule.showContextMenuBatch" @reload="refresh" />
      <calendar-menu v-if="$store.state.schedule.showCalendar" />
      <shift-detail />
      <div
        class="add-time-item"
        v-if="$store.state.schedule.contextMenuTask.isShow && ($store.state.schedule.contextMenuTask.y || $store.state.schedule.contextMenuTask.y == 0)"
        :style="{
          left: $store.state.schedule.contextMenuTask.isLeft ? $store.state.schedule.contextMenuTask.left + 'px' : 'unset',
          right: $store.state.schedule.contextMenuTask.isLeft ? 'unset' : utils.innerWidth - $store.state.schedule.contextMenuTask.left + 'px',
          top: $store.state.schedule.contextMenuTask.isTop ? $store.state.schedule.contextMenuTask.top + 'px' : 'unset',
          bottom: $store.state.schedule.contextMenuTask.isTop ? 'unset' : utils.innerHeight - $store.state.schedule.contextMenuTask.top + 'px'
        }">
        <div class="list">
          <div v-for="(v, i) in $store.state.schedule.depShifts" :key="i" @click="addTask(v, $event)" v-if="v.disableStatus != 1">
            <div class="title">
              <i :style="{background: v.color}"></i>
              <p>{{ v.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <schedule-prompt @resave="operateButtonClick('resave')" @examineApplyResave="operateButtonClick('examineApplyResave')" />
    <wq-drawer
      :title="$t('zh_examine_schedule')"
      :visible.sync="showViewData"
      direction="rtl"
      :close-on-press-escape="false"
      custom-class="view-data-drawer"
      size="80%"
      ref="viewDataDrawer"
      @close="viewSearchText = ''"
      :wrapperClosable="false">
      <div class="turn-drawer__content">
        <div class="view-data-wrapper">
          <div class="daterange">
            <el-date-picker
              v-model="viewDateRange"
              type="daterange"
              align="right"
              unlink-panels
              :clearable="false"
              :editable="false"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              :range-separator="$t('zh_to')"
              :start-placeholder="$t('startDate')"
              :end-placeholder="$t('endDate')"
              @change="getViewData"
              :picker-options="pickerOptions1"></el-date-picker>
          </div>
          <div class="main" v-loading="viewLoading">
            <div class="table-header" :style="{'padding-right': hasScrollY ? '17px' : '0px'}">
              <div class="left">
                <div class="search">
                  <el-input class="search-input" v-model="viewSearchText" suffix-icon="el-icon-search" @input="viewSearchChange" :placeholder="$t('zh_input_placeholder')" />
                </div>
                <div class="combin">{{ $t("zh_total") }}</div>
              </div>
              <div class="right">
                <div class="day" v-for="(day, i) in timeArr" :key="i">
                  <span>{{ day.format("MM-DD") }}</span>
                  <span>{{ day.format("ddd") }}</span>
                </div>
              </div>
            </div>
            <div class="table-body" ref="tableBodyScroll">
              <div class="row" v-for="(row, rowIndex) in getRenderViewData" :key="rowIndex">
                <div class="left">
                  <div class="info">
                    <!-- <span>{{row.profile.name}}&nbsp;{{row.profile.jobCode}}</span>
                    <span>{{row.profile.dep}}-{{row.profile.post}}</span> -->
                    <span>{{ row.profile.name }}</span>
                    <span style="color: #c2c2c2">{{ row.profile.post }}</span>
                  </div>
                  <div class="combin">
                    {{ (utils.getTotalShiftTimeLengthByEmp({Emp: row, start: timeArr[0].format("YYYY-MM-DD"), end: timeArr[timeArr.length - 1].format("YYYY-MM-DD")}) / 60).toFixed(2) }}H
                  </div>
                </div>
                <div class="right">
                  <div class="day" v-for="(day, i) in timeArr" :key="i"></div>
                  <div class="schedule">
                    <template v-for="(v, i) in getRenderViewData[rowIndex] ? getRenderViewData[rowIndex].tasks : []">
                      <!-- && ((i === viewData[rowIndex].tasks.length - 1) || moment(viewData[rowIndex].tasks[i + 1].gmtStart).isAfter(viewData[rowIndex].tasks[i].gmtStart, 'day')) -->
                      <schedule v-if="v.sourceType !== 5 && v.sourceType != 3" timeMode="m" :timeArr="timeArr" :key="i" :index="rowIndex" :viewData="getRenderViewData" :data="v" />
                    </template>
                  </div>
                </div>
              </div>
            </div>
            <shift-detail />
          </div>
        </div>
      </div>
      <div class="turn-drawer__footer">
        <el-button @click="showViewData = false">
          {{ $t("zh_cancel") }}
        </el-button>
        <el-button type="primary" @click="showViewData = false">
          {{ $t("zh_sure") }}
        </el-button>
        <el-button v-if="isweekchartPrint" type="primary" @click="printFn">
          {{ $t("zh_print") }}
        </el-button>
      </div>
    </wq-drawer>
  </div>
</template>

<script>
import tableHead from "../../scheduleComponents/tableHead.vue";
import openTaskTitle from "../../scheduleComponents/openTaskTitle.vue";
import openTaskTimeLine from "../../scheduleComponents/openTaskTimeLine.vue";
import timeLine from "../../scheduleComponents/timeLine.vue";
import tableCharts from "../../scheduleComponents/stats/tableCharts.vue";
import calendarMenu from "../../scheduleComponents/calendarMenu.vue";
import HighSearch from "commonRemote/components/highSearch";
import shiftDetail from "../../scheduleComponents/shiftDetail.vue";
import exportMask from "commonRemote/components/exportMask";
import fileUpload from "commonRemote/components/fileUpload";
import mixinOperates from "../../scheduleComponents/mixinOperates.js";
import mixinOpenTask from "../../scheduleComponents/mixinOpenTask.js";
import mixinCommonMethods from "../../scheduleComponents/mixinCommonMethods.js";
import schedulePrompt from "../../scheduleComponents/schedulePrompt.vue";
import gjempselect from "commonRemote/components/selectMember/gjEmpselect";
import api from "../api.js";
import schedule from "../../scheduleComponents/scheduleXCView.vue";
import privilegeValidator from "commonRemote/services/privilegeValidator";
import {utils} from "../../scheduleComponents/utils.js";

const person = () => import("../../scheduleComponents/person.vue");
const contextMenuBatch = () => import("../../scheduleComponents/contextMenuBatch.vue");

export default {
  name: "schedule-task",
  mixins: [mixinCommonMethods, mixinOpenTask, mixinOperates],
  components: {
    tableHead,
    openTaskTitle,
    openTaskTimeLine,
    timeLine,
    tableCharts,
    person,
    contextMenuBatch,
    calendarMenu,
    HighSearch,
    shiftDetail,
    exportMask,
    fileUpload,
    schedulePrompt,
    gjempselect,
    schedule
  },
  props: {
    searchForm: {
      type: Object,
      default: () => ({
        scheduleDate: [],
        scheduleDept: {}
      })
    },
    readonly: Boolean,
    callback: Function,
    detectChanges: Function
  },
  data() {
    return {
      privilege_view: "ht_sch_intelligence_lite#view",
      tabsConHeight: 0,
      isLineShow: false,
      total: 0,
      showScale: false,
      dateValue: {},
      dids: [],
      eids: [],
      timeOptionsValue: "15-d",
      searchDate: "",
      XCCreate: true,
      showViewData: false,
      viewData: [],
      viewDateRange: [],
      viewSearchText: "",
      hasScrollY: false,
      viewLoading: false,
      viewLoading1: false,
      assistEids: [],
      disableDate: false,
      taskReleaseMemoMode: "hidden",
      emptyMsg: "",
      isweekchartView: false, // 周视图查看权限
      isweekchartPrint: false, // 周视图打印权限
      utils
    };
  },
  computed: {
    pickerOptions: function () {
      let that = this;
      return {
        disabledDate(time) {
          const start = that.searchForm.scheduleDate[0];
          const end = that.searchForm.scheduleDate[1];
          return that.moment(time).isBefore(that.moment(start)) || that.moment(time).isAfter(that.moment(end));
        }
      };
    },
    pickerOptions1: function () {
      let minTime = null;
      let maxTime = null;
      return {
        onPick(time) {
          if (!time.maxDate) {
            let timeRange = 6 * 24 * 60 * 60 * 1000;
            minTime = time.minDate.getTime() - timeRange;
            maxTime = time.minDate.getTime() + timeRange;
          } else {
            minTime = maxTime = null;
          }
        },
        disabledDate(time) {
          // onPick后触发
          if (minTime && maxTime) {
            return time.getTime() < minTime || time.getTime() > maxTime;
          }
        }
      };
    },
    timeArr() {
      let timeArr = [];
      let day = this.moment(this.viewDateRange[0]);
      let func = () => {
        if (day.isAfter(this.moment(this.moment(this.viewDateRange[1])))) {
          return;
        }
        timeArr.push(this.moment(day.format("YYYY-MM-DD")));
        day.add(1, "d");
        func();
      };
      func();
      return timeArr;
    },
    getRenderViewData() {
      return this.viewSearchText ? this.viewData.filter((item) => item.profile.name.indexOf(this.viewSearchText) > -1 || item.profile.jobCode.indexOf(this.viewSearchText) > -1) : this.viewData;
    }
  },
  created() {
    this.$store.state.schedule.XCCreate = true;
    this.searchDate = this.searchForm.scheduleDate[0];
    this.initCreated("task");
    this.initReadonly("task");
    this.timeOptionsChange(this.timeOptionsValue);
    this.checkCompany().finally(() => {
      this.checkPrivilege();
    });
    // this.getAllPerson();
  },
  mounted() {
    this.initHeight("task");
    this.$eventBus.$on("initHeight", this.initHeight);
    this.$store.commit("schedule/setTimeArr");
    this.$store.state.schedule.canEditTemp = true;
    this.initKeyEvent("task");

    // 上面内容 高度设置
    this.$nextTick(function () {
      if (document.getElementsByClassName("leftMove")) {
        document.getElementsByClassName("leftMove")[0].style.height = document.body.offsetHeight - 175 - this.$store.state.schedule.tabHeight + "px";
      }
    });
  },
  watch: {
    searchForm: {
      handler(value) {
        this.$store.state.schedule.XCCreateDid = value.scheduleDept.did;
      },
      immediate: true
    },
    searchDate() {
      this.disableDate = true;
      this.search();
    }
  },
  methods: {
    okBtn() {
      this.$store.state.schedule.visableDialog = false;
      this.search();
    },
    handleClose() {
      this.$store.state.schedule.visableDialog = false;
    },
    getName(key) {
      const data = this.$store.state.schedule.allEmpData;
      const obj = data.find((ele) => {
        return ele.profile.destId == key;
      });
      return obj ? obj.profile.name : "";
    },
    getQueryVariable(variable) {
      const query = window.location.href.split("?")[1];
      if (query) {
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split("=");
          if (pair[0] == variable) {
            return pair[1];
          }
        }
        return "";
      }
    },

    searchTime(date) {
      this.searchDate = date;
    },
    checkPrivilege() {
      const privileges = this.utils.getPrivilegeListByPage(this.$store);
      privilegeValidator.checkPageKey(privileges, (res) => {
        const {code, data} = res.data;
        if (code == 0 && data.keys.length) {
          this.$store.state.schedule.privileges = data.keys;
          this.$store.state.schedule.canRelease = new Set(data.keys).has("schedule_simplify_setting_publish");
          this.isweekchartPrint = new Set(data.keys).has("schedule_simplify_setting_weekchart_print");
        }
      });
    },
    click(e) {
      if (this.$store.state.schedule.noClick) {
        // 当进行选取日历范围时不处理
        return;
      }
      if (this.$store.state.schedule.handlerType) {
        return;
      }
      this.initStoreState();
      this.initPersonSelect();
    },
    initPersonSelect() {
      try {
        const personInfo = this.$refs.person.$refs.personInfo;
        const personInfoList = personInfo && personInfo.$children && personInfo.$children.length ? personInfo.$children : null;
        if (personInfoList) {
          personInfoList.forEach((child) => {
            if (child.$children && child.$children.length) {
              const childDom = child.$children[0] || {};
              if (childDom.$refs.acEmpSelect) {
                childDom.showEmpSelect = false;
              }
            }
          });
        }
      } catch (e) {
        console.log(e);
      }
    },
    contextmenu(e) {
      e.preventDefault();
      this.initStoreState();
      this.$eventBus.$emit("hideTaskContextMenu");
    },
    timeOptionsChange(val) {
      this.$store.state.schedule.timeMode = val.split("-")[1];
      this.$store.state.schedule.timeScale = parseInt(val.split("-")[0]);
      this.$nextTick(() => {
        this.$eventBus.$emit("calcScroll");
      });
      this.$store.commit("schedule/setChartOpt", {
        features: ["timeScaleChange", "widthChange"]
      });
    },
    getEids(date) {
      let data = this.searchRequest;
      data.rangeDate = data.rangeDate || {};
      data.rangeDate.gmtStart = date[0];
      data.rangeDate.gmtEnd = date[1];
      return new Promise((resolve, reject) => {
        this.http
          .post("/api/schedule-task/shift/doSearch", data)
          .then((res) => {
            if (res.data.code !== 0) {
              reject([]);
              if (res.data.code == 999) {
                this.emptyMsg = res.data.msg;
                return;
              } else {
                return this.$message.error(res.data.msg);
              }
            }
            resolve({
              allEids: res.data.data.allEids || [],
              assistEids: res.data.data.assistEids || []
            });
          })
          .catch(() => {
            reject({
              allEids: [],
              assistEids: []
            });
          });
      });
    },
    async getViewData(date) {
      date ? (this.viewLoading = true) : (this.viewLoading1 = true);
      const start = date ? date[0] : this.searchForm.scheduleDate[0];
      const end = date ? date[1] : this.moment(this.searchForm.scheduleDate[0]).add(6, "d").format("YYYY-MM-DD");
      const {allEids, assistEids} = await this.getEids([start, end]);
      const eids = this.$store.state.schedule.data
        .filter((emp, index) => {
          return emp.destEid && emp.checked;
        })
        .map((emp) => emp.destEid);
      const params = {
        allDids: this.dids,
        allEids: eids.length ? eids : allEids,
        assistEids: assistEids,
        start: start,
        end: end,
        nowPageIndex: 1,
        pageSize: 1000,
        privilegeKey: "schedule_task_setting_task#view"
      };
      this.viewDateRange = [params.start, params.end];
      this.http
        .post("/api/schedule-task/setting/listTaskScheduleLimit", params, "json")
        .then((res) => {
          if (res.data.code !== 0) {
            return this.$message.error(res.data.msg);
          }
          const data = res.data.data;
          const currentDate = this.$store.state.schedule.timeArr[0];
          const searchDateStart = this.moment(this.viewDateRange[0]).format("YYYY-MM-DD HH:mm");
          this.viewData = data.map((emp) => {
            if (this.timeArr.find((day) => day.isSame(currentDate, "day"))) {
              // 搜索范围包含视图当天，展示当前排班视图最新排班结果
              const newEmps = [];
              this.$store.state.schedule.data.forEach((obj) => {
                if (obj.destEid == emp.destEid) {
                  newEmps.push(obj);
                }
              });
              // 过滤掉排班视图当天的任务
              emp.tasks = emp.tasks.filter((task) => !this.moment(task.gmtStart).isSame(currentDate, "d"));
              emp.tasks = emp.tasks.concat(
                ...newEmps.map((emp) => {
                  return emp.tasks.filter((task) => this.moment(task.gmtStart).isSame(currentDate, "d"));
                })
              );
            }
            // 过滤掉前面的结束时间为零点的跨天任务
            emp.tasks = emp.tasks.filter((task) => this.moment(task.gmtEnd).format("YYYY-MM-DD HH:mm") !== searchDateStart);
            emp.tasks.sort((a, b) => {
              if (a.gmtStart > b.gmtStart) {
                return -1;
              }
              if (a.gmtStart < b.gmtStart) {
                return 1;
              }
              return 0;
            });
            return emp;
          });
          let temp = JSON.parse(JSON.stringify(this.viewData));
          (this.viewData || []).forEach((emp) => {
            emp.tasks.forEach((i) => {
              i.tasksBakSatrt = [];
              i.tasksBakEnd = [];
              let startDate = i.gmtStart.split(" ")[0];
              let endDate = i.gmtEnd.split(" ")[0];
              temp.forEach((j) => {
                j.tasks.forEach((k) => {
                  if (k.gmtStart.indexOf(startDate) > -1 && k.sourceType != 0 && k.sourceType != 5) {
                    i.tasksBakSatrt.push(k.gmtStart);
                  }
                  if (startDate == endDate && k.sourceType != 0 && k.sourceType != 5) {
                    if (k.gmtEnd.indexOf(endDate) > -1 && k.sourceType != 0) {
                      i.tasksBakEnd.push(k.gmtEnd);
                    }
                    let endTimeK = this.moment(k.gmtEnd).subtract(1, "days").format("yyyy-MM-DD HH:mm:ss");
                    endTimeK = endTimeK.split(" ")[0];
                    if (endTimeK == startDate && k.gmtStart.indexOf(startDate) > -1 && k.sourceType != 0) {
                      i.tasksBakEnd.push(k.gmtEnd);
                    }
                  } else {
                    let endTimeK = this.moment(endDate).subtract(1, "days").format("yyyy-MM-DD HH:mm:ss");
                    endTimeK = endTimeK.split(" ")[0];
                    if (endTimeK == startDate && k.gmtStart.indexOf(startDate) > -1 && k.sourceType != 0 && k.sourceType != 5) {
                      i.tasksBakEnd.push(k.gmtEnd);
                    }
                  }
                });
              });
            });
          });
          this.showViewData = true;
          this.changeScrollBar();
        })
        .finally(() => {
          this.viewLoading = false;
          this.viewLoading1 = false;
        });
    },
    viewSearchChange(value) {
      this.changeScrollBar();
    },
    changeScrollBar() {
      this.$nextTick(() => {
        this.hasScrollY = this.$refs["tableBodyScroll"].scrollHeight > this.$refs["tableBodyScroll"].clientHeight;
      });
    },
    getAllPerson() {
      const searchRequest = {
        depTreeQueryList: [],
        employeeCodes: "",
        logic: "and",
        metaQueryList: [],
        permission: {
          usage: "ht_sch_intelligence_lite"
        },
        rangeDate: {
          gmtEnd: this.searchForm.scheduleDate[0],
          gmtStart: this.searchForm.scheduleDate[1]
        },
        searchKey: "",
        tableData: [
          {metaObj: "entry_information", metaField: "employee_code"},
          {metaObj: "personal_profile", metaField: "full_name"}
        ]
      };
      const loadAllPerson = (eids = []) => {
        const query = {
          allEids: eids,
          allDids: [],
          searchRequest: searchRequest,
          start: this.searchForm.scheduleDate[0],
          end: this.searchForm.scheduleDate[1],
          nowPageIndex: 1,
          pageSize: 1000,
          privilegeKey: "schedule_task_setting_task#view"
        };
        this.http.post("/api/schedule-task/setting/listTaskScheduleLimit", query, "json").then((res) => {
          const {code, msg, data} = res.data;
          if (code === 0) {
            const canEditStatusArr = [0, 1, 2, 4, 5, 6];
            const canEditTypeArr = [0, 2, 4, 6];
            data.forEach((item, index) => {
              item.profile.requireAttendHours = item.profile.requireAttendHours || 0;
              item.profile.attendHours = item.profile.attendHours || 0;
              item.profile.requireLeaveDays = item.profile.requireLeaveDays || 0;
              (item.profile.leaveDays = item.profile.leaveDays || 0), (item.availableDate = {});
              [
                ...this.$store.state.schedule.timeArr,
                this.moment(this.$store.state.schedule.timeArr[0]).subtract(1, "d"),
                this.moment(this.$store.state.schedule.timeArr[0]).subtract(2, "d"),
                this.moment(this.$store.state.schedule.timeArr[this.$store.state.schedule.timeArr.length - 1]).add(1, "d"),
                this.moment(this.$store.state.schedule.timeArr[this.$store.state.schedule.timeArr.length - 1]).add(2, "d")
              ].forEach((date) => {
                const flag1 = date.isBetween(item.profile.dateOfJoin, item.profile.dateOfLeave, "d", "[]");
                const flag2 = !item.profile.destEid;
                item.availableDate[date.format("YYYY-MM-DD")] = flag1 || flag2;
              });
              item._frontIndex = index;
              item._frontId = this.utils.getUUID();
              item.checked = false;
              item.tasks.forEach((task) => {
                task.canEdit = canEditStatusArr.indexOf(task.taskStatus) > -1 && canEditTypeArr.indexOf(task.sourceType) > -1 && !task.locked;
                task.isAvailable = item.availableDate[this.moment(task.gmtStart).format("YYYY-MM-DD")];
                task._frontId = this.utils.getUUID();
              });
            });
            this.$store.state.schedule.allEmpData = data;
          } else {
            return this.$message.error(msg);
          }
        });
      };
      this.http.post("/api/shared-search/shared/doSearch", searchRequest).then((res) => {
        if (res.data.code !== 0) {
          return this.$message.error(res.data.msg);
        }
        const eids = res.data.data || [];
        loadAllPerson(eids);
      });
    },
    findChilds() {
      return new Promise((resolve, reject) => {
        this.http
          .post(api.findChildDids, {
            eqCond: {
              did: [this.searchForm.scheduleDept.did]
            },
            onlyGetDid: true,
            containOwner: true
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
    async search() {
      const childs = await this.findChilds();
      const did = this.searchForm.scheduleDept.did;
      const dep = {
        ...this.searchForm.scheduleDept,
        childDids: childs[did].filter((o) => o.did != did).map((o) => o.did)
      };
      let data = {
        depTreeQueryList: [
          {
            metaField: "name",
            metaObj: "work_unit",
            symbols: ["like"],
            values: [dep]
          }
        ],
        employeeCodes: "",
        logic: "and",
        metaQueryList: [],
        permission: {
          usage: "ht_sch_intelligence_lite"
        },
        rangeDate: {
          gmtStart: this.searchDate,
          gmtEnd: this.searchDate
        },
        searchKey: "",
        tableData: [
          {metaObj: "entry_information", metaField: "employee_code"},
          {metaObj: "personal_profile", metaField: "full_name"}
        ]
      };
      this.$store.state.schedule.startTime = this.searchDate;
      this.$store.state.schedule.endTime = this.searchDate;
      this.$store.commit("schedule/setTimeArr");
      // this.$store.commit("schedule/setChartOpt", { features: ["widthChange", 'timeScaleChange'] })
      this.dids = childs[this.searchForm.scheduleDept.did].map((o) => o.did);
      this.$store.state.schedule.dids = this.dids;
      this.searchRequest = data;
      const p1 = new Promise((resolve, reject) => {
        // 当前部门下的人员
        this.http
          .post("/api/schedule-task/shift/doSearch", data)
          .then((res) => {
            if (res.data.code !== 0) {
              reject([]);
              if (res.data.code == 999) {
                this.emptyMsg = res.data.msg;
                return;
              } else {
                return this.$message.error(res.data.msg);
              }
            }
            resolve(res.data.data.allEids || []);
          })
          .catch(() => {
            reject([]);
          });
      });
      const p2 = new Promise((resolve, reject) => {
        // 支援当前部门的人员
        this.http
          .post("/api/time-support/request/queryReceiveEid", {
            didList: this.dids,
            startDate: this.searchDate,
            endDate: this.searchDate
          })
          .then((res) => {
            if (res.data.code !== 0) {
              reject([]);
              return this.$message.error(res.data.msg);
            }
            this.assistEids = res.data.data || [];
            resolve(res.data.data || []);
          })
          .catch(() => {
            reject([]);
          });
      });
      Promise.all([p1, p2])
        .then((res) => {
          this.eids = [...new Set([...res[0], ...res[1]])];
          this.refresh();
        })
        .catch((e) => console.log(e));
    },
    refresh() {
      this.$store.state.schedule.awaitBids = [];
      this.$store.state.schedule.isCheckAll = false;
      this.$store.state.schedule.checkNum = 0;
      this.$store.state.schedule.data = [];
      this.$store.state.schedule.allEmpData = [];
      this.$store.state.schedule.dataCopy = [];
      this.$store.state.schedule.copyShiftData = {};
      this.$store.state.schedule.deleteBids = [];
      this.$store.state.schedule.usageCalcMap = {};
      this.getScheduleConfig();
      this.getDepShifts();
      let timeStampCheck = +new Date();
      this.$store.state.schedule.XCCreateTimeStampCheck = timeStampCheck;
      const p1 = this.loadData("task", timeStampCheck);
      const p2 = this.loadOpenTasks(null, timeStampCheck);
      Promise.all([p1, p2])
        .then((res) => {
          this.disableDate = false;
          console.log(res);
        })
        .catch((e) => {
          this.disableDate = false;
          console.log(e);
        });
    },
    memoSure(memo) {
      memo = memo || "";
      if (this.$store.state.schedule.addMemoType == "publish") {
        this.saveAndPublish(memo);
      }
      this.$store.state.schedule.addMemoType = "";
    },
    save(publish) {
      if (publish) {
        if (this.taskReleaseMemoMode !== "hidden" && !this.$store.state.schedule.isSkipFirst) {
          this.$store.state.schedule.memoRequired = this.taskReleaseMemoMode === "mandatory";
          this.$store.state.schedule.addMemoType = "publish";
          this.$store.state.schedule.showAddMemoDialog = true;
        } else {
          this.saveAndPublish();
        }
      } else {
        this.$store.commit("schedule/saveShift", {that: this});
      }
    },
    saveAndPublish(memo = "") {
      const that = this;
      const publishParam = {
        autoSubmit: 1,
        dids: this.dids,
        start: this.searchForm.scheduleDate[0],
        end: this.searchForm.scheduleDate[1],
        del: 1,
        progressBid: this.getQueryVariable("bid")
      };
      const refresh = this.$parent.currentStep === 4 ? true : false;
      this.$store.commit("schedule/saveShift", {
        that: this,
        refresh,
        showError: false,
        publish: true,
        publishParam,
        memo: memo,
        cb: that.callback
      });
      if (!this.$store.state.schedule.hasChange) {
        // 无可保存班次，直接走发布逻辑。
        this.publish(memo);
      }
    },
    publish(memo = "") {
      if (this.$store.state.schedule.loadedAllAwait === false) {
        this.$message.error(this.$t("zh_too_large_publish_shift"));
        return;
      }
      const range = {
        start: this.searchForm.scheduleDate[0],
        end: this.searchForm.scheduleDate[1]
      };
      this.publishShift(memo, this.callback, range);
    },
    getDepShifts() {
      const params = JSON.parse(JSON.stringify(this.searchRequest));
      delete params.rangeDate;
      delete params.tableData;
      delete params.permission;
      const data = {
        nowPageIndex: 1,
        pageSize: 200000,
        group: true,
        searchRequest: {
          ...params,
          permission: {usage: "schedule_config_task#view"}
        }
      };
      this.http.post("/api/schedule-config/task/listPagination", data).then((res) => {
        const {code, msg, data} = res.data;
        if (code === 0) {
          let list = data.list || [];

          // 过滤掉共享任务
          list = list.filter((v) => v.type !== 5);

          this.$store.state.schedule.depShifts = list;
        } else {
          this.$message.error(msg);
        }
      });
    },
    loadTaskReport(query) {
      this.http.post("/api/schedule-task/setting/efficiency/report", {...query, simple: 1}, "json").then((r) => {
        if (r.data.code !== 0) {
          return this.$message.error(r.data.msg);
        }
        this.$store.state.schedule.chartLegends = r.data.data.rowList;
        this.$store.state.schedule.chartLegendsMap = {};
        var chartData = {};
        r.data.data.rowList.forEach((item) => {
          this.$store.state.schedule.chartLegendsMap[item.key] = {
            ...item,
            checked: ["forecast_worktime", "actural_worktime"].indexOf(item.key) > -1
          };
          chartData[item.key] = {day: [], hour: [], halfHour: []};
        });
        r.data.data.dayDataList.forEach((day) => {
          day.fieldColumnList.forEach((field) => {
            chartData[field.key].day = [...chartData[field.key].day, ...field.oneDayColumnList.map((item) => Number(item))];
            chartData[field.key].hour = [...chartData[field.key].hour, ...field.oneHourColumnList.map((item) => Number(item))];
            chartData[field.key].halfHour = [...chartData[field.key].halfHour, ...field.halfHourColumnList.map((item) => Number(item))];
          });
        });
        this.$store.state.schedule.chartData = chartData;
        this.$store.commit("schedule/setChartOpt", {features: ["dataChange"]});
        // 表格数据返回，Dom更新后重新计算高度。
        this.initHeight("task");
      });
    },
    loadDayType() {
      this.http.post("/api/schedule-config/calendar/getCons", {}, "json").then((r) => {
        if (r.data.code !== 0) {
          return this.$message.error(r.data.msg);
        }
        this.$store.state.schedule.dayType = r.data.data.dayType;
      });
    },
    loadSpecial() {
      this.http.post("/api/schedule-task/loopWork/getCons", {}, "json").then((r) => {
        if (r.data.code !== 0) {
          return this.$message.error(r.data.msg);
        }
        this.$store.state.schedule.specialList = r.data.data.skipTypes || {};
      });
    },
    loadDepTasks() {
      this.http
        .post(
          "/api/schedule-config/task/listDidTaskByEids",
          {
            eids: this.queryEids,
            start: this.$store.state.schedule.startTime,
            end: this.$store.state.schedule.endTime
          },
          "json"
        )
        .then((r) => {
          if (r.data.code !== 0) {
            return this.$message.error(r.data.msg);
          }
          const didTaskBidMap = {};
          const data = r.data.data || {};
          for (const key in data) {
            if (data[key]) {
              didTaskBidMap[key] = data[key].map((task) => task.bid);
            }
          }
          this.$store.state.schedule.depTaskData = data;
          this.$store.state.schedule.didTaskBidMap = didTaskBidMap;
        });
    },
    loadTasks() {
      this.http
        .post(
          "/api/schedule-config/task/listMapByEids",
          {
            eids: this.queryEids
          },
          "json"
        )
        .then((r) => {
          if (r.data.code !== 0) {
            return this.$message.error(r.data.msg);
          }
          this.eids.forEach((eid) => {
            r.data.data[eid] = r.data.data[eid] || [];
          });
          this.$store.state.schedule.taskData = r.data.data;
        });
    },
    addRow() {
      this.$store.state.schedule.data.unshift({
        availableDate: {
          [this.searchDate]: true,
          [this.moment(this.searchDate).subtract(1, "d").format("YYYY-MM-DD")]: true,
          [this.moment(this.searchDate).subtract(2, "d").format("YYYY-MM-DD")]: true,
          [this.moment(this.searchDate).add(1, "d").format("YYYY-MM-DD")]: true,
          [this.moment(this.searchDate).add(2, "d").format("YYYY-MM-DD")]: true,
          // 以下 -bgcolor 只控制 格子 是否置灰   -- xuezhong
          [this.searchDate + "-bgcolor"]: true,
          [this.moment(this.searchDate).subtract(1, "d").format("YYYY-MM-DD") + "-bgcolor"]: true,
          [this.moment(this.searchDate).subtract(2, "d").format("YYYY-MM-DD") + "-bgcolor"]: true,
          [this.moment(this.searchDate).add(1, "d").format("YYYY-MM-DD") + "-bgcolor"]: true,
          [this.moment(this.searchDate).add(2, "d").format("YYYY-MM-DD") + "-bgcolor"]: true
        },
        checked: false,
        destBid: null,
        destEid: null,
        destId: null,
        leaves: [],
        offDays: [],
        profile: {
          requireAttendHours: 0,
          attendHours: 0,
          requireLeaveDays: 0,
          leaveDays: 0
        },
        tasks: [],
        formatAssists: [],
        _frontId: this.utils.getUUID()
      });
      this.$store.state.schedule.data = this.$store.state.schedule.data.map((obj, index) => {
        obj._frontIndex = index;
        return obj;
      });
      // this.$store.state.schedule.data = JSON.parse(JSON.stringify(this.$store.state.schedule.data));
    },
    deleteShifts() {
      let delIndex = [];
      let checkedRowList = this.$store.state.schedule.data.filter((emp) => emp.checked);
      if (checkedRowList.length) {
        this.$store.state.schedule.data.forEach((emp, index) => {
          if (emp.checked) {
            let tasks = [];
            let leaves = [];
            let empTasks = this.utils.getXYDelShifts(this.$store.state.schedule.data, this.$store.state.schedule.timeArr, 0, index).map((obj) => obj.task);
            empTasks = empTasks.filter((task) => task.sourceType !== 5);
            (emp.leaves || []).forEach((leave) => {
              leaves.push(...leave);
            });
            empTasks.forEach((shift) => {
              let cumulate = false;
              shift.taskStatus === 1 &&
                leaves.forEach((leave) => {
                  if (!cumulate) {
                    cumulate = this.utils.timeBetween(shift.gmtStart, shift.gmtEnd, leave.gmtStart, leave.gmtEnd);
                  }
                });
              // 已发布班次没有已发布可编辑权限时，不可删除。
              const cantReleaseRm = shift.taskStatus == 1 && this.$store.state.schedule.privileges.indexOf(this.utils.getPrivilegeByPageAndType(this.$store, "releaseRm")) == -1;
              // 检查删除班次是否是当前部门可操作的班次
              if (
                !shift.canEdit ||
                shift.locked ||
                cumulate ||
                cantReleaseRm ||
                this.moment(shift.gmtStart).format("YYYY-MM-DD") < this.$store.state.schedule.timeArr[0].format("YYYY-MM-DD") ||
                !this.$store.getters["schedule/shiftBelongToOwn"](shift, emp._frontIndex)
              ) {
                tasks.push(shift);
              }
            });
            // 全部班次都可以删除，遍历执行删除、计算操作
            if (!tasks.length) {
              empTasks.forEach((shift) => {
                this.$store.dispatch("schedule/calcAttendHours", {
                  index,
                  type: "delete",
                  shift: JSON.parse(JSON.stringify(shift))
                });
                this.$store.dispatch("schedule/calcLeaveDays", {
                  index,
                  type: "delete",
                  shift: JSON.parse(JSON.stringify(shift))
                });
                this.$store.commit("schedule/setCurrentRemoves", {
                  shift: shift,
                  index: index
                });
                this.$store.dispatch("schedule/calcTaskChartData", {
                  startTime: shift.gmtStart,
                  endTime: shift.gmtEnd,
                  type: "delete",
                  sourceType: shift.sourceType,
                  taskType: (shift.taskInfo || {}).type,
                  name: shift.name
                });
                if (shift.bid && !(shift.taskOpenGroupList && shift.taskOpenGroupList.empTaskOpenList)) {
                  this.$store.state.schedule.deleteBids.push(shift.bid); // 普通班次
                }
                if (shift.bid && shift.taskOpenGroupList && shift.taskOpenGroupList.empTaskOpenList) {
                  this.$store.state.schedule.deleteOpenTaskBid.push(shift.taskOpenGroupList.empTaskOpenList[0].bid); // 开放班次
                }
              });
              delIndex.push(index);
            } else {
              this.$message.error(this.$t("zh_not_delete_row"));
            }
          }
        });
      } else {
        this.$message.error(this.$t("zh_please_check_row"));
      }
      if (delIndex.length) {
        delIndex.forEach((index) => {
          const oldEid = this.$store.state.schedule.data[index].destEid;
          const oldEmp = this.notNull(oldEid) ? this.$store.state.schedule.allEmpData.find((item) => item.destEid === oldEid) : null;
          const shiftHasBid = this.$store.state.schedule.data[index].tasks.some((task) => task.bid);
          if (oldEmp && shiftHasBid) {
            // 同步人员选择器班次数据
            oldEmp.tasks = [];
          }
        });
        this.$store.state.schedule.data = this.$store.state.schedule.data
          .filter((item, index) => delIndex.indexOf(index) < 0)
          .map((item, index) => {
            item._frontIndex = index;
            return item;
          });
        this.$store.state.schedule.checkNum = this.$store.state.schedule.data.filter((emp) => emp.checked).length;
      }
    },
    notNull(value) {
      // eslint-disable-next-line no-undefined
      return value != null && value != undefined && value != "";
    },
    addTask(data, e) {
      this.$store.commit("schedule/setChooseShift", {
        color: data.color,
        fkSourceBid: data.bid,
        gmtEnd: this.moment(this.$store.state.schedule.contextMenuTask.end).format("YYYY-MM-DD HH:mm:ss"),
        gmtStart: this.moment(this.$store.state.schedule.contextMenuTask.start).format("YYYY-MM-DD HH:mm:ss"),
        name: data.name,
        ranges: [],
        extend: 2,
        canEdit: true,
        sourceType: 4,
        taskStatus: 0,
        _frontId: this.utils.getUUID(),
        taskInfo: {
          type: data.type
        }
      });
      this.$store.commit("schedule/setCopyShift");
      this.$store.commit("schedule/setChooseDay", {
        chooseDayX: this.$store.state.schedule.contextMenuTask.x,
        chooseDayY: this.$store.state.schedule.contextMenuTask.y
      });
      this.$store.dispatch("schedule/dropOrPasteShift", {type: "paste", that: this});
      this.$eventBus.$emit("hideTaskContextMenu");
    },
    loadOpenTasks(type = "task", timeStampCheck) {
      return new Promise((resolve, reject) => {
        this.$store.state.schedule.openTask = [];
        this.http
          .post(
            "/api/schedule-task/open/listOpenPoolXCH",
            {
              type: type,
              eidList: this.eids,
              startDate: this.$store.state.schedule.startTime,
              endDate: this.$store.state.schedule.endTime,
              did: this.searchForm.scheduleDept.did
            },
            "json"
          )
          .then((r) => {
            if (
              // 喜茶智能排班 快速点击步骤 重复请求 重复数据 bug XBUGXM-4314 -- xuezhong
              timeStampCheck != this.$store.state.schedule.XCCreateTimeStampCheck &&
              this.$store.state.schedule.XCCreate &&
              this.$store.state.schedule.ISXICHA
            ) {
              return;
            }
            if (r.data.code !== 0) {
              return this.$message.error(r.data.msg);
            }
            let openTaskList = [];
            let taskMap = {};
            r.data.data.forEach((item) => {
              Object.keys(item.empTaskOpenList).forEach((key) => {
                taskMap[key] = taskMap[key] || [];
                item.empTaskOpenList[key].forEach((task) => {
                  let sourceBid = type == "emp" ? task.fkShiftBid : task.diTaskBid; // 判断是员工开放班次还是任务开放班次
                  let sourceType = type == "emp" ? 1 : 4;
                  let taskType = task.diTaskType;
                  sourceBid &&
                    taskMap[key].push({
                      bid: task.bid,
                      isOpenTask: false,
                      color: task.color,
                      duration: task.durationMinute,
                      fkSourceBid: sourceBid,
                      gmtEnd: this.moment(task.taskDate + " " + task.endTime)
                        .add(task.acrossDayNum, "d")
                        .format("YYYY-MM-DD HH:mm:ss"),
                      gmtStart: task.taskDate + " " + task.startTime,
                      name: task.shiftName,
                      ranges: task.ranges,
                      sourceType: sourceType,
                      canEdit: true,
                      taskStatus: 0,
                      taskOpenGroupList: {...item, empTaskOpenList: [task]},
                      taskInfo: {type: taskType},
                      _frontId: this.utils.getUUID()
                    });
                });
              });
            });
            Object.keys(taskMap).forEach((key) => {
              openTaskList.push({
                profile: {},
                tasks: taskMap[key]
              });
            });
            this.setStateData(openTaskList, "task");
            resolve(true);
          })
          .catch((e) => {
            reject(false);
          });
      });
    },
    dateChange(key, cb) {
      switch (key) {
        case -1:
          if (this.searchDate === this.searchForm.scheduleDate[0]) {
            return;
          }
          this.detectChanges(() => {
            this.searchDate = this.moment(this.searchDate).subtract(1, "d").format("yyyy-MM-DD");
            cb && cb();
          });
          break;
        case 1:
          if (this.searchDate === this.searchForm.scheduleDate[1]) {
            return;
          }
          this.detectChanges(() => {
            this.searchDate = this.moment(this.searchDate).add(1, "d").format("yyyy-MM-DD");
            cb && cb();
          });
          break;
        default:
          break;
      }
    },
    printFn() {
      this.$eventBus.$emit("printMes", {
        viewData: this.viewData,
        timeArr: this.timeArr
      });
    }
  },
  beforeDestroy() {
    this.$eventBus.$off("refresh");
  }
};
</script>

<style lang="less" scoped>
@bdcolor: #eaedf2;
@boxshadowcolor: rgba(202, 199, 199, 0.5);
@color: #3c5266;
@bgcolorhover: #f8f9fa;
.sch-task-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .datepicker {
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    .el-date-editor {
      width: 120px;
    }
    .btn-left {
      margin-right: -7px;
      width: 30px;
      padding: 10px 21px;
      :deep(.el-icon-arrow-left) {
        margin-left: -5px;
      }
    }
    .btn-right {
      margin-left: -7px;
      width: 30px;
      padding: 10px 21px;
      :deep(.el-icon-arrow-right) {
        margin-left: -5px;
      }
    }
  }
  .schedule-by-task-xc {
    padding: 0 0px;
    .wrap {
      border-bottom: 1px solid @bdcolor;
      box-sizing: border-box;
      overflow: hidden;
      position: relative;
      .main {
        display: flex;
        overflow: hidden;
        align-items: stretch;
        position: relative;
        // z-index: 12;
        .fixed-x {
          overflow: hidden;
          // position: relative;
          // z-index: 7;
        }
        .scroll-x {
          // overflow-x: auto;
          // overflow-y: hidden;
          position: relative;
          // z-index: 8;
          .time-line-gutter {
            overflow: hidden;
            height: 60px;
            position: relative;
          }
          .open-task-gutter {
            // overflow-x: hidden;
            // height: 90px;
            border-bottom: 1px solid @bdcolor;
            position: relative;
          }
          :deep(.sch-com-person) {
            .person-info {
              z-index: 1002;
            }
          }
        }
      }
    }
    .add-time-item {
      position: absolute;
      z-index: 1000;
      top: 0;
      width: 200px;
      border: 1px solid @bdcolor;
      background: #fff;
      padding: 10px 0;
      box-shadow: 0 2px 4px @boxshadowcolor;
      &:before {
        content: "";
        left: -4px;
        top: 16px;
        border-width: 4px 5px 5px 0;
        border-color: transparent #fff;
        z-index: 1;
        position: absolute;
        border-style: solid;
      }
      &:after {
        content: "";
        left: -6px;
        top: 16px;
        border-width: 4px 6px 6px 0;
        border-color: transparent @bdcolor;
        position: absolute;
        border-style: solid;
      }
      .list {
        max-height: 148px;
        overflow-x: visible;
        overflow-y: auto;
        > div {
          height: 37px;
          cursor: pointer;
          &:hover {
            background: @bgcolorhover;
          }

          .title {
            display: flex;
            line-height: 37px;
            color: @color;
            font-size: 13px;
            i {
              width: 8px;
              height: 8px;
              border-radius: 4px;
              margin: 14px 8px 0;
            }
            p {
              flex: 1;
              margin: 0;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }
    }
  }
}
</style>

<style lang="less">
@bordercolor: #eaedf2;
.scrollbar5px {
  &::-webkit-scrollbar {
    height: 10px;
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
    background: rgba(0, 0, 0, 0.2);
  }
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
    border-radius: 0;
    background: rgba(0, 0, 0, 0.1);
  }
}
.auto-mark-rest-xc {
  width: auto;
  .el-message-box__content {
    padding: 0px;
    .el-message-box__status {
      .wqIconImg {
        display: none;
      }
    }
    .el-message-box__message {
      padding-left: 0px;
    }
  }
}
.view-data-drawer {
  [class*="-drawer__content"] {
    height: calc(100vh - 110px);
  }
  [class*="-drawer__footer"] {
    display: flex;
    justify-content: flex-end;
  }
  .el-drawer__body {
    padding: 10px 20px 10px 20px;
  }
  .turn-drawer__content {
    .view-data-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      font-size: 14px;
      color: #3c5266;
      .daterange {
        width: 100%;
        height: 40px;
        line-height: 80px;
        display: flex;
        justify-content: center;
      }
      .main {
        width: 100%;
        height: 100%;
        border-top: 1px solid @bordercolor;
        border-bottom: 1px solid @bordercolor;
        margin: 10px 0;
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
        .table-header {
          width: 100%;
          height: 52px;
          border-bottom: 1px solid @bordercolor;
          display: flex;
          box-sizing: border-box;
          .left {
            width: 25%;
            border-left: 1px solid @bordercolor;
            display: flex;
            .search {
              width: 70%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              border-right: 1px solid @bordercolor;
              padding: 0 20px;
              .el-input {
                width: 100%;
              }
            }
            .combin {
              width: 30%;
              height: 100%;
              padding: 5px;
              border-right: 1px solid @bordercolor;
              box-sizing: border-box;
              display: flex;
              justify-content: center;
              align-items: center;
            }
          }
          .right,
          .right > .day {
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            flex: 1;
            border-right: 1px solid @bordercolor;
          }
          .day {
            flex-direction: column;
          }
        }
        .table-body {
          width: 100%;
          display: flex;
          flex: 1;
          flex-direction: column;
          // border-bottom: 1px solid @bordercolor;
          overflow: auto;
          .row {
            width: 100%;
            height: 52px;
            min-height: 52px;
            display: flex;
            border-bottom: 1px solid #eaedf2;
            box-sizing: border-box;
            .left {
              width: 25%;
              border-left: 1px solid @bordercolor;
              // border-bottom: 1px solid @bordercolor;
              display: flex;
              .info {
                width: 70%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: flex-start;
                border-right: 1px solid @bordercolor;
                padding: 0 20px;
              }
              .combin {
                width: 30%;
                height: 100%;
                padding: 5px;
                border-right: 1px solid @bordercolor;
                box-sizing: border-box;
                display: flex;
                justify-content: center;
                align-items: center;
              }
            }
            .right,
            .right > .day {
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              flex: 1;
              border-right: 1px solid @bordercolor;
            }
            .right {
              position: relative;
              overflow: hidden;
            }
          }
          // .row:last-child {
          //   border-bottom: 0;
          // }
        }
      }
    }
  }
}
.titleStyle {
  i {
    color: orange;
    display: inline-block;
    vertical-align: middle;
    font-size: 20px;
    margin-right: 10px;
  }
  h1 {
    font-size: 16px;
    color: black;
    display: inline-block;
    vertical-align: middle;
  }
}
.titleColor {
  margin-bottom: 10px;
  span {
    color: red;
    margin: 0 6px;
  }
}
.btnStyle {
  text-align: right;
  margin-top: 10px;
}
</style>
>
