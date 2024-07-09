<template>
  <el-form class="dialog-form noBorder" label-position="top" ref="form" label-width="80px" :model="formData" :rules="rules">
    <el-form-item :label="$t('rule_code')" prop="code">
      <el-input v-model="formData.code" disabled class="inputStyle"></el-input>
    </el-form-item>
    <el-form-item :label="$t('config_type')" prop="suitType">
      <el-select v-model="formData.suitType" :disabled="!!formData.bid" @change="configChange" :placeholder="$t('please_select')" class="inputStyle">
        <el-option v-for="item in suitTypeList" :key="item.code" :label="item.name" :value="item.code"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('apply_range')" prop="suitDeps">
      <dep-select v-model="formData.suitDeps" class="inputStyle" :option="depOption.option"></dep-select>
    </el-form-item>
    <el-form-item v-if="formData.suitType == 'emp'" key="applyTimes" :label="$t('max_apply_num')" prop="applyTimes">
      <el-input v-model="formData.applyTimes" :placeholder="$t('please_input_natural_number')" class="inputStyle"></el-input>
    </el-form-item>
    <el-form-item v-if="formData.suitType == 'emp'" key="cycleType" :label="$t('statistical_cycle')" prop="cycleType">
      <el-select v-model="formData.cycleType" :placeholder="$t('please_select_statistical_cycle')" class="inputStyle">
        <el-option v-for="item in cycleTypeList" :key="item.code" :label="item.name" :value="item.code"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item v-if="formData.suitType == 'emp'" key="cycleNums" :label="$t('time_range')" prop="cycleNums">
      <el-input v-model="formData.cycleNums" :placeholder="$t('please_input_number')" class="inputStyle"></el-input>
    </el-form-item>
    <el-form-item :label="$t('start_date')" prop="startDate">
      <el-date-picker v-model="formData.startDate" value-format="yyyy-MM-dd" type="date" :placeholder="$t('please_select_date')" class="inputStyle"></el-date-picker>
    </el-form-item>
    <el-form-item :label="$t('end_date')" prop="endDate">
      <el-date-picker v-model="formData.endDate" value-format="yyyy-MM-dd" type="date" :placeholder="$t('please_select_date')" class="inputStyle"></el-date-picker>
    </el-form-item>
    <el-form-item v-if="formData.suitType == 'org'" key="applyNums" :label="$t('valiable_apply_num')" prop="applyNums">
      <el-input v-model="formData.applyNums" :placeholder="$t('please_input_natural_number')" class="inputStyle"></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
import DepSelect from "commonRemote/components/depSelect";
export default {
  components: {
    DepSelect
  },
  props: {
    formData: {
      type: Object,
      default() {
        return {};
      }
    },
    suitTypeList: {
      type: Array,
      default() {
        return [];
      }
    },
    cycleTypeList: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      depOption: {
        option: {
          multiple: true,
          showSearch: true,
          privilege: "schedule_sch_unavailability_limit#view",
          placeholder: this.$t("please_select")
        }
      },
      rules: {
        code: [
          {
            required: true,
            message: this.$t("please_input_code"),
            trigger: "change"
          }
        ],
        suitType: [
          {
            required: true,
            message: this.$t("please_select_config_type"),
            trigger: "change"
          }
        ],
        suitDeps: [
          {
            required: true,
            message: this.$t("please_select_apply_scope"),
            trigger: "change"
          }
        ],
        applyTimes: [
          {
            required: true,
            pattern: /^[1-9]\d*$|^0$/,
            message: this.$t("please_input_natural_number"),
            trigger: "blur"
          }
        ],
        cycleType: [
          {
            required: true,
            message: this.$t("please_select_statistical_cycle"),
            trigger: "change"
          },
          {validator: this.outRangeValid, trigger: "change"}
        ],
        cycleNums: [
          {
            required: true,
            pattern: /^[1-9]\d*$/,
            message: this.$t("please_input_number"),
            trigger: "blur"
          },
          {validator: this.outRangeValid, trigger: "blur"}
        ],
        startDate: [
          {
            required: true,
            message: this.$t("please_select_date"),
            trigger: ["blur", "change"]
          },
          {validator: this.ruleStartLtEnd, trigger: ["blur", "change"]}
        ],
        endDate: [
          {
            required: true,
            message: this.$t("please_select_date"),
            trigger: ["blur", "change"]
          },
          {validator: this.ruleStartLtEnd, trigger: ["blur", "change"]}
        ],
        applyNums: [
          {
            required: true,
            pattern: /^[1-9]\d*$|^0$/,
            message: this.$t("please_input_natural_number"),
            trigger: "blur"
          }
        ]
      },
      formatDateType: {
        day: "days",
        week: "weeks",
        month: "months",
        year: "years"
      }
    };
  },
  created() {},
  methods: {
    validate(callback) {
      this.$refs.form.validate((valid) => {
        callback && callback(valid);
      });
    },
    resetField() {
      this.$refs["form"].resetFields();
    },
    configChange() {
      this.formData.applyTimes = "";
      this.formData.cycleType = "";
      this.formData.cycleNums = "";
      this.formData.applyNums = "";
    },
    ruleStartLtEnd(rule, value, callback) {
      if (this.formData.startDate && this.formData.endDate) {
        if (this.formData.startDate > this.formData.endDate) {
          return callback(new Error(this.$t("ruleStartLtEnd")));
        } else {
          if (this.formData.cycleType && /^[1-9]\d*$/.test(this.formData.cycleNums)) {
            if (this.moment(this.formData.endDate).add(1, "d").diff(this.formData.startDate, this.formatDateType[this.formData.cycleType], true) >= this.formData.cycleNums) {
              this.$refs.form.clearValidate(["cycleType", "cycleNums", "startDate", "endDate"]);
              return callback();
            } else {
              return callback(new Error(this.$t("out_time_range")));
            }
          }
          this.$refs.form.clearValidate(["startDate", "endDate"]);
          return callback();
        }
      }
    },
    outRangeValid(rule, value, callback) {
      if (this.formData.cycleType && /^[1-9]\d*$/.test(this.formData.cycleNums) && this.formData.startDate && this.formData.endDate) {
        if (this.moment(this.formData.endDate).add(1, "d").diff(this.formData.startDate, this.formatDateType[this.formData.cycleType], true) >= this.formData.cycleNums) {
          this.$refs.form.clearValidate(["cycleType", "cycleNums", "startDate", "endDate"]);
          return callback();
        } else {
          return callback(new Error(this.$t("out_time_range")));
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
.inputStyle {
  width: 510px;
}
</style>
