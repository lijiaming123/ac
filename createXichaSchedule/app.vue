<template>
  <div class="createXichaSchedule">
    <div v-loading="loading">
      <div class="head">
        <div class="goBack">
          <i class="el-icon-back" @click="goBack"></i>
          <span class="woquTitle">{{ title }}</span>
        </div>
        <div class="btnGroup">
          <div v-if="currentStep === 0">
            <el-button size="medium" @click="firstGoBack" style="margin-left: 8px">
              {{ $t("cancel") }}
            </el-button>
            <el-button type="primary" size="medium" @click="saveAndFirstNextStep">
              {{ $t("zh_keep_next") }}
            </el-button>
          </div>
          <div v-if="currentStep === 1">
            <el-button size="medium" @click="currentStep--">
              {{ $t("zh_prev") }}
            </el-button>
            <el-button size="medium" @click="saveSecondStep" style="margin-left: 8px">
              {{ $t("zh_save") }}
            </el-button>
            <el-button type="primary" size="medium" @click="saveAndSecondNextStep">
              {{ $t("zh_keep_next") }}
            </el-button>
          </div>
          <div v-if="currentStep === 2">
            <el-button size="medium" @click="$refs.pos.save().then(() => currentStep--)">
              {{ $t("zh_prev") }}
            </el-button>
            <el-button size="medium" @click="$refs.pos.save()" style="margin-left: 8px">
              {{ $t("zh_save") }}
            </el-button>
            <el-button type="primary" size="medium" @click="$refs.pos.save(false).then(() => updateStepAndData({bid, stage: 3}, () => currentStep++))">
              {{ $t("zh_keep_next") }}
            </el-button>
          </div>
          <div v-if="currentStep === 3">
            <el-button v-if="isweekchartView" size="medium" @click="$refs.scheduleTask.getViewData()">
              {{ $t("zh_week_view") }}
            </el-button>
            <el-button size="medium" @click="detectChanges(() => currentStep--)">
              {{ $t("zh_prev") }}
            </el-button>
            <el-button size="medium" @click="$refs.scheduleTask.deleteShifts()">
              {{ $t("zh_delete_row") }}
            </el-button>
            <el-button size="medium" @click="$refs.scheduleTask.addRow()">
              {{ $t("zh_add_row") }}
            </el-button>
            <el-button size="medium" @click="$refs.scheduleTask.save()">
              {{ $t("zh_save") }}
            </el-button>
            <el-button v-if="isPublish" type="primary" size="medium" @click="$refs.scheduleTask.save(true)">
              {{ $t("zh_publish") }}
            </el-button>
          </div>
          <div v-if="currentStep === 4">
            <el-button v-if="isweekchartView" size="medium" @click="$refs.scheduleTask.getViewData()">
              {{ $t("zh_week_view") }}
            </el-button>
            <el-button size="medium" @click="detectChanges(() => currentStep--)">
              {{ $t("zh_prev") }}
            </el-button>
            <el-button size="medium" @click="$refs.scheduleTask.deleteShifts()" style="margin-left: 8px">
              {{ $t("zh_delete_row") }}
            </el-button>
            <el-button size="medium" @click="$refs.scheduleTask.addRow()">
              {{ $t("zh_add_row") }}
            </el-button>
            <el-button size="medium" @click="$refs.scheduleTask.save()">
              {{ $t("zh_save") }}
            </el-button>
            <el-button v-if="isPublish" size="medium" @click="$refs.scheduleTask.save(true)">
              {{ $t("zh_publish") }}
            </el-button>
            <el-dropdown v-if="privilegeKeys.length" @command="handleCommand" style="margin-left: 8px">
              <el-button type="primary" size="medium">
                {{ $t("zh_more") }}
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="printCalendar" v-if="privilegeKeys.indexOf('schedule_task_setting_print_month_simple') >= 0">
                  {{ $t("zh_print_calendar") }}
                </el-dropdown-item>
                <el-dropdown-item command="printDate" v-if="privilegeKeys.indexOf('schedule_task_setting_print_week_simple') >= 0">
                  {{ $t("zh_print_date") }}
                </el-dropdown-item>
                <el-dropdown-item command="printDuration" v-if="privilegeKeys.indexOf('schedule_task_setting_print_day_simple') >= 0">
                  {{ $t("zh_print_time") }}
                </el-dropdown-item>
                <el-dropdown-item command="exportCalendar" v-if="privilegeKeys.indexOf('schedule_task_setting_export_month_simple') >= 0">
                  {{ $t("zh_export_1") }}
                </el-dropdown-item>
                <el-dropdown-item command="exportDate" v-if="privilegeKeys.indexOf('schedule_task_setting_export_week_simple') >= 0">
                  {{ $t("zh_export_2") }}
                </el-dropdown-item>
                <el-dropdown-item command="exportDuration" v-if="privilegeKeys.indexOf('schedule_task_setting_export_day_simple') >= 0">
                  {{ $t("zh_export_3") }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </div>
      <div class="body" :style="{height: boxHeight}">
        <div class="step" style="height: 40px">
          <el-steps :active="currentStep" simple>
            <el-step :title="$t('zh_create_schedule')" @click.native="changeStep(0)">
              <template slot="icon">
                <i v-if="currentStep > 0" class="el-icon-check" style="font-size: 14px; font-weight: bold"></i>
                <span v-else-if="currentStep === 0" style="font-size: 16px">1</span>
                <span v-else style="font-size: 16px; color: #6a7885">1</span>
              </template>
            </el-step>
            <el-step :title="$t('zh_business_time')" @click.native="changeStep(1)">
              <template slot="icon">
                <i v-if="currentStep > 1" class="el-icon-check" style="font-size: 14px; font-weight: bold"></i>
                <span v-else-if="currentStep === 1" style="font-size: 16px">2</span>
                <span v-else style="font-size: 16px; color: #6a7885">2</span>
              </template>
            </el-step>
            <el-step :title="$t('zh_POS_check1')" @click.native="changeStep(2)">
              <template slot="icon">
                <i v-if="currentStep > 2" class="el-icon-check" style="font-size: 14px; font-weight: bold"></i>
                <span v-else-if="currentStep === 2" style="font-size: 16px">3</span>
                <span v-else style="font-size: 16px; color: #6a7885">3</span>
              </template>
            </el-step>
            <el-step :title="$t('zh_schedule_operate')" @click.native="changeStep(3)">
              <template slot="icon">
                <i v-if="currentStep > 3" class="el-icon-check" style="font-size: 14px; font-weight: bold"></i>
                <span v-else-if="currentStep === 3" style="font-size: 16px">4</span>
                <span v-else style="font-size: 16px; color: #6a7885">4</span>
              </template>
            </el-step>
            <el-step :title="$t('zh_examine_schedule')" @click.native="changeStep(4)">
              <template slot="icon">
                <i v-if="currentStep > 4" class="el-icon-check" style="font-size: 14px; font-weight: bold"></i>
                <span v-else-if="currentStep === 4" style="font-size: 16px">5</span>
                <span v-else style="font-size: 16px; color: #6a7885">5</span>
              </template>
            </el-step>
          </el-steps>
        </div>
        <div class="content">
          <div v-show="currentStep === 0">
            <create-form v-if="createFormShow" :scheduleCycle="scheduleCycle" :model="shiftData" ref="createForm"></create-form>
          </div>
          <div v-if="currentStep === 1">
            <business-hours :model="businessData" :shiftData="shiftData" ref="businessHours"></business-hours>
          </div>
          <div v-show="currentStep === 2">
            <posForecast ref="pos" v-if="currentStep === 2" :searchForm="shiftData" :chartHeight="boxHeight - 200 - 51" />
          </div>
          <div v-if="currentStep === 3" style="height: 100%">
            <scheduleTask
              ref="scheduleTask"
              v-if="currentStep === 3"
              :key="new Date()"
              :searchForm="shiftData"
              :detectChanges="detectChanges"
              :callback="() => updateStepAndData({bid, stage: 4}, () => currentStep++)" />
          </div>
          <div v-show="currentStep === 4">
            <scheduleTask ref="scheduleTask" v-if="currentStep === 4" :key="new Date() + 1" :searchForm="shiftData" :detectChanges="detectChanges" />
          </div>
        </div>
      </div>
    </div>
    <export-mask :loading.sync="exportLoading" :param="exportParam" :title="$t('zh_schedule_by_task_xc')" />
    <el-dialog :title="$t('zh_print_preview')" :visible.sync="startPrint" :close-on-click-modal="false" width="80%" top="6vh" @close="startPrint = false">
      <iframe v-if="startPrint" :src="pdfSrc" width="100%" height="720px"></iframe>
    </el-dialog>

    <print />
  </div>
</template>

<script>
import businessHours from "./components/businessHours.vue";
import posForecast from "./components/posForecast.vue";
import exportMask from "commonRemote/components/exportMask";
import privilegeValidator from "commonRemote/services/privilegeValidator";
import print from "./components/print.vue";
import moment from "moment";
import "./../scheduleComponents/icon/iconfont.css";
import {message} from "./../scheduleComponents/message.js";

const createForm = () => import("./components/createForm.vue");
const scheduleTask = () => import("./components/scheduleTask.vue");

export default {
  components: {
    createForm,
    businessHours,
    posForecast,
    scheduleTask,
    exportMask,
    print
  },
  data() {
    return {
      boxHeight: "0px",
      title: "",
      bid: "",
      currentStep: 0,
      shiftData: {
        scheduleDate: [],
        scheduleDept: {}
      },
      oldShiftData: {
        scheduleDate: [],
        scheduleDept: {}
      },
      businessData: {
        dataList: [
          {
            start: "",
            end: "",
            dates: []
          }
        ]
      },
      oldBusinessData: {
        dataList: [
          {
            start: "",
            end: "",
            dates: []
          }
        ]
      },
      loading: false,
      postUrl: "",
      createFormShow: false,
      exportLoading: false,
      exportParam: {
        key: "schedule_scheduleExportTask",
        callBackParam: ""
      },
      interval: null,
      printLoading: null,
      pdfSrc: "",
      startPrint: false,
      privilegeKeys: [],
      isweekchartView: false,
      isPublish: false,
      scheduleCycle: {} // 排班周期设置参数
    };
  },
  watch: {
    currentStep(val) {
      this.resetLocation(this.bid, val + 1);
    }
  },
  beforeRouteEnter(to, from, next) {
    window.__Vue__.constructor.use(message);
    next();
  },
  created() {
    window.onpopstate = null;
    this.getInitValue();
    this.bid = this.getQueryVariable("bid") || "";
    this.title = this.bid ? this.$t("updateSchedule") : this.$t("zh_create_schedule");
    let stage = this.getQueryVariable("stage");
    stage = stage ? +stage : null;
    document.title = this.title;
    this.initHeight();
    window.onresize = this.initHeight;
    this.getPrivilege();
    if (this.bid) {
      this.getShiftData(stage);
    } else {
      this.currentStep = this.notNull(stage) ? stage - 1 : this.currentStep;
      if (this.currentStep == 0) {
        this.createFormShow = true;
      }
    }
    window.localStorage.removeItem("show_table_charts_xc");
  },
  methods: {
    getInitValue() {
      this.http.post("/api/schedule-config/aiBasicSetting/findOne", {}).then((res) => {
        const {data, code, msg} = res.data;
        if (code === 0) {
          data.scheduleCycle = data.scheduleCycle || 0;
          data.scheduleCycleExtra = data.scheduleCycleExtra || {};
          this.scheduleCycle = data;
        } else {
          this.$message.error(msg);
        }
      });
    },
    initHeight() {
      let height = document.documentElement.clientHeight || document.body.clientHeight;
      this.boxHeight = height - 129 + "px";
    },
    getPrivilege() {
      privilegeValidator.checkPageKey(
        [
          "schedule_simplify_setting_publish",
          "schedule_simplify_setting_weekchart_view",
          "schedule_task_setting_export_month_simple",
          "schedule_task_setting_export_week_simple",
          "schedule_task_setting_export_day_simple",
          "schedule_task_setting_print_month_simple",
          "schedule_task_setting_print_week_simple",
          "schedule_task_setting_print_day_simple"
        ],
        (res) => {
          const {code, data} = res.data;
          if (code == 0) {
            this.privilegeKeys = data.keys;
            this.isweekchartView = new Set(data.keys).has("schedule_simplify_setting_weekchart_view");
            this.isPublish = new Set(data.keys).has("schedule_simplify_setting_publish");
          }
        }
      );
    },
    getBusinessSetting(bid) {
      this.http
        .post("/api/schedule-task/setting/getBusiHours", {
          did: this.shiftData.scheduleDept.did,
          start: this.shiftData.scheduleDate[0],
          end: this.shiftData.scheduleDate[1]
        })
        .then((res) => {
          if (bid) {
            this.resetLocation(bid, 2);
          }
          this.currentStep++;
          const {code, msg, data} = res.data;
          if (code == 0) {
            this.businessData.dataList = data && data.length ? data : [{start: "", end: "", dates: []}];
          } else {
            this.$message.error(msg);
          }
        });
    },
    getShiftData(stage) {
      this.loading = true;
      this.http
        .post("/api/schedule-task/setting/getTaskJobStage", {bid: this.bid})
        .then((res) => {
          this.loading = false;
          const {code, msg, data} = res.data;
          if (code == 0) {
            this.shiftData.scheduleDate = [data.start, data.end];
            this.shiftData.scheduleDept.did = data.did;
            this.oldShiftData.scheduleDate = [data.start, data.end];
            this.oldShiftData.scheduleDept.did = data.did;
            this.createFormShow = true;
            this.currentStep = data.stage || 0;
            this.currentStep = this.notNull(stage) ? stage - 1 : this.currentStep;
            this.businessData.dataList = data.stageInfo[1] || [{start: "", end: "", dates: []}];
            this.oldBusinessData.dataList = JSON.parse(JSON.stringify(this.businessData.dataList));
          } else {
            this.currentStep = this.notNull(stage) ? stage - 1 : this.currentStep;
            this.$message.error(msg);
          }
        })
        .catch(() => {
          this.currentStep = this.notNull(stage) ? stage - 1 : this.currentStep;
        });
    },
    saveAndFirstNextStep() {
      this.$refs.createForm.validate((valid) => {
        if (valid) {
          if (
            this.shiftData.scheduleDate[0] === this.oldShiftData.scheduleDate[0] &&
            this.shiftData.scheduleDate[1] === this.oldShiftData.scheduleDate[1] &&
            this.shiftData.scheduleDept.did === this.oldShiftData.scheduleDept.did
          ) {
            if (JSON.stringify(this.businessData.dataList) === JSON.stringify([{start: "", end: "", dates: []}])) {
              this.getBusinessSetting();
            } else {
              this.currentStep++;
            }
          } else {
            this.addOrupdateShiftData((bid) => {
              this.getBusinessSetting(bid);
            });
          }
        }
      });
    },
    addOrupdateShiftData(callBack) {
      let submitData = {
        did: this.shiftData.scheduleDept.did,
        start: this.shiftData.scheduleDate[0],
        end: this.shiftData.scheduleDate[1]
      };
      if (this.bid) {
        this.postUrl = "/api/schedule-task/setting/updateTaskJob";
        submitData.bid = this.bid;
        submitData.stage = 0;
      } else {
        this.postUrl = "/api/schedule-task/setting/createTaskJob";
      }
      this.loading = true;
      this.http.post(this.postUrl, submitData).then((res) => {
        this.loading = false;
        const {code, msg, data} = res.data;
        if (code == 0) {
          this.$message.success(msg);
          this.oldShiftData.scheduleDate = [this.shiftData.scheduleDate[0], this.shiftData.scheduleDate[1]];
          this.oldShiftData.scheduleDept.did = this.shiftData.scheduleDept.did;
          this.businessData.dataList = [{start: "", end: "", dates: []}];
          this.oldBusinessData.dataList = [{start: "", end: "", dates: []}];
          this.bid = this.bid || data;
          callBack && callBack(this.bid);
        } else {
          this.$message.error(msg);
        }
      });
    },
    saveSecondStep() {
      this.$refs.businessHours.validate((valid) => {
        if (valid) {
          if (JSON.stringify(this.businessData.dataList) === JSON.stringify(this.oldBusinessData.dataList)) {
            console.log("nochange");
          } else {
            this.updateStepAndData({
              bid: this.bid,
              stage: 1,
              busiHours: this.businessData.dataList
            });
          }
        }
      });
    },
    saveAndSecondNextStep() {
      this.$refs.businessHours.validate((valid) => {
        if (valid) {
          if (JSON.stringify(this.businessData.dataList) === JSON.stringify(this.oldBusinessData.dataList)) {
            this.currentStep++;
          } else {
            this.updateStepAndData(
              {
                bid: this.bid,
                stage: 1,
                busiHours: this.businessData.dataList
              },
              () => {
                this.currentStep++;
              }
            );
          }
        }
      });
    },
    updateStepAndData(params, callBack) {
      if (params.busiHours) {
        let flag = true;
        let tempList = [];
        params.busiHours.forEach((o) => {
          o.dates.forEach((p) => {
            if (o.start >= o.end) {
              tempList.push([p + " " + o.start, this.moment(p).add(1, "day").format("YYYY-MM-DD") + " " + o.end]);
            } else {
              tempList.push([p + " " + o.start, p + " " + o.end]);
            }
          });
        });
        tempList
          .sort((x, y) => x[0].localeCompare(y[0]))
          .forEach((a, i) => {
            if (tempList[i + 1] && tempList[i + 1][0] < a[1]) {
              flag = false;
            }
          });
        if (!flag) {
          this.$message.error(this.$t("settingConflict"));
          return false;
        }
      }
      this.loading = true;
      this.http.post("/api/schedule-task/setting/updateTaskJob", params).then((res) => {
        this.loading = false;
        const {code, msg} = res.data;
        if (code == 0) {
          this.$message.success(msg);
          this.oldBusinessData.dataList = JSON.parse(JSON.stringify(this.businessData.dataList));
          callBack && callBack();
        } else {
          this.$message.error(msg);
        }
      });
    },
    changeStep(step) {
      if (this.currentStep !== step && (this.currentStep === 3 || this.currentStep === 4)) {
        this.detectChanges(() => (this.currentStep = step));
        return;
      }
      this.currentStep = step;
    },
    notNull(value) {
      // eslint-disable-next-line no-undefined
      return value != null && value != undefined && value != "";
    },
    goBack() {
      switch (this.currentStep) {
        case 0:
          this.firstGoBack();
          break;
        case 1:
          this.secondGoBack();
          break;
        case 2:
          this.$refs.pos.save().then(this.goSchedulePage());
          break;
        case 3:
          this.goSchedulePage();
          break;
        case 4:
          this.goSchedulePage();
          break;
        default:
          break;
      }
    },
    firstGoBack() {
      this.$refs.createForm.validate((valid) => {
        if (valid) {
          if (
            this.shiftData.scheduleDate[0] === this.oldShiftData.scheduleDate[0] &&
            this.shiftData.scheduleDate[1] === this.oldShiftData.scheduleDate[1] &&
            this.shiftData.scheduleDept.did === this.oldShiftData.scheduleDept.did
          ) {
            this.goSchedulePage();
          } else {
            this.$confirm(this.$t("noticeInfo"), this.$t("tips"), {
              confirmButtonText: this.$t("save"),
              cancelButtonText: this.$t("cancel"),
              type: "warning"
            })
              .then(() => {
                this.addOrupdateShiftData(() => {
                  setTimeout(() => {
                    this.goSchedulePage();
                  }, 1000);
                });
              })
              .catch(() => {
                this.goSchedulePage();
              });
          }
        } else {
          this.goSchedulePage();
        }
      });
    },
    secondGoBack() {
      this.$refs.businessHours.validate((valid) => {
        if (valid) {
          if (JSON.stringify(this.businessData.dataList) === JSON.stringify(this.oldBusinessData.dataList)) {
            this.goSchedulePage();
          } else {
            this.$confirm(this.$t("noticeInfo"), this.$t("tips"), {
              confirmButtonText: this.$t("save"),
              cancelButtonText: this.$t("cancel"),
              type: "warning"
            })
              .then(() => {
                this.updateStepAndData(
                  {
                    bid: this.bid,
                    stage: 1,
                    busiHours: this.businessData.dataList
                  },
                  () => {
                    setTimeout(() => {
                      this.goSchedulePage();
                    }, 1000);
                  }
                );
              })
              .catch(() => {
                this.goSchedulePage();
              });
          }
        } else {
          this.goSchedulePage();
        }
      });
    },
    handleCommand(command) {
      let exportType = command === "exportCalendar" ? 1 : command === "exportDate" ? 2 : command === "exportDuration" ? 3 : command === "printCalendar" ? 4 : command === "printDate" ? 5 : 6;
      this.http
        .post("/api/hr-query-center/workUnit/findChildToLeafDids", {
          eqCond: {did: [this.shiftData.scheduleDept.did]},
          onlyGetDid: true,
          containOwner: false
        })
        .then((res) => {
          const {code, data, msg} = res.data;
          if (code === 0) {
            this.exportParam.callBackParam = JSON.stringify({
              exportType,
              simple: 1,
              destIds: [],
              start: this.shiftData.scheduleDate[0],
              end: this.shiftData.scheduleDate[1],
              searchRequest: {
                searchKey: "",
                employeeCodes: "",
                depTreeQueryList: [
                  {
                    metaObj: "work_unit",
                    metaField: "name",
                    symbols: ["like"],
                    values: [
                      {
                        exclude: [],
                        isInclude: 0,
                        childDids: (data[this.shiftData.scheduleDept.did] || []).map((o) => o.did),
                        did: this.shiftData.scheduleDept.did
                      }
                    ]
                  }
                ],
                metaQueryList: [],
                logic: "and",
                permission: {
                  usage: "ht_sch_intelligence_lite"
                },
                rangeDate: {
                  gmtStart: this.shiftData.scheduleDate[0],
                  gmtEnd: this.shiftData.scheduleDate[1]
                }
              }
            });
            if (exportType >= 4) {
              this.printLoading = this.$loading({
                lock: true,
                text: this.$t("zh_get_data_elli"),
                spinner: "el-icon-loading"
              });
              this.http.post("/api/shared-i18n/excelUtil/executeExcelTask4Export", this.exportParam).then((res) => {
                const {code, data, msg} = res.data;
                if (code === 0) {
                  this.process(data);
                } else {
                  this.stop();
                  this.printLoading.close();
                  this.$message.error(msg);
                }
              });
            } else {
              this.exportLoading = true;
            }
          } else {
            this.$message.error(msg);
          }
        });
    },
    stop() {
      clearInterval(this.interval);
      this.interval = null;
    },
    process(bid) {
      this.http.post("/api/shared-foundation/shared/asyncTask/findProgress", {bid}).then((res) => {
        const {code, data} = res.data;
        if (code === 0) {
          this.printLoading.text = this.$t("zh_get_data") + data.exportPercent + " ...";
          let progress = data.exportPercent.split("%")[0] - 0;
          if (progress === 100 || data.taskStatus === "SUCCESS") {
            this.stop();
            const s = setTimeout(() => {
              this.download(bid);
              clearTimeout(s);
            }, 1000);
          } else if (data.taskStatus === "ERROR") {
            this.printLoading.text = this.$t("zh_load_fail");
            this.stop();
            const s = setTimeout(() => {
              this.printLoading.close();
              clearTimeout(s);
            }, 1000);
          } else {
            setTimeout(() => {
              this.interval = setInterval(this.process(bid), 1000);
            }, 1000);
          }
        } else {
          this.stop();
        }
      });
    },
    download(bid) {
      this.http.post("/api/schedule-task/setting/getPathInCache", {bid}).then((res) => {
        const {code, msg, data} = res.data;
        if (code === 0) {
          this.printLoading.text = this.$t("zh_create_print_preview");
          const s = setTimeout(() => {
            this.printLoading.close();
            this.pdfSrc = data;
            this.startPrint = true;
            clearTimeout(s);
          }, 500);
        } else {
          this.printLoading.close();
          this.$message.error(msg);
        }
      });
    },
    goSchedulePage() {
      this.loadHref("/ac/xicha-schedule.html");
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
    detectChanges(callback, callback2) {
      this.$store.commit("schedule/setChangeData");
      if (this.$store.state.schedule.hasChange) {
        this.$confirm(this.$t("zh_save_prompt_detail"), this.$t("zh_save_prompt"), {
          confirmButtonText: this.$t("zh_yes"),
          cancelButtonText: this.$t("zh_not"),
          type: "info",
          customClass: "el-message-box-xc__custom"
        })
          .then(() => {
            this.$store.commit("schedule/saveShift", {
              that: this,
              refresh: false,
              cb: callback
            });
          })
          .catch((e) => {
            // ...取消跳转
            console.log(e);
            callback2 && callback2();
          });
      } else {
        callback && callback();
      }
    },
    resetLocation(bid, stage) {
      let url = location.pathname;
      if (this.notNull(bid)) {
        url += "?" + "bid=" + bid;
      }
      if (this.notNull(stage)) {
        url += (this.notNull(bid) ? "&" : "?") + "stage=" + stage;
      }
      history.pushState({url, title: document.title}, document.title, url);
      window.onpopstate = () => {
        this.goBack();
      };
    }
  }
};
</script>
<style lang="less">
.createXichaSchedule {
  .head {
    display: flex;
    padding: 15px;
    justify-content: space-between;
    .goBack {
      color: #314252;
      .el-icon-back {
        font-size: 24px;
        cursor: pointer;
        font-weight: bold;
      }
      .woquTitle {
        font-size: 22px;
        margin-left: 12px;
        font-weight: bold;
      }
    }
  }
  .body {
    margin: 0 15px;
    // overflow: auto;
    border: 1px solid #eaedf2;
    display: flex;
    flex-direction: column;
    &::-webkit-scrollbar {
      height: 6px;
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 6px;
      -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
      background: #7f7f7f;
    }
    &::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
      border-radius: 6px;
      background: rgba(0, 0, 0, 0.1);
    }
    .step {
      border-bottom: 1px solid #eaedf2;
      cursor: default;
      .el-steps--simple {
        background: transparent;
        padding: 8px 8%;
      }
      .el-step.is-simple .el-step__title {
        font-size: 15px;
      }
      .el-step__title.is-finish {
        color: #3c5266;
      }
      .el-step__title.is-wait {
        color: #6a7885;
      }
      .el-step__head.is-process {
        color: #ffffff;
        border-color: #27a9f8;
        .el-step__icon {
          background: #27a9f8;
          border: 1px solid #27a9f8;
        }
      }
      .el-step.is-simple .el-step__icon {
        width: 24px;
        height: 24px;
      }
      .el-step__head.is-finish {
        .el-step__line-inner {
          border-width: 0 !important;
        }
      }
      .el-step__icon.is-text {
        border: 1px solid;
      }
    }
    .content {
      flex: 1;
    }
  }
}
.el-message--error {
  top: 20px !important;
}
.el-message-box-xc__custom {
  .el-message-box__status {
    top: 30px !important;
  }
}
</style>
