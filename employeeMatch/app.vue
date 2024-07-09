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
      <high-search privilege="schedule_config_emp_attribute#view" @change="search" :config="highConfig" :hideSearch="true"></high-search>
      <wq-list :refresh-time="refreshTime" @refresh-list="pullUp" :total-page="totalPage" :current-page="params.nowPageIndex" style="position: relative" :style="{height: tableHeight + 'px'}">
        <el-col :span="6" v-for="(item, index) in taskList" :key="index" style="margin-bottom: 20px">
          <card
            :cardData="item"
            :check="item.check"
            @showDialogBox="showItem"
            @deleteItem="deleteItem"
            @copyItem="copyItem"
            @saveItem="saveItem"
            @setCheck="getChecks"
            :cntedit="isupdate"
            :cntdelete="isdelete"
            :cntadd="isadd"></card>
        </el-col>
      </wq-list>
    </div>
    <wq-drawer :visible.sync="dialog" :title="dialogTitle" :wrapperClosable="false" custom-class="demo-drawer">
      <div class="demo-drawer__content">
        <dialog-form v-if="dialog" :cardData="editData" ref="dialogForm"></dialog-form>
      </div>
      <div class="demo-drawer__footer">
        <el-button @click="dialog = false">{{ $t("zh_cancel") }}</el-button>
        <el-button type="primary" @click="save">{{ $t("zh_save") }}</el-button>
      </div>
    </wq-drawer>
    <file-upload :visible.sync="uploadVisible" :uploadConfig="uploadConfig" @success="uploadSuccess"></file-upload>
  </div>
