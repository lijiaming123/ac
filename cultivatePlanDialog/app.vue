<template>
  <div class="cultivate-plan-dialog" v-loading="loading">
    <div class="content">
      <el-form :inline="true" :model="form" ref="form" label-position="top" :rules="rules">
        <el-form-item :label="$t('zh_emp')" style="width: calc(50% - 20px)" prop="eids">
          <newDepEmp style="width: 80%" id="new-dep" v-model="searchRequest" ref="soltFun" @change="clickSave"></newDepEmp>
        </el-form-item>
        <el-form-item :label="$t('zh_cultivateplanname')" prop="trainingPlanName" style="width: calc(50% - 20px)">
          <el-select style="width: 80%" v-model="form.trainingPlanName" :placeholder="$t('zh_select')" @change="nameChange">
            <el-option v-for="item in nameData" :label="item.name" :key="item.bid" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div style="margin-bottom: 10px">
        <i @click="addcultivate" style="margin-right: 10px; font-size: 16px" class="el-icon-circle-plus-outline"></i>
        <span>{{ $t("zh_addclutivateplan") }}</span>
      </div>
      <!-- 课程列表 -->
      <div v-for="(item, index) in cultivateData" :key="index" style="margin-top: 10px">
        <div style="font-size: 18px; margin-bottom: 6px">
          <span style="margin-right: 10px">{{ item.course_name }}</span>
          <i class="el-icon-remove-outline" @click="deletecultivate(index)"></i>
        </div>
        <div style="font-size: 14px; color: #ccc">{{ $t("zh_workhour") }}{{ item.totalhour }}H</div>
        <wq-table :data="item.tabledata" :row-style="{height: '40px'}" :pagination="false" :showPaging="false" style="border-left: 1px solid #eaedf2; margin-top: 10px" :split-screen="false">
          <el-table-column :label="$t('zh_number')" width="80">
            <template slot-scope="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('zh_traintask')" prop="training_tasks__name"></el-table-column>
          <el-table-column :label="$t('zh_trainworkhour')" width="140" prop="training_time_standard"></el-table-column>
          <el-table-column :label="$t('zh_traincoach')" prop="positionDescription">
            <template slot-scope="scope">
              <newDepEmp style="width: 50%" id="new-dep" v-model="scope.row.searchRequest" @change="rowclickSave($event, item, scope.row)"></newDepEmp>
            </template>
          </el-table-column>
          <el-table-column :label="$t('zh_taketraintask')" prop="training_task__name"></el-table-column>
        </wq-table>
      </div>
    </div>
    <div class="footer-button">
      <el-button @click="close">{{ $t("zh_close") }}</el-button>
      <el-button type="primary" @click="save">{{ $t("zh_save") }}</el-button>
    </div>
    <el-dialog :title="$t('zh_addclutivateplan')" custom-class="cultvivatelist-dialog" :visible.sync="dialogVisible" width="60%">
      <wq-table
        :data="cultivateList"
        ref="cultivatetable"
        :row-style="{height: '40px'}"
        :pagination="false"
        :showPaging="false"
        style="border-left: 1px solid #eaedf2; margin-top: 10px"
        :split-screen="false"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column :label="$t('zh_coursename')" prop="course_name"></el-table-column>
        <el-table-column :label="$t('zh_coursecode')" prop="course_code"></el-table-column>
        <el-table-column :label="$t('zh_hourdetail')" prop="hours_datail">
          <!-- <template slot-scope="scope">
                {{scope.row["task_list.training_time_standard"]}}
              </template> -->
        </el-table-column>
      </wq-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t("zh_cancel") }}</el-button>
        <el-button type="primary" @click="sureAdd">{{ $t("zh_sure") }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import http from "commonRemote/services/http";
const newDepEmp = () => import("commonRemote/components/selectMember/newDepEmp");

import moment from "moment";
export default {
  components: {
    newDepEmp
  },
  data() {
    return {
      loading: false,
      eid: "",
      bid: "",
      cid: "",
      dialogVisible: false,
      form: {
        eids: [],
        trainingPlanName: ""
      },
      rules: {
        trainingPlanName: [{required: true, message: this.$t("zh_enter"), trigger: "change"}],
        eids: [
          {required: true, message: this.$t("zh_selectemp"), trigger: "change"},
          {validator: this.checkConditionVilidate, trigger: "change"}
        ]
      },
      searchRequest: {
        chooserConfig: {
          mode: "emp",
          multiple: true,
          privilege: "pagefunction_list_employee_training_plan",
          hasTerminated: false
        },
        mode: "multipleEmp",
        fieldValue: [],
        powerAttr: {
          disabled: false
        }
      },
      cultivateList: [],
      selectcultivate: [],
      cultivateData: [],
      detaildata: [],
      nameData: [],
      selectnameData: {}
    };
  },
  async created() {
    this.cid = window.globalData._u2cid_;
    this.bid = this.getUrl().bid;
    await this.getNameData();
    if (this.bid) {
      await this.detail(this.bid);
      this.searchRequest.powerAttr.disabled = true;
      // this.searchRequest.fieldValue = [this.bid];
    }
    this.getList();
  },
  computed: {},
  watch: {},
  methods: {
    getNameData() {
      return new Promise((resolve, reject) => {
        http.post("/api/shared-foundation/shared/option/getListOptionItem4OuterBids", {outerBids: ["pxjhmc"]}).then((res) => {
          const {data, code, msg} = res.data;
          if (code == 0) {
            console.log(data);
            data.pxjhmc &&
              data.pxjhmc.forEach((obj) => {
                obj.name = obj.title;
                obj.value = obj.key;
              });
            this.nameData = data.pxjhmc || [];
            resolve();
          } else {
            this.$message.error(msg);
            resolve();
          }
        });
      });
    },
    nameChange(value) {
      this.selectnameData = this.nameData.find((obj) => {
        return (obj.value == value);
      });
      console.log(this.selectnameData, this.form.trainingPlanName);
    },
    detail(bid) {
      return new Promise((resolve, reject) => {
        http.post("/api/customb-schedule/jc/training/detail", {cid: this.cid, bid: bid}).then((res) => {
          const {code, data, msg} = res.data;
          if (code == 0 && data != null) {
            console.log(data);
            this.searchRequest.fieldValue = [{eid: data.eid, name: data.eidName}];
            this.form.eids = [data.eid];
            this.form.trainingPlanName = data.trainingPlanName.value;
            this.selectnameData = data.trainingPlanName;
            this.detaildata = data.curriculums;
            if (this.detaildata.length > 0) {
              this.detaildata.forEach((detailobj) => {
                let cloneobj = JSON.parse(JSON.stringify(detailobj));
                detailobj.tabledata = [];
                detailobj.totalhour = 0;
                detailobj.bid = detailobj.curriculum;
                detailobj.courseList.forEach((detailchildobj) => {
                  detailobj.totalhour += Number(detailchildobj.trainingTimeStandard);
                  let param = {
                    searchRequest: {
                      chooserConfig: {
                        multiple: false,
                        privilege: "pagefunction_list_employee_training_plan",
                        hasTerminated: false
                      },
                      mode: "multipleEmp",
                      fieldValue: detailchildobj.coaches ? [{eid: detailchildobj.coaches, name: detailchildobj.coachesName}] : [],
                      powerAttr: {
                        disabled: false
                      }
                    },
                    if_need: detailchildobj.ifNeed,
                    training_task: detailchildobj.trainingTask,
                    training_task__name: detailchildobj.trainingTaskName,
                    training_tasks: detailchildobj.trainingTasks,
                    training_tasks__name: detailchildobj.trainingTasksName,
                    training_time_standard: detailchildobj.trainingTimeStandard
                  };
                  if (param.if_need === "1") {
                    param.searchRequest.powerAttr.disabled = true;
                  }
                  detailobj.tabledata.push(param);
                  // for (let i = cloneobj.tabledata.length - 1; i >= 0; i--) {
                  //   if (detailchildobj.trainingTasks == cloneobj.tabledata[i].training_tasks) {
                  //     cloneobj.tabledata[i].searchRequest.fieldValue = detailchildobj.coaches ? [{eid: detailchildobj.coaches, name: detailchildobj.coachesName}] : [];
                  //     cloneobj.tabledata[i].if_need = detailchildobj.ifNeed;
                  //     cloneobj.tabledata[i].training_task = detailchildobj.trainingTask;
                  //     cloneobj.tabledata[i].training_task__name = detailchildobj.trainingTaskName;
                  //     cloneobj.tabledata[i].training_tasks = detailchildobj.trainingTasks;
                  //     cloneobj.tabledata[i].training_tasks__name = detailchildobj.trainingTasksName;
                  //     cloneobj.tabledata[i].training_time_standard = detailchildobj.trainingTimeStandard;
                  //   } else {
                  //     cloneobj.tabledata.splice(i, 1)
                  //   }
                  // }
                });
                // cloneobj.course_name = '';
                detailobj.course_name = detailobj.curriculumName || "";
                this.cultivateData.push(detailobj);
              });
            }
            resolve();
          } else {
            this.$message.error(msg);
            resolve();
          }
        });
      });
    },
    getUrl() {
      var params = function (val, queryObj) {
        val = val.replace(/^[\?#]?/, "");
        queryObj = queryObj || {};
        val.split("?").forEach((e) => {
          e.split("&").forEach((kv) => {
            var item;
            if ((item = /(.*)=(.*)/.exec(kv))) {
              queryObj[item[1]] = decodeURIComponent(item[2]);
            }
          });
        });
        return queryObj;
      };
      return params(location.search, params(location.hash));
    },
    clickSave(val) {
      console.log(val);
      this.searchRequest.fieldValue = val;
      this.form.eids = val.map((obj) => {
        return obj.eid;
      });
      if (val && val.length) {
        this.$refs.form.clearValidate("eids");
      } else {
        this.$refs.form.validate("eids");
      }
    },
    addcultivate() {
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.cultivatetable.clearSelection();
        this.cultivateList.forEach((obj) => {
          this.cultivateData.forEach((item) => {
            if (obj.bid == item.bid) {
              this.$refs.cultivatetable.toggleRowSelection(obj);
            }
          });
        });
      });
    },
    handleSelectionChange(val) {
      this.selectcultivate = val;
    },
    checkConditionVilidate(rule, value, callback) {
      if (value && value.length) {
        return callback();
      } else {
        return callback(new Error(this.$t("zh_selectemp")));
      }
    },
    getList() {
      this.loading = true;
      http
        .post("/api/shared-data/shareddata/api/listV2", {
          cid: null,
          operatorUid: null,
          operatorEid: null,
          operatorLanguage: null,
          operatorTimeZone: null,
          operator: null,
          paramCid: this.cid,
          categoryBid: null,
          categoryId: 500000174,
          formCategoryId: null,
          defBid: null,
          fields: ["course_name", "course_code", "bid", "hours_datail"],
          criteria: {chain: [{code: "status", opr: "EQ", value: 0, value1: null, inValue: null}], criteria: null, whereSql: null},
          orderBy: null,
          groupBy: null,
          groupByCount: false,
          pagination: null,
          distinct: false,
          ignoreStatus: null,
          latestVal: false,
          queryType: null,
          assistField: false,
          needFieldCal: false,
          isSensitive: null,
          listCode: null,
          masterDb: false
        })
        .then((res) => {
          const {code, data, msg} = res.data;
          if (code == 0) {
            console.log(data);
            this.cultivateList = data || [];
            let bids = [];
            this.cultivateList.forEach((obj) => {
              obj.tabledata = [];
              obj.totalhour = 0;
              bids.push(obj.bid);
            });
            if (bids.length > 0) {
              this.listByBids(bids);
            } else {
              this.loading = false;
            }
          } else {
            this.loading = false;
            this.$message.error(msg);
          }
        });
    },
    sureAdd() {
      if (this.selectcultivate.length > 0) {
        // this.listByBids()
        let arr = JSON.parse(JSON.stringify(this.selectcultivate));
        let cultivatearr = JSON.parse(JSON.stringify(this.cultivateData));
        arr.forEach((obj) => {
          cultivatearr.forEach((detailobj) => {
            if (obj.bid == detailobj.bid) {
              obj = JSON.parse(JSON.stringify(detailobj));
            }
          });
        });
        this.cultivateData = JSON.parse(JSON.stringify(arr));
        this.dialogVisible = false;
      } else {
        this.dialogVisible = false;
      }
    },
    listByBids(bids) {
      http
        .post("/api/shared-data/shareddata/api/listV2", {
          cid: null,
          operatorUid: null,
          operatorEid: null,
          operatorLanguage: null,
          operatorTimeZone: null,
          operator: null,
          paramCid: 60000134,
          categoryBid: null,
          categoryId: 500000175,
          formCategoryId: null,
          defBid: null,
          fields: ["bid", "parent_bid", "training_tasks", "training_tasks__name", "training_time_standard", "training_task", "training_task__name", "if_need", "if_need__name"],
          criteria: {
            chain: [
              {code: "status", opr: "EQ", value: 0, value1: null, inValue: null},
              {code: "parent_bid", opr: "IN", value: null, value1: null, inValue: bids}
            ],
            criteria: null,
            whereSql: null
          },
          orderBy: null,
          groupBy: null,
          groupByCount: false,
          pagination: null,
          distinct: false,
          ignoreStatus: null,
          latestVal: false,
          queryType: null,
          assistField: false,
          needFieldCal: false,
          isSensitive: null,
          listCode: null,
          masterDb: false
        })
        .then((res) => {
          const {code, data, msg} = res.data;
          if (code == 0) {
            this.loading = false;
            console.log(data);
            this.cultivateList.forEach((obj) => {
              // obj.tabledata = [];
              // obj.totalhour = 0;
              data.forEach((item) => {
                if (item.parent_bid == obj.bid) {
                  item.searchRequest = {
                    chooserConfig: {
                      multiple: false,
                      privilege: "pagefunction_list_employee_training_plan",
                      hasTerminated: false
                    },
                    mode: "multipleEmp",
                    fieldValue: [],
                    powerAttr: {
                      disabled: false
                    }
                  };
                  if (item.if_need === "1") {
                    item.searchRequest.powerAttr.disabled = true;
                  }
                  obj.tabledata.push(item);
                  obj.totalhour += Number(item.training_time_standard);
                }
              });
              if(this.detaildata.length > 0) {
                this.detaildata.forEach((detailobj) => {
                  if(detailobj.curriculum == obj.bid) {
                    obj.tabledata = detailobj.tabledata
                  }
                })
              }
            });
          } else {
            this.$message.error(msg);
          }
        });
    },
    deletecultivate(index) {
      this.cultivateData.splice(index, 1);
    },
    rowclickSave(val, item, row) {
      console.log(val, item, this.cultivateList, row);
      this.cultivateList.forEach(obj => {
        if(obj.bid == item.bid) {
          obj.tabledata.forEach(childobj => {
            if(childobj.bid == row.bid) {
              childobj.searchRequest.fieldValue = val;
            }
          })
        }
      })
      row.searchRequest.fieldValue = val;
    },
    save() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.cultivateData.length == 0) {
            return this.$message.error(this.$t("zh_pleaseaddclutivateplan"));
          }
          let param = {
            bid: this.bid,
            curriculums: [
              // {
              // 	"courseList": [
              // 		{
              // 			"coaches": 0,
              // 			"coachesName": 0,
              // 			"ifNeed": "",
              // 			"ifNeedName": "",
              // 			"trainingTask": "",
              // 			"trainingTaskName": "",
              // 			"trainingTasks": "",
              // 			"trainingTasksName": "",
              // 			"trainingTimeStandard": 0
              // 		}
              // 	],
              // 	"curriculum": "",
              // 	"curriculumName": "",
              // 	"trainingStandardTime": 0
              // }
            ],
            eids: this.form.eids,
            trainingPlanName: {
              name: this.selectnameData.name,
              value: this.selectnameData.value
            },
            trainingTime: 0
          };
          let noemp = false;
          this.cultivateData.forEach((obj, index) => {
            param.trainingTime += obj.totalhour;
            param.curriculums[index] = {
              curriculum: obj.bid,
              curriculumName: obj.course_name,
              trainingStandardTime: obj.totalhour,
              courseList: []
            };
            obj.tabledata.forEach((item) => {
              if (item.if_need == "0" && item.searchRequest.fieldValue && !item.searchRequest.fieldValue[0]) {
                noemp = true;
              }
              param.curriculums[index].courseList.push({
                coaches: item.searchRequest.fieldValue && item.searchRequest.fieldValue[0] && item.searchRequest.fieldValue[0].eid,
                coachesName: item.searchRequest.fieldValue && item.searchRequest.fieldValue[0] && item.searchRequest.fieldValue[0].name,
                ifNeed: item.if_need,
                ifNeedName: item.if_need__name,
                trainingTask: item.training_task,
                trainingTaskName: item.training_task__name,
                trainingTasks: item.training_tasks,
                trainingTasksName: item.training_tasks__name,
                trainingTimeStandard: item.training_time_standard
              });
            });
          });
          if (noemp) {
            return this.$message.error(this.$t("zh_pleaseaddcoach"));
          }
          http.post("/api/customb-schedule/jc/training/save", param).then((res) => {
            const {code, data, msg} = res.data;
            if (code == 0) {
              this.$message.success(msg);
              window.parent && window.parent.postMessage({code: "sys_save"});
              console.log(data);
            } else {
              this.$message.error(msg);
            }
          });
        } else {
          return false;
        }
      });
    },
    close() {
      window.parent && window.parent.postMessage({code: "sys_close"});
    }
  }
};
</script>
<style lang="less" scoped>
.cultivate-plan-dialog {
  height: 100%;
  background: #fff;
  .content {
    height: calc(100% - 80px);
    overflow: auto;
  }
  .footer-button {
    margin-right: 20px;
    padding-top: 10px;
    border-top: 1px solid #ccc;
    width: 100%;
    margin-top: 10px;
    button {
      float: right;
      margin-right: 10px;
    }
  }
  :deep(.el-dialog__body) {
    height: 300px;
    overflow: auto;
  }
}
</style>
