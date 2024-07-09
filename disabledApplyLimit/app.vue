<template>
  <div class="disabledApplyLimit">
    <wq-page-head :title="$t('title')" :hideStar="true" :refresh-time="refreshTime" :operate-buttons="operateButtons" @operate-click="operateButtonClick" @refresh="refresh"></wq-page-head>
    <high-search pageId="adv_search_1000001395572571" privilege="schedule_sch_unavailability_limit" @change="searchChange"></high-search>
    <el-tabs v-model="activeName" @tab-click="refresh" :no-padding="true" style="margin-top: -10px; padding: 0 20px">
      <el-tab-pane :label="$t('dept_apply_num')" name="dept">
        <wq-table
          v-loading="deptLoading"
          :border-header="true"
          tableName="deptTable"
          :data="deptTableData"
          ref="deptTable"
          :max-height="tableHeight"
          @currentPageChange="deptPageChange"
          :currentPageNum="deptParams.nowPageIndex"
          :total="totalItem"
          :pageTotal="deptTotalPage"
          @selection-change="deptHandleSelectionChange">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column :label="$t('rule_code')">
            <template slot-scope="scope">
              <span v-if="privilegeKeys.indexOf('schedule_sch_unavailability_limit#update') > -1" @click="updateItem(scope.row)" style="color: #27a9f8; cursor: pointer">
                {{ scope.row.code }}
              </span>
              <span v-else>{{ scope.row.code }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('apply_range')" prop="applyRange" show-overflow-tooltip></el-table-column>
          <el-table-column :label="$t('start_date')" prop="startDate"></el-table-column>
          <el-table-column :label="$t('end_date')" prop="endDate"></el-table-column>
          <el-table-column :label="$t('valiable_apply_num')" prop="applyNums"></el-table-column>
          <el-table-column :label="$t('create_user')" prop="createUserName"></el-table-column>
          <el-table-column :label="$t('create_time')" prop="gmtCreate"></el-table-column>
        </wq-table>
      </el-tab-pane>
      <el-tab-pane :label="$t('emp_apply_times')" name="emp">
        <wq-table
          v-loading="empLoading"
          :border-header="true"
          tableName="empTable"
          :data="empTableData"
          ref="empTable"
          :max-height="tableHeight"
          @currentPageChange="empPageChange"
          :currentPageNum="empParams.nowPageIndex"
          :total="totalItem"
          :pageTotal="empTotalPage"
          @selection-change="empHandleSelectionChange">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column :label="$t('rule_code')">
            <template slot-scope="scope">
              <span v-if="privilegeKeys.indexOf('schedule_sch_unavailability_limit#update') > -1" @click="updateItem(scope.row)" style="color: #27a9f8; cursor: pointer">
                {{ scope.row.code }}
              </span>
              <span v-else>{{ scope.row.code }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('apply_range')" prop="applyRange" show-overflow-tooltip></el-table-column>
          <el-table-column :label="$t('max_apply_num')" prop="applyTimes"></el-table-column>
          <el-table-column :label="$t('statistical_cycle')">
            <template slot-scope="scope">
              <span>{{ formatCycle[scope.row.cycleType] }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('time_range')" prop="cycleNums"></el-table-column>
          <el-table-column :label="$t('start_date')" prop="startDate"></el-table-column>
          <el-table-column :label="$t('end_date')" prop="endDate"></el-table-column>
          <el-table-column :label="$t('create_user')" prop="createUserName"></el-table-column>
          <el-table-column :label="$t('create_time')" prop="gmtCreate"></el-table-column>
        </wq-table>
      </el-tab-pane>
    </el-tabs>
    <wq-drawer v-if="dialogVisible" :visible.sync="dialogVisible" :title="dialogTitle" :wrapperClosable="false" size="560px" custom-class="demo-drawer">
      <div class="demo-drawer__content leftcontainBox">
        <dialog-form :formData="formData" :suitTypeList="suitTypeList" :cycleTypeList="cycleTypeList" ref="dialogForm"></dialog-form>
        <div class="demo-drawer__footer">
          <el-button @click="dialogVisible = false">
            {{ $t("cancel") }}
          </el-button>
          <el-button type="primary" :disabled="btnDisabled" @click="saveBtn">
            {{ $t("confirm") }}
          </el-button>
        </div>
      </div>
    </wq-drawer>
    <file-upload :visible.sync="uploadVisible" :uploadConfig="uploadConfig" @success="refresh"></file-upload>
    <export-mask :loading.sync="exportLoad" :param="exportParam" :title="exportTitle"></export-mask>
  </div>
</template>

<script>
import http from "commonRemote/services/http";
import HighSearch from "commonRemote/components/highSearchNew";
import privilegeValidator from "commonRemote/services/privilegeValidator";
import FileUpload from "commonRemote/components/fileUpload";
import exportMask from "commonRemote/components/exportMask";
// import DialogForm from "./components/dialogForm.vue";
const DialogForm = () => import("./components/dialogForm.vue");
export default {
  components: {
    HighSearch,
    FileUpload,
    exportMask,
    DialogForm
  },
  data() {
    return {
      uploadVisible: false,
      uploadConfig: {
        bucketKey: "scheduler_unavailabilityDataImporter"
      },
      exportLoad: false,
      exportParam: {
        key: "scheduler_unavailabilityDataExporter",
        callBackParam: ""
      },
      exportTitle: this.$t("title"),
      dateValue: {
        gmtStart: "",
        gmtEnd: ""
      },
      activeName: "dept",
      deptLoading: false,
      empLoading: false,
      tableHeight: 0,
      deptTableData: [],
      empTableData: [],
      totalItem: 0,
      deptTotalPage: 0,
      empTotalPage: 0,
      refreshTime: "",
      operateButtons: [
        {
          type: "custom",
          key: "add",
          name: this.$t("add"),
          icon: "/style/static/svgIcon/com/add.svg",
          disabled: false,
          isDisabled: false,
          privilege: "schedule_sch_unavailability_limit#add"
        },
        {
          type: "delete",
          key: "delete",
          disabled: true,
          isDisabled: true,
          name: this.$t("delete"),
          privilege: "schedule_sch_unavailability_limit#delete"
        },
        {
          type: "import",
          disabled: false,
          isDisabled: false,
          privilege: "schedule_sch_unavailability_limit_Import"
        },
        {
          type: "export",
          disabled: false,
          isDisabled: false,
          privilege: "schedule_sch_unavailability_limit_export"
        }
      ],
      deptParams: {
        nowPageIndex: 1,
        pageSize: 20
      },
      empParams: {
        nowPageIndex: 1,
        pageSize: 20
      },
      searchRequest: {},
      dialogVisible: false,
      dialogTitle: "",
      formData: {},
      selectDeptList: [],
      selectEmpList: [],
      privilegeKeys: [],
      btnDisabled: false,
      suitTypeList: [],
      cycleTypeList: [],
      mapNames: {},
      formatCycle: {
        day: this.$t("format_day"),
        week: this.$t("format_week"),
        month: this.$t("format_month"),
        year: this.$t("format_year")
      }
    };
  },
  created() {
    document.title = this.$t("title");
    this.getPrivilege();
    this.getConfigList();
    this.initHeight();
    window.onresize = this.initHeight;
  },
  computed: {
    selectList() {
      return {
        selectDeptList: this.selectDeptList,
        selectEmpList: this.selectEmpList
      };
    }
  },
  watch: {
    selectList: {
      handler(data) {
        let deleteBtn = this.operateButtons.find((obj) => obj.key == "delete") || {};
        if (this.activeName === "dept") {
          deleteBtn.isDisabled = !data.selectDeptList.length;
        } else {
          deleteBtn.isDisabled = !data.selectEmpList.length;
        }
      },
      deep: true
    }
  },
  methods: {
    initHeight() {
      const height = document.documentElement.clientHeight || document.body.clientHeight;
      this.tableHeight = height - 236;
    },
    getPrivilege() {
      privilegeValidator.checkPageKey(
        [
          "schedule_sch_unavailability_limit#add",
          "schedule_sch_unavailability_limit#delete",
          "schedule_sch_unavailability_limit#update",
          "schedule_sch_unavailability_limit",
          "schedule_sch_unavailability_limit_Import",
          "schedule_sch_unavailability_limit_export"
        ],
        (res) => {
          const {code, data} = res.data;
          if (code == 0) {
            this.privilegeKeys = data.keys;
            this.operateButtons = this.operateButtons.filter((item) => this.privilegeKeys.indexOf(item.privilege) > -1);
          }
        }
      );
    },
    getConfigList() {
      http.post("/api/schedule-config/unavailabilityLimit/listConfigEnum", {}).then((res) => {
        const {code, msg, data} = res.data;
        if (code == 0) {
          this.suitTypeList = data.suitTypeList || [];
          this.cycleTypeList = data.cycleTypeList || [];
        } else {
          this.$message.error(msg);
        }
      });
    },
    refresh() {
      this.refreshTime = "";
      this.totalItem = 0;
      this.deptTotalPage = 0;
      this.empTotalPage = 0;
      this.selectDeptList = [];
      this.selectEmpList = [];
      this.deptTableData = [];
      this.empTableData = [];
      this.deptParams.nowPageIndex = 1;
      this.empParams.nowPageIndex = 1;
      if (this.activeName == "dept") {
        this.getDeptList();
      } else {
        this.getEmpList();
      }
    },
    operateButtonClick(key) {
      if (key == "add") {
        this.formData = {
          code: "",
          suitType: "",
          suitDeps: [],
          applyTimes: "",
          cycleType: "",
          cycleNums: "",
          startDate: "",
          endDate: "",
          applyNums: ""
        };
        http.post("/api/schedule-config/unavailabilityLimit/getAutoCode", {}).then((res) => {
          const {code, msg, data} = res.data;
          if (code == 0) {
            this.formData.code = data;
          } else {
            this.$message.error(msg);
          }
        });
        this.dialogTitle = this.$t("create_rule");
        this.dialogVisible = true;
      } else if (key == "delete") {
        this.$confirm(this.$t("sure_delete_selected"), this.$t("delete"), {
          confirmButtonText: this.$t("confirm"),
          cancelButtonText: this.$t("cancel"),
          type: "warning"
        })
          .then(() => {
            this.deleteSelectedData();
          })
          .catch(() => {});
      } else if (key == "import") {
        this.uploadVisible = true;
      } else if (key == "export") {
        if ((this.activeName === "dept" && this.selectDeptList.length) || (this.activeName === "emp" && this.selectEmpList.length)) {
          this.exportParam.callBackParam = JSON.stringify({
            bids: this.activeName === "dept" ? this.selectDeptList.map((o) => o.bid) : this.selectEmpList.map((o) => o.bid)
          });
        } else {
          this.exportParam.callBackParam = JSON.stringify({
            suitType: this.activeName === "dept" ? "org" : "emp",
            searchRequest: this.searchRequest
          });
        }
        this.exportLoad = true;
      }
    },
    searchChange(data) {
      this.searchRequest = data;
      this.refresh();
    },
    deleteSelectedData() {
      http
        .post("/api/schedule-config/unavailabilityLimit/delete", {
          bids: this.activeName === "dept" ? this.selectDeptList.map((o) => o.bid) : this.selectEmpList.map((o) => o.bid)
        })
        .then((res) => {
          const {code, msg} = res.data;
          if (code == 0) {
            this.$message.success(msg);
            this.refresh();
          } else {
            this.$message.error(msg);
          }
        });
    },
    saveBtn() {
      this.$refs.dialogForm.validate((valid) => {
        if (valid) {
          this.btnDisabled = true;
          http.post("/api/schedule-config/unavailabilityLimit/save", this.formData).then((res) => {
            this.btnDisabled = false;
            const {code, msg} = res.data;
            if (code == 0) {
              this.dialogVisible = false;
              this.$message.success(msg);
              this.refresh();
            } else {
              this.$message.error(msg);
            }
          });
        }
      });
    },
    updateItem(data) {
      this.dialogTitle = this.$t("modify_rule");
      this.formData = JSON.parse(JSON.stringify(data));
      this.formData.suitDeps = this.formData.suitDeps || [];
      this.dialogVisible = true;
    },
    formatDeptTableData(res) {
      const {data, lastModifiedTime} = res.data;
      this.refreshTime = lastModifiedTime;
      this.totalItem = data.totalItem;
      this.deptTotalPage = data.totalPage;
      (data.list || []).forEach((o) => {
        if (o.suitDeps && o.suitDeps.length) {
          o.applyRange = this.$t("apply_org") + "=" + o.suitDeps.map((o) => o.name).join("、");
        }
      });
      this.deptTableData = data.list || [];
      this.$nextTick(() => {
        this.selectDeptList = [];
        this.$refs.deptTable.clearSelection();
      });
    },
    formatEmpTableData(res) {
      const {data, lastModifiedTime} = res.data;
      this.refreshTime = lastModifiedTime;
      this.totalItem = data.totalItem;
      this.empTotalPage = data.totalPage;
      (data.list || []).forEach((o) => {
        if (o.suitDeps && o.suitDeps.length) {
          o.applyRange = this.$t("apply_org") + "=" + o.suitDeps.map((o) => o.name).join("、");
        }
      });
      this.empTableData = data.list || [];
      this.$nextTick(() => {
        this.selectEmpList = [];
        this.$refs.empTable.clearSelection();
      });
    },
    getDeptList() {
      this.deptLoading = true;
      http
        .post("/api/schedule-config/unavailabilityLimit/findPagination", {
          nowPageIndex: this.deptParams.nowPageIndex,
          pageSize: this.deptParams.pageSize,
          suitType: "org",
          searchRequest: this.searchRequest
        })
        .then((res) => {
          this.deptLoading = false;
          if (res.data.code === 0) {
            this.formatDeptTableData(res);
          } else {
            this.$message.error(res.data.msg);
          }
        });
    },
    getEmpList() {
      this.empLoading = true;
      http
        .post("/api/schedule-config/unavailabilityLimit/findPagination", {
          nowPageIndex: this.empParams.nowPageIndex,
          pageSize: this.empParams.pageSize,
          suitType: "emp",
          searchRequest: this.searchRequest
        })
        .then((res) => {
          this.empLoading = false;
          if (res.data.code === 0) {
            this.formatEmpTableData(res);
          } else {
            this.$message.error(res.data.msg);
          }
        });
    },
    deptHandleSelectionChange(list) {
      this.selectDeptList = list;
    },
    empHandleSelectionChange(list) {
      this.selectEmpList = list;
    },
    deptPageChange(index, pageSize) {
      this.deptParams.nowPageIndex = index;
      this.deptParams.pageSize = pageSize;
      this.getDeptList();
    },
    empPageChange(index, pageSize) {
      this.empParams.nowPageIndex = index;
      this.empParams.pageSize = pageSize;
      this.getEmpList();
    }
  }
};
</script>

<style lang="less" scoped>
.disabledApplyLimit {
  :deep(.el-drawer__body) {
    padding: 20px 14px 20px 24px;
  }
}
.demo-drawer {
  .leftcontainBox {
    height: calc(100% - 50px);
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
</style>
