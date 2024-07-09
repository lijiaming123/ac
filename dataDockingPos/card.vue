<template>
  <div>
    <div class="data-docking-pos-card">
      <el-form class="card-form" :model="addItem" :rules="addRules" ref="addItemForm" v-if="!cardData.bid">
        <el-form-item prop="name">
          <el-input v-model="addItem.configName" :placeholder="$t('zh_cardname')"></el-input>
        </el-form-item>
      </el-form>
      <el-row class="card-header" :gutter="12" v-if="cardData.bid">
        <el-col :span="16">
          <el-checkbox v-model="checked" @change="changeCheck"></el-checkbox>
          <span class="title" :title="cardData.configName">
            {{ cardData.configName }}
          </span>
        </el-col>
        <el-col :span="8" style="font-size: 12px; text-align: right; overflow: hidden; text-overflow: ellipsis">
          {{ getSysType(cardData.sysType) }}
        </el-col>
      </el-row>
      <el-scrollbar>
        <div class="box-card-content" v-if="cardData.bid">
          <el-row>
            <el-col :span="24">
              <div class="min-card">
                <p class="min-card-label">{{ $t("zh_cardcode") }}</p>
                <p class="min-card-value" :title="cardData.depName">
                  {{ cardData.depName }}
                </p>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="min-card">
                <p class="min-card-label">{{ $t("zh_lc") }}</p>
                <p class="min-card-value">{{ cardData.intervalValue }}{{ getType(cardData.frequencyType) }}</p>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="min-card">
                <p class="min-card-label">{{ $t("zh_lc1") }}</p>
                <p class="min-card-value">{{ getPosType(cardData.posType) }}</p>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-scrollbar>
      <div class="box-card-footer">
        <div class="card-btn" v-if="cardData.bid">
          <wq-icon url="/style/static/svgIcon/card/card-edit.svg" :width="16" :height="16" :hover="true" @click="editBtn" :disabled="true" :isDisabled="!cntedit"></wq-icon>
        </div>
        <div class="card-btn" v-if="cardData.bid">
          <wq-icon url="/style/static/svgIcon/card/card-duplicate.svg" :width="16" :height="16" :hover="true" @click="copyBtn" :disabled="true" :isDisabled="!cntadd"></wq-icon>
        </div>
        <div class="card-btn">
          <wq-icon url="/style/static/svgIcon/card/card-delet.svg" :width="16" :height="16" :hover="true" @click="deleteBtn" :disabled="true" :isDisabled="!cntdelete"></wq-icon>
        </div>
        <div class="card-btn" v-if="!cardData.bid">
          <wq-icon url="/style/static/svgIcon/card/card-save.svg" :width="16" :height="16" :hover="true" @click="saveBtn" :disabled="true" :isDisabled="!cntadd"></wq-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Card",
  props: {
    cardData: {
      type: Object,
      default() {
        return {};
      }
    },
    check: {
      type: Boolean,
      default: false
    },
    index: {
      type: Number
    },
    frequencyTypeList: {
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
    posTypeList: {
      type: Array,
      default() {
        return [];
      }
    },
    cntedit: {
      type: Boolean,
      default: false
    },
    cntdelete: {
      type: Boolean,
      default: false
    },
    cntadd: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      checked: false,
      itemUnit: [],
      addRules: {
        configName: [
          {required: true, message: this.$t("zh_rwmc"), trigger: "blur"},
          {min: 1, max: 20, message: this.$t("zh_checkname1"), trigger: "blur"}
        ]
      },
      addItem: this.cardData
    };
  },
  created() {
    this.checked = this.check;
    this.addItem = this.cardData;
    this.itemUnit = this.cardData.itemUnit ? JSON.parse(this.cardData.itemUnit) : [];
  },
  watch: {
    check(val) {
      this.checked = val;
    },
    cardData: {
      handler(val) {
        this.addItem = val;
        this.itemUnit = this.cardData.itemUnit ? JSON.parse(this.cardData.itemUnit) : [];
      },
      deep: true
    }
  },
  methods: {
    getType(val) {
      var name = "";
      this.frequencyTypeList.forEach((item) => {
        if (item.code === val) {
          name = item.name;
        }
      });
      return name;
    },
    getPosType(val) {
      var name = "";
      this.posTypeList.forEach((item) => {
        if (item.code === val) {
          name = item.name;
        }
      });
      return name;
    },
    getSysType(val) {
      var name = "";
      this.sysTypeList.forEach((item) => {
        if (item.code === val) {
          name = item.name;
        }
      });
      return name;
    },
    changeCheck() {
      this.$emit("setCheck", this.cardData.bid, this.checked);
    },
    deleteBtn() {
      this.$emit("deleteItem", this.cardData, this.index);
    },
    copyBtn() {
      this.$emit("copyItem", this.cardData);
    },
    editBtn() {
      this.$emit("showDialogBox", this.cardData);
    },
    saveBtn() {
      this.$refs["addItemForm"].validate((valid) => {
        if (valid) {
          this.$emit("saveItem", this.addItem);
        } else {
          console.log("submit error");
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.data-docking-pos-card {
  height: 225px;
  background: rgba(255, 255, 255, 1);
  border-radius: 2px;
  border: 1px solid rgba(234, 237, 242, 1);
  margin-bottom: 12px;
  .card-form {
    height: 180px;
    padding: 15px;
    box-sizing: border-box;
  }
  .card-header {
    height: 48px;
    padding: 0 16px;
    border-bottom: 1px solid rgba(234, 237, 242, 1);
    display: flex;
    align-items: center;
    .title {
      margin-left: 6px;
      font-weight: 600;
      color: #3c5266;
      overflow: hidden;
      display: inline-block;
      vertical-align: middle;
      width: 80%;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .wqIconImg {
      display: unset !important;
    }
  }
  .el-scrollbar {
    height: auto;
    .el-scrollbar__wrap {
      overflow: hidden;
      width: 100%;
    }
  }
  .box-card-content {
    height: 150px;
    padding: 0 20px;
    .el-table {
      box-shadow: none;
    }
    .el-table th {
      padding: 0;
    }
    .el-table td,
    .el-table th {
      height: 32px;
    }
    .el-table__empty-block {
      min-height: 40px;
    }
    .el-col {
      padding: 5px 0;
      // padding-left: 22px;
      .min-card {
        p {
          margin: 0;
          padding: 2px 0;
        }
        padding: 5px 0;
        .min-card-name {
          font-size: 13px;
          font-family: PingFangSC;
          font-weight: bold;
          color: #3c5266;
          line-height: 14px;
          .name-icon {
            display: inline-block;
            width: 20px;
            height: 20px;
            background: #4abaff;
            color: #fff;
            font-style: normal;
            border-radius: 50%;
            text-align: center;
            line-height: 20px;
            margin-right: 12px;
          }
        }
        .min-card-label {
          font-size: 12px;
          font-family: PingFangSC-Regular;
          font-weight: 400;
          color: rgba(106, 120, 133, 1);
        }
        .min-card-value {
          font-size: 13px;
          height: 22px;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: PingFangSC-Regular;
          font-weight: 400;
          color: rgba(60, 82, 102, 1);
        }
      }
    }
  }
  .box-card-footer {
    display: flex;
    align-items: center;
    width: 100%;
    height: 44px;
    background: rgba(246, 248, 250, 1);
    border-radius: 0px 0px 2px 2px;
    .card-btn {
      flex: 1;
      cursor: pointer;
      display: flex;
      justify-content: center;
      border-right: 1px solid rgba(234, 237, 242, 1);
      &:last-child {
        border: none;
      }
    }
  }
}
</style>
