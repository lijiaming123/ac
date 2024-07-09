<template>
  <div class="employee-match-card">
    <el-form class="card-form" :model="addItem" :rules="addRules" ref="addItemForm" v-if="!cardData.bid">
      <el-form-item prop="name">
        <el-input v-model.trim="addItem.name" :placeholder="$t('zh_enter')"></el-input>
      </el-form-item>
    </el-form>
    <el-row class="card-header" v-if="cardData.bid">
      <el-col :span="20">
        <el-checkbox v-model="checked" @change="changeCheck"></el-checkbox>
        <span class="title" :title="cardData.name">{{ cardData.name }}</span>
      </el-col>
      <el-col :span="4" style="font-size: 12px; text-align: right">
        {{ cardData.shortCode }}
      </el-col>
    </el-row>
    <el-scrollbar v-if="cardData.bid">
      <div class="card-content">
        <el-row :gutter="16" style="margin-top: 4px" class="con-con">
          <el-col :span="24">
            <div class="min-card">
              <p class="min-card-value">{{ cardData.content }}</p>
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
    typeList: {
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
      addItem: this.cardData,
      addRules: {
        name: [
          {required: true, message: this.$t("zh_enter"), trigger: "blur"},
          {min: 1, max: 20, message: this.$t("zh_enterzi"), trigger: "blur"}
        ]
      }
    };
  },
  created() {
    this.checked = this.check;
    this.addItem = this.cardData;
  },
  watch: {
    check(val) {
      this.checked = val;
    },
    cardData: {
      handler(val) {
        this.addItem = val;
      },
      deep: true
    }
  },
  methods: {
    changeCheck() {
      this.$emit("setCheck", this.cardData.bid, this.checked);
    },
    copyBtn() {
      this.$emit("copyItem", this.cardData);
    },
    editBtn() {
      this.$emit("showDialogBox", this.cardData);
    },
    deleteBtn() {
      this.$emit("deleteItem", this.cardData, this.index);
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
.employee-match-card {
  height: 227px;
  background: rgba(255, 255, 255, 1);
  border-radius: 2px;
  border: 1px solid rgba(234, 237, 242, 1);
  margin-bottom: 12px;
  .card-form {
    height: 183px;
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
      display: inline-block;
      vertical-align: middle;
      width: 80%;
      margin-left: 6px;
      font-weight: 600;
      color: #3c5266;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .wqIconImg {
      display: unset !important;
    }
  }
  .el-scrollbar {
    height: 135px;
    .el-scrollbar__wrap {
      overflow: hidden;
      width: 100%;
    }
  }
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
  .card-content {
    height: auto;
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
    .con-title {
      color: #6a7885;
      font-size: 12px;
    }
    .con-con {
      color: #3c5266;
      font-size: 12px;
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
