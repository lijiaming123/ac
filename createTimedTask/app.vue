<template>
  <div>
    <div class="fightSetting">
      <wq-page-head
        :title="bid ? $t('zh_title_edit') : $t('zh_title_create')"
        :hideTotal="true"
        :hideStar="true"
        :showCheck="false"
        :showNum="false"
        :operate-buttons="operateButtons"
        @operate-click="operateButtonClick"></wq-page-head>

      <el-form ref="configForm" :model="timedTaskData" :loading="loading" :rules="rules">
        <div>
          <!-- 基本设置 -->
          <el-card shadow="never">
            <div>
              <div class="title">
                <span>{{$t('zh_priority_setting')}}</span>
              </div>
              <div class="one-row">
                <div class="label" style="display: flex">
                  <el-form-item :label="$t('zh_suit_area')" :rules="rules.tbNotNull" label-width="100px" prop="didList" style="margin-left: 5px">
                    <dep-select style="width: 150px" v-model="timedTaskData.didList" :option="depOption" @change="depChange"></dep-select>
                  </el-form-item>
                </div>
              </div>
            </div>
          </el-card>
          <!-- 业务量预测（自动发起） -->
          <el-card shadow="never">
            <div>
              <div class="title">
                <span>{{$t('zh_business_forecast_auto')}}</span>
                <el-switch v-model="timedTaskData.forecastPosOn" :active-value="0" :inactive-value="1"></el-switch>
              </div>
              <div v-if="!timedTaskData.forecastPosOn">
                <div class="one-row">
                  <div class="label">
                    <el-form-item :label="$t('zh_business_forecast')" :rules="rules.tbNotNull" label-width="100px" prop="posTypesJson" style="margin-left: 5px">
                      <el-select :placeholder="$t('zh_chioce_please')" v-model="timedTaskData.posTypesJson" collapse-tags="true" multiple style="width: 150px">
                        <el-option v-for="(item, index) in posTypesList" :key="index" :value="item.key" :label="item.title"></el-option>
                      </el-select>
                    </el-form-item>
                  </div>
                </div>
                <div class="one-row">
                  <div class="label">
                    <el-form-item :label="$t('zh_posCycleInterval')" :rules="rules.tbNotNull" label-width="100px" prop="posCycleInterval" style="margin-left: 5px">
                      <el-select :placeholder="$t('zh_chioce_please')" style="width: 300px" @change="timeTypeChange('pos')" v-model="timedTaskData.posCycleInterval">
                        <el-option v-for="(item, index) in trunData" :key="index" :value="item.value" :label="item.label"></el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item :rules="rules.tbNotNull" prop="posCycleDay" style="width: 150px; margin-left: 5px">
                      <el-select :placeholder="$t('zh_chioce_please')" v-model="timedTaskData.posCycleDay">
                        <el-option v-for="(item, index) in timedTaskData.posCycleInterval == 0 ? months : weekdays" :key="index" :value="item.value" :label="item.label"></el-option>
                      </el-select>
                    </el-form-item>

                    <el-form-item :rules="rules.tbNotNull" prop="posCycleTime" style="margin-left: 5px">
                      <el-time-select
                        v-model="timedTaskData.posCycleTime"
                        style="width: 150px"
                        :picker-options="{
                          start: '00:00',
                          step: '01:00',
                          end: '23:00'
                        }"
                        :placeholder="$t('zh_chioce_please')"></el-time-select>
                    </el-form-item>
                  </div>
                </div>
                <div class="one-row">
                  <div class="label">
                    <el-form-item :rules="rules.tbNotNull" label-width="100px" prop="posTargetDay" :label="$t('zh_forecast_start_date')" style="margin-left: 5px">
                      <el-select :placeholder="$t('zh_chioce_please')" style="width: 150px" v-model="timedTaskData.posTargetDay">
                        <el-option v-for="(item, index) in timedTaskData.posCycleInterval == 0 ? months : weekdays" :key="index" :value="item.value" :label="item.label"></el-option>
                      </el-select>
                    </el-form-item>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
          <!-- 工时预测（自动发起） -->
          <el-card shadow="never">
            <div>
              <div class="title">
                <span>{{$t('zh_work_time_forecast_auto')}}</span>
                <el-switch v-model="timedTaskData.forecastTimeOn" :active-value="0" :inactive-value="1"></el-switch>
              </div>
              <div v-if="!timedTaskData.forecastTimeOn">
                <div class="one-row">
                  <div class="label">
                    <el-checkbox :true-label="0" @change="timeTypeCheckBox('forecastTime')" :false-label="1" v-model="timedTaskData.autoForecastTime">{{$t('zh_after_forecast_auto')}}</el-checkbox>
                  </div>
                </div>
                <div class="one-row" v-if="timedTaskData.autoForecastTime">
                  <div class="label">
                    <el-form-item :rules="rules.tbNotNull" label-width="100px" prop="forecastTimeCycleInterval" :label="$t('zh_posCycleInterval')" style="margin-left: 5px">
                      <el-select :placeholder="$t('zh_chioce_please')" style="width: 300px" @change="timeTypeChange('forecastTime')" v-model="timedTaskData.forecastTimeCycleInterval">
                        <el-option
                          v-for="(item, index) in timedTaskData.posCycleInterval == 0
                            ? trunData.filter((o) => o.value == 0)
                            : trunData.filter((o) => o.value <= timedTaskData.posCycleInterval && o.value != 0)"
                          :key="index"
                          :value="item.value"
                          :label="item.label"></el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item :rules="rules.tbNotNull" prop="forecastTimeCycleDay" style="margin-left: 5px">
                      <el-select :placeholder="$t('zh_chioce_please')" style="width: 150px" v-model="timedTaskData.forecastTimeCycleDay">
                        <el-option v-for="(item, index) in timedTaskData.forecastTimeCycleInterval == 0 ? months : weekdays" :key="index" :value="item.value" :label="item.label"></el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item :rules="rules.tbNotNull" prop="forecastTimeCycleTime" style="margin-left: 5px">
                      <el-time-select
                        v-model="timedTaskData.forecastTimeCycleTime"
                        style="width: 150px"
                        :picker-options="{
                          start: '00:00',
                          step: '01:00',
                          end: '23:00'
                        }"
                        :placeholder="$t('zh_chioce_please')"></el-time-select>
                    </el-form-item>
                  </div>
                </div>
                <div class="one-row" v-if="timedTaskData.autoForecastTime">
                  <div class="label">
                    <el-form-item :rules="rules.tbNotNull" label-width="100px" prop="forecastTimeTargetDay" :label="$t('zh_forecast_start_date')" style="margin-left: 5px">
                      <el-select :placeholder="$t('zh_chioce_please')" style="width: 150px" v-model="timedTaskData.forecastTimeTargetDay">
                        <el-option v-for="(item, index) in timedTaskData.forecastTimeCycleInterval == 0 ? months : weekdays" :key="index" :value="item.value" :label="item.label"></el-option>
                      </el-select>
                    </el-form-item>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
          <!-- 智能排班（自动发起） -->
          <el-card shadow="never">
            <div>
              <div class="title">
                <span>{{$t('zh_intelligent_schedule_auto')}}</span>
                <el-switch v-model="timedTaskData.aiScheduleOn" :active-value="0" :inactive-value="1"></el-switch>
              </div>
              <div v-if="!timedTaskData.aiScheduleOn">
                <div class="one-row">
                  <div class="label">
                    <el-checkbox :true-label="0" @change="timeTypeCheckBox('aiSchedule')" :false-label="1" v-model="timedTaskData.autoAiSchedule">{{$t('zh_after_work_time_forecast_auto')}}</el-checkbox>
                  </div>
                </div>
                <div class="one-row" v-if="timedTaskData.autoAiSchedule">
                  <div class="label">
                    <el-form-item :rules="rules.tbNotNull" label-width="100px" prop="aiScheduleCycleInterval" :label="$t('zh_posCycleInterval')" style="margin-left: 5px">
                      <el-select :placeholder="$t('zh_chioce_please')" style="width: 300px" @change="timeTypeChange('aiSchedule')" v-model="timedTaskData.aiScheduleCycleInterval">
                        <el-option
                          v-for="(item, index) in timedTaskData.forecastTimeCycleInterval == 0
                            ? trunData.filter((o) => o.value == 0)
                            : trunData.filter((o) => o.value <= timedTaskData.forecastTimeCycleInterval && o.value != 0)"
                          :key="index"
                          :value="item.value"
                          :label="item.label"></el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item :rules="rules.tbNotNull" prop="aiScheduleCycleDay" style="margin-left: 5px">
                      <el-select :placeholder="$t('zh_chioce_please')" style="width: 150px" v-model="timedTaskData.aiScheduleCycleDay">
                        <el-option v-for="(item, index) in timedTaskData.aiScheduleCycleInterval == 0 ? months : weekdays" :key="index" :value="item.value" :label="item.label"></el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item :rules="rules.tbNotNull" prop="aiScheduleCycleTime" style="margin-left: 5px">
                      <el-time-select
                        v-model="timedTaskData.aiScheduleCycleTime"
                        style="width: 150px"
                        :picker-options="{
                          start: '00:00',
                          step: '01:00',
                          end: '23:00'
                        }"
                        :placeholder="$t('zh_chioce_please')"></el-time-select>
                    </el-form-item>
                  </div>
                </div>
                <div class="one-row" v-if="timedTaskData.autoAiSchedule">
                  <div class="label">
                    <el-form-item :rules="rules.tbNotNull" label-width="100px" prop="aiScheduleTargetDay" :label="$t('zh_schedule_start_date')" style="margin-left: 5px">
                      <el-select :placeholder="$t('zh_chioce_please')" style="width: 150px" v-model="timedTaskData.aiScheduleTargetDay">
                        <el-option v-for="(item, index) in timedTaskData.aiScheduleCycleInterval == 0 ? months : weekdays" :key="index" :value="item.value" :label="item.label"></el-option>
                      </el-select>
                    </el-form-item>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
          <!-- 自动发布班表（自动发起） -->
          <el-card shadow="never">
            <div>
              <div class="title">
                <span>{{$t('zh_schedule_release_auto')}}</span>
                <el-switch v-model="timedTaskData.schedulePublishOn" :active-value="0" :inactive-value="1"></el-switch>
              </div>
              <div v-if="!timedTaskData.schedulePublishOn">
                <div class="one-row">
                  <div class="label">
                    <el-checkbox :true-label="0" @change="timeTypeCheckBox('schedulePublish')" :false-label="1" v-model="timedTaskData.autoSchedulePublish">{{$t('zh_after_intelligent_schedule')}}</el-checkbox>
                  </div>
                </div>
                <div class="one-row" v-if="timedTaskData.autoSchedulePublish">
                  <div class="label">
                    <el-form-item :rules="rules.tbNotNull" label-width="100px" prop="schedulePublishCycleInterval" :label="$t('zh_posCycleInterval')" style="margin-left: 5px">
                      <el-select :placeholder="$t('zh_chioce_please')" style="width: 300px" @change="timeTypeChange('schedulePublish')" v-model="timedTaskData.schedulePublishCycleInterval">
                        <el-option
                          v-for="(item, index) in timedTaskData.aiScheduleCycleInterval == 0
                            ? trunData.filter((o) => o.value == 0)
                            : trunData.filter((o) => o.value <= timedTaskData.aiScheduleCycleInterval && o.value != 0)"
                          :key="index"
                          :value="item.value"
                          :label="item.label"></el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item :rules="rules.tbNotNull" prop="schedulePublishCycleDay" style="margin-left: 5px">
                      <el-select :placeholder="$t('zh_chioce_please')" style="width: 150px" v-model="timedTaskData.schedulePublishCycleDay">
                        <el-option v-for="(item, index) in timedTaskData.schedulePublishCycleInterval == 0 ? months : weekdays" :key="index" :value="item.value" :label="item.label"></el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item :rules="rules.tbNotNull" prop="schedulePublishCycleTime" style="margin-left: 5px">
                      <el-time-select
                        v-model="timedTaskData.schedulePublishCycleTime"
                        style="width: 150px"
                        :picker-options="{
                          start: '00:00',
                          step: '01:00',
                          end: '23:00'
                        }"
                        :placeholder="$t('zh_chioce_please')"></el-time-select>
                    </el-form-item>
                  </div>
                </div>
                <div class="one-row" v-if="timedTaskData.autoSchedulePublish">
                  <div class="label">
                    <el-form-item :rules="rules.tbNotNull" label-width="100px" prop="schedulePublishTargetDay" :label="$t('zh_schedule_start_date')" style="margin-left: 5px">
                      <el-select :placeholder="$t('zh_chioce_please')" style="width: 150px" v-model="timedTaskData.schedulePublishTargetDay">
                        <el-option v-for="(item, index) in timedTaskData.schedulePublishCycleInterval == 0 ? months : weekdays" :key="index" :value="item.value" :label="item.label"></el-option>
                      </el-select>
                    </el-form-item>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import http from "commonRemote/services/http";
