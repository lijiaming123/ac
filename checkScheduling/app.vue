<script>
import HighSearch from "commonRemote/components/highSearch";
import ScheduleCheckModal from "./components/scheduleCheckModal";
import Cell from "./components/cell";
import moment from "moment";
import {getRangeTime} from "./utils";
import {getData, scheduleCheckBatch, revocationCheckBatch} from "./api";
import privilegeValidator from "commonRemote/services/privilegeValidator";

const taskFields = ["gmtStart", "gmtEnd", "name"];

export default {
  name: "checkScheduling",
  components: {ScheduleCheckModal},
  data() {
    return {
      //表格
      tableProps: {
        data: [],
        loading: false,
        "split-screen": false,
        "cell-class-name": ({column, row, rowIndex, columnIndex}) => {
          const isDateCell = this.columns[columnIndex].cellType === "schedulingCell";
          if (isDateCell) {
            const col = this.columns[columnIndex];
            const date = col.prop.split("-")[1];
            return row[`${date}_diff`] ? "diff date-cell" : "";
          }
        }
        // 'max-height': 40
      },
      // 表格数据列
      columnsFixedLeft: [
        {
          type: "selection",
          fixed: "left",
          width: 55
        },
        {
          prop: "jobCode",
          label: this.$t("zh_table_jobCode"),
          fixed: "left",
          width: 100
        },
        {
          prop: "name",
          label: this.$t("zh_table_name"),
          fixed: "left",
          width: 80
        },
        {
          prop: "dateOfJoin",
          label: this.$t("zh_table_dateOfJoin"),
          fixed: "left",
          width: 90
        },
        {
          prop: "dateOfLeave",
          label: this.$t("zh_table_dateOfLeave"),
          fixed: "left",
          width: 90
        },
        {
          prop: "dep",
          label: this.$t("zh_table_dep"),
          fixed: "left",
          width: 110
        },
        {
          prop: "attendanceHours",
          label: this.$t("zh_table_attendanceHours"),
          fixed: "left",
          width: 50
        }
      ],
      columnsDate: [],
      columnsFixedRight: [
        {
          label: this.$t("zh_table_action"),
          scopedSlots: {
            default: ({row, $index}) => (
              <div>
                <el-button disabled={row.hasCheck} loading={row.jobCode && this.loading[row.jobCode]} on-click={() => this.handleCheck(row)}>
                  {this.$t("zh_btn_check_scheduling_tbl")}
                </el-button>
                <el-button loading={row.jobCode && this.loading[row.jobCode]} on-click={() => this.handleRevocation(row)}>
                  {this.$t("zh_btn_revocation_check_scheduling_tbl")}
                </el-button>
              </div>
            )
          },
          width: 200,
          fixed: "right"
        }
      ],
      // 页头
      pageHeadProps: {
        total: 0,
        checkedNumber: 0,
        showSearchOperate: false,
        showNum: true,
        refreshTime: "",
        operateButtons: [
          {
            type: "custom",
            key: "checkScheduling",
            icon: "/style/static/svg/Setting.svg",
            name: this.$t("zh_btn_check_scheduling"),
            disabled: false
          },
          {
            type: "custom",
            key: "revocationCheckScheduling",
            icon: "/style/static/svg/Setting.svg",
            name: this.$t("zh_btn_revocation_check_scheduling"),
            disabled: false
          },
          {
            type: "custom",
            key: "checkSchedulingALL",
            icon: "/style/static/svg/Setting.svg",
            name: this.$t("zh_btn_check_scheduling_all"),
            disabled: false
          },
          {
            type: "custom",
            key: "revocationCheckSchedulingALL",
            icon: "/style/static/svg/Setting.svg",
            name: this.$t("zh_btn_revocation_check_scheduling_all"),
            disabled: false
          }
        ]
      },
      // 高级搜索
      highSearchProps: {
        privilege: "schedule_task_check#view",
        pageId: "schedule_task_check_search",
        hideSearch: false
      },
      // 分页信息
      pagination: {
        nowPageIndex: 1,
        pageSize: 10
      },
      paginationProps: {
        total: 0,
        pageSizes: [10, 20, 30, 40],
        popperClass: "pagination-center",
        layout: "total, sizes, prev, pager, next, jumper"
      },

      // dialog 显示
      modal: {
        check: {
          name: "ScheduleCheckModal",
          title: this.$t("zh_btn_check_scheduling_all_modal"),
          props: {
            type: "check"
          },
          visible: false
        },
        revocation: {
          name: "ScheduleCheckModal",
          title: this.$t("zh_btn_revocation_scheduling_all_modal"),
          props: {
            type: "revocation"
          },
          visible: false
        }
      },
      currentModal: "",

      selectList: [],

      // page permission
      permission: "schedule_task_check#view",

      loading: {},
      tableKey: ""
    };
  },
  computed: {
    columns() {
      return [
        ...this.columnsFixedLeft.map((v) => ({
          ...v,
          "show-overflow-tooltip": true,
          width: Reflect.has(v, "width") ? v.width : 120,
          align: "center"
        })),
        ...this.columnsDate.map((v) => ({
          ...v,
          width: 112,
          align: "center",
          cellType: "schedulingCell"
        })),
        ...this.columnsFixedRight.map((v) => ({...v, align: "center"}))
      ];
    }
  },
  created() {
    this.init();
  },
  watch: {
    selectList: {
      handler(val) {
        if (val.length) {
          this.pageHeadProps.checkedNumber = val.length;
          this.pageHeadProps.checkedAll = val.length == this.tableProps.data.length;
        } else {
          this.pageHeadProps.checkedNumber = 0;
          this.pageHeadProps.checkedAll = false;
        }
      },
      deep: true
    }
  },
  methods: {
    init() {
      // 初始化高级搜索入参
      this.params = {};
      this.privilegeValidatorFun();
      this.initDateColumns();
    },
    getDate() {
      const d = this.getSearchDate().split("-");
      const year = d[0];
      const month = d[1] - 1;
      // const year = '2021';
      // const month = '8';
      const days = moment(this.getSearchDate()).daysInMonth();
      const date = getRangeTime(moment().year(year).month(month).date(1), moment().year(year).month(month).date(days));
      return date;
    },
    initDateColumns() {
      this.tableKey = this.getSearchDate();
      const date = this.getDate();
      this.columnsDate = date.map((datePayload) => ({
        prop: `date-${datePayload.date.replace(/-/g, "")}`,
        scopedSlots: {
          default: ({row}) => {
            const dataStr = datePayload.date.replace(/-/g, "");
            const source = row[`source_${dataStr}`] || [];
            const target = row[`target_${dataStr}`] || [];
            return <Cell diff={row[`${dataStr}_diff`]} source={source} target={target} />;
          },
          header: () => (
            <div style="width: 100%">
              <p class="table-date-title">{datePayload.date}</p>
              <p class="table-date-tip">{this.$t(datePayload.day)}</p>
            </div>
          )
        }
      }));
    },
    privilegeValidatorFun() {
      const allPrivilegeItems = ["schedule_task_check"];
      privilegeValidator.checkPageKey(allPrivilegeItems, ({data, code}) => {
        if (code === 0) {
          // debugger
          // this.operateButtons
        }
      });
    },
    async getData() {
      this.tableProps.loading = true;
      this.loading = {};
      this.initSelect();
      const {data: resData} = await getData({
        ...this.pagination,
        ...this.params
      }).finally(() => {
        this.tableProps.loading = false;
      });
      const {code, msg, totalItem, data = []} = resData;
      if (code !== 0) {
        this.$message.error(msg);
        return;
      }
      this.paginationProps.total = totalItem;
      this.pageHeadProps.total = totalItem;
      const baseFields = ["eid", "hasCheck", ...this.columnsFixedLeft.map((v) => v.prop)].filter(Boolean);

      this.tableProps.data = (data || []).map((v) => {
        const {newTasks, sourcesTasks} = v;
        const fillinFn = (tasks, prefix) => ({
          ...tasks.reduce((prev, task) => {
            const date = moment(task.gmtStart).format("YYYYMMDD");
            if (Reflect.has(prev, `${prefix}_${date}`)) {
              prev[`${prefix}_${date}`].push(task);
            } else {
              prev[`${prefix}_${date}`] = [task];
            }
            return prev;
          }, {})
        });
        const targetTasks = fillinFn(newTasks, "target");
        const sourceTasks = fillinFn(sourcesTasks, "source");

        const date = this.getDate();
        const diffMap = {};
        date.forEach((datePayload) => {
          const dataStr = datePayload.date.replace(/-/g, "");
          const target = targetTasks[`target_${dataStr}`] || [];
          const source = sourceTasks[`source_${dataStr}`] || [];
          // 判断是否为同一班次(名字, 起始和结束时间相同为同班次)
          const check = (s, t) => taskFields.every((key) => s[key] === t[key]);

          // 标记不同的班次
          let diff = source.length !== target.length;
          if (source.length && source.length === target.length) {
            diff = source.some((sourceTask) => {
              return !target.some((targetTask) => check(sourceTask, targetTask));
            });
          }
          diffMap[`${dataStr}_diff`] = diff;
        });

        return {
          ...baseFields.reduce((prev, prop) => {
            prev[prop] = v[prop];
            return prev;
          }, {}),
          ...diffMap,
          ...fillinFn(newTasks, "target"),
          ...fillinFn(sourcesTasks, "source")
        };
      });
    },

    // 批量处理
    async dealBatch(eids, type = "check") {
      if (!eids.length) {
        this.$message.error(this.$t("zh_pls_choose_staff"));
        return;
      }
      if (!Reflect.has(this.params, "metaQueryList") || !this.tableProps.data.length) return;
      const yearMonth = this.getSearchDate();
      const fn = type === "check" ? scheduleCheckBatch : revocationCheckBatch;
      const {data} = await fn({eids, yearMonth});
      const {code, msg, data: successMsg} = data;
      if (code === 0) {
        this.$message.success(successMsg);
        this.getData();
      } else {
        this.$message.error(msg);
      }
    },

    // 获取高级搜索的当前时间
    getSearchDate() {
      let result = moment().format("YYYY-MM");
      if (Reflect.has(this.params, "metaQueryList") && this.params.metaQueryList.length) result = this.params.metaQueryList[0].values[0];
      return result;
    },

    // 高级搜索查询
    search(data) {
      this.params = data;
      this.pagination.nowPageIndex = 1;
      this.initDateColumns();
      // this.$refs.table.$forceUpdate()
      this.getData();
    },
    operateButtonClick(key) {
      switch (key) {
        case "checkScheduling": // 批量
          this.dealBatch(this.selectList, "check");
          break;
        case "checkSchedulingALL": // 全量
          this.toggleModal("check");
          break;
        case "revocationCheckScheduling": // 批量撤销
          this.dealBatch(this.selectList, "revocation");
          break;
        case "revocationCheckSchedulingALL": // 全量撤销
          this.toggleModal("revocation");
          break;

        default:
          break;
      }
    },
    toggleModal(modalName) {
      this.currentModal = modalName;
      this.modal[this.currentModal].visible = true;
    },
    refresh() {
      this.pagination.nowPageIndex = 1;
      this.getData();
    },

    // 单条班次校验
    handleCheck(payload) {
      this.$set(this.loading, payload.jobCode, true);
      this.dealBatch([payload.eid]).finally(() => {
        this.$set(this.loading, payload.jobCode, false);
      });
    },
    // 单条班次撤销
    handleRevocation(payload) {
      this.$set(this.loading, payload.jobCode, true);
      this.dealBatch([payload.eid], "revocation").finally(() => {
        this.$set(this.loading, payload.jobCode, false);
      });
    },

    handleSelectionChange(list) {
      this.selectList = [];
      list.forEach((element) => {
        // 防止重复添加
        !this.selectList.includes(element.eid) && this.selectList.push(element.eid);
      });
    },

    handlePageChange(val) {
      this.pagination.nowPageIndex = val;
      this.getData();
    },
    handleSizeChange(val) {
      this.pagination.nowPageIndex = 1;
      this.pagination.pageSize = val;
      this.getData();
    },
    initSelect() {
      this.$refs.table.store.commit("setAllSelected", false);
      this.selectList = [];
      this.$refs.table.store.clearSelection();
    },
    handleDialogClose() {
      this.modal[this.currentModal].visible = false;
      this.$refs.modalInstance.reset && this.$refs.modalInstance.reset();
    }
  },
  render() {
    return (
      <div class="check-scheduling-wrap">
        <wq-page-head ref="wqPageHead" title={this.$t("zh_page_title")} {...{props: this.pageHeadProps}} on-refresh={this.refresh} on-operate-click={this.operateButtonClick} />
        <HighSearch autoInit={false} {...{props: this.highSearchProps}} on-change={this.search} />
        <wq-table
          v-loading={this.tableProps.loading}
          key={this.tableKey}
          ref="table"
          row-key="eid"
          border-header
          style="width: 98%; margin: 0 auto; box-shadow: none"
          on-selection-change={this.handleSelectionChange}
          {...{props: this.tableProps}}>
          {
            this.columns.map((column) => (
              <el-table-column key={column.prop} {...Object.assign({props: column}, column.scopedSlots ? {scopedSlots: column.scopedSlots} : {})} />
            ))
            // this.columns.map(column => column.scopedSlots ? <el-table-column {...{ props: column, scopedSlots: column.scopedSlots }} /> : <el-table-column {...{ props: column }} />)
          }
        </wq-table>
        <div class="pagination mt-10">
          <el-pagination
            // current-page={this.pagination.nowPageIndex}
            // page-size={this.pagination.pageSize}
            {...{
              props: {
                "current-page": this.pagination.nowPageIndex,
                "page-size": this.pagination.pageSize,
                ...this.paginationProps
              },
              on: {
                "update:currentPage": (val) => (this.paginationProps.nowPageIndex = val),
                "current-change": this.handlePageChange,
                "size-change": this.handleSizeChange
              }
            }}
          />
        </div>
        <el-dialog
          title={this.currentModal ? this.modal[this.currentModal].title : ""}
          visible={this.currentModal ? this.modal[this.currentModal].visible : false}
          on={{
            "update:visible": (val) => (this.modal[this.currentModal].visible = val)
          }}
          width="360px"
          on-close={this.handleDialogClose}>
          {() =>
            h(this.modal[this.currentModal].name, {
              ref: "modalInstance",
              props: {
                ...this.modal[this.currentModal].props
              },
              on: {
                close: () => (this.modal[this.currentModal].visible = false)
              }
            })
          }
        </el-dialog>
      </div>
    );
  }
};
</script>

<style>
@import url(./style.less);
</style>

<style lang="less" scoped>
// .ml-5 {
//     margin-left: 5px;
// }
// .mr-5 {
//     margin-right: 5px;
// }
// .mt-10 {
//     margin-top: 10px;
// }
// .w100 {
//     width: 100%;
// }
.pagination {
  :deep(.el-pagination) {
    display: inline-block;
  }
  text-align: right;
}

:deep(.table-date-title),
:deep(.table-date-tip) {
  margin: 0;
}
:deep(.table-date-tip) {
  font-size: 12px;
  line-height: 12px;
  color: #9ca3a9;
}
:deep(td) {
  &.diff {
    padding: 2px 1px;
    background: #d3e6f0;
    border: 2px solid #fff;
  }
}

:deep(.date-cell) {
  padding: 0;
  .cell {
    line-height: 42px;
    // margin: 2px 1px;
    display: block;
    // &.diff {
    //   background: #d3e6f0;
    // }
  }
  .flex {
    display: flex;
    justify-content: center;
  }
}
</style>