</template>
<script>
import HighSearch from "commonRemote/components/highSearch";
import FileUpload from "commonRemote/components/fileUpload";
import http from "commonRemote/services/http";
import privilegeValidator from "commonRemote/services/privilegeValidator";
import api from "./api";
const card = () => import("./card.vue");
const DialogForm = () => import("./dialog.vue");
export default {
  name: "taskSetting",
  components: {
    card,
    DialogForm,
    HighSearch,
    FileUpload
  },
  data() {
    return {
      highConfig: [
        {
          metaObj: "employee-match",
          fieldName: this.$t("zh_danyuan"),
          metaField: "dids",
          fieldSearchType: "organization_tree",
          alias: this.$t("zh_danyuan"),
          toolTip: this.$t("zh_danyuan"),
          logicOperate: [
            {
              k: "in",
              v: this.$t("zh_include")
            }
          ]
        },
        {
          metaObj: "employee-match",
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
        }
      ],
      isCheckAll: false,
      checkNum: 0,
      editData: {
        name: "",
        content: "",
        didList: [],
        shortCode: "",
        matchingRuleObjList: [
          {
            settingType: "",
            settingValue: "",
            subType: "",
            type: "",
            number: 1,
            index: 1
          }
        ]
      },
      totalItem: 0,
      refreshTime: "",
      operateButtons: [
        {
          type: "custom",
          key: "add",
          name: this.$t("zh_add"),
          icon: "/style/static/svgIcon/com/add.svg",
          disabled: true,
          invisible: true,
          isDisabled: true
        },
        {
          type: "delete",
          disabled: true,
          isDisabled: true,
          invisible: true,
          name: this.$t("zh_delete")
        },
        {type: "import", invisible: true, name: this.$t("zh_import")}
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
      saveOnce: true,
      isadd: false,
      isupdate: false,
      isdelete: false,
      uploadVisible: false,
      uploadConfig: {
        bucketKey: "schedule_import_emp_matching_properties"
      },
      startTimeMD: null // 埋点
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
    this.initHeight();
    window.onresize = this.initHeight;
    privilegeValidator.checkPageKey(
      ["schedule_config_emp_attribute#view", "schedule_config_emp_attribute#add", "schedule_config_emp_attribute#update", "schedule_config_emp_attribute#delete"],
      (res) => {
        const {code, data} = res.data;
        if (code == 0) {
          if (data.keys.length) {
            data.keys.forEach((item) => {
              if (item == "schedule_config_emp_attribute#add") {
                this.isadd = true;
                this.operateButtons[0]["isDisabled"] = false;
                this.operateButtons[0]["invisible"] = false;
              }
              if (item == "schedule_config_emp_attribute#update") {
                this.operateButtons[2]["invisible"] = false;
                this.isupdate = true;
              }
              if (item == "schedule_config_emp_attribute#delete") {
                this.isdelete = true;
                this.operateButtons[1]["invisible"] = false;
              }
            });
          }
        }
      }
    );
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
    copyItem(data) {
      this.startTimeMD = new Date();
      let newItem = JSON.parse(JSON.stringify(data));
      delete newItem.bid;
      newItem.name += "copy";
      newItem.code = "";
      newItem.shortCode = "";
      // this.taskList.unshift(newItem);
      this.dialogTitle = this.$t("zh_copy");
      this.editData = newItem;
      this.dialog = true;
      this.saveOnce = true;
    },
    saveItem(data) {
      var param = JSON.parse(JSON.stringify(data));
      let matchingRuleObjList = param.matchingRuleObjList.map((item, index) => {
        item.number = index + 1;
        return item;
      });
      param.matchingRuleObjList = matchingRuleObjList;
      http.post(api.save, param).then((res) => {
        if (res.data.code === 0) {
          // mtm && mtm.setTrackEvent(this.$t("zh_copy"), +new Date() - this.startTimeMDCopy);
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
      if (this.saveOnce) {
        this.saveOnce = false;
        this.$refs.dialogForm.validate((valid, form) => {
          if (valid) {
            var param = JSON.parse(JSON.stringify(form));
            console.log(param, "rrrrrrrr");
            let matchingRuleObjList = param.matchingRuleObjList.map((item, index) => {
              item.number = index + 1;
              return item;
            });
            param.matchingRuleObjList = matchingRuleObjList;
            http.post(api.save, param).then((res) => {
              if (res.data.code === 0) {
                // mtm && mtm.setTrackEvent(this.dialogTitle, +new Date() - this.startTimeMD);
                this.startTimeMD = null;
                this.$message.success(res.data.msg);
                this.refresh();
                this.dialog = false;
                this.saveOnce = true;
              } else {
                this.saveOnce = true;
                this.$message.error(res.data.msg);
              }
            });
          } else {
            this.saveOnce = true;
          }
        });
      }
    },
    operateButtonClick(key) {
      if (key === "add") {
        this.startTimeMD = new Date();
        this.dialogTitle = this.$t("zh_create");
        this.dialog = true;
        this.saveOnce = true;
        this.editData = {
          name: "",
          content: "",
          didList: [],
          shortCode: "",
          matchingRuleObjList: [
            {
              settingType: "",
              settingValue: "",
              subType: "",
              type: "",
              number: 1,
              index: 1
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
        this.$confirm(this.$t("zh_warningmsg"), this.$t("zh_tishi"), {
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
              message: this.$t("zh_canceldel")
            });
          });
      } else if (key === "import") {
        this.uploadVisible = true;
      }
    },
    showItem(data) {
      this.startTimeMD = new Date();
      this.dialog = true;
      this.dialogTitle = this.$t("zh_edit");
      this.editData = data;
      this.saveOnce = true;
    },
    deleteItem(data, index) {
      this.$confirm(this.$t("zh_warningmsg"), this.$t("zh_tishi"), {
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
            message: this.$t("zh_canceldel")
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
    },
    uploadSuccess() {
      // mtm && mtm.setTrackEvent(this.$t("zh_import"));
      this.refresh();
    }
  }
};
</script>
<style lang="less">
// .task-setting {
//   height: 100%;
// }
.demo-drawer {
  width: 960px !important;
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
  .el-form-item__label {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
