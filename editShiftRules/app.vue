<template>
  <div class="editShiftRules wq-page-table-content">
    <wq-page-head :title="$t('app.new_title')" :hideStar="true" :refresh-time="refreshTime" :operate-buttons="operateButtons" @operate-click="operateButtonClick" @refresh="refreshData"></wq-page-head>
    <high-search @change="barSearch" :showUseLogic="false" privilege="schedule_editschhistory#view" pageId="adv_search_1000000796138735" :hideSearch="true"></high-search>
    <div class="wq-page-table-content--table" ref="wqPagetTableContent">
      <wq-table
        v-loading="loading"
        :border-header="true"
        tableName="editShiftRules"
        :data="tableData"
        ref="table"
        style="margin: 0 auto; box-shadow: none"
        :max-height="tableHeight"
        @currentPageChange="currentPageChange"
        :currentPageNum="params.nowPageIndex"
        :total="totalItem"
        :pageTotal="totalPage"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column :label="$t('dialogForm.rule_code')">
          <template slot-scope="scope">
            <span v-if="privilegeKeys.indexOf('schedule_editschhistory#update') > -1" @click="updateItem(scope.row.bid)" class="theme-color" style="cursor: pointer">
              {{ scope.row.code }}
            </span>
            <span v-else>{{ scope.row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('dialogForm.rules_name')" prop="name"></el-table-column>
        <el-table-column :label="$t('dialogForm.applicable_user')">
          <template slot-scope="scope">
            <el-tooltip placement="top" :enterable="false">
              <div slot="content">
                <wq-open-data :openData="(scope.row.emps || []).map((o) => o.userAccount + (o.empName ? '-' + o.empName : '')).join('、')"></wq-open-data>
              </div>
              <wq-open-data :openData="(scope.row.emps || []).map((o) => o.userAccount + (o.empName ? '-' + o.empName : '')).join('、')"></wq-open-data>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column :label="$t('dialogForm.applicable_role')" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ (scope.row.roles || []).join("、") }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('dialogForm.applicable_dep')" show-overflow-tooltip>
          <template slot-scope="scope">
            {{
              (scope.row.didList || [])
                .map((did) => did.name)
                .filter((name) => !!name)
                .join("、")
            }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('dialogForm.modify_type')" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ formatModifyType[scope.row.editScheduleStatus] }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('dialogForm.editable_day')">
          <template slot-scope="scope">
            {{ scope.row.editDayNum || scope.row.editDayNum === 0 ? scope.row.editDayNum : "/" }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('dialogForm.week_edit')">
          <template slot-scope="scope">
            {{ formatWeek[scope.row.editWeekBefore] || "/" }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('dialogForm.month_edit')">
          <template slot-scope="scope">
            {{ formatMonth[scope.row.editMonthBefore] || "/" }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('dialogForm.before_month_end_edit')">
          <template slot-scope="scope">
            {{ scope.row.editMonthBottom || scope.row.editMonthBottom === 0 ? scope.row.editMonthBottom : "/" }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('dialogForm.create_user')">
          <template slot-scope="scope">
            <wq-open-data :openData="scope.row.creator || ''"></wq-open-data>
          </template>
        </el-table-column>
        <el-table-column :label="$t('dialogForm.create_time')" prop="gmtCreate" width="170"></el-table-column>
      </wq-table>
    </div>
    <wq-drawer v-if="dialog" :visible.sync="dialog" :title="dialogTitle" custom-class="demo-drawer" size="600px" :wrapperClosable="false">
      <div class="demo-drawer__content">
        <dialog-form :formData="formData" :rolesListOptions="rolesListOptions" :rulesControl="rulesControl" :weekList="weekList" :monthList="monthList" ref="dialogForm"></dialog-form>
        <div class="demo-drawer__footer">
          <el-button @click="dialog = false">{{ $t("app.cancel") }}</el-button>
          <el-button type="primary" :disabled="btndis" @click="saveBtn">
            {{ $t("app.save") }}
          </el-button>
        </div>
      </div>
    </wq-drawer>
  </div>
</template>

<script>
import api from "./api.js";
import http from "commonRemote/services/http";
import HighSearch from "commonRemote/components/highSearchNew";
import privilegeValidator from "commonRemote/services/privilegeValidator";
import tableStyle from "commonRemote/mixins/tableStyle";
// import DialogForm from './components/dialogForm.vue';
const DialogForm = () => import("./components/dialogForm.vue");
export default {
  data() {
    return {
      highConfig: [
        {
          fieldName: this.$t("dialogForm.rule_code"),
          alias: this.$t("dialogForm.rule_code"),
          fieldSearchType: "text",
          logicOperate: [{metaObject: null, k: "like", v: this.$t("app.logic"), type: null}],
          metaField: "code",
          metaObj: "code",
          placeholder: this.$t("dialogForm.rule_code"),
          toolTip: this.$t("dialogForm.rule_code")
        },
        {
          fieldName: this.$t("app.name"),
          alias: this.$t("app.name"),
          fieldSearchType: "text",
          logicOperate: [{metaObject: null, k: "like", v: this.$t("app.logic"), type: null}],
          metaField: "name",
          metaObj: "name",
          placeholder: this.$t("app.name"),
          toolTip: this.$t("app.name")
        },
        {
          fieldName: this.$t("app.person_name"),
          alias: this.$t("app.person_name"),
          fieldSearchType: "text",
          logicOperate: [{metaObject: null, k: "like", v: this.$t("app.logic"), type: null}],
          metaField: "emp_name",
          metaObj: "sch_edit_histopry",
          placeholder: this.$t("app.person_name"),
          toolTip: this.$t("app.person_name")
        },
        {
          fieldName: this.$t("app.user_name"),
          alias: this.$t("app.user_name"),
          fieldSearchType: "text",
          logicOperate: [{metaObject: null, k: "like", v: this.$t("app.logic"), type: null}],
          metaField: "user",
          metaObj: "user",
          placeholder: this.$t("app.user_name"),
          toolTip: this.$t("app.user_name")
        },
        {
          fieldName: this.$t("app.role"),
          alias: this.$t("app.role"),
          fieldSearchType: "text",
          logicOperate: [{metaObject: null, k: "like", v: this.$t("app.logic"), type: null}],
          metaField: "role",
          metaObj: "role",
          placeholder: this.$t("app.role"),
          toolTip: this.$t("app.role")
        }
      ],
      totalItem: 0,
      refreshTime: "",
      totalPage: 0,
      params: {
        nowPageIndex: 1,
        pageSize: 20
      },
      btndis: false,
      operateButtons: [
        {
          type: "custom",
          key: "add",
          name: this.$t("app.create"),
          icon: "/style/static/svgIcon/com/add.svg",
          disabled: false,
          isDisabled: false,
          privilegeKey: "schedule_editschhistory#add"
        },
        {
          type: "delete",
          key: "delete",
          name: this.$t("app.delete"),
          disabled: true,
          isDisabled: true,
          privilegeKey: "schedule_editschhistory#delete"
        }
      ],
      tableHeight: 0,
      tableData: [],
      dialog: false,
      dialogTitle: "",
      formData: {
        bid: "",
        code: "",
        ruleName: "",
        uids: [],
        roleBids: [],
        editScheduleStatus: "2",
        editDayNum: "",
        editWeekBefore: "",
        editMonthBefore: "",
        editMonthBottom: "",
        didList: []
      },
      rolesListOptions: [],
      rulesControl: [
        {label: this.$t("app.enable"), value: "0"},
        {label: this.$t("app.disable"), value: "1"},
        {label: this.$t("app.partial_date_allowed_durantion"), value: "2"}
      ],
      formatModifyType: {
        0: this.$t("app.enable"),
        1: this.$t("app.disable"),
        2: this.$t("app.partial_date_allowed_durantion")
      },
      weekList: [
        {label: this.$t("app.monday"), value: "1"},
        {label: this.$t("app.tuesday"), value: "2"},
        {label: this.$t("app.wednesday"), value: "3"},
        {label: this.$t("app.thursday"), value: "4"},
        {label: this.$t("app.friday"), value: "5"},
        {label: this.$t("app.saturday"), value: "6"},
        {label: this.$t("app.sunday"), value: "7"}
      ],
      formatWeek: {
        1: this.$t("app.monday"),
        2: this.$t("app.tuesday"),
        3: this.$t("app.wednesday"),
        4: this.$t("app.thursday"),
        5: this.$t("app.friday"),
        6: this.$t("app.saturday"),
        7: this.$t("app.sunday")
      },
      monthList: [
        {label: "1", value: "1"},
        {label: "2", value: "2"},
        {label: "3", value: "3"},
        {label: "4", value: "4"},
        {label: "5", value: "5"},
        {label: "6", value: "6"},
        {label: "7", value: "7"},
        {label: "8", value: "8"},
        {label: "9", value: "9"},
        {label: "10", value: "10"},
        {label: "11", value: "11"},
        {label: "12", value: "12"},
        {label: "13", value: "13"},
        {label: "14", value: "14"},
        {label: "15", value: "15"},
        {label: "16", value: "16"},
        {label: "17", value: "17"},
        {label: "18", value: "18"},
        {label: "19", value: "19"},
        {label: "20", value: "20"},
        {label: "21", value: "21"},
        {label: "22", value: "22"},
        {label: "23", value: "23"},
        {label: "24", value: "24"},
        {label: "25", value: "25"},
        {label: "26", value: "26"},
        {label: "27", value: "27"},
        {label: "28", value: "28"},
        {label: this.$t("app.end_of_month"), value: "MOUTH_END"}
      ],
      formatMonth: {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        10: 10,
        11: 11,
        12: 12,
        13: 13,
        14: 14,
        15: 15,
        16: 16,
        17: 17,
        18: 18,
        19: 19,
        20: 20,
        21: 21,
        22: 22,
        23: 23,
        24: 24,
        25: 25,
        26: 26,
        27: 27,
        28: 28,
        MOUTH_END: this.$t("app.end_of_month")
      },
      selectList: [],
      loading: false,
      privilegeKeys: [],
      startTimeMD: null // 埋点
    };
  },
  mixins: [tableStyle],
  components: {
    DialogForm,
    HighSearch
  },
  watch: {
    selectList: {
      handler(val) {
        let deleteBtn = this.operateButtons.find((obj) => obj.key == "delete") || {};
        deleteBtn.isDisabled = !val.length;
      },
      deep: true
    }
  },
  created() {
    document.title = this.$t("app.title");
    // this.initHeight();
    // window.onresize = this.initHeight;
    this.getPermission();
    this.getRolesListOptions();
  },
  methods: {
    barSearch(data) {
      this.params.searchRequest = data;
      this.refreshData();
    },
    // initHeight() {
    //   const height = document.documentElement.clientHeight || document.body.clientHeight;
    //   this.tableHeight = height - 280;
    // },
    getPermission() {
      privilegeValidator.checkPageKey(["schedule_editschhistory#add", "schedule_editschhistory#update", "schedule_editschhistory#delete"], (res) => {
        const {code, data} = res.data;
        if (code == 0) {
          this.privilegeKeys = data.keys;
          this.operateButtons = this.operateButtons.filter((item) => this.privilegeKeys.indexOf(item.privilegeKey) > -1);
        }
      });
    },
    getRolesListOptions() {
      http.post(api.getAllRoles, {}).then((res) => {
        const {data, code} = res.data;
        if (code === 0) {
          this.rolesListOptions = data;
        }
      });
    },
    operateButtonClick(key) {
      if (key === "add") {
        this.startTimeMD = new Date();
        this.formData = {
          bid: "",
          code: "",
          ruleName: "",
          uids: [],
          roleBids: [],
          editScheduleStatus: "2",
          editDayNum: "",
          editWeekBefore: "",
          editMonthBefore: "",
          editMonthBottom: "",
          didList: []
        };
        http.post("/api/schedule-config/editHistory/getAutoShortCode", {}).then((res) => {
          const {code, msg, data} = res.data;
          if (code == 0) {
            this.formData.code = data;
          } else {
            this.$message.error(msg);
          }
        });
        this.dialog = true;
        this.dialogTitle = this.$t("app.create");
      }
      if (key === "delete") {
        this.$confirm(this.$t("app.sure_mutiple_delete_info2"), this.$t("app.delete_tips1"), {
          confirmButtonText: this.$t("app.confirm1"),
          cancelButtonText: this.$t("app.cancel"),
          type: "warning"
        })
          .then(() => {
            http.post(api.delete, {bids: this.selectList.map((o) => o.bid)}).then((res) => {
              const {msg, code} = res.data;
              if (code == 0) {
                // mtm && mtm.setTrackEvent(this.$t("zh_delete"));
                this.$message.success(msg);
                this.refreshData();
              } else {
                this.$message.error(msg);
              }
            });
          })
          .catch(() => {
            // this.$message.info(this.$t("app.delete_cancelled"));
          });
      }
    },
    refreshData() {
      this.checkNum = 0;
      this.checkedAll = false;
      this.refreshTime = "";
      this.selectList = [];
      this.params.nowPageIndex = 1;
      this.getData();
    },
    getData() {
      this.loading = true;
      http.post(api.getList, this.params).then((res) => {
        this.loading = false;
        const {data, code, lastModifiedTime, msg} = res.data;
        this.refreshTime = lastModifiedTime;
        if (code == 0) {
          this.totalItem = data.totalItem;
          this.totalPage = data.totalPage;
          this.tableData = data.list || [];
          this.$nextTick(() => {
            this.selectList = [];
            this.$refs.table.clearSelection();
          });
        } else {
          this.$message.error(msg);
        }
      });
    },
    saveBtn() {
      this.$refs.dialogForm.validate((valid, formData) => {
        if (valid) {
          this.btndis = true;
          let submitData = {editData: formData};
          http.post(api.saveOrUpdate, submitData, "json").then((res) => {
            const {msg, code} = res.data;
            this.btndis = false;
            if (code == 0) {
              // 埋点 yangkun.2021-04-06
              // mtm && mtm.setTrackEvent(this.dialogTitle, +new Date() - this.startTimeMD);
              this.startTimeMD = null;
              this.$message.success(msg);
              this.dialog = false;
              this.refreshData();
            } else {
              this.$message.error(msg);
            }
          });
        }
      });
    },
    updateItem(bid) {
      this.startTimeMD = new Date();
      http.post(api.getOne, {bid}).then((res) => {
        const {data, code, msg} = res.data;
        if (code === 0) {
          data.uids = data.uids || [];
          data.roleBids = data.roleBids || [];
          data.didList = data.didList || [];
          this.formData = data;
          this.dialog = true;
          this.dialogTitle = this.$t("app.edit_rules");
        } else {
          this.$message.error(msg);
        }
      });
    },
    handleSelectionChange(val) {
      this.selectList = val;
    },
    currentPageChange(index, pageSize) {
      this.params.nowPageIndex = index;
      this.params.pageSize = pageSize;
      this.getData();
    }
  }
};
</script>

<style lang="less" scoped>
.demo-drawer {
  .demo-drawer__footer {
    position: fixed;
    bottom: 14px;
    right: 25px;
  }
}
.editShiftRules {
  :deep(.el-drawer__body) {
    overflow: auto;
    margin-bottom: 65px;
    padding: 20px 24px 0;
  }
  :deep(.is-error) .el-input.is-disabled .el-input__inner {
    border-color: #f4502c;
  }
  :deep(.el-tooltip) {
    display: inline-block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: keep-all;
  }
}
:deep(.el-table) table {
  border-collapse: separate;
}
</style>
