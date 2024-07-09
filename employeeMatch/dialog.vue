<template>
  <el-form class="dialog-form" label-position="top" ref="form" label-width="80px" :model="form" :rules="rules">
    <el-row :gutter="16">
      <el-col :span="8">
        <el-form-item :label="$t('zh_dianame')" prop="name" :rules="rules.name">
          <el-input v-model.trim="form.name"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item :label="$t('zh_zuzhi')" prop="didList" :rules="rules.didList">
          <dep-select v-model="form.didList" :option="multipleDepOption.option"></dep-select>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item :label="$t('zh_jianma')" prop="shortCode" :rules="rules.shortCode">
          <el-input v-model.trim="form.shortCode"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item :label="$t('zh_zuzhi')" prop="matchingRuleObjList">
          <wq-table id="matchingRuleObjList" :data="form.matchingRuleObjList" :row-key="rowKey" :pagination="false" :showPaging="false" :split-screen="false">
            <el-table-column :label="$t('zh_sx')" align="center" width="50">
              <template slot-scope="scope">
                {{ scope.row.number }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('zh_diatype')">
              <template slot-scope="scope">
                <el-form-item :prop="'matchingRuleObjList.' + scope.$index + '.type'" :rules="rules.type" :show-message="false">
                  <el-select v-model="scope.row.type" @change="typeChange(scope.$index)" :placeholder="$t('zh_choosetype')">
                    <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column :label="$t('zh_desc')" width="300">
              <template slot-scope="scope">
                <el-form-item :prop="'matchingRuleObjList.' + scope.$index + '.subType'" :rules="rules.subType" :show-message="false">
                  <el-select style="width: 100%" v-if="scope.row.type == '0'" v-model="scope.row.subType" :placeholder="$t('zh_choosedesc')">
                    <el-option v-for="item in htypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                  <el-select style="width: 100%" v-if="scope.row.type == '1'" v-model="scope.row.subType" :placeholder="$t('zh_choosedesc')">
                    <el-option v-for="item in skillTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                  <el-select style="width: 100%" v-if="scope.row.type == '2'" v-model="scope.row.subType" :placeholder="$t('zh_choosedesc')">
                    <el-option v-for="item in shiftTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                  <el-select style="width: 100%" v-if="scope.row.type == '3'" v-model="scope.row.subType" :placeholder="$t('zh_choosedesc')">
                    <el-option v-for="item in otherTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column :label="$t('zh_setting')">
              <template slot-scope="scope">
                <el-form-item :prop="'matchingRuleObjList.' + scope.$index + '.settingType'" :rules="rules.settingType" :show-message="false">
                  <el-select v-model="scope.row.settingType" :placeholder="$t('zh_chooseset')">
                    <el-option
                      v-if="(scope.row.type == '1' && scope.row.subType == '2') || scope.row.type == '3'"
                      v-for="item in settingOptions1"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"></el-option>
                    <el-option v-else v-for="item in settingOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column :label="$t('zh_fa')">
              <template slot-scope="scope">
                <el-form-item :prop="'matchingRuleObjList.' + scope.$index + '.settingValue'" :rules="rules.settingValue" :show-message="false">
                  <el-input v-model="scope.row.settingValue" @blur="settingBlur(scope.$index)"></el-input>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column :label="$t('zh_do')" align="center">
              <template slot-scope="scope">
                <div class="actions-wrap">
                  <span class="operateBtn delete" @click="deleteRow(scope.$index)" :class="{disabled: !scope.$index}">
                    <i class="el-icon-minus"></i>
                  </span>
                  <span class="operateBtn add" @click="addRow(scope.$index)">
                    <i class="el-icon-plus"></i>
                  </span>
                </div>
              </template>
            </el-table-column>
          </wq-table>
          <div class="add-box" @click="addRow" v-if="form.matchingRuleObjList.length == 0">
            <wq-icon style="display: inline-block" url="/style/static/svg/ui2/add.svg" :hover="true" :active="true" :width="18" :height="18"></wq-icon>
            <span style="margin-left: 6px; position: relative; top: -4px; font-size: 14px; cursor: pointer; color: #27a9f8">
              {{ $t("zh_addpp") }}
            </span>
          </div>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item :label="$t('zh_ddd')" prop="content">
          <el-input type="textarea" :rows="3" v-model="form.content"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script>
import DepSelect from "commonRemote/components/depSelect";
import draggable from "vuedraggable";
import Sortable from "sortablejs";
export default {
  name: "DialogForm",
  components: {
    DepSelect,
    draggable
  },
  props: {
    cardData: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      form: {},
      multipleDepOption: {
        option: {
          multiple: true,
          showSearch: true,
          privilege: ""
        }
      },
      settingOptions1: [
        {
          label: this.$t("zh_eq"),
          value: 4
        }
      ],
      settingOptions: [
        {
          label: this.$t("zh_gt"),
          value: 0
        },
        {
          label: this.$t("zh_ge"),
          value: 1
        },
        {
          label: this.$t("zh_lt"),
          value: 2
        },
        {
          label: this.$t("zh_le"),
          value: 3
        },
        {
          label: this.$t("zh_eq"),
          value: 4
        },
        {
          label: this.$t("zh_noeq"),
          value: 5
        }
      ],
      typeOptions: [
        {
          label: this.$t("zh_ch1"),
          value: 0
        },
        {
          label: this.$t("zh_ch2"),
          value: 1
        },
        {
          label: this.$t("zh_ch3"),
          value: 2
        },
        {
          label: this.$t("zh_ch4"),
          value: 3
        }
      ],
      htypeOptions: [
        {
          label: this.$t("zh_day"),
          value: 0
        },
        {
          label: this.$t("zh_week"),
          value: 1
        },
        {
          label: this.$t("zh_mon"),
          value: 2
        }
      ],
      skillTypeOptions: [
        {
          label: this.$t("zh_ds1"),
          value: 0
        },
        {
          label: this.$t("zh_ds2"),
          value: 1
        },
        {
          label: this.$t("zh_ds3"),
          value: 2
        }
      ],
      shiftTypeOptions: [
        {
          label: this.$t("zh_fs1"),
          value: 0
        },
        {
          label: this.$t("zh_fs2"),
          value: 1
        }
      ],
      otherTypeOptions: [
        {
          label: this.$t("zh_dffd1"),
          value: 0
        },
        {
          label: this.$t("zh_dffd2"),
          value: 1
        },
        {
          label: this.$t("zh_dffd3"),
          value: 2
        }
      ],
      rules: {
        name: [
          {required: true, message: this.$t("zh_enter1"), trigger: "blur"},
          {min: 1, max: 20, message: this.$t("zh_enter2"), trigger: "blur"}
        ],
        didList: [{required: true, message: this.$t("zh_enter3"), trigger: "change"}],
        shortCode: [
          {
            required: true,
            message: this.$t("zh_entershortcode"),
            trigger: "change"
          },
          {
            min: 1,
            max: 5,
            message: this.$t("zh_enterlength"),
            trigger: "change"
          }
        ],
        type: [{required: true, message: this.$t("zh_enter4"), trigger: "change"}],
        subType: [{required: true, message: this.$t("zh_enter5"), trigger: "change"}],
        settingType: [{required: true, message: this.$t("zh_enter6"), trigger: "change"}],
        settingValue: [{required: true, message: this.$t("zh_enter7"), trigger: "blur"}]
      }
    };
  },
  created() {
    var form = JSON.parse(JSON.stringify(this.cardData));
    form.matchingRuleObjList = form.matchingRuleObjList || [];
    this.$set(this, "form", form);
    this.$nextTick(() => {
      this.rowDrop();
    });
    if (this.form.bid) {
      // 编辑
      this.multipleDepOption.option.privilege = "schedule_config_emp_attribute#update";
    } else {
      // 新增
      this.multipleDepOption.option.privilege = "schedule_config_emp_attribute#add";
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
    rowKey(row) {
      row.nbid = row.type + "_" + row.subType + "_" + row.index;
      return row.nbid;
    },
    validate(callback) {
      this.$refs.form.validate((valid) => {
        callback && callback(valid, this.form);
      });
    },
    resetFields() {
      this.$refs.form.resetFields();
    },
    typeChange(index) {
      this.form.matchingRuleObjList[index].subType = 0;
    },
    settingBlur(index) {
      if (isNaN(this.form.matchingRuleObjList[index].settingValue)) {
        this.$message.error(this.$t("zh_dfvfd1"));
        this.form.matchingRuleObjList[index].settingValue = 0;
      } else {
        if (this.form.matchingRuleObjList[index].settingValue < 0) {
          this.$message.error(this.$t("zh_dfvfd2"));
          this.form.matchingRuleObjList[index].settingValue = 0;
        }
      }
      if (this.form.matchingRuleObjList[index].type == 1) {
        if (this.form.matchingRuleObjList[index].subType == 2) {
          if (this.form.matchingRuleObjList[index].settingValue != "1") {
            if (this.form.matchingRuleObjList[index].settingValue != "0") {
              this.$message.error(this.$t("zh_dfvfd3"));
              this.form.matchingRuleObjList[index].settingValue = "";
            }
          }
        } else {
          if (this.form.matchingRuleObjList[index].settingValue < 0 || this.form.matchingRuleObjList[index].settingValue > 100) {
            this.$message.error(this.$t("zh_dfvfd4"));
            this.form.matchingRuleObjList[index].settingValue = "";
          }
        }
      } else if (this.form.matchingRuleObjList[index].type == 3) {
        if (this.form.matchingRuleObjList[index].settingValue != "1") {
          if (this.form.matchingRuleObjList[index].settingValue != "0") {
            this.$message.error(this.$t("zh_dfvfd3"));
            this.form.matchingRuleObjList[index].settingValue = "";
          }
        }
      }
    },
    rowDrop() {
      const tbody = document.querySelector("#matchingRuleObjList .el-table__body-wrapper tbody");
      const _this = this;
      Sortable.create(tbody, {
        onEnd({newIndex, oldIndex}) {
          const currRow = _this.form.matchingRuleObjList.splice(oldIndex, 1)[0];
          _this.form.matchingRuleObjList.splice(newIndex, 0, currRow);
          _this.sortArr();
        }
      });
    },
    sortArr() {
      this.form.matchingRuleObjList.forEach((item, index) => {
        item.number = index + 1;
      });
    },
    deleteRow(index) {
      if (index == 0) {
        return;
      }
      this.form.matchingRuleObjList.splice(index, 1);
    },
    addRow(index) {
      this.$nextTick(() => {
        let len = this.form.matchingRuleObjList.length;
        this.form.matchingRuleObjList.splice(index + 1, 0, {
          settingType: "",
          settingValue: "",
          subType: "",
          type: "",
          number: len + 1,
          index: len + 1
        });
        this.sortArr();
      });
    }
  }
};
</script>
<style lang="less">
.dialog-form {
  .el-form--label-top .el-form-item__label {
    padding: 0;
  }
  .el-radio-group {
    .el-radio {
      padding: 11px 0;
    }
    .el-radio + .el-radio {
      margin: 0;
    }
  }
  .el-table__empty-block {
    height: 0;
    min-height: 0;
  }
  .add-box {
    text-align: center;
    box-shadow: 6px 6px 10px 0 rgba(73, 80, 87, 0.08);
    border: 1px solid #e5e9ee;
    border-top: none;
    border-right: none;
    height: 56px;
    line-height: 66px;
  }
  .actions-wrap {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
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
        margin-right: 5px;
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
}
</style>
