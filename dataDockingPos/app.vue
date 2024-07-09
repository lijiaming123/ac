<template>
  <div>
    <div class="task-setting">
      <wq-page-head
        ref="wqPageHead"
        :title="$t('zh_title')"
        :total="totalItem"
        :hideStar="true"
        :checkedNumber="checkNum"
        :show-check="true"
        :show-num="true"
        :checked-all="isCheckAll"
        :refresh-time="refreshTime"
        @checkAll="checkAll"
        :operate-buttons="operateButtons"
        @operate-click="operateButtonClick"
        @refresh="refreshData"></wq-page-head>
      <high-search privilege="schedule_pos_dock_config#view" @change="search" :config="highConfig" :hideSearch="true"></high-search>
      <wq-list :refresh-time="refreshTime" @refresh-list="pullUp" :total-page="totalPage" :current-page="params.nowPageIndex" style="position: relative" :style="{height: tableHeight + 'px'}">
        <el-col :span="6" v-for="(item, index) in taskList" :key="index" style="margin-bottom: 20px">
          <card
            :cardData="item"
            :check="item.check"
            @showDialogBox="showItem"
            :index="index"
            @copyItem="copyItem"
            @saveItem="saveItem"
            @deleteItem="deleteItem"
            :posTypeList="posTypeList"
            :sysTypeList="sysTypeList"
            :frequencyTypeList="frequencyTypeList"
            @setCheck="getChecks"
            :cntedit="isupdate"
            :cntdelete="isdelete"
            :cntadd="isadd"></card>
        </el-col>
      </wq-list>
    </div>
    <wq-drawer :visible.sync="dialog" :title="dialogTitle" :wrapperClosable="false" custom-class="demo-drawer">
      <div class="demo-drawer__content">
        <dialog-form
          v-if="dialog"
          :cardData="editData"
          ref="dialogForm"
          :sysTypeList="sysTypeList"
          :frequencyTypeList="frequencyTypeList"
          :posTypeList="posTypeList"
          :tableHeight="tableHeight1"></dialog-form>
        <div class="demo-drawer__footer">
          <el-button @click="dialog = false">{{ $t("zh_cancel") }}</el-button>
          <el-button type="primary" @click="save">
            {{ $t("zh_save") }}
          </el-button>
        </div>
      </div>
    </wq-drawer>
  </div>
