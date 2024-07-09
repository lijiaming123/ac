<template>
  <el-form class="dialog-form" label-position="top" ref="form" :model="formData" :rules="rules">
    <el-form-item :label="$t('dialogForm.rule_code')" prop="code">
      <el-input v-model="formData.code" disabled :placeholder="$t('dialogForm.please_input')"></el-input>
    </el-form-item>
    <el-form-item :label="$t('dialogForm.rules_name_title1')" prop="ruleName">
      <el-input v-model="formData.ruleName" maxlength="200" :placeholder="$t('dialogForm.please_input')"></el-input>
    </el-form-item>
    <el-form-item :label="$t('dialogForm.applicable_user')" prop="uids">
      <el-select v-model="formData.uids" class="inputStyle" :placeholder="$t('dialogForm.please_select')" multiple filterable remote :remote-method="getUserListOptions">
        <el-option v-for="item in userListOptions" :key="item.uid" :value="item.uid" :label="item.account">
          <el-checkbox :value="formData.uids.indexOf(item.uid) > -1" style="float: left; margin-top: 1px; margin-right: 6px; pointer-events: none"></el-checkbox>
          <span style="float: left">{{ item.account }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">
            <wq-open-data :openData="item.employeeName || ''"></wq-open-data>
          </span>
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('dialogForm.applicable_role')" prop="roleBids">
      <!-- <el-select v-model="formData.roleBids" class="inputStyle" :placeholder="$t('dialogForm.please_select')" multiple filterable>
        <el-option v-for="item in rolesListOptions" :key="item.bid" :value="item.bid" :label="item.roleName"></el-option>
      </el-select> -->
      <all-select
        :collapse-tags="collapseTags"
        @visible-change="visibleChange"
        style="width: 100%"
        v-model="formData.roleBids"
        :options="rolesListOptions"
        item-key="bid"
        label-key="roleName"
        value-key="bid"
        multiple
        filterable
        show-select-all
        clearable></all-select>
    </el-form-item>
    <el-form-item prop="didList" :label="$t('dialogForm.applicable_dep')" :rules="rules.didList">
      <dep-select v-model="formData.didList" class="inputStyle" @change="depChange" :option="multipleDepOption.option"></dep-select>
    </el-form-item>
    <el-form-item :label="formData.editScheduleStatus == '2' ? $t('dialogForm.modify_type_title') : $t('dialogForm.modify_type')" prop="editScheduleStatus">
      <el-select v-model="formData.editScheduleStatus" @change="controlChange" class="inputStyle" :placeholder="$t('dialogForm.please_select')">
        <el-option v-for="item in rulesControl" :key="item.value" :value="item.value" :label="item.label"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item v-if="formData.editScheduleStatus == 2" :label="$t('dialogForm.editable_day')" prop="editDayNum">
      <el-input v-model="formData.editDayNum" :placeholder="$t('dialogForm.please_input')"></el-input>
    </el-form-item>
    <el-form-item v-if="formData.editScheduleStatus == 2" :label="$t('dialogForm.week_edit')" prop="editWeekBefore">
      <el-select v-model="formData.editWeekBefore" class="inputStyle" :placeholder="$t('dialogForm.please_select')" filterable clearable>
        <el-option v-for="item in weekList" :key="item.value" :value="item.value" :label="item.label"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item v-if="formData.editScheduleStatus == 2" :label="$t('dialogForm.month_edit')" prop="editMonthBefore">
      <el-select v-model="formData.editMonthBefore" class="inputStyle" :placeholder="$t('dialogForm.please_select')" filterable clearable>
        <el-option v-for="item in monthList" :key="item.value" :value="item.value" :label="item.label"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item v-if="formData.editScheduleStatus == 2" :label="$t('dialogForm.before_month_end_edit')" prop="editMonthBottom">
      <el-input v-model="formData.editMonthBottom" :placeholder="$t('dialogForm.please_input')"></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
import http from "commonRemote/services/http";
import allSelect from "commonRemote/components/allSelect";
import DepSelect from "commonRemote/components/depSelect";
import axios from "axios";
export default {
  components: {
    allSelect,
    DepSelect
  },
  props: {
    formData: {
      type: Object,
      default() {
        return {};
      }
    },
    rolesListOptions: {
      type: Array,
      default() {
        return [];
      }
    },
    rulesControl: {
      type: Array,
      default() {
        return [];
      }
    },
    weekList: {
      type: Array,
      default() {
        return [];
      }
    },
    monthList: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    const multipleDepOption = {
      option: {
        multiple: true,
        showSearch: true,
        privilege: "schedule_editschhistory#update",
        placeholder: this.$t("app.partial_date_allowed_durantion")
      }
    };
    return {
      rules: {
        code: [
          {
            required: true,
            message: this.$t("dialogForm.rule_code_valid"),
            trigger: "change"
          }
        ],
        ruleName: [
          {
            required: true,
            message: this.$t("dialogForm.please_enter_name"),
            trigger: ["change", "blur"]
          }
        ],
        uids: [{validator: this.userAndRoleValid, trigger: "change"}],
        roleBids: [{validator: this.userAndRoleValid, trigger: "change"}],
        editScheduleStatus: [
          {
            required: true,
            message: this.$t("dialogForm.please_select_edit_control"),
            trigger: ["change", "blur"]
          }
        ],
        editDayNum: [
          {
            pattern: /^[1-9]\d*$/,
            message: this.$t("dialogForm.please_enter_positive_integer1"),
            trigger: ["change", "blur"]
          },
          {validator: this.modifyLimitValid, trigger: ["change", "blur"]}
        ],
        editWeekBefore: [{validator: this.modifyLimitValid, trigger: "change"}],
        editMonthBefore: [{validator: this.modifyLimitValid, trigger: "change"}],
        editMonthBottom: [
          {
            pattern: /^[1-9]\d*$/,
            message: this.$t("dialogForm.please_enter_positive_integer1"),
            trigger: ["change", "blur"]
          },
          {validator: this.modifyLimitValid, trigger: ["change", "blur"]}
        ],
        didList: [
          {
            validator: this.userAndRoleValid,
            trigger: ["change", "blur"]
          }
        ]
      },
      userListOptions: [],
      collapseTags: true,
      multipleDepOption
    };
  },
  created() {
    axios.all([this.promiseObj("", this.formData.uids), this.promiseObj()]).then(
      axios.spread((...resList) => {
        let lastResult = [];
        let newObj = {};
        resList.forEach((o, i) => {
          if (o.data.code == 0) {
            lastResult = lastResult.concat(o.data.data || []);
          }
        });
        this.userListOptions = lastResult
          .reduce((preVal, curVal) => {
            newObj[curVal.uid] ? "" : (newObj[curVal.uid] = preVal.push(curVal));
            return preVal;
          }, [])
          .map((o) => {
            return {
              account: o.account,
              uid: o.uid.toString(),
              employeeName: o.employeeName
            };
          });
      })
    );
  },
  methods: {
    visibleChange() {
      if (this.formData.roleBids.length == this.rolesListOptions.length) {
        this.$nextTick(() => {
          setTimeout(() => {
            document.getElementsByClassName("all-select")[0].getElementsByClassName("el-scrollbar__wrap")[0].scrollTop = 0;
          }, 100);
        });
      }
    },
    depChange(val) {
      console.log(val);
      console.log(this.formData);
    },
    validate(callback) {
      this.$refs.form.validate((valid) => {
        callback && callback(valid, this.formData);
      });
    },
    resetField() {
      this.$refs["form"].resetFields();
    },
    controlChange() {
      this.formData.editDayNum = "";
      this.formData.editWeekBefore = "";
      this.formData.editMonthBefore = "";
      this.formData.editMonthBottom = "";
    },
    getUserListOptions(name = "", ids = []) {
      http
        .post("/api/shared-user/user/listAccount4Select", {
          account: name,
          uidList: ids
        })
        .then((res) => {
          const {data, code} = res.data;
          if (code === 0) {
            this.userListOptions = data.map((o) => {
              return {
                account: o.account,
                uid: o.uid.toString(),
                employeeName: o.employeeName
              };
            });
          }
        });
    },
    promiseObj(name = "", ids = []) {
      return http.post("/api/shared-user/user/listAccount4Select", {
        account: name,
        uidList: ids
      });
    },
    userAndRoleValid(rule, value, callback) {
      if ((this.formData.uids && this.formData.uids.length) || (this.formData.roleBids && this.formData.roleBids.length) || (this.formData.didList && this.formData.didList.length)) {
        this.$refs.form.clearValidate(["uids", "roleBids", "didList"]);
        return callback();
      } else {
        return callback(new Error(" "));
      }
    },
    modifyLimitValid(rule, value, callback) {
      if (this.formData.editDayNum || this.formData.editWeekBefore || this.formData.editMonthBefore || this.formData.editMonthBottom) {
        this.$refs.form.clearValidate(["editWeekBefore", "editMonthBefore"]);
        if (/^[1-9]\d*$/.test(this.formData.editDayNum) || this.formData.editDayNum === "") {
          this.$refs.form.clearValidate(["editDayNum"]);
        }
        if (/^[1-9]\d*$/.test(this.formData.editMonthBottom) || this.formData.editMonthBottom === "") {
          this.$refs.form.clearValidate(["editMonthBottom"]);
        }
        return callback();
      } else {
        return callback(new Error(" "));
      }
    }
  }
};
</script>

<style lang="less" scoped>
.inputStyle {
  width: 100%;
}
.dialog-form {
  :deep(.el-form-item) {
    label {
      max-width: 100%;
    }
  }
  :deep(.is-error) {
    .empSelect {
      .edit {
        border: 1px solid #f4502c;
      }
    }
  }
}
</style>