import DepSelect from "commonRemote/components/depSelect";
import {closeWindow} from "commonRemote/utils/index";
export default {
  data() {
    return {
      title: this.$t("zh_title"),
      bid: null,
      depOption: {
        multiple: true,
        showSearch: true,
        privilege: "schedule_ai_job_time_setting#view"
      },
      operateButtons: [
        {
          type: "custom",
          key: "save",
          name: this.$t("zh_save"),
          icon: "/style/static/svg/save.svg",
          disabled: false,
          invisible: false,
          isDisabled: false
        }
      ],
      weekdays: [
        {value: "1", label: this.$t('zh_monday')},
        {value: "2", label: this.$t('zh_tuesday')},
        {value: "3", label: this.$t('zh_wednesday')},
        {value: "4", label: this.$t('zh_thursday')},
        {value: "5", label: this.$t('zh_friday')},
        {value: "6", label: this.$t('zh_saturday')},
        {value: "7", label: this.$t('zh_sunday')}
      ],
      months:[],
      loading: false,
      // 定时任务列表
      timedTaskData: {
        didList: [], // 适用范围
        status: 0,

        forecastPosOn: 1, // 业务量预测开关
        posTypesJson: [], // 业务量类型
        posCycleInterval: null, //
        posCycleDay: null,
        posTargetDay: null, // 预测周期开始日期
        posCycleTime: null,

        forecastTimeOn: 1, // 工时预测开关
        autoForecastTime: 1,
        forecastTimeCycleInterval: null,
        forecastTimeCycleDay: "",
        forecastTimeCycleTime: "",
        forecastTimeTargetDay: "",


        aiScheduleOn: 1, // 排班算法执行开关
        autoAiSchedule: 1,
        aiScheduleCycleInterval: null,
        aiScheduleCycleDay: "",
        aiScheduleCycleTime: "",
        aiScheduleTargetDay: "",


        schedulePublishOn: 1, // 自动发布班表开关
        autoSchedulePublish: 1,
        schedulePublishCycleInterval: null,
        schedulePublishCycleDay: "",
        schedulePublishCycleTime: "",
        schedulePublishTargetDay: ""
      },
      rules: {
        name: [
          {required: true, message: this.$t("zh_enterbanci"), trigger: "blur"},
          {validator: this.validateName, trigger: "blur"}
        ],
        etype: [
          {required: true, message: this.$t("please_select"), trigger: "change"}
        ],
        positionIds: [
          {required: true, message: this.$t("please_select"), trigger: "change"}
        ],
        mappingFiled: [
          {required: true, message: this.$t("please_select"), trigger: "change"}
        ],
        tbNotNull: [{required: true, message: this.$t('zh_please_enter'), trigger: ["change", "blur"]}]
      },
      pageData: {},
      posTypesList: [], // 业务量下拉
      trunData:[
        {value: 1, label: this.$t('zh_every_week_1')},
        {value: 2, label: this.$t('zh_every_week_2')},
        {value: 3, label: this.$t('zh_every_week_3')},
        {value: 4, label: this.$t('zh_every_week_4')},
        {value: 0, label: this.$t('zh_every_month')}
      ],
    };
  },
  components: {
    DepSelect
  },
  created() {
    this.bid = this.getSearchString("bid", window.location.search);
    if(this.bid) {
      document.title = this.$t("zh_title_edit");
      this.getTimedParam();
    }else {
      document.title = this.$t("zh_title_create");
    }

    this.getMonths();
    this.getTimedTask();

  },
  methods: {
    getMonths() {
      for(let i = 1;i <= 31;i++) {
        this.months.push({
          value: `${i}`,
          label: `${i}${this.$t('zh_day')}`
        })
      }
    },
    depChange(data) {
      this.timedTaskData.didList = data;
    },
    getTimedTask() { // 业务量下拉
      http.post("/api/shared-foundation/shared/option/getListOptionItem4OuterBids", {
        outerBids: ["schedule_labor_buss_type"]
      }).then((res) => {
        const {data, code, msg} = res.data;
        if (code == 0) {
          // data.schedule_labor_buss_type.forEach(element => {
          //   element.key = element.
          // });
          this.posTypesList = data.schedule_labor_buss_type;
        } else {
          this.$message.error(msg);
        }
      });
    },
    getTimedParam() { // 获取参数设置
      http.post("/api/schedule-config/aiJobTime/findOneByBid", {bid: this.bid}).then((res) => {
        const {data, code, msg} = res.data;
        if (code == 0) {
          data.posTypesJson = JSON.parse(data.posTypesJson)
          this.timedTaskData = data;
        } else {
          this.$message.error(msg);
        }
      });
    },
    timeTypeChange(type) {
      this.timedTaskData[type + "CycleDay"] = null;
      this.timedTaskData[type + "CycleTime"] = null;
      this.timedTaskData[type + "TargetDay"] = null;
      if(type == 'pos') {
        this.timedTaskData["forecastTime" + "CycleInterval"] = null;
      }else if(type == 'forecastTime') {
        this.timedTaskData["aiSchedule" + "CycleInterval"] = null;
      }else if(type == 'aiSchedule') {
        this.timedTaskData["schedulePublish" + "CycleInterval"] = null;
      }
    },
    timeTypeCheckBox(type) {
      this.timedTaskData[type + "CycleInterval"] = null;
      this.timedTaskData[type + "CycleDay"] = null;
      this.timedTaskData[type + "CycleTime"] = null;
      this.timedTaskData[type + "TargetDay"] = null;
    },
    operateButtonClick(key) {
      if (key === "save") {
        this.$refs.configForm.validate((valid) => {
          if (valid) {
            this.loading = true;
            var param = JSON.parse(JSON.stringify(this.timedTaskData));
            // param.posTypesJson = "[" + param.posTypesJson.toString() + "]";
            param.posTypesJson = JSON.stringify(param.posTypesJson)
            http.post("/api/schedule-config/aiJobTime/save", {data: param})
            .then((res) => {
              const {code, msg} = res.data;
              this.loading = false;
              if (code == 0) {
                this.$message.success(msg);
                // this.refreshData();
                setTimeout(() => {
                  closeWindow("basicInfoSetting");
                  window.opener &&
                    window.opener.postMessage("basicInfoSetting", "*");
                  window.close();
                }, 1000);
              } else {
                this.$message.error(msg);
              }
            });
          }
        }
      }
    },
    getSearchString(key, Url) {
      var str = Url;
      str = str.substring(1, str.length);
      var arr = str.split("&");
      var obj = new Object();
      for (var i = 0; i < arr.length; i++) {
        var tmp_arr = arr[i].split("=");
        obj[decodeURIComponent(tmp_arr[0])] = decodeURIComponent(tmp_arr[1]);
      }
      return obj[key];
    },
  }
};
</script>

<style lang="less" scoped>
.el-card {
  margin: 0 20px 10px;
}
.el-form-item {
  margin-bottom: 0;
  margin-left: 50px;
}

.demo-drawer {
  .leftcontainBox {
    height: 90%;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .leftcontainBox::-webkit-scrollbar {
    width: 4px;
  }
  .leftcontainBox::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: rgba(0, 0, 0, 0.2);
  }
  .leftcontainBox::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 0;
    background: rgba(0, 0, 0, 0.1);
  }
  .demo-drawer__footer {
    position: absolute;
    bottom: 16px;
    right: 16px;
  }
}
.title {
  border-left: 5px solid rgb(21, 133, 255);
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 10px;
}
.one-row {
  line-height: 40px;
  font-size: 14px;
  margin: 20px 60px 0 60px;
  .label {
    display: flex;
    .el-checkbox {
      color: #6a7885;
    }
  }
}
</style>