</template>
<script>
import HighSearch from "commonRemote/components/highSearch";
import http from "commonRemote/services/http";
import privilegeValidator from "commonRemote/services/privilegeValidator";
import {getSelectOptions} from "commonRemote/utils/index";
import api from "./api";
const card = () => import("./card.vue");
const DialogForm = () => import("./dialog.vue");
export default {
  name: "taskSetting",
  components: {
    card,
    DialogForm,
    HighSearch
  },
  data() {
    return {
      highConfig: [
        {
          metaObj: "data_docking_pos",
          fieldName: this.$t("zh_zuzhi"),
          metaField: "did",
          fieldSearchType: "organization_tree",
          alias: this.$t("zh_zuzhi"),
          toolTip: this.$t("zh_zuzhi"),
          logicOperate: [
            {
              k: "like",
              v: this.$t("zh_include")
            }
          ]
        },
        {
          metaObj: "data_docking_pos",
          metaField: "name",
          fieldSearchType: "text",
          alias: this.$t("zh_people"),
          toolTip: this.$t("zh_people"),
          logicOperate: [
            {
              k: "like",
              v: this.$t("zh_include")
            }
          ]
        },
        {
          metaObj: "data_docking_pos",
          metaField: "sysType",
          fieldSearchType: "checkbox",
          alias: this.$t("zh_group"),
          toolTip: this.$t("zh_group"),
          logicOperate: [
            {
              k: "like",
              v: this.$t("zh_include")
            }
          ],
          sourceData: []
        }
      ],
      isCheckAll: false,
      checkNum: 0,
      editData: {},
      totalItem: 0,
      refreshTime: "",
      operateButtons: [
        {
          type: "custom",
          key: "add",
          name: this.$t("zh_create"),
          icon: "/style/static/svgIcon/com/add.svg",
          disabled: true,
          invisible: true,
          isDisabled: true
        },
        {
          type: "delete",
          disabled: true,
          invisible: true,
          isDisabled: true,
          name: this.$t("zh_delete")
        }
      ],
      taskList: [],
      totalPage: 1,
      params: {
        pageSize: 20,
        nowPageIndex: 1
      },
      dialogTitle: "",
      dialog: false,
      tableHeight: 0,
      tableHeight1: 0,
      sysTypeList: [],
      posTypeList: [],
      frequencyTypeList: [],
      isadd: false,
      isupdate: false,
      isdelete: false,
      schedule_labor_buss_type: [],
      convert: {},
      hasConvert: false,
      startTimeMD: null, // 埋点
      startTimeMDCopy: null
    };
  },
  computed: {
    allLoad() {
      return {
        data: this.schedule_labor_buss_type,
        convert: this.convert
      };
    }
  },
  watch: {
    allLoad(data) {
      if (data.data && data.data.length && JSON.stringify(data.convert) != "{}") {
        if (!this.hasConvert) {
          data.data.forEach((obj) => {
            obj.key = data.convert[obj.key];
            return obj;
          });
          this.hasConvert = true;
          this.posTypeList = JSON.parse(JSON.stringify(data.data)).map((obj) => ({name: obj.title, code: obj.key}));
          // !isNum(this.foracastForm.type) && this.$set(this.foracastForm, 'type', getSelectDefaultValue(this.schedule_labor_buss_type))
        }
      }
    },
    checkNum(val) {
      if (this.isdelete) {
        if (val > 0) {
          this.operateButtons[1].isDisabled = false;
        } else {
          this.operateButtons[1].isDisabled = true;
        }
      }
    },
    dialog(val) {
      if (val) {
        console.log("val", val);
        this.$nextTick(() => {
          this.$refs.dialogForm.resetFields();
        });
      }
    }
  },
  created() {
    http.post("/api/schedule-config/pos/type/convert").then((res) => {
      if (res && res.data && res.data.code == 0) {
        this.convert = res.data.data;
      }
    });
    getSelectOptions(["schedule_labor_buss_type"], this);
    document.title = this.$t("zh_title");
    this.getList();
    this.initHeight();
    window.onresize = this.initHeight;
    this.initHeight1();
    window.onresize = this.initHeight1;
    this.getConfigEnum();
    privilegeValidator.checkPageKey(["schedule_pos_dock_config#view", "schedule_pos_dock_config#add", "schedule_pos_dock_config#update", "schedule_pos_dock_config#delete"], (res) => {
      const {code, data} = res.data;
      if (code == 0) {
        if (data.keys.length) {
          data.keys.forEach((item) => {
            if (item == "schedule_pos_dock_config#add") {
              this.isadd = true;
              this.operateButtons[0]["isDisabled"] = false;
              this.operateButtons[0]["invisible"] = false;
            }
            if (item == "schedule_pos_dock_config#update") {
              this.isupdate = true;
            }
            if (item == "schedule_pos_dock_config#delete") {
              this.isdelete = true;
              this.operateButtons[1]["invisible"] = false;
            }
          });
        }
      }
    });
  },
  methods: {
    // 初始化表格高度
    initHeight() {
      var height = document.documentElement.clientHeight || document.body.clientHeight;
      this.tableHeight = height - 200;
    },
    initHeight1() {
      const height = document.documentElement.clientHeight || document.body.clientHeight;
      this.tableHeight1 = height - 480;
    },
    search(data) {
      this.params.searchRequest = data;
      this.params.nowPageIndex = 1;
      this.getList();
    },
    getConfigEnum() {
      http.post(api.listConfigEnum, {}).then((res) => {
        const {data, code, msg} = res.data;
        if (code == 0) {
          this.sysTypeList = data.sysTypeList || [];
          // this.posTypeList = data.posTypeList || []
          this.frequencyTypeList = data.frequencyTypeList || [];
          this.highConfig[2]["sourceData"] = this.sysTypeList.map((item) => {
            return {
              k: item.code,
              v: item.name
            };
          });
        } else {
          this.$message.error(msg);
        }
      });
    },
    checkAll(val) {
      var list = this.taskList;
      if (val) {
        this.checkNum = list.length;
        this.isCheckAll = true;
        list.forEach((item, index) => {
          item.check = true;
        });
      } else {
        this.checkNum = 0;
        this.isCheckAll = false;
        list.forEach((item, index) => {
          item.check = false;
        });
      }
    },
    refresh() {
      this.totalPage = 1;
      this.params.nowPageIndex = 1;
      this.checkNum = 0;
      this.isCheckAll = false;
      this.getList();
    },
    refreshData() {
      this.totalPage = 1;
      this.params.nowPageIndex = 1;
      this.checkNum = 0;
      this.isCheckAll = false;
      this.getList();
    },
    pullUp(index) {
      this.params.nowPageIndex = index;
      this.getList();
    },
    getList() {
      http.post(api.pagination, this.params, "json").then((res) => {
        const {data, code, lastModifiedTime} = res.data;
        if (code === 0) {
          this.refreshTime = lastModifiedTime;
          this.totalItem = data.totalItem;
          this.totalPage = data.totalPage;
          data.list.forEach((item) => {
            item.check = this.isCheckAll;
          });
          if (this.params.nowPageIndex == 1) {
            this.taskList = data.list;
          } else {
            this.taskList = this.taskList.concat(data.list);
          }
          if (this.isCheckAll) {
            this.checkNum = this.taskList.length;
          } else {
            this.checkNum = 0;
          }
        }
      });
    },
    save() {
      this.$refs.dialogForm.validate((form) => {
        var param = JSON.parse(JSON.stringify(form));
        param.did = param.did ? param.did.did : "";
        http.post(api.save, param).then((res) => {
          if (res.data.code === 0) {
            // mtm && mtm.setTrackEvent(this.dialogTitle, +new Date() - this.startTimeMD);
            this.startTimeMD = null;
            this.$message.success(res.data.msg);
            this.refresh();
            this.dialog = false;
          } else {
            this.$message.error(res.data.msg);
          }
        });
      });
    },
    saveItem(data) {
      http.post(api.save, data).then((res) => {
        if (res.data.code === 0) {
          // mtm && mtm.setTrackEvent(this.$t("zh_copyadd"), +new Date() - this.startTimeMDCopy);
          this.startTimeMDCopy = null;
          this.$message.success(res.data.msg);
          this.refresh();
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    operateButtonClick(key) {
      if (key === "add") {
        this.startTimeMD = new Date();
        this.dialogTitle = this.$t("zh_adddia");
        this.dialog = true;
        this.editData = {
          configName: "", // 设置名字
          did: "", // 对接组织节点，部门选择器单选
          sysType: "", // 对接收银系统
          sysDeviceCode: "", // 收银系统标识
          posType: "", // 对接数据
          intervalValue: null, // 数据获取时间间隔
          frequencyType: "", // 时间单位
          startDate: "", // 开始时间
          endDate: "" // 结束时间
        };
      } else if (key === "delete") {
        let bidArr = [];
        let arr = [];
        arr = this.taskList.filter((item) => {
          return item.check;
        });
        arr.forEach((item) => {
          bidArr.push(item.bid);
        });
        this.$confirm(this.$t("zh_warning"), this.$t("zh_tishi"), {
          confirmButtonText: this.$t("zh_sure"),
          cancelButtonText: this.$t("zh_cancel"),
          type: "warning"
        })
          .then(() => {
            http
              .post(
                api.delete,
                {
                  bids: bidArr
                },
                "json"
              )
              .then((res) => {
                const {code, msg} = res.data;
                if (code == 0) {
                  // mtm && mtm.setTrackEvent(this.$t("zh_delete"));
                  this.totalPage = 1;
                  this.params.nowPageIndex = 1;
                  this.getList();
                  this.checkNum = 0;
                  this.isCheckAll = false;
                  this.$message({
                    type: "success",
                    message: this.$t("zh_successdel")
                  });
                } else {
                  this.$message.error(msg);
                }
                bidArr = [];
              });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: this.$t("zh_cd")
            });
          });
      }
    },
    copyItem(data) {
      this.startTimeMDCopy = new Date();
      let newItem = JSON.parse(JSON.stringify(data));
      newItem.bid = "";
      newItem.configName = "";
      this.taskList.unshift(newItem);
    },
    showItem(data) {
      this.startTimeMD = new Date();
      this.dialog = true;
      this.dialogTitle = this.$t("zh_edit");
      let form = JSON.parse(JSON.stringify(data));
      this.editData = form;
    },
    deleteItem(data, index) {
      this.$confirm(this.$t("zh_warning"), this.$t("zh_tishi"), {
        confirmButtonText: this.$t("zh_sure"),
        cancelButtonText: this.$t("zh_cancel"),
        type: "warning"
      })
        .then(() => {
          if (!data.bid) {
            this.taskList.splice(index, 1);
          } else {
            http
              .post(
                api.delete,
                {
                  bids: [data.bid]
                },
                "json"
              )
              .then((res) => {
                const {code, msg} = res.data;
                if (code == 0) {
                  // mtm && mtm.setTrackEvent(this.$t("zh_delete"));
                  this.totalPage = 1;
                  this.params.nowPageIndex = 1;
                  this.getList();
                  this.checkNum = 0;
                  this.isCheckAll = false;
                  this.$message({
                    type: "success",
                    message: this.$t("zh_successdel")
                  });
                } else {
                  this.$message.error(msg);
                }
              });
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: this.$t("zh_cd")
          });
        });
    },
    getChecks(bid, check) {
      this.taskList.map((item) => {
        if (item.bid == bid) {
          item.check = check;
        }
        return item;
      });
      let newArr = this.taskList.filter((item) => {
        return item.check;
      });
      if (newArr.length > 0) {
        this.checkNum = newArr.length;
        if (newArr.length == this.taskList.length) {
          this.isCheckAll = true;
        } else {
          this.isCheckAll = false;
        }
      } else {
        this.checkNum = 0;
        this.isCheckAll = false;
      }
    }
  }
};
</script>
<style lang="less">
.task-setting {
  height: 100%;
}
.demo-drawer {
  width: 520px !important;
  padding-bottom: 50px;
  .demo-drawer__footer {
    position: absolute;
    bottom: 16px;
    right: 16px;
  }
}
.demo-drawer.demo-drawer_group {
  width: 520px !important;
}
</style>
