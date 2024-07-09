<template>
  <el-form class="dialog-form" label-position="top" ref="form" label-width="80px" :model="model" :rules="rules">
    <el-form-item class="row-inline" :label="$t('scheduleDate')" prop="scheduleDate" v-if="scheduleCycle.scheduleCycle == 2">
      <el-date-picker style="width: 100%" v-model="valueData.scheduleDate" type="month" value-format="yyyy-MM"></el-date-picker>
    </el-form-item>
    <el-form-item class="row-inline" :label="$t('scheduleDate')" prop="scheduleDate" v-if="scheduleCycle.scheduleCycle == 1">
      <el-date-picker style="width: 40%" v-model="valueData.scheduleDate" :picker-options="pickerOptionsWeek" type="date" @change="endChange" value-format="yyyy-MM-dd"></el-date-picker>
      至
      <el-input style="width: 40%" disabled v-model="endDateSch"></el-input>
    </el-form-item>
    <el-form-item class="row-inline" :label="$t('scheduleDate')" prop="scheduleDate" v-if="scheduleCycle.scheduleCycle == 0">
      <el-date-picker
        style="width: 100%"
        v-model="valueData.scheduleDate"
        type="daterange"
        range-separator="~"
        value-format="yyyy-MM-dd"
        :start-placeholder="$t('startDate')"
        :end-placeholder="$t('endDate')"></el-date-picker>
    </el-form-item>
    <el-form-item class="row-inline" :label="$t('scheduleDept')" prop="scheduleDept">
      <dep-select v-model="model.scheduleDept" :option="deptOption" @change="changeDept"></dep-select>
    </el-form-item>
  </el-form>
</template>

<script>
import DepSelect from "commonRemote/components/depSelect";
import moment from "moment";
export default {
  props: {
    model: {
      type: Object,
      default() {
        return {
          scheduleDate: [],
          scheduleDept: {}
        };
      }
    },
    scheduleCycle: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  watch: {
    valueData: {
      handler(val, oldVal) {
        if (this.scheduleCycle.scheduleCycle == 0) {
          this.model.scheduleDate = this.valueData.scheduleDate;
        } else if (this.scheduleCycle.scheduleCycle == 1) {
          this.model.scheduleDate = this.valueData.scheduleDate ? [this.valueData.scheduleDate, moment(this.valueData.scheduleDate).add(6, "days").format("YYYY-MM-DD")] : [];
        } else if (this.scheduleCycle.scheduleCycle == 2) {
          this.model.scheduleDate = this.valueData.scheduleDate ? [this.valueData.scheduleDate + "-01", moment(this.valueData.scheduleDate).endOf("month").format("YYYY-MM-DD")] : [];
        }
        console.log("时间吧", this.model.scheduleDate);
      },
      deep: true
    }
  },
  components: {
    DepSelect
  },
  data() {
    return {
      endDateSch: "",
      isLoad: false,
      deptOption: {
        multiple: false,
        showSearch: true,
        privilege: "ht_sch_intelligence_lite",
        placeholder: this.$t("selectDept")
      },
      valueData: {
        scheduleDate: null,
        scheduleDept: {}
      },
      rules: {
        scheduleDate: [
          {
            required: true,
            message: this.$t("pleaseSelectDate"),
            trigger: ["blur", "change"]
          },
          {
            validator: this.dateValidate,
            trigger: "blur",
            message: this.$t("zh_ai_period_31_rule")
          }
        ],
        scheduleDept: [
          {
            required: true,
            message: this.$t("selectDept"),
            trigger: ["blur", "change"]
          },
          {validator: this.checkDid, trigger: ["blur", "change"]}
        ]
      },
      pickerOptionsWeek: {
        disabledDate: (time) => {
          if (this.scheduleCycle.scheduleCycleExtra.dayOfWeek == 7) {
            this.scheduleCycle.scheduleCycleExtra.dayOfWeek = 0;
          }
          if (this.scheduleCycle.scheduleCycle == 1) {
            return moment(time.getTime()).day() != this.scheduleCycle.scheduleCycleExtra.dayOfWeek;
          }
        }
      }
    };
  },
  created() {
    let date = this.model.scheduleDate;
    if (this.scheduleCycle.scheduleCycle == 0) {
      this.valueData.scheduleDate = date.length != 0 ? date : [];
    } else if (this.scheduleCycle.scheduleCycle == 1) {
      if (date.length == 0) {
        this.valueData.scheduleDate = "";
      } else {
        this.valueData.scheduleDate = date[0];
        this.endDateSch = date[0] ? moment(date[0]).add(6, "days").format("YYYY-MM-DD") : "";
      }
    } else if (this.scheduleCycle.scheduleCycle == 2) {
      this.valueData.scheduleDate = date.length == 0 ? "" : date[0].substring(0, 7);
    }
    // this.model.scheduleDate = this.model.scheduleDate[0];
  },
  mounted() {},
  methods: {
    dateValidate(rule, value, callback) {
      if (this.scheduleCycle.scheduleCycle != 0) {
        return callback();
      }
      if (!this.model.scheduleDate.length) {
        return callback(new Error(this.$t("zh_ai_period_rule")));
      }
      console.log(this.model.scheduleDate);
      console.log(Math.abs(this.moment(this.model.scheduleDate[1]).diff(this.model.scheduleDate[0], "d")));
      Math.abs(this.moment(this.model.scheduleDate[1]).diff(this.model.scheduleDate[0], "d")) < 31 ? callback() : callback(new Error(rule.message));
    },
    endChange(data) {
      console.log("改变时间", data);
      this.endDateSch = data ? moment(data).add(6, "days").format("YYYY-MM-DD") : "";
    },
    validate(callback) {
      this.$refs.form.validate((valid) => {
        callback && callback(valid);
      });
    },
    resetField() {
      this.$refs["form"].resetFields();
    },
    changeDept() {
      this.$refs["form"].validateField("scheduleDept");
    },
    checkDid(rule, value, callback) {
      if (value.did || value.did === 0) {
        return callback();
      } else {
        return callback(new Error(this.$t("selectDept")));
      }
    }
  }
};
</script>

<style lang="less" scoped>
.dialog-form {
  padding: 10px 20px;
  .row-inline {
    display: inline-block;
    width: 360px;
    margin-right: 15px;
  }
}
</style>
