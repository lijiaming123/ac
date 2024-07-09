<template>
  <div class="employeeInfoMaintain wq-page-table-content">
    <wq-page-head :title="$t('title')" :refresh-time="refreshTime" :operate-buttons="operateButtons" @operate-click="operateButtonClick" @refresh="refresh"></wq-page-head>
    <high-search v-if="tabActive == 'skill'" :key="'skill'" :autoInit="autoInit" privilege="schedule_config_emp_info#view" pageId="employee_info_search" @change="searchChange"></high-search>
    <high-search
      v-if="tabActive == 'availability'"
      :key="'availability'"
      :autoInit="autoInit"
      privilege="schedule_config_emp_info#view"
      pageId="employee_info_search"
      @change="searchChange"></high-search>
    <high-search v-if="tabActive == 'overtimeSetRule'" privilege="schedule_ai_group#view" @change="searchChange" pageId="adv_search_1000000943099430" :autoInit="autoInit"></high-search>

    <wq-tabs v-if="!!tabActive" v-model="tabActive" @tab-click="tabChange" :no-padding="true" style="padding: 0 20px">
      <wq-tab-pane :label="tab.title" :name="tab.key" v-for="tab in tabs" :key="tab.key" :disabled="loading"></wq-tab-pane>
    </wq-tabs>
    <div v-if="!!tabActive" class="employee-wrap wq-page-table-content--table" v-loading="loading" ref="wqPagetTableContent">
      <wq-table
        highlight-current-row
        :total="totalitem"
        v-if="tabActive == 'skill'"
        :data="empskillData"
        load-type="key"
        :row-key="rowKeys"
        :border="true"
        :ref="tabActive"
        :key="tabActive"
        @currentPageChange="skillPageChange"
        :currentPageNum="skillPagination.nowPageIndex"
        :max-height="tableHeight"
        @selection-change="selectionChange">
        <el-table-column type="selection" :reserve-selection="true"></el-table-column>
        <el-table-column :label="$t('zh_gw1')" width="200px">
          <template slot-scope="scope">
            <el-container>
              <el-aside style="width: 60px; padding: 0 5px 0 0; display: flex; justify-content: center; align-items: center; overflow: hidden">
                <wq-avatar v-if="scope.row.employeeAvatar != null" :avatar="scope.row.employeeAvatar" :width="40" :height="40" />
                <span
                  v-else
                  style="
                    border: 1px solid #ccc;
                    width: 40px;
                    height: 40px;
                    border-radius: 20px;
                    display: flex;
                    font-size: 10px;
                    overflow: hidden;
                    vertical-align: middle;
                    color: #ccc;
                    align-items: center;
                    justify-content: center;
                  ">
                  <wq-open-data :openData="scope.row.name"></wq-open-data>
                </span>
              </el-aside>
              <el-main style="padding: 0px; display: flex; flex-direction: column">
                <span>
                  <wq-open-data :openData="scope.row.name"></wq-open-data>
                </span>
                <span>{{ scope.row.jobNo }}</span>
              </el-main>
            </el-container>
            <!-- <el-button v-if="item.columnFieldKey == 'full_name'" type="text" @click="rowClick(scope.row)">{{ formatName(scope.row && scope.row.columns, item) }}</el-button> -->
            <!-- <span>{{scope.row.name}}</span> -->
            <!-- <el-avatar :size="size" :src="scope.row"></el-avatar> -->
          </template>
        </el-table-column>
        <el-table-column min-width="100px" v-for="(item, index) in skillhead" :label="item.title" :show-overflow-tooltip="true" :key="item.key">
          <template slot-scope="scope">
            <!-- <el-button v-if="item.columnFieldKey == 'full_name'" type="text" @click="rowClick(scope.row)">{{ formatName(scope.row && scope.row.columns, item) }}</el-button> -->
            <div @mouseover="skillhover(scope.$index, index)" @mouseleave="skillout(scope.$index, index)">
              <span style="display: inline-block; min-width: 60px; min-height: 20px" v-if="!scope.row.skills[index].isedit">
                {{ scope.row.skills[index].title }}
                <!-- {{ scope.row.skills[index].precentage }} -->
                <!-- <span v-if="scope.row.skills[index].precentage && scope.row.skills[index].precentage != '' && !scope.row.skills[index].precentage.includes('%')">%</span> -->
              </span>
              <i class="el-icon-edit el-input__icon" v-if="scope.row.skills[index].ishover && !scope.row.skills[index].isedit" @click="showskillselect(scope.$index, index)"></i>
              <el-select @change="skillchange(scope.row, scope.row.skills[index], scope.$index, index)" v-model="scope.row.skills[index].proficiency" :placeholder="$t('select')" clearable v-if="scope.row.skills[index].isedit">
                <el-option v-for="item in skilllevel" :key="item.key" :label="item.title" :value="item.key"></el-option>
              </el-select>
            </div>
          </template>
        </el-table-column>
      </wq-table>
      <wq-table
        v-if="tabActive == 'availability'"
        :total="totalitem"
        :data="availableData"
        highlight-current-row
        :row-key="rowKeys"
        load-type="key"
        :border="true"
        :ref="tabActive"
        :key="tabActive"
        @currentPageChange="availabPageChange"
        :currentPageNum="availabPagination.nowPageIndex"
        :max-height="tableHeight"
        @selection-change="selectionavailable">
        <el-table-column fixed type="selection" :reserve-selection="true"></el-table-column>
        <el-table-column fixed :label="$t('zh_gw1')" width="200px">
          <template slot-scope="scope">
            <el-container>
              <el-aside style="width: 60px; padding: 0 5px 0 0; display: flex; justify-content: center; align-items: center; overflow: hidden">
                <!-- <img
                  v-if="scope.row.employeeAvatar != null"
                  :src="scope.row.employeeAvatar"
                  alt=""
                  style="border:1px solid #ccc;width:40px;height:40px;border-radius:20px;"
                /> -->
                <wq-avatar v-if="scope.row.employeeAvatar != null" :avatar="scope.row.employeeAvatar" :width="40" :height="40" />
                <span
                  v-else
                  style="
                    border: 1px solid #ccc;
                    width: 40px;
                    height: 40px;
                    border-radius: 20px;
                    display: flex;
                    font-size: 10px;
                    overflow: hidden;
                    vertical-align: middle;
                    color: #ccc;
                    align-items: center;
                    justify-content: center;
                  ">
                  <wq-open-data :openData="scope.row.name"></wq-open-data>
                </span>
              </el-aside>
              <el-main style="padding: 0px; display: flex; flex-direction: column">
                <span>
                  <wq-open-data :openData="scope.row.name"></wq-open-data>
                  <span style="width: 26px; height: 14px; font-size: 10px; background: #3ac27d; color: #ffffff; border-radius: 2px" v-if="scope.row.isSupport">{{ $t("zh_rule_support") }}</span>
                  <span style="width: 26px; height: 14px; font-size: 10px; background: #fb9f52; color: #ffffff; border-radius: 2px" v-if="scope.row.isDispatch">{{ $t("zh_rule_dispatch") }}</span>
                </span>
                <span>{{ scope.row.jobNo }}</span>
              </el-main>
            </el-container>
          </template>
        </el-table-column>
        <el-table-column v-for="(item, index) in availableHead" :key="index" :label="item" :show-overflow-tooltip="true" min-width="120px">
          <template slot-scope="scope">
            <div v-if="hasNoPower(scope.row, index)">
              <span>{{ $t("zh_no_power") }}</span>
            </div>
            <div @mouseenter="availabhover(scope.$index, index)" @mouseleave="availabhoverout(scope.$index, index)" v-else-if="scope.row.availableScopes[index].type == 1">
              <span style="color: #ccc">{{ $t("nouse") }}</span>
              <i class="el-icon-edit el-input__icon" v-if="scope.row.availableScopes[index].ishover" @click="editFn(scope.row, index)"></i>
            </div>
            <div @mouseenter="availabhover(scope.$index, index)" @mouseleave="availabhoverout(scope.$index, index)" v-else-if="scope.row.availableScopes[index].type == 2" class="flexC">
              <div>
                <div>
                  <!-- <span
                    v-for="(item, index) in scope.row.availableScopes[index]
                      .scopes[0].timeSlotList"
                    :key="index"
                    >{{ item.start }}-{{ item.end }}</span
                  > -->

                  <span v-for="(item, index) in scope.row.availableScopes[index].scopes[0].timeSlotList" :key="index">{{ timeHland(item.start) }}-{{ timeHland(item.end) }}</span>
                </div>
              </div>
              <i v-if="scope.row.availableScopes[index].ishover" class="el-icon-edit el-input__icon" @click="editFn(scope.row, index)"></i>
            </div>
            <div @mouseenter="availabhover(scope.$index, index)" @mouseleave="availabhoverout(scope.$index, index)" v-else>
              <span>{{ $t("use") }}</span>
              <i v-if="scope.row.availableScopes[index].ishover" class="el-icon-edit el-input__icon" @click="editFn(scope.row, index)"></i>
            </div>
          </template>
        </el-table-column>
      </wq-table>
      <overtime-set-rule ref="overtime" v-if="tabActive == 'overtimeSetRule'" :inset="true" @loaded="hasloaded" @loading="hasloading" @total="setTotal" @checkedLength="setOvertimeBtns" />
    </div>
    <el-empty v-if="!tabActive" :description="$t('noPrivilege')"></el-empty>
    <!-- editObj.name -->
    <el-dialog :title="$t('add') + editName + $t('canuse')" :visible.sync="dialogVisible" width="560" v-if="dialogVisible">
      <div class="dialogCon" style="min-height: 20px; max-height: 500px; overflow: auto">
        <!-- .availableScopes[editIndex].type -->
        <el-radio-group v-model="editObj.type">
          <el-radio :label="0">{{ $t("dayuse") }}</el-radio>
          <el-radio :label="1">{{ $t("daynouse") }}</el-radio>
          <el-radio :label="2">{{ $t("timeuse") }}</el-radio>
        </el-radio-group>
        <!-- <div class="timeBox timeBox1">
          <span class="span">{{ $t("usedate") }}</span>
          <div class="dataListZx" v-for="(item, index) in editObj.dates" :key="index">
            <el-date-picker v-model="item.start" type="date" :placeholder="$t('selectdate')" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
            -
            <el-date-picker v-model="item.end" type="date" :placeholder="$t('selectdate')" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
            <span class="operateBtn delete" @click="dataDelete(index)">
              <i class="el-icon-minus"></i>
            </span>
            <span class="operateBtn add" @click="dataAdd">
              <i class="el-icon-plus"></i>
            </span>
          </div>
        </div> -->
        <div class="timeBox timeBox2" v-if="editObj.type === 2">
          <span class="span">{{ $t("usetime") }}</span>
          <!-- editObj.times -->
          <div class="timeListZx" v-for="(item, index) in editObj.times" :key="index">
            <el-time-select v-model="item.start" :picker-options="{start: '00:00', step: step, end: '24:00'}" :placeholder="$t('selecttime')" @change="timeCheck(item)"></el-time-select>
            -
            <el-time-select
              v-model="item.end"
              :picker-options="{start: '00:00', step: step, end: '24:00'}"
              :placeholder="$t('selecttime')"
              :disabled="item.start == ''"
              @change="timeCheck(item)"></el-time-select>
            <span class="operateBtn delete">
              <i class="el-icon-minus" @click="timeDelete(index)"></i>
            </span>
            <span class="operateBtn add">
              <i class="el-icon-plus" @click="timeAdd"></i>
            </span>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t("cancel") }}</el-button>
        <el-button type="primary" @click="saveEditFn">
          {{ $t("sure") }}
        </el-button>
      </span>
    </el-dialog>
    <el-dialog :title="$t('select') + $t('operateButtonsLabels.Empty') + $t('date')" :visible.sync="cleardialog" width="560">
      <el-date-picker v-model="clearstart" type="date" :placeholder="$t('selectdate')" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
      -
      <el-date-picker v-model="clearend" type="date" :placeholder="$t('selectdate')" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cleardialog = false">{{ $t("cancel") }}</el-button>
        <el-button type="primary" @click="availabilityclear">
          {{ $t("sure") }}
        </el-button>
      </span>
    </el-dialog>
    <file-upload :visible.sync="uploadVisible" :uploadConfig="uploadConfig" @success="uploadSuccess"></file-upload>
    <export-mask :loading.sync="load" :param="param" :title="$t('export')"></export-mask>
  </div>
