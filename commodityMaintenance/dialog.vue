<template>
  <el-form class="dialog-form" label-position="top" ref="form" label-width="80px" :model="form" :rules="rules">
    <el-row :gutter="16">
      <el-col :span="12">
        <el-form-item :label="$t('zh_dianame')" prop="name" :rules="rules.name">
          <el-input v-model.trim="form.name"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item :label="$t('zh_diacode')" prop="code" :rules="rules.code">
          <el-input v-model="form.code"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item :label="$t('zh_zuzhi')" prop="didList" :rules="rules.didList">
          <dep-select v-model="form.didList" :option="multipleDepOption.option"></dep-select>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="" prop="taskObjList" class="taskObjList">
          <wq-table :data="form.taskObjList" :max-height="220" :pagination="false" :showPaging="false" :split-screen="false">
            <el-table-column :label="$t('zh_index')" align="center" width="100">
              <template slot-scope="scope">
                {{ scope.$index + 1 }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('zh_rwmc')">
              <template slot-scope="scope">
                <el-form-item :prop="'taskObjList.' + scope.$index + '.taskBid'" :rules="rules.taskBid">
                  <wq-tag-select v-model="scope.row.taskBid" :showCheckAll="false" :showSearch="true" :selection-options="groupList"></wq-tag-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column :label="$t('zh_tq')">
              <template slot-scope="scope">
                <el-form-item :prop="'taskObjList.' + scope.$index + '.presetTime'" :rules="rules.presetTime">
                  <el-input v-model="scope.row.presetTime"></el-input>
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
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item :label="$t('zh_desc')" prop="content">
          <el-input type="textarea" :rows="3" v-model="form.content"></el-input>
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
    checkCode: Function,
    groupList: {
      type: Array,
      default() {
        return [];
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
      rules: {
        name: [{required: true, message: this.$t("zh_diaentername"), trigger: "blur"}],
        code: [
          {
            required: true,
            message: this.$t("zh_diaentercode"),
            trigger: "blur"
          },
          {validator: this.checkCodeFunc, trigger: "blur"}
        ],
        didList: [{required: true, message: this.$t("zh_diazz"), trigger: "change"}],
        taskBid: [{required: true, message: this.$t("zh_enterrw"), trigger: "change"}],
        presetTime: [
          {required: true, message: this.$t("zh_tqtime"), trigger: "blur"},
          {validator: this.checkTime, trigger: "blur"}
        ]
      }
    };
  },
  created() {
    var form = JSON.parse(JSON.stringify(this.cardData));
    if (this.form.bid) {
      // 编辑
      this.multipleDepOption.option.privilege = "schedule_config_goods#update";
    } else {
      // 新增
      this.multipleDepOption.option.privilege = "schedule_config_goods#add";
    }
    this.$set(this, "form", form);
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
    checkTime(rule, value, callback) {
      console.log(value);
      if (value) {
        const reg = /^-?[0-9]\d*$/;
        if (!reg.test(value)) {
          return callback(new Error(this.$t("zh_nums")));
        } else {
          callback();
        }
      } else {
        callback();
      }
    },
    checkCodeFunc(rule, value, callback) {
      if (!value) {
        return callback(new Error(this.$t("zh_notnull")));
      } else {
        const reg = /^[A-Za-z0-9]+$/;
        if (!reg.test(value)) {
          return callback(new Error(this.$t("zh_num")));
        } else {
          this.checkCode(this.form, (flag, msg) => {
            if (flag) {
              callback();
            } else {
              return callback(new Error(msg));
            }
          });
        }
      }
    },
    validate(callback) {
      this.$refs.form.validate((valid) => {
        if (valid) {
          callback && callback(this.form);
        }
      });
    },
    resetFields() {
      this.$refs.form.resetFields();
    },
    deleteRow(index) {
      if (index === 0) {
        return;
      }
      this.form.taskObjList.splice(index, 1);
    },
    addRow(index) {
      this.form.taskObjList.splice(index + 1, 0, {
        presetTime: 0,
        taskBid: ""
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
  .taskObjList {
    margin-top: 10px;
  }
}
</style>
