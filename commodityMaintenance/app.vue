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
        isShowTotal
        @refresh="refreshData"></wq-page-head>
      <high-search privilege="schedule_config_goods#view" :config="highConfig" @change="search" :hideSearch="true"></high-search>
      <wq-list :refresh-time="refreshTime" @refresh-list="pullUp" :total-page="totalPage" :current-page="params.nowPageIndex" style="position: relative" :style="{height: tableHeight + 'px'}">
        <el-col :span="6" v-for="(item, index) in taskList" :key="index" style="margin-bottom: 20px">
          <card
            :cardData="item"
            :check="item.check"
            @showDialogBox="showItem"
            @deleteItem="deleteItem"
            @copyItem="copyItem"
            @saveItem="saveItem"
            :checkCode="checkCode"
            @setCheck="getChecks"
            :cntedit="isupdate"
            :cntdelete="isdelete"
            :cntadd="isadd"></card>
        </el-col>
      </wq-list>
      <wq-drawer :visible.sync="dialog" :title="dialogTitle" :wrapperClosable="false" custom-class="demo-drawer">
        <div class="demo-drawer__content">
          <dialog-form v-if="dialog" :cardData="editData" ref="dialogForm" :groupList="groupList" :checkCode="checkCode"></dialog-form>
        </div>
        <div class="demo-drawer__footer">
          <el-button @click="dialog = false">{{ $t("zh_cancel") }}</el-button>
          <el-button type="primary" @click="save">
            {{ $t("zh_save") }}
          </el-button>
        </div>
      </wq-drawer>
    </div>
    <wq-drawer :visible.sync="dialog" :title="dialogTitle" :wrapperClosable="false" custom-class="demo-drawer">
      <div class="demo-drawer__content">
        <dialog-form v-if="dialog" :cardData="editData" ref="dialogForm" :groupList="groupList" :checkCode="checkCode"></dialog-form>
      </div>
      <div class="demo-drawer__footer">
        <el-button @click="dialog = false">{{ $t("zh_cancel") }}</el-button>
        <el-button type="primary" @click="save">{{ $t("zh_save") }}</el-button>
      </div>
    </wq-drawer>
  </div>
</template>
<script>
import HighSearch from "commonRemote/components/highSearch";
import http from "commonRemote/services/http";
import privilegeValidator from "commonRemote/services/privilegeValidator";
import api from "./api";
// import card from "./card.vue";
// import DialogForm from "./dialog.vue";
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
          metaObj: "commodity",
          fieldName: this.$t("zh_zz"),
          metaField: "dids",
          fieldSearchType: "organization_tree",
          alias: this.$t("zh_zz"),
          toolTip: this.$t("zh_zz"),
          logicOperate: [
            {
              k: "in",
              v: this.$t("zh_include")
            }
          ]
        },
        {
          metaObj: "commodity",
          metaField: "name",
          fieldSearchType: "text",
          alias: this.$t("zh_name"),
          toolTip: this.$t("zh_name"),
          logicOperate: [
            {
              k: "like",
              v: this.$t("zh_include")
            }
          ]
        },
        {
          metaObj: "commodity",
          metaField: "code",
          fieldSearchType: "text",
          alias: this.$t("zh_code"),
          toolTip: this.$t("zh_code"),
          logicOperate: [
            {
              k: "like",
              v: this.$t("zh_include")
            }
          ]
        }
      ],
      isCheckAll: false,
      checkNum: 0,
      editData: {
        code: "",
        name: "",
        content: "",
        didList: [],
        taskObjList: [
          {
            number: 1,
            presetTime: 0,
            taskBid: ""
          }
        ]
      },
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
        nowPageIndex: 1,
        pageSize: 20
      },
      dialogTitle: "",
      dialog: false,
      tableHeight: "",
      groupList: [],
      isadd: false,
      isupdate: false,
      isdelete: false,
      startTimeMD: null, // 埋点
      startTimeMDCopy: null
    };
  },
  watch: {
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
        this.$nextTick(() => {
          this.$refs.dialogForm.resetFields();
        });
      }
    }
  },
  created() {
    document.title = this.$t("zh_title");
    this.getList();
    this.getGroupList();
    this.initHeight();
    window.onresize = this.initHeight;
    privilegeValidator.checkPageKey(["schedule_config_goods#view", "schedule_config_goods#add", "schedule_config_goods#update", "schedule_config_goods#delete"], (res) => {
      const {code, data} = res.data;
      if (code == 0) {
        if (data.keys.length) {
          data.keys.forEach((item) => {
            if (item == "schedule_config_goods#add") {
              this.isadd = true;
              this.operateButtons[0]["isDisabled"] = false;
              this.operateButtons[0]["invisible"] = false;
            }
            if (item == "schedule_config_goods#update") {
              this.isupdate = true;
            }
            if (item == "schedule_config_goods#delete") {
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
      this.tableHeight = height - 220;
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
    search(data) {
      this.params.searchRequest = data;
      this.params.nowPageIndex = 1;
      this.getList();
    },
    getGroupList() {
      http.post(api.groupList, {group: false}, "json").then((res) => {
        const {data, code, msg} = res.data;
        if (code === 0) {
          if (data.length != 0) {
            this.groupList = data.map((item) => {
              return {
                label: item.name,
                value: item.bid
              };
            });
          }
        } else {
          this.$message.error(msg);
        }
      });
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
      http.post(api.findPagination, this.params, "json").then((res) => {
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
    checkCode(data, callback) {
      http.post(api.checkCode, data).then((res) => {
        if (!res.data.data.duplicate) {
          callback(true);
        } else {
          callback(false, res.data.data.message);
        }
      });
    },
    copyItem(data) {
      this.startTimeMDCopy = new Date();
      let newItem = JSON.parse(JSON.stringify(data));
      delete newItem.bid;
      newItem.name = "";
      newItem.code = "";
      this.taskList.unshift(newItem);
    },
    saveItem(data) {
      var param = JSON.parse(JSON.stringify(data));
      let taskObjList = param.taskObjList.map((item, index) => {
        item.number = index + 1;
        return item;
      });
      param.taskObjList = taskObjList;
      http.post(api.save, param).then((res) => {
        if (res.data.code === 0) {
          // mtm && mtm.setTrackEvent(this.$t("zh_copyadd"), +new Date() - this.startTimeMDCopy);
          this.startTimeMDCopy = null;
          this.$message.success(res.data.msg);
          this.refresh();
          this.dialog = false;
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    save() {
      this.$refs.dialogForm.validate((form) => {
        let param = JSON.parse(JSON.stringify(form));
        let taskObjList = param.taskObjList.map((item, index) => {
          item.number = index + 1;
          return item;
        });
        param.taskObjList = taskObjList;
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
    operateButtonClick(key) {
      if (key === "add") {
        this.startTimeMD = new Date();
        this.dialogTitle = this.$t("zh_adddia");
        this.dialog = true;
        this.editData = {
          code: "",
          name: "",
          content: "",
          didList: [],
          taskObjList: [
            {
              number: 1,
              presetTime: 0,
              taskBid: ""
            }
          ]
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
    showItem(data) {
      this.startTimeMD = new Date();
      this.dialog = true;
      this.dialogTitle = this.$t("zh_edit");
      this.editData = data;
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
  width: 735px !important;
  .el-drawer__body {
    overflow: hidden;
  }
  .demo-drawer__content {
    height: calc(100% - 50px);
    overflow-y: auto;
    overflow-x: hidden;
  }
  .demo-drawer__footer {
    position: absolute;
    bottom: 16px;
    right: 16px;
  }
}
</style>