</template>

<script>
import api from "./api.js";
import http from "commonRemote/services/http";
import HighSearch from "commonRemote/components/highSearchNew";
import privilegeValidator from "commonRemote/services/privilegeValidator";
import FileUpload from "commonRemote/components/fileUpload";
import exportMask from "commonRemote/components/exportMask";
import overtimeSetRule from "../overtimeSetRuleNew/app";
import tableStyle from "commonRemote/mixins/tableStyle";
export default {
  data() {
    return {
      step: "00:15",
      autoInit: true,
      uploadVisible: false,
      load: false,
      uploadConfig: {
        bucketKey: "schedule_import_user_skill"
      },
      startTime: "",
      endTime: "",
      dateValue: {},
      highConfig: [
        {
          metaObj: "work_unit",
          fieldName: this.$t("org"),
          metaField: "name",
          fieldSearchType: "organization_tree",
          alias: this.$t("org"),
          toolTip: this.$t("org"),
          logicOperate: [
            {
              k: "in",
              v: this.$t("zh_include")
            }
          ]
        },
        {
          metaObj: "position",
          metaField: "position_description",
          fieldSearchType: "text",
          alias: this.$t("position"),
          toolTip: this.$t("position"),
          logicOperate: [
            {
              k: "like",
              v: this.$t("zh_include")
            }
          ]
        },
        {
          metaObj: "personal_profile",
          metaField: "hiring_status",
          fieldSearchType: "checkbox",
          alias: this.$t("personal_profile"),
          toolTip: this.$t("personal_profile"),
          logicOperate: [
            {
              k: "like",
              v: this.$t("zh_include")
            }
          ]
        },
        {
          metaObj: "date",
          metaField: "date",
          fieldSearchType: "date_range",
          alias: this.$t("date"),
          toolTip: this.$t("date"),
          logicOperate: [
            {
              k: "like",
              v: this.$t("zh_include")
            }
          ]
        }
      ],
      queryEid: "",
      loading: false,
      tableHeight: 0,
      empskillData: [],
      tabs: [
        {
          title: this.$t("tabs.skill"),
          key: "skill",
          privilegeKey: "schedule_config_emp_skill#view",
          isDisabled: false,
          operateButtons: [
            {
              type: "custom",
              key: "initialization",
              name: this.$t("operateButtonsLabels.initialization"),
              icon: "/style/static/svgIcon/com/add.svg",
              disabled: true,
              isDisabled: false
            },
            {
              type: "custom",
              key: "empty",
              name: this.$t("operateButtonsLabels.Empty"),
              icon: "/style/static/svg/blackList_remove.svg",
              disabled: true,
              isDisabled: false
            },
            {
              type: "custom",
              key: "save",
              name: this.$t("operateButtonsLabels.save"),
              icon: "/style/static/svg/save.svg",
              disabled: true,
              isDisabled: false
            },
            {
              type: "import",
              disabled: true,
              isDisabled: false
            },
            {
              type: "export",
              disabled: true,
              isDisabled: false
            }
          ]
        },
        {
          title: this.$t("tabs.availability"),
          key: "availability",
          privilegeKey: "schedule_config_emp_available#view",
          isDisabled: false,
          operateButtons: [
            {
              type: "custom",
              key: "initialization",
              name: this.$t("operateButtonsLabels.initialization"),
              icon: "/style/static/svgIcon/com/add.svg",
              disabled: true,
              isDisabled: true
            },
            {
              type: "custom",
              key: "empty",
              name: this.$t("operateButtonsLabels.Empty"),
              icon: "/style/static/svg/blackList_remove.svg",
              disabled: true,
              isDisabled: false
            },
            {
              type: "custom",
              key: "save",
              name: this.$t("operateButtonsLabels.save"),
              icon: "/style/static/svg/save.svg",
              disabled: true,
              isDisabled: true
            },
            {
              type: "import",
              disabled: true,
              isDisabled: false
            },
            {
              type: "export",
              disabled: true,
              isDisabled: false
            }
          ]
        },
        {
          title: this.$t("tabs.overtimeSetRule"),
          key: "overtimeSetRule",
          privilegeKey: "schedule_ai_group#view",
          isDisabled: false,
          operateButtons: [
            {
              type: "custom",
              key: "add",
              name: this.$t("operateButtonsLabels.establish"),
              icon: "/style/static/svgIcon/com/add.svg",
              disabled: true,
              isDisabled: false
            },
            {
              type: "delete",
              key: "delete",
              name: this.$t("operateButtonsLabels.delete"),
              disabled: true,
              isDisabled: true
            },
            {
              type: "custom",
              key: "import",
              name: this.$t("operateButtonsLabels.import"),
              icon: "/style/static/svgIcon/com/export.svg",
              disabled: true,
              isDisabled: false
            },
            {
              type: "custom",
              key: "export",
              name: this.$t("operateButtonsLabels.export"),
              icon: "/style/static/svgIcon/com/export.svg",
              disabled: true,
              isDisabled: true
            }
          ]
        }
      ],
      tabActive: "skill",
      refreshTime: "",
      operateButtons: [],
      maxEid: 0,
      searchRequest: {},
      skillhead: [],
      skilllevel: [],
      availableData: [],
      availableHead: [],
      dialogVisible: false,
      cleardialog: false,
      supportDataDialog: [],
      dateTitle: null,
      editObj: {},
      editName: "",
      selectionavailableData: [],
      selectskillData: [],
      param: {
        key: "schedule_export_user_skill",
        callBackParam: ""
      },
      eidData: [],
      totalitem: 0,
      skillPagination: {
        nowPageIndex: 1,
        pageSize: 20
      },
      availabPagination: {
        nowPageIndex: 1,
        pageSize: 20
      },
      skillpagetotal: 0,
      availabpagetotal: 0,
      searchparam: {},
      clearstart: "",
      clearend: "",
      changeData: [], // 保存修改数据
      cloneSelectdata: [],
      isSupport: false,
      isDispatch: false
    };
  },
  components: {
    HighSearch,
    FileUpload,
    exportMask,
    overtimeSetRule
  },
  mixins: [tableStyle],
  created() {
    document.title = this.$t("title");
    this.getStep();
    this.operateButtons = this.tabs.find((item) => item.key === "skill").operateButtons;
    // this.refresh();
    this.privilegeValidatorFun();
    this.getListOptionItemProperty();
    this.getSkillOptionItemOrder();
    // this.pageEmpSkills();
    // this.initHeight();
    // this.pageavailableScope();\
    this.dateValue = {
      gmtStart: this.moment().startOf("isoWeek").format("YYYY-MM-DD"),
      gmtEnd: this.moment().add(7, "days").endOf("isoWeek").format("YYYY-MM-DD")
    };
    this.startTime = this.dateValue.gmtStart;
    this.endTime = this.dateValue.gmtEnd;
    this.loading = true;
    this.setOvertimeButtons();
  },
  mounted() {},
  methods: {
    rowKeys(row) {
      return row.bid;
    },
    getStep() {
      http.post("/api/schedule-config/aiBasicSetting/findOne", {}).then((res) => {
        const {data, code, msg} = res.data;
        if (code == 0) {
          // this.step = Number(data.scaleTypeVal) / 60;
          if (data.scaleTypeVal == 60) {
            this.step = "01:00";
          } else if (data.scaleTypeVal == 30) {
            this.step = "00:30";
          } else if (data.scaleTypeVal == 15) {
            this.step = "00:15";
          }
          console.log("补偿", this.step);
        } else {
          this.$message.error(msg);
        }
      });
    },
    setOvertimeBtns(val) {
      const btns = this.tabs.find((item) => item.key == "overtimeSetRule").operateButtons;
      if (val) {
        btns.find((btn) => btn.key === "delete").isDisabled = false;
        btns.find((btn) => btn.key === "export").isDisabled = false;
      } else {
        btns.find((btn) => btn.key === "delete").isDisabled = true;
        btns.find((btn) => btn.key === "export").isDisabled = true;
      }
    },
    setTotal(data) {
      this.totalitem = data;
    },
    setOvertimeButtons() {
      privilegeValidator.checkPageKey(["schedule_ai_group#delete", "schedule_ai_group#add", "schedule_ai_group#view", "schedule_ai_group_excel_import", "schedule_ai_group_excel_export"], (res) => {
        const {msg, code, data} = res.data;
        const btns = this.tabs.find((item) => item.key == "overtimeSetRule")?.operateButtons || [];
        if (code == 0) {
          data.keys.forEach((v) => {
            if (v === "schedule_ai_group#add") {
              btns.find((v) => v.key == "add").isDisabled = false;
              btns.find((v) => v.key == "add").invisible = false;
            }
            if (v === "schedule_ai_group#delete") {
              btns.find((v) => v.key == "delete").invisible = false;
            }
            if (v === "schedule_ai_group_excel_export") {
              btns.find((v) => v.key == "export").isDisabled = false;
              btns.find((v) => v.key == "export").invisible = false;
            }
            if (v === "schedule_ai_group_excel_import") {
              btns.find((v) => v.key == "import").isDisabled = false;
              btns.find((v) => v.key == "import").invisible = false;
            }
          });
        } else {
          this.$message.error(msg);
        }
      });
    },
    hasloaded() {
      this.loading = false;
    },
    hasloading() {
      this.loading = true;
    },
    timeHland(time) {
      let s = time.split(":")[0];
      let e = time.split(":")[1];
      s.length == 1 && (s = "0" + s);
      e.length == 1 && (e = "0" + e);
      return s + ":" + e;
    },
    privilegeValidatorFun() {
      privilegeValidator.checkPageKey(
        this.tabs.map((e) => e.privilegeKey),
        (res) => {
          const {code, data} = res.data;
          if (code != 0) {
            return;
          }
          console.log("权限", data);

          const allowedKeys = data.keys || [];
          // const allowedKeys = ['signSuccess', 'signing', 'signFailure', 'sendInfoFailure', 'download', 'send'];
          this.tabs = this.tabs.filter((e) => allowedKeys.indexOf(e.privilegeKey) != -1);
          console.log(this.tabs)
          this.tabActive = this.tabs.length ? this.tabs[0].key : "";
          this.operateButtons = this.tabs.find((item) => item.key == this.tabActive)?.operateButtons || [];
          if (this.tabActive == '') {
            this.loading = false;
            this.$message.error(this.$t('noPrivilege'));
            this.operateButtons = [];
            return;
          }
          // if (this.tabActive == 'skill') {
          //   this.operateButtons.map(obj => {
          //     if (
          //       obj.key == 'save' || obj.key == 'initialization'
          //     ) {
          //       obj.isDisabled = false;
          //     }
          //   });
          // } else if (this.tabActive == 'availability') {
          //   this.operateButtons.map(obj => {
          //     if (
          //       obj.key == 'save' || obj.key == 'initialization'
          //     ) {
          //       obj.isDisabled = true;
          //     }
          //   });
          // } else {
          //   this.operateButtons.map(obj => {
          //     if (
          //       obj.key == 'export' ||
          //       obj.key == 'import' ||
          //       obj.key == 'save' ||
          //       obj.key == 'empty'
          //     ) {
          //       obj.isDisabled = true;
          //     }
          //   });
          // }
          // this.operateButtons.forEach(item => {
          //   if (this.tabActive == 'skill') {
          //     if (
          //       item.key == 'export' ||
          //       item.key == 'import' ||
          //       item.key == 'save'
          //     ) {
          //       item.isDisabled = false;
          //     }
          //     if (item.key == 'empty') {
          //       item.isDisabled = true;
          //     }
          //   } else if (this.tabActive == 'availability') {
          //     if (
          //       item.key == 'export' ||
          //       item.key == 'import' ||
          //       item.key == 'save'
          //     ) {
          //       item.isDisabled = true;
          //     }
          //     if (item.key == 'empty') {
          //       item.isDisabled = false;
          //     }
          //   } else {
          //     item.isDisabled = true;
          //   }
          // });
          // this.getListOptionItemProperty();
          // this.getavailabilityHead();
          // this.headerColumns =
          //     (this.activeName === 'Signed_Successfully' || this.activeName === 'Signing') ? this.headerColumns1 : this.headerColumns2;
        }
      );
    },
    // 获取可用性默认表头
    getavailabilityHead() {
      var dd = new Date().getDate();
      this.getNext(dd, 14);
    },
    getNext(date, day) {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() + day);
      this.getDataAfter(newDate);
      this.dateTime = newDate;
    },
    getDataAfter(date) {
      this.datePicker = date;
      let list = [];
      for (let i = 0; i < 14; i++) {
        let obj = {
          time: new Date(new Date(date).setDate(new Date(date).getDate() + i)).toLocaleDateString(),
          week: this.$t("week") + this.$t("week_list").charAt(new Date(new Date(date).setDate(new Date(date).getDate() + i)).getDay())
        };
        list.push(obj);
      }
      this.dayList = list.map((item) => {
        item.time = item.time.split("/")[2];
        return item;
      });
      console.log(this.dayList);
    },
    skillhover(index, sindex) {
      this.cloneSelectdata = JSON.parse(JSON.stringify(this.selectskillData));
      this.empskillData[index].skills[sindex].ishover = true;
      this.setCurrent();
    },
    skillout(index, sindex) {
      this.cloneSelectdata = JSON.parse(JSON.stringify(this.selectskillData));
      this.empskillData[index].skills[sindex].ishover = false;
      this.setCurrent();
    },
    availabhover(index, sindex) {
      this.cloneSelectdata = JSON.parse(JSON.stringify(this.selectionavailableData));
      this.availableData[index].availableScopes[sindex].ishover = true;
      this.setCurrent();
    },
    availabhoverout(index, sindex) {
      this.cloneSelectdata = JSON.parse(JSON.stringify(this.selectionavailableData));
      this.availableData[index].availableScopes[sindex].ishover = false;
      this.setCurrent();
    },
    setCurrent() {
      // this.$refs[this.tabActive].toggleSelection(this.cloneSelectdata);
    },
    skillPageChange(index, pageSize) {
      console.log(index);
      this.skillPagination.nowPageIndex = index;
      this.skillPagination.pageSize = pageSize;
      this.pageEmpSkills();
      this.$nextTick(() => {
        this.$refs[this.tabActive].bodyWrapper.scrollTop = 0;
      });
    },
    availabPageChange(index, pageSize) {
      console.log(index);
      this.availabPagination.nowPageIndex = index;
      this.availabPagination.pageSize = pageSize;
      this.pageavailableScope();
      this.$nextTick(() => {
        this.$refs[this.tabActive].bodyWrapper.scrollTop = 0;
      });
    },
    skillchange(item, sitem, rowIndex, columnIndex) {
      console.log(rowIndex, columnIndex,item);
      let sameskillIndex = this.changeData.findIndex(obj => {
        return obj.rowIndex == rowIndex && obj.columnIndex == columnIndex
      })
      if(sitem.proficiency == '') {
        sitem.isedit = false;
        sitem.title = "";
        sitem.precentage = "";
        if(sameskillIndex > -1) {
          this.changeData[sameskillIndex] = {
            bid: sitem.bid,
            deptName: "",
            did: "",
            eid: item.eid,
            hiringStatus: "",
            jobNo: item.jobNo,
            name: item.name,
            occupationalSkillBid: sitem.bid,
            positionBid: "",
            positionName: "",
            precentage: "",
            proficiency: "",
            skill: "",
            rowIndex: rowIndex,
            columnIndex: columnIndex
          };
        } else {
          this.changeData.push({
            bid: sitem.bid,
            deptName: "",
            did: "",
            eid: item.eid,
            hiringStatus: "",
            jobNo: item.jobNo,
            name: item.name,
            occupationalSkillBid: sitem.bid,
            positionBid: "",
            positionName: "",
            precentage: "",
            proficiency: "",
            skill: "",
            rowIndex: rowIndex,
            columnIndex: columnIndex
          });
        }
        return
      }
      this.skilllevel.forEach((obj) => {
        if (obj.key == sitem.proficiency) {
          sitem.precentage = obj.properties[Object.keys(obj.properties)[0]];
          sitem.title = obj.title;
        }
      });
      console.log(sitem);
      if(sameskillIndex > -1) {
        this.changeData[sameskillIndex] = {
          bid: sitem.bid,
          deptName: "",
          did: "",
          eid: item.eid,
          hiringStatus: "",
          jobNo: item.jobNo,
          name: item.name,
          occupationalSkillBid: sitem.bid,
          positionBid: "",
          positionName: "",
          precentage: sitem.precentage,
          proficiency: sitem.proficiency,
          skill: sitem.skill,
          rowIndex: rowIndex,
          columnIndex: columnIndex
        };
      } else {
        this.changeData.push({
          bid: sitem.bid,
          deptName: "",
          did: "",
          eid: item.eid,
          hiringStatus: "",
          jobNo: item.jobNo,
          name: item.name,
          occupationalSkillBid: sitem.bid,
          positionBid: "",
          positionName: "",
          precentage: sitem.precentage,
          proficiency: sitem.proficiency,
          skill: sitem.skill,
          rowIndex: rowIndex,
          columnIndex: columnIndex
        });
      }
    },
    // initHeight() {
    //   const height = document.documentElement.clientHeight || document.body.clientHeight;
    //   this.tableHeight = height - 340;
    // },
    // 员工技能
    pageEmpSkills() {
      this.searchparam.maxEid = this.maxEid;
      let params = {
        allDids: [],
        ...this.skillPagination,
        end: this.endTime,
        needHeader: 0,
        start: this.startTime,
        searchRequest: this.searchparam
      };
      this.loading = true;
      http.post(api.pageEmpSkills, params).then((res) => {
        const {code, data, msg} = res.data;
        this.loading = false;
        if (code == 0) {
          if (data.data != null) {
            this.skilllevel.forEach((obj) => {
              data.data.list.map((item) => {
                if (item.skills == null) {
                  item.skills = [];
                }
                item.skills.map((childitem) => {
                  if (childitem.proficiency == obj.key) {
                    childitem.title = obj.title;
                    childitem.isedit = false;
                    childitem.ishover = false;
                  }
                });
              });
            });
            data.data.list.map((item) => {
              if (item.skills == null) {
                item.skills = [];
              }
              let cloneskillhead = JSON.parse(JSON.stringify(this.skillhead));
              let cloneskills = JSON.parse(JSON.stringify(item.skills));
              item.skills.splice(0, item.skills.length);
              cloneskillhead.forEach((obj) => {
                // obj.ishave = false;
                // cloneskills.map(childitem => {
                //   if (childitem.skill == obj.key) {
                //     obj.ishave = true;
                //   }
                // });
                // if (!obj.ishave) {
                item.skills.push({
                  bid: "",
                  eid: item.eid,
                  isedit: false,
                  ishover: false,
                  parentBid: item.bid,
                  precentage: "",
                  proficiency: "",
                  skill: obj.key,
                  title: ""
                });
                //   }
              });
              cloneskills.forEach((cloneobj) => {
                item.skills.map((newobj, newindex) => {
                  if (newobj.skill == cloneobj.skill) {
                    item.skills.splice(newindex, 1, cloneobj);
                    // newobj = JSON.parse(JSON.stringify(cloneobj))
                    console.log(newobj);
                  }
                });
              });
            });
            this.empskillData = data.data.list || [];
            this.totalitem = data.data.totalItem;
            this.skillpagetotal = data.data.totalPage;
            if (this.totalitem > 0) {
              this.maxEid = this.empskillData[this.empskillData.length - 1]["eid"];
            }
            console.log(data.data.list, "empskillData");
          } else {
            this.totalitem = 0;
            this.skillpagetotal = 0;
          }
        } else {
          this.$message.error(msg);
        }
        this.$nextTick(() => {
          this.$refs.skill.doLayout && this.$refs.skill.doLayout();
        });
      });
    },
    // listAssign(arrA, arrB) {
    //   Object.keys(arrA).forEach(key => {
    //     arrA[key] = arrB[key] || arrA[key]
    //   })
    // },
    uploadSuccess() {
      // mtm && mtm.setTrackEvent(this.$t("zh_import"));
      this.refresh();
    },
    // 员工可用性
    pageavailableScope() {
      this.searchparam.maxEid = this.maxEid;
      let params = {
        // allEids: this.eidData,
        start: this.startTime,
        end: this.endTime,
        needHeader: 1,
        ...this.availabPagination,
        searchRequest: this.searchparam
      };
      this.loading = true;
      this.selectionavailableData = [];
      http.post(api.pageavailableScope, params).then((res) => {
        const {code, data, msg} = res.data;
        this.loading = false;
        if (code == 0) {
          if (data.data != null) {
            data.data.list.map((obj) => {
              obj.availableScopes.map((childobj) => {
                childobj.ishover = false;
              });
              obj.isSupport = false;
              obj.isDispatch = false;
              if (obj.supportData && obj.supportData.findIndex((s) => s.type == 3) >= 0) {
                obj.isSupport = true;
                obj.isDispatch = true;
              }
              if (obj.supportData && obj.supportData.findIndex((s) => s.type == 1) >= 0) {
                obj.isSupport = true;
              }
              if (obj.supportData && obj.supportData.findIndex((s) => s.type == 0) >= 0) {
                obj.isDispatch = true;
              }
            });
            this.availableData = data.data.list || [];
            this.availableHead = data.tableHeader;
            this.availabpagetotal = data.data.totalPage;
            this.totalitem = data.data.totalItem;
            if (data.data.totalItem > 0) {
              this.maxEid = this.availableData[this.availableData.length - 1]["eid"];
            }
            console.log(this.availableData, "this.availableData");
          } else {
            this.totalitem = 0;
            this.availabpagetotal = 0;
          }
          // this.empskillData = data.list
        } else {
          this.$message.error(msg);
        }
      });
    },
    showskillselect(index, sindex) {
      console.log(index, sindex);
      this.empskillData.forEach(obj => {
        obj.skills.forEach(child => {
          child.isedit = false;
        })
      })
      this.empskillData[index].skills[sindex].isedit = true;
      this.empskillData = JSON.parse(JSON.stringify(this.empskillData));
    },
    selectionChange(data) {
      this.selectskillData = data;
    },
    selectionavailable(data) {
      this.selectionavailableData = data;
    },
    tabChange(tab) {
      this.changeData = [];
      this.maxEid = 0;
      this.operateButtons = this.tabs.find((item) => item.key === this.tabActive).operateButtons;
      this.loading = true;
      if (this.tabActive == "skill") {
        this.skillPagination.nowPageIndex = 1;
        this.skillPagination.pageSize = 20;
        this.skillpagetotal = 0;
        this.empskillData = [];
        // if (this.eidData.length > 0) {
        // this.pageEmpSkills();
        // }
      } else if (this.tabActive == "availability") {
        this.availabPagination.nowPageIndex = 1;
        this.availabPagination.pageSize = 20;
        this.availabpagetotal = 0;
        this.availableData = [];
        // if (this.eidData.length > 0) {
        // this.pageavailableScope();
        // }
      } else {
      }
    },
    refresh() {
      this.changeData = [];
      this.maxEid = 0;
      this.selectionavailableData = [];
      this.selectskillData = [];
      this.skillpagetotal = 0;
      this.empskillData = [];
      this.availableData = [];
      this.skillPagination.nowPageIndex = 1;
      this.availabPagination.nowPageIndex = 1;
      this.availabpagetotal = 0;
      if (this.tabActive == "skill") {
        this.pageEmpSkills();
      } else if (this.tabActive == "availability") {
        this.pageavailableScope();
      }
    },
    operateButtonClick(key) {
      if (this.tabActive == "overtimeSetRule") {
        this.$refs.overtime.operateButtonClick(key);
        return;
      }
      if (key == "initialization") {
        console.log(key);
        this.initialization();
      } else if (key == "empty") {
        this.clear();
      } else if (key == "import") {
        if (this.tabActive == "skill") {
          this.uploadConfig.bucketKey = "schedule_import_user_skill";
        } else {
          [(this.uploadConfig.bucketKey = "schedule_import_user_available")];
        }
        this.uploadVisible = true;
      } else if (key == "export") {
        // mtm && mtm.setTrackEvent(this.$t("export"));
        // if (this.selectskillData.length == 0) {
        //   return this.$message.error('//请选择要导出的人员');
        // }
        let eidarr = [];
        if (this.tabActive == "skill") {
          this.param.key = "schedule_export_user_skill";
          if (this.selectskillData.length > 0) {
            this.selectskillData.forEach((obj) => {
              eidarr.push(obj.eid);
            });
            this.param.callBackParam = JSON.stringify({eids: eidarr});
            this.load = !this.load;
          } else {
            let params = {
              search: {
                maxEid: -1,
                searchRequest: this.searchparam.searchRequest,
                ignoreLimitNum: true
              },
              start: this.startTime,
              end: this.endTime
            };
            this.param.callBackParam = JSON.stringify(params);
            console.log(params);
            this.load = !this.load;
            // this.employeeData();
          }
        } else {
          this.param.key = "schedule_export_user_available";
          if (this.selectionavailableData.length > 0) {
            this.selectionavailableData.forEach((obj) => {
              eidarr.push(obj.eid);
            });
            this.param.callBackParam = JSON.stringify({
              eids: eidarr,
              start: this.startTime,
              end: this.endTime
            });
            this.load = !this.load;
          } else {
            // this.employeeData();
            let params = {
              search: {
                maxEid: -1,
                searchRequest: this.searchparam.searchRequest,
                ignoreLimitNum: true
              },
              start: this.startTime,
              end: this.endTime
            };
            console.log(params);
            this.param.callBackParam = JSON.stringify(params);
            this.load = !this.load;
          }
        }
        // this.load = !this.load;
      } else if (key == "save") {
        if (this.tabActive == "skill") {
          this.saveskillData();
        }
      }
    },
    employeeData() {
      console.log(this.searchparam);
      http
        .post(api.searchInit, {
          maxEid: -1,
          searchRequest: this.searchparam.searchRequest,
          ignoreLimitNum: true
        })
        .then((res) => {
          this.loading = false;
          const {code, msg} = res.data;
          if (code === 0) {
            this.allEmp = [];
            let allEmpArr = (res.data.data && res.data.data.data) || [];
            console.log(allEmpArr, "allEmpArr");
            this.eidData = [];
            allEmpArr.forEach((obj) => {
              this.eidData.push(obj.eid);
            });
            if (this.tabActive == "skill") {
              this.param.callBackParam = JSON.stringify({eids: this.eidData});
              this.load = !this.load;
            } else if (this.tabActive == "availability") {
              this.param.callBackParam = JSON.stringify({
                eids: this.eidData,
                start: this.startTime,
                end: this.endTime
              });
              this.load = !this.load;
            }
          } else {
            this.$message.error(msg);
          }
        });
    },
    // 初始化
    initialization() {
      let params = {};
      let url = "";
      if (this.selectskillData.length == 0) {
        return this.$message.error(this.$t("pleaseempty"));
      }
      this.loading = true;
      params = {
        eids: []
      };
      this.selectskillData.forEach((obj) => {
        params.eids.push(obj.eid);
      });
      url = api.batchSet;
      http.post(url, params).then((res) => {
        this.loading = false;
        const {code, msg} = res.data;
        if (code == 0) {
          // mtm && mtm.setTrackEvent(this.$t("operateButtonsLabels.initialization"));
          // this.params.nowPageIndex = 1;
          this.$message({
            type: "success",
            message: msg
          });
          this.refresh();
        } else {
          this.$message.error(msg);
        }
      });
    },
    // 清空
    clear() {
      let params = {};
      let url = "";
      if (this.tabActive == "skill") {
        if (this.selectskillData.length == 0) {
          return this.$message.error(this.$t("pleaseempty"));
        }
        this.loading = true;
        params = {
          eids: []
        };
        this.selectskillData.forEach((obj) => {
          params.eids.push(obj.eid);
        });
        url = api.skillclean;
      } else {
        if (this.selectionavailableData.length == 0) {
          return this.$message.error(this.$t("pleaseempty"));
        }
        this.clearstart = "";
        this.clearend = "";
        this.cleardialog = true;
        return;
        // this.loading = true;
        // params = {
        //   allEids: [],
        //   dates: [
        //     {
        //       start: this.startTime,
        //       end: this.endTime
        //     }
        //   ]
        // };
        // this.selectionavailableData.forEach(obj => {
        //   params.allEids.push(obj.eid);
        // });
        // url = api.clean;
      }
      http.post(url, params).then((res) => {
        this.loading = false;
        const {code, msg} = res.data;
        if (code == 0) {
          // mtm && mtm.setTrackEvent(this.$t("operateButtonsLabels.Empty"));
          // this.params.nowPageIndex = 1;
          this.$message({
            type: "success",
            message: msg
          });
          this.refresh();
        } else {
          this.$message.error(msg);
        }
      });
    },
    availabilityclear() {
      let params = {};
      let url = "";
      if (!this.clearstart || !this.clearend) {
        return this.$message.error(this.$t("select") + this.$t("operateButtonsLabels.Empty") + this.$t("date"));
      }
      this.loading = true;
      params = {
        allEids: [],
        dates: [
          {
            start: this.clearstart,
            end: this.clearend
          }
        ]
      };
      this.selectionavailableData.forEach((obj) => {
        params.allEids.push(obj.eid);
      });
      url = api.clean;
      http.post(url, params).then((res) => {
        this.loading = false;
        const {code, msg} = res.data;
        if (code == 0) {
          // this.params.nowPageIndex = 1;
          this.cleardialog = false;
          this.$message({
            type: "success",
            message: msg
          });
          this.refresh();
        } else {
          this.$message.error(msg);
        }
      });
    },
    // 技能baocun
    saveskillData(arr) {
      if (this.changeData.length == 0) {
        return this.$message.error(this.$t("pleasesave"));
      }
      http
        .post(api.saveskill, {
          skillData: this.changeData
        })
        .then((res) => {
          const {code, msg} = res.data;
          if (code == 0) {
            // mtm && mtm.setTrackEvent(this.$t("operateButtonsLabels.save"));
            // this.params.nowPageIndex = 1;
            this.$message.success(msg);
            this.refresh();
          } else {
            this.$message.error(msg);
          }
        });
    },
    // 技能表头熟练度
    getListOptionItemProperty() {
      http
        .post(api.listOptionItemProperty, {
          outerKeyList: ["employee_skill"]
        })
        .then((r) => {
          const {code, data, msg} = r.data;
          if (code == 0) {
            console.log(data);
            this.skillhead = data.employee_skill;
            // this.pageEmpSkills();
          } else {
            this.$message.error(msg);
          }
        });
    },
    getSkillOptionItemOrder() {
      http
        .post('/api/schedule-config/skill/getSkillOptionItemOrder', {})
        .then((r) => {
          const {code, data, msg} = r.data;
          if (code == 0) {
            this.skilllevel = data || [];
            // this.pageEmpSkills();
          } else {
            this.$message.error(msg);
          }
        });
    },
    // 查询人员
    searchChange(data) {
      if (this.tabActive != "overtimeSetRule") {
        console.log(this.dateValue, data, "data");
        data = JSON.parse(JSON.stringify(data));
        if (data.depTreeQueryList.length || data.metaQueryList.length || data.searchKey || data.employeeCodes) {
          this.queryEid = "";
        }
        // if (
        //   data.depTreeQueryList.length ||
        //   data.metaQueryList.length ||
        //   data.searchKey ||
        //   data.employeeCodes ||
        //   this.queryEid
        // ) {
        const clone = JSON.parse(JSON.stringify(data));
        clone.tableData = [
          {metaObj: "personal_profile", metaField: "employee_code"}, // 工号
          {metaObj: "personal_profile", metaField: "full_name"}, // 姓名
          {metaObj: "position", metaField: "position_description"}, // 岗位
          {metaObj: "work_unit", metaField: "this_name"}
        ]; // 部门
        clone.extendQueryList = [
          {
            metaObj: "personal_profile",
            metaField: "hiring_status",
            symbols: ["in"],
            values: ["Active", "Leaving", "Probation"]
          }
        ];
        clone.metaQueryList.forEach((obj) => {
          if (obj.metaObj == "date_obj") {
            clone.rangeDate = {
              gmtStart: obj.values[0],
              gmtEnd: obj.values[1]
            };
            this.startTime = obj.values[0];
            this.endTime = obj.values[1];
          }
        });
        // this.changeSearchQuery(data);
        this.changeData = [];
        this.searchparam = {
          maxEid: this.maxEid,
          searchRequest: clone,
          ignoreLimitNum: true
        };
        this.refresh();
      } else {
        this.$refs.overtime.search(data);
      }
      // this.loading = true;
    },
    hasNoPower(obj, index) {
      console.log(obj);
      let isPower = false;
      let tableDate = this.availableHead[index].slice(0, 10);
      let dayStart = tableDate + " 00:00";
      let endStart = tableDate + " 24:00";
      if (obj.isDispatch && obj.isSupport) {
        return false;
      }
      if (obj.isDispatch) {
        // 派出
        let d = obj.supportData.find((s) => {
          if (s.startTime == null || s.endTime == null) {
            return false;
          } else {
            return this.moment(dayStart).diff(this.moment(s.startTime.slice(0, 16)), "minutes") >= 0 && this.moment(endStart).diff(this.moment(s.endTime.slice(0, 16)), "minutes") <= 0;
          }
        });
        isPower = d ? true : false;
      }
      if (obj.isSupport) {
        // 支援
        isPower = true;
        let d = obj.supportData.find(
          (s) => {
            console.log(s);
            if (s.startTime == null || s.endTime == null) {
              return false;
            } else {
              if (s.type == 1 && s.fromDidPermission == false) {
                return (
                  (this.moment(dayStart).diff(this.moment(s.startTime.slice(0, 16)), "minutes") >= 0 && this.moment(dayStart).diff(this.moment(s.endTime.slice(0, 16)), "minutes") < 0) ||
                  (this.moment(endStart).diff(this.moment(s.startTime.slice(0, 16)), "minutes") > 0 && this.moment(endStart).diff(this.moment(s.endTime.slice(0, 16)), "minutes") <= 0) ||
                  (this.moment(s.startTime.slice(0, 16)).diff(this.moment(dayStart), "minutes") >= 0 && this.moment(s.startTime.slice(0, 16)).diff(this.moment(endStart), "minutes") < 0) ||
                  (this.moment(s.endTime.slice(0, 16)).diff(this.moment(dayStart), "minutes") > 0 && this.moment(s.endTime.slice(0, 16)).diff(this.moment(endStart), "minutes") <= 0)
                );
              } else {
                return true;
              }
            }
          }
          // (this.moment(dayStart).diff(this.moment(s.endTime.slice(0, 16)), 'minutes') >= 0 ||
          // this.moment(endStart).diff(this.moment(s.startTime.slice(0, 16)), 'minutes') <= 0)
        );
        isPower = d ? false : true;
      }
      return isPower;
    },
    editFn(obj, index) {
      this.isSupport = obj.isSupport;
      this.isDispatch = obj.isDispatch;
      this.dialogVisible = true;
      this.editName = obj.name;
      this.supportDataDialog = JSON.parse(JSON.stringify(obj.supportData || []));
      this.dateTitle = this.availableHead[index].slice(0, 10);
      let o = JSON.parse(JSON.stringify(obj.availableScopes[index]));
      this.editObj = {
        eid: obj.eid,
        dates: [
          {
            start: this.dateTitle,
            end: this.dateTitle
          }
        ],
        times: o.scopes.length
          ? o.scopes[0].timeSlotList
          : [
              {
                start: "",
                end: ""
              }
            ],
        type: o.type != 1 && o.type != 2 ? 0 : o.type
      };
    },
    dataAdd() {
      this.editObj.dates.push({
        start: "",
        end: ""
      });
    },
    timeAdd() {
      this.editObj.times.push({
        start: "",
        end: ""
      });
    },
    dataDelete(index) {
      this.editObj.dates.length > 1 && this.editObj.dates.splice(index, 1);
    },
    timeDelete(index) {
      this.editObj.times.length > 1 && this.editObj.times.splice(index, 1);
    },
    saveEditFn() {
      debugger;
      if (!this.isSupport && this.isDispatch) {
        // 派出
        let isPowerMsg = null;
        let PowerMsg = {};
        if (this.editObj.type == 2) {
          this.editObj.times.forEach((t1) => {
            let dayStart = this.dateTitle + " " + t1.start;
            let endStart = this.dateTitle + " " + t1.end;
            isPowerMsg = this.supportDataDialog.find((s) => {
              if (s.startTime == null || s.endTime == null) {
                return false;
              } else {
                (this.moment(dayStart).diff(this.moment(s.startTime.slice(0, 16)), "minutes") >= 0 && this.moment(dayStart).diff(this.moment(s.endTime.slice(0, 16)), "minutes") < 0) ||
                  (this.moment(endStart).diff(this.moment(s.startTime.slice(0, 16)), "minutes") > 0 && this.moment(endStart).diff(this.moment(s.endTime.slice(0, 16)), "minutes") <= 0) ||
                  (this.moment(dayStart).diff(this.moment(s.startTime.slice(0, 16)), "minutes") >= 0 && this.moment(endStart).diff(this.moment(s.endTime.slice(0, 16)), "minutes") <= 0);
              }
            });
            if (isPowerMsg) {
              PowerMsg.start = dayStart.slice(11, 16);
              PowerMsg.end = endStart.slice(11, 16);
            }
          });
        } else if (this.editObj.type == 0) {
          let dayStart = this.dateTitle + " 00:00";
          let endStart = this.dateTitle + " 24:00";
          isPowerMsg = this.supportDataDialog.find((s) => {
            if (s.startTime == null || s.endTime == null) {
              return false;
            } else {
              (this.moment(s.startTime).diff(this.moment(dayStart.slice(0, 16)), "minutes") >= 0 && this.moment(s.startTime).diff(this.moment(endStart.slice(0, 16)), "minutes") < 0) ||
                (this.moment(s.endTime).diff(this.moment(dayStart.slice(0, 16)), "minutes") > 0 && this.moment(s.endTime).diff(this.moment(endStart.slice(0, 16)), "minutes") <= 0);
            }
          });
          if (isPowerMsg) {
            PowerMsg.start = dayStart;
            PowerMsg.end = endStart;
            return this.$message.error(this.$t("zh_rule_condition1", {name: this.editName, type: this.$t("zh_rule_dispatch")}));
          }
        }
        if (isPowerMsg) {
          let type = this.$t("zh_rule_dispatch");
          return this.$message.error(this.$t("zh_rule_condition", {name: this.editName, start: PowerMsg.start, end: PowerMsg.end, type: type}));
        }
      }
      if (this.isSupport && !this.isDispatch) {
        // 支援
        let isPowerMsg = null;
        let PowerMsg = {};
        if (this.editObj.type == 2) {
          this.editObj.times.forEach((t1) => {
            let dayStart = this.dateTitle + " " + t1.start;
            let endStart = this.dateTitle + " " + t1.end;
            isPowerMsg = this.supportDataDialog.find(
              (s) => !(this.moment(dayStart).diff(this.moment(s.startTime.slice(0, 16)), "minutes") >= 0 && this.moment(endStart).diff(this.moment(s.endTime.slice(0, 16)), "minutes") <= 0)
            );
            if (isPowerMsg) {
              PowerMsg.start = dayStart;
              PowerMsg.end = endStart;
            }
          });
        } else if (this.editObj.type == 0) {
          let dayStart = this.dateTitle + " 00:00";
          let endStart = this.dateTitle + " 24:00";
          isPowerMsg = this.supportDataDialog.find(
            (s) => !(this.moment(dayStart).diff(this.moment(s.startTime.slice(0, 16)), "minutes") >= 0 && this.moment(endStart).diff(this.moment(s.endTime.slice(0, 16)), "minutes") <= 0)
          );
          if (isPowerMsg) {
            PowerMsg.start = dayStart;
            PowerMsg.end = endStart;
          }
        }
        if (isPowerMsg) {
          let type = this.$t("zh_rule_support");
          return this.$message.error(this.$t("zh_rule_condition2", {name: this.editName, start: PowerMsg.start, end: PowerMsg.end, type: type}));
        }
      }
      if (this.editObj.dates.some((v) => !v.start || !v.end)) {
        this.$message.error(this.$t("zh_choice_date"));
        return;
      }
      if (this.editObj.times.some((v) => !v.start || !v.end) && this.editObj.type == 2) {
        this.$message.error(this.$t("zh_choice_time"));
        return;
      }
      var params = {};
      if (this.editObj.type != 2) {
        params = {
          eid: this.editObj.eid,
          dates: this.editObj.dates,
          type: this.editObj.type
        };
      } else {
        params = this.editObj;
        let f = false;
        this.editObj.times.length > 1 &&
          this.editObj.times.some((v) => {
            this.editObj.times.some((v1) => {
              if (!this.isDateIntersection(v.start, v.end, v1.start, v1.end)) {
                f = true;
                return true;
              }
            });
            if (f) {
              return true;
            }
          });
        if (f) {
          this.$message.error(this.$t("timecoincide"));
          return;
        }
      }
      http.post(api.setAV, params).then((r) => {
        const {code, msg} = r.data;
        if (code == 0) {
          this.dialogVisible = false;
          this.$message.success(msg);
          this.refresh();
        } else {
          this.$message.error(msg);
        }
      });
    },
    isDateIntersection(start1, end1, start2, end2) {
      var startdate1 = +new Date("2020-11-11 " + start1);
      var enddate1 = +new Date("2020-11-11 " + end1);
      var startdate2 = +new Date("2020-11-11 " + start2);
      var enddate2 = +new Date("2020-11-11 " + end2);
      if (startdate1 >= enddate2) {
        return true;
      }
      if (startdate2 >= enddate1) {
        return true;
      }
      if (startdate1 == startdate2 && enddate1 == enddate2) {
        return true;
      }
      return false;
    },
    timeCheck(item) {
      if (!item.start) {
        item.end = "";
      }
      if (+new Date("1999-01-01 " + item.start) > +new Date("1999-01-01 " + item.end) && item.end) {
        item.end = item.start;
      }
    }
  }
};
</script>

<style lang="less">
.employeeInfoMaintain {
  .employee-wrap {
    padding: 0 20px;
  }
}
.dialogCon {
  .timeBox {
    margin-top: 15px;
    .span {
      font-size: 13px;
      font-weight: 400;
      color: #6a7885;
      line-height: 13px;
    }
  }
  .dataListZx {
    margin: 10px 0;
  }
  .timeListZx {
    margin: 10px 0;
  }
  .operateBtn {
    margin-left: 5px;
    display: inline-block;
    width: 18px;
    height: 18px;
    line-height: 18px;
    text-align: center;
    font-size: 12px;
    cursor: pointer;
    &.delete {
      background: #f4502c;
      color: #fff;
    }
    &.disabled {
      cursor: not-allowed;
      background: rgba(244, 80, 44, 0.5);
    }
    &.add {
      background: #27a9f8;
      color: #fff;
    }
  }
}
.flexC {
  // display: flex;
  > div {
    > div {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    display: inline-block;
    vertical-align: middle;
    span {
      display: block;
      line-height: 20px;
    }
  }
}
</style>
