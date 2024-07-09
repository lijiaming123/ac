<template>
  <el-form class="dialog-form" label-position="top" ref="form" label-width="80px" :model="model" :rules="rules">
    <el-form-item prop="dataList">
      <el-table :data="model.dataList" style="width: 100%" key="businessTable">
        <el-table-column :label="$t('businessStartTime')" width="270">
          <template slot-scope="scope">
            <el-form-item :prop="'dataList.' + scope.$index + '.start'" :show-message="false" :rules="rules.start">
              <el-time-select
                :placeholder="$t('selectStartTime')"
                v-model="scope.row.start"
                :picker-options="{
                  start: '00:00',
                  step: '00:15',
                  end: '24:00'
                }"></el-time-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column :label="$t('businessEndTime')" width="270">
          <template slot-scope="scope">
            <el-form-item :prop="'dataList.' + scope.$index + '.end'" :show-message="false" :rules="rules.end">
              <el-time-select
                :placeholder="$t('selectEndTime')"
                v-model="scope.row.end"
                :picker-options="{
                  start: '00:00',
                  step: '00:15',
                  end: '24:00'
                }"></el-time-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column :label="$t('applyDate')">
          <template slot-scope="scope">
            <el-form-item :prop="'dataList.' + scope.$index + '.dates'" :show-message="false" :rules="rules.dates">
              <el-date-picker type="dates" style="width: 90%" value-format="yyyy-MM-dd" v-model="scope.row.dates" :picker-options="pickerOptions" :placeholder="$t('selectApplyDate')"></el-date-picker>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column :label="$t('operate')" width="140">
          <template slot-scope="scope">
            <el-button type="text" @click="addHours(scope.$index)">
              {{ $t("zh_addnew") }}
            </el-button>
            <el-button type="text" @click="deleteHours(scope.$index)" :disabled="model.dataList.length <= 1">
              {{ $t("zh_delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  props: {
    model: {
      type: Object,
      default() {
        return {
          dataList: [
            {
              start: "",
              end: "",
              dates: []
            }
          ]
        };
      }
    },
    shiftData: {
      type: Object
    }
  },
  data() {
    return {
      rules: {
        start: [
          {
            required: true,
            message: this.$t("selectStartTime"),
            trigger: ["blur", "change"]
          }
        ],
        end: [
          {
            required: true,
            message: this.$t("selectEndTime"),
            trigger: ["blur", "change"]
          }
        ],
        dates: [
          {
            required: true,
            message: this.$t("selectApplyDate"),
            trigger: ["blur", "change"]
          }
        ]
      }
    };
  },
  created() {},
  computed: {
    pickerOptions() {
      let that = this;
      return {
        disabledDate(time) {
          const start = that.shiftData.scheduleDate[0];
          const end = that.shiftData.scheduleDate[1];
          return that.moment(time).isBefore(that.moment(start)) || that.moment(time).isAfter(that.moment(end));
        }
      };
    }
  },
  methods: {
    validate(callback) {
      this.$refs.form.validate((valid) => {
        callback && callback(valid);
      });
    },
    addHours(index) {
      this.model.dataList.push({
        start: "",
        end: "",
        dates: []
      });
    },
    deleteHours(index) {
      if (this.model.dataList.length > 1) {
        this.model.dataList.splice(index, 1);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.dialog-form {
  padding: 15px;
}
</style>
