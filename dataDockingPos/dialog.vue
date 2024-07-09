<template>
  <el-form class="dialog-form" label-position="top" ref="form" label-width="80px" :model="form" :rules="rules">
    <el-row :gutter="16">
      <el-col :span="24">
        <el-form-item :label="$t('zh_dianame')" prop="configName" :rules="rules.configName">
          <el-input v-model="form.configName" :placeholder="$t('zh_dianame1')"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item :label="$t('zh_diacode')" prop="did" :rules="rules.did">
          <dep-select v-model="form.did" :option="depOption" @change="changeDep"></dep-select>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item :label="$t('zh_sy')" prop="sysType" :rules="rules.sysType">
          <el-select v-model="form.sysType" style="width: 100%">
            <el-option v-for="(item, index) in sysTypeList" :key="index" :value="item.code" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item :label="$t('zh_sybs')" prop="sysDeviceCode" :rules="rules.sysDeviceCode">
          <el-input v-model="form.sysDeviceCode" :placeholder="$t('zh_sybs1')"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item :label="$t('zh_djsj')" prop="posType">
          <el-select v-model="form.posType" style="width: 100%" :rules="rules.posType">
            <el-option v-for="(item, index) in posTypeList" :key="index" :value="item.code" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item :label="$t('zh_timejg')" prop="intervalValue" :rules="rules.intervalValue">
          <el-input :placeholder="$t('zh_timejg1')" v-model="form.intervalValue"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item :label="$t('zh_sjdw')" prop="frequencyType">
          <el-select v-model="form.frequencyType" style="width: 100%" :rules="rules.frequencyType">
            <el-option v-for="(item, index) in frequencyTypeList" :key="index" :value="item.code" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item :label="$t('zh_starttime')" prop="startDate" :rules="rules.startDate">
          <el-date-picker style="width: 100%" v-model="form.startDate" @blur="startBlur" value-format="yyyy-MM-dd" format="yyyy-MM-dd" type="date" :placeholder="$t('zh_starttime1')"></el-date-picker>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item :label="$t('zh_endtime')" prop="endDate" :rules="rules.endDate">
          <el-date-picker style="width: 100%" v-model="form.endDate" @blur="endBlur" value-format="yyyy-MM-dd" format="yyyy-MM-dd" type="date" :placeholder="$t('zh_endtime1')"></el-date-picker>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script>
import DepSelect from "commonRemote/components/depSelect";
export default {
  name: "DialogForm",
  components: {
    DepSelect
  },
  props: {
    cardData: {
      type: Object,
      default() {
        return {};
      }
    },
    frequencyTypeList: {
      type: Array,
      default() {
        return [];
      }
    },
    posTypeList: {
      type: Array,
      default() {
        return [];
      }
    },
    sysTypeList: {
      type: Array,
      default() {
        return [];
      }
    },
    tableHeight: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      form: {},
      depOption: {
        multiple: false,
        showSearch: true,
        privilege: ""
      },
      rules: {
        configName: [
          {
            required: true,
            message: this.$t("zh_diaentername"),
            trigger: "change"
          },
          {min: 1, max: 20, message: this.$t("zh_checkname1"), trigger: "blur"}
        ],
        did: [
          {
            required: true,
            message: this.$t("zh_diachoose1"),
            trigger: "change"
          },
          {validator: this.checkDid, trigger: "change"}
        ],
        sysType: [{required: true, message: this.$t("zh_diachoose2"), trigger: "change"}],
        sysDeviceCode: [{required: true, message: this.$t("zh_diachoose3"), trigger: "blur"}],
        posType: [{required: true, message: this.$t("zh_diachoose4"), trigger: "change"}],
        intervalValue: [
          {
            required: true,
            message: this.$t("zh_diachoose5"),
            trigger: "change"
          },
          {validator: this.checkNumber, trigger: "blur"}
        ],
        frequencyType: [{required: true, message: this.$t("zh_diachoose6"), trigger: "change"}],
        startDate: [{required: true, message: this.$t("zh_diachoose7"), trigger: "change"}],
        endDate: [{required: true, message: this.$t("zh_diachoose8"), trigger: "change"}]
      }
    };
  },
  created() {
    var form = JSON.parse(JSON.stringify(this.cardData));
    this.$set(this, "form", form);
    this.form.did = this.form.did ? {did: this.form.did} : {};
    if (this.form.bid) {
      // 编辑
      this.depOption.privilege = "schedule_pos_dock_config#update";
    } else {
      // 新增
      this.depOption.privilege = "schedule_pos_dock_config#add";
    }
  },
  watch: {
    cardData: {
      handler(val) {
        var form = JSON.parse(JSON.stringify(val));
        this.$set(this, "form", form);
      },
      deep: true
    }
  },
  methods: {
    changeDep() {
      this.$refs.form.validateField("did");
    },
    checkDid(rule, value, callback) {
      if (JSON.stringify(value.did) !== "{}") {
        return callback();
      } else {
        return callback(new Error(this.$t("zh_sdvsd1")));
      }
    },
    checkNumber(rule, value, callback) {
      if (value) {
        if (isNaN(value)) {
          this.form.intervalValue = "";
          return callback(new Error(this.$t("zh_sdvsd2")));
        } else {
          if (value < 0) {
            this.form.intervalValue = "";
            return callback(new Error(this.$t("zh_sdvsd3")));
          } else {
            return callback();
          }
        }
      } else {
        return callback();
      }
    },
    validate(callback) {
      this.$refs.form.validate((valid) => {
        if (valid) {
          callback && callback(this.form);
        } else {
          console.log("error");
        }
      });
    },
    resetFields() {
      this.$refs.form.resetFields();
    },
    startBlur() {
      if (this.form.endDate) {
        if (this.moment(this.form.startDate).isAfter(this.form.endDate)) {
          this.$message.error(this.$t("zh_sdvsd4"));
          this.form.startDate = "";
        }
      }
    },
    endBlur() {
      if (this.form.startDate) {
        if (this.moment(this.form.endDate).isBefore(this.form.startDate)) {
          this.$message.error(this.$t("zh_sdvsd5"));
          this.form.endDate = "";
        }
      }
    }
  }
};
</script>
<style lang="less">
.el-drawer__body {
  height: calc(100% - 110px);
  overflow-y: auto;
  flex: 1;
}
.el-form-item {
  // margin-bottom: 12px;
  .el-form-item__content {
    line-height: unset;
  }
}
.el-form--label-top .el-form-item__label {
  // padding: 0;
}
.el-dialog__body::-webkit-scrollbar {
  width: 4px;
}
.el-dialog__body::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: rgba(0, 0, 0, 0.2);
}
.el-dialog__body::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 0;
  background: rgba(0, 0, 0, 0.1);
}
.dialog-form {
  .el-form--label-top .el-form-item__label {
    padding: 0;
  }
  .el-date-editor.el-input,
  .el-date-editor.el-input__inner {
    width: auto;
  }
  .el-radio-group {
    .el-radio {
      padding: 11px 0;
    }
    .el-radio + .el-radio {
      margin: 0;
    }
  }
  .operateBtn {
    display: inline-block;
    width: 18px;
    height: 18px;
    line-height: 18px;
    text-align: center;
    font-size: 12px;
    cursor: pointer;
    &.delete {
      background: #f4502c;
      color: #fff;
    }
    &.disabled {
      cursor: not-allowed;
      background: rgba(244, 80, 44, 0.5);
    }
    &.add {
      background: #27a9f8;
      color: #fff;
    }
  }
}
</style>
