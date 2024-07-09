<script>
import DepSelect from "commonRemote/components/depSelect";
import {scheduleCheck,revocationCheck} from "../api";
import moment from "moment";

export default {
  name: "ScheduleCheckModal",
  data() {
    return {
      form: {
        department: [],
        date: undefined
      },
      loading: false
    };
  },
  props: {
    type: String
  },
  methods: {
    reset() {
      this.form = {
        department: [],
        date: undefined
      };
    },
    // 全局排班
    async handleConfirm() {
      await this.serachChangeData();
      const valid = Object.values(this.form).every((v) => !!v);
      if (!valid) {
        this.$message.error(this.$t("zh_missing_params"));
        return;
      }
      const {department, date} = this.form;
      const depTreeQueryList = this.searchChangeDep(department);
      const metaQueryList = [
        {
          metaField: "schedule_month",
          metaObj: "schedule_config_cycle",
          symbols: ["eq"],
          values: [moment(date).format("YYYY-MM")]
        }
      ];
      const params = {
        depTreeQueryList,
        metaQueryList,
        logic: "and",
        permission: {
          usage: this.permission
        }
      };
      if (!this.type) return
      const fn = this.type === 'check' ? scheduleCheck : revocationCheck
      this.loading = true
      const res = await fn(params).finally(() => {
        this.loading = false
      });
      const {data, code, msg = this.$t("zh_unknown_error")} = res.data;
      if (code === 0) {
        this.$message.success(data);
        this.close();
      } else {
        this.$message.error(msg);
      }
    },

    // 部门选择输出和高级搜索一样格式 逻辑照搬高级搜索
    searchChangeDep(item) {
      const depTreeQueryList = [];
      const _item = {
        metaField: "name",
        metaObj: "work_unit",
        value: item
      };
      var flag = true;
      depTreeQueryList.forEach((metaItem) => {
        if (_item.metaObj === metaItem.metaObj && _item.metaField === metaItem.metaField) {
          metaItem.symbols = ["like"];
          metaItem.values = _item.value;
          flag = false;
        }
      });
      if (!flag && !_item.value.length) {
        depTreeQueryList.length = 0;
        return;
      }
      if (flag) {
        depTreeQueryList.push({
          metaObj: _item.metaObj,
          metaField: _item.metaField,
          symbols: ["like"],
          values: _item.value
        });
      }
      return depTreeQueryList;
    },
    // 部门选择 补齐子部门  逻辑照搬高级搜索
    async serachChangeData() {
      const deps = await this.$refs.depSelect.getChildWorkUnit();
      const values = this.form.department;
      values.forEach((value) => {
        value.childDids = (deps[value.did] || []).map((dep) => dep.did);
        value.did = Number(value.did);
      });
    },

    close() {
      this.$emit("close");
    }
  },
  render() {
    return (
      <div>
        {
          this.type === 'check' ? (
            <div class="dialog-tip">
              <i class="el-icon-warning-outline" />
              <span>{this.$t("zh_check_tips")}</span>
            </div>) : 
            null
        }
        <div>
          <DepSelect
            ref="depSelect"
            class="mt-10 w100"
            v-model={this.form.department}
            option={{
              placeholder: this.$t("zh_choose_dep"),
              multiple: true,
              showSearch: true,
              privilege: "schedule_task_setting_emp#view"
            }}
          />
          <el-date-picker class="mt-10 w100" v-model={this.form.date} type="month" placeholder={this.$t("zh_choose_date")} />
        </div>
        <div style="text-align: right; margin-top: 20px">
          <el-button loading={this.loading} type="primary" on-click={this.handleConfirm}>
            {this.type === 'check' ? this.$t("zh_btn_confirm") : this.$t("zh_btn2_confirm")}
          </el-button>
          <el-button on-click={this.close}>{this.$t("zh_btn_cancel")}</el-button>
        </div>
      </div>
    );
  }
};
</script>

<style lang="less" scoped>
.dialog-tip {
  display: flex;
  & > i {
    color: #ff9a04;
    font-size: 24px;
    margin-right: 8px;
  }
  & > span {
    flex: 1;
    flex-shrink: 0;
  }
}
</style>
