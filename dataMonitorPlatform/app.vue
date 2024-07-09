<template>
  <div class="fightSetting wq-page-table-content">
    <wq-page-head
      :title="$t('zh_title1')"
      :refresh-time="refreshTime"
      :operate-buttons="operateButtons"
      @operate-click="operateButtonClick"
      :hideStar="true"
      :total="allDids.length"
      @refresh="refreshData"></wq-page-head>
    <high-search privilege="schedule_data_forecast_acc#view" pageId="adv_search_1000000643826128" @change="search" :hideSearch="true" :autoInit="true"></high-search>
    <div class="wq-page-table-content--table" ref="wqPagetTableContent">
      <wq-table
        :total="allDids.length"
        ref="shiftTable"
        :data="listData"
        :border-header="true"
        style="margin: 0 auto; box-shadow: none"
        v-loading="loading"
        :maxHeight="tableHeight"
        border
        :currentPageNum="tableParam.pageIndex"
        :pageSize="tableParam.pageSize"
        @currentPageChange="handleCurrentChange">
        <!-- 组织名称 -->
        <el-table-column :label="$t('zh_ori_name')" prop="deptName"></el-table-column>
        <!-- 组织编码 -->
        <el-table-column :label="$t('zh_ori_id')" prop="deptCode"></el-table-column>
        <!-- 时段准确率达标标准 -->
        <el-table-column :label="$t('zh_time_accuracy_rate_standard')">
          <template slot="header">
            <span>{{ $t("zh_time_accuracy_rate_standard") }}</span>
            <el-tooltip placement="top" :content="$t('zh_time_accuracy_rate_standard_tip')">
              <wq-img src="/style/static/svgIcon/com/undefined.svg" style="width: 13px; height: 13px; cursor: pointer" />
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <span>{{ scope.row.timeAccuracyAchieve }}{{ !scope.row.timeAccuracyAchieve || scope.row.timeAccuracyAchieve == "-" ? "" : "%" }}</span>
          </template>
        </el-table-column>
        <!-- 时段允许偏差值 -->
        <el-table-column :label="$t('zh_allowable_deviation_time')">
          <template slot="header">
            <span>{{ $t("zh_allowable_deviation_time") }}</span>
            <el-tooltip placement="top" :content="$t('zh_allowable_deviation_time_tip')">
              <wq-img src="/style/static/svgIcon/com/undefined.svg" style="width: 13px; height: 13px; cursor: pointer" />
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <span>
              {{ scope.row.timeAllowDiff == null ? "-" : scope.row.timeAllowDiff }}
            </span>
          </template>
        </el-table-column>
        <!-- 日准确率达标值 -->
        <el-table-column :label="$t('zh_standard_value_daily_accuracy')">
          <template slot="header">
            <span>{{ $t("zh_standard_value_daily_accuracy") }}</span>
            <el-tooltip placement="top" :content="$t('zh_standard_value_daily_accuracy_tip')">
              <wq-img src="/style/static/svgIcon/com/undefined.svg" style="width: 13px; height: 13px; cursor: pointer" />
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <span>{{ scope.row.dateAccuracyAchieve }}{{ !scope.row.dateAccuracyAchieve || scope.row.dateAccuracyAchieve == "-" ? "" : "%" }}</span>
          </template>
        </el-table-column>
        <!-- xx天合格率（基于日准确率达标值） -->
        <el-table-column>
          <template slot="header" slot-scope="scope">
            <span>{{ timePosition + $t("zh_days_pass_rate") }}</span>
            <el-tooltip placement="top" :content="$t('zh_days_pass_rate_tip')">
              <wq-img src="/style/static/svgIcon/com/undefined.svg" style="width: 13px; height: 13px; cursor: pointer" />
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <span>{{ scope.row.dateXAchieveRate }}{{ !scope.row.dateXAchieveRate || scope.row.dateXAchieveRate == "-" ? "" : "%" }}</span>
          </template>
        </el-table-column>
        <!-- 日期 -->
        <el-table-column :label="$t('zh_date')">
          <template slot-scope="scope">
            <li v-for="(item, index) in scope.row.posAnalyzeAccuracyDateList" :key="index" :style="item.curDate ? '' : 'border-bottom: 0'">
              {{ item.curDate ? item.curDate : $t("zh_average_value") }}
            </li>
          </template>
        </el-table-column>
        <!-- 准确率 -->
        <el-table-column>
          <template slot="header">
            <span>{{ $t("zh_accuracy_rate") }}</span>
            <el-tooltip placement="top" :content="$t('zh_accuracy_rate_tip')">
              <wq-img src="/style/static/svgIcon/com/undefined.svg" style="width: 13px; height: 13px; cursor: pointer" />
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <li v-for="(item, index) in scope.row.posAnalyzeAccuracyDateList" :key="index" :style="item.curDate ? '' : 'border-bottom: 0'">
              {{ item.accuracyDayValue }}{{ item.accuracyDayValue == "-" ? "" : "%" }}
            </li>
          </template>
        </el-table-column>
        <!-- 合格率（基于允许偏差值） -->
        <el-table-column>
          <template slot="header">
            <span>{{ $t("zh_pass_rate_deviation") }}</span>
            <el-tooltip placement="top" :content="$t('zh_pass_rate_deviation_tip_1')">
              <wq-img src="/style/static/svgIcon/com/undefined.svg" style="width: 13px; height: 13px; cursor: pointer" />
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <li v-for="(item, index) in scope.row.posAnalyzeAccuracyDateList" :key="index" :style="item.curDate ? '' : 'border-bottom: 0'">
              {{ item.qualifiedOnDiffValue }}{{ item.qualifiedOnDiffValue == "-" ? "" : "%" }}
            </li>
          </template>
        </el-table-column>
        <!-- 合格率（基于时段准确率达标值） -->
        <el-table-column :label="$t('zh_pass_rate_accuracy')">
          <template slot="header">
            <span>{{ $t("zh_pass_rate_accuracy") }}</span>
            <el-tooltip placement="top" :content="$t('zh_pass_rate_accuracy_tip')">
              <wq-img src="/style/static/svgIcon/com/undefined.svg" style="width: 13px; height: 13px; cursor: pointer" />
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <li v-for="(item, index) in scope.row.posAnalyzeAccuracyDateList" :key="index" :style="item.curDate ? '' : 'border-bottom: 0'">
              {{ item.qualifiedOnAccuracyValue }}{{ item.qualifiedOnAccuracyValue == "-" ? "" : "%" }}
            </li>
          </template>
        </el-table-column>
      </wq-table>
    </div>
    <!-- <div class="paginationBox">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="tableParam.pageIndex"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="tableParam.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="allDids.length"
        popper-class="pagination-center"></el-pagination>
    </div> -->
    <export-mask :loading.sync="exportLoad" :param="exportParam" :title="$t('zh_export_title')"></export-mask>
  </div>
</template>

<script>
import HighSearch from "commonRemote/components/highSearchNew";
import http from "commonRemote/services/http";
import privilegeValidator from "commonRemote/services/privilegeValidator";
import exportMask from "commonRemote/components/exportMask";
import moment from "moment";
import tableStyle from "commonRemote/mixins/tableStyle";
export default {
  data() {
    return {
      title: this.$t("zh_title1"),
      isCheckAll: false,
      refreshTime: "",
      allDids: [],
      tableParam: {
        pageSize: 20,
        displayDids: [],
        pageIndex: 1
      },
      params: {
        // 请求列表接口的参数 --didList部门列表数组
        startDate: "",
        endDate: "",
        extParam: "",
        didList: [],
        type: ""
      },
      timePosition: "",
      dateValue: {},
      // rangeObj:{
      //   'rangeNum':30, // 第n天之后
      //   'status':true, // 开启
      //   'date':'', // 无值取选择的开始日期
      //   'position':'later'// 置灰的位置：later 之后，pre之前
      // },
      operateButtons: [
        {
          type: "export",
          key: "export",
          name: this.$t("zh_export"),
          disabled: false,
          invisible: true,
          isDisabled: true
        }
      ],
      tableHeight: 0,

      listData: [], // 列表数据
      loading: false,
      exportLoad: false,
      exportParam: {
        key: "schedule_monitorForecastAccuracy",
        callBackParam: JSON.stringify({})
      }
    };
  },
  mixins: [tableStyle],
  components: {
    HighSearch,
    exportMask
  },
  created() {
    document.title = this.$t("zh_title1");
    // this.initHeight();
    // window.onresize = this.initHeight;
    this.getData();
    privilegeValidator.checkPageKey(["schedule_data_forecast_acc#view"], (res) => {
      const {code, data} = res.data;
      if (code == 0) {
        if (data.keys.length) {
          data.keys.forEach((item) => {
            if (item == "schedule_data_forecast_acc#view") {
              this.operateButtons[0]["isDisabled"] = false;
              this.operateButtons[0]["invisible"] = false;
            }
          });
        }
      }
    });
  },
  methods: {
    // initHeight() {
    //   const height = document.documentElement.clientHeight || document.body.clientHeight;
    //   this.tableHeight = height - 235;
    // },
    checkAll(val) {
      this.isCheckAll = val ? true : false;
      this.$refs.shiftTable.toggleAllSelection();
    },

    refreshData() {
      this.refreshTime = "";
      this.params = {
        // 请求列表接口的参数 --didList部门列表数组
        startDate: "",
        endDate: "",
        extParam: "",
        didList: [],
        type: ""
      };
      this.tableParam = {
        pageSize: 10,
        displayDids: [],
        pageIndex: 1
      };
      this.allDids = [];
      this.listData = [];
    },
    search(data) {
      // 高级搜索返回已选部门列表
      this.refreshData();

      // if (data.depTreeQueryList.length !== 0 && data.depTreeQueryList[0].values) {
      //   data.depTreeQueryList[0].values.forEach(dep => {
      //     dep.did && this.params.didList.push(dep.did)
      //   });
      // }
      // if (data.metaQueryList.length !== 0) {
      //   data.metaQueryList.forEach(pa => {
      //     if (pa.metaObj == 'date_obj') { // 高级搜索拿日期
      //       this.params.startDate = pa.values[0];
      //       this.params.endDate = pa.values[1];
      //     } else { // 高级搜索拿业务类型
      //       this.params.type = pa.values[0];
      //     }
      //   });
      // }
      // this.getData();
      this.getDidsData(data);
    },

    getData() {
      // 获取子组织didLists
      this.loading = true;
      http.post("/api/schedule-forecast/pos/analyze/accuracy/init", this.params).then((res) => {
        this.loading = false;
        const {data, code, lastModifiedTime} = res.data;
        if (code == 0) {
          this.allDids = data;
          this.getDisplayDids();
          this.getTableData();
        }
      });
    },

    getDidsData(data) {
      //获取子组织didLists

      http
        .post("/api/schedule-forecast/pos/analyze/accuracy/initHS", {
          condition: {searchRequests: [data]}
        })
        .then((res) => {
          this.loading = false;
          const {data, code, lastModifiedTime} = res.data;
          if (code == 0) {
            console.log("高级搜索的数据", data);
            this.allDids = data.didList;
            this.params.startDate = data.startDate;
            this.params.endDate = data.endDate;
            this.params.type = data.type;
            let d = moment(this.params.endDate).diff(moment(this.params.startDate), "day") + 1 || "";
            if (!isNaN(d) && d > 31) return this.$message.warning(this.$t("zh_more_31"));
            this.timePosition = d;
            this.getDisplayDids();
            this.getTableData();
          }
        });
    },
    getTableData() {
      // 获取当前页数据
      this.loading = true;
      this.listData = [];
      http
        .post("/api/schedule-forecast/pos/analyze/accuracy", {
          didList: this.tableParam.displayDids,
          endDate: this.params.endDate,
          extParam: "",
          startDate: this.params.startDate,
          type: this.params.type
        })
        .then((res) => {
          this.loading = false;
          const {data, code, lastModifiedTime} = res.data;
          if (code == 0) {
            this.listData = data;
          }
        });
    },
    operateButtonClick(key) {
      if (key === "export") {
        this.exportParam.callBackParam = JSON.stringify({
          searchRequest: {
            didList: this.allDids,
            endDate: this.params.endDate,
            extParam: "",
            startDate: this.params.startDate,
            type: this.params.type
          }
        });
        this.exportLoad = true;
      }
    },
    handleCurrentChange(ele, pageSize) {
      this.tableParam.pageIndex = ele;
      this.tableParam.pageSize = pageSize;
      this.getDisplayDids();
      this.getTableData();
    },
    handleSizeChange(ele) {
      this.tableParam.pageSize = ele;
      this.getDisplayDids();
      this.getTableData();
    },
    getDisplayDids() {
      this.tableParam.displayDids = this.allDids.filter(
        (did, index) => index >= (this.tableParam.pageIndex - 1) * this.tableParam.pageSize && index < this.tableParam.pageIndex * this.tableParam.pageSize
      );
    }
  }
};
</script>

<style lang="less" scoped>
:deep(.el-table) {
  // min-height: 700px;
  .el-table__body {
    .el-table_1_column_7,
    .el-table_1_column_8,
    .el-table_1_column_9,
    .el-table_1_column_10 {
      .cell {
        padding: 0;
        li {
          list-style: none;
          // text-align: center;
          text-indent: 10px;
          height: 24px;
          border-bottom: 1px solid #eaedf2;
        }
      }
    }
  }
}

.el-icon-warning-outline {
  font-size: 15px;
  transform: rotate(180deg);
  -ms-transform: rotate(180deg); /* IE 9 */
  -moz-transform: rotate(180deg); /* Firefox */
  -webkit-transform: rotate(180deg); /* Safari 和 Chrome */
  -o-transform: rotate(180deg); /* Opera */
}
.paginationBox {
  background-color: #f4f6f8;
  position: fixed;
  bottom: 20px;
  right: 12px;
}
</style>
