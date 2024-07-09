<template>
  <div class="card">
    <div class="headerStyle">
      <el-checkbox v-model="checked" @change="changeCheck"></el-checkbox>
      <span class="titleStyle" :title="itemData.name">{{ itemData.name }}</span>
    </div>
    <div class="contain">
      <div class="innerBox">
        <el-row class="innerDetail" style="margin-bottom: 15px">
          {{ $t("card.applicable_user") }}：
          <el-tooltip placement="top" effect="light">
            <div slot="content">
              <wq-open-data :openData="(itemData.emps || []).map((o) => o.userAccount + (o.empName ? '-' + o.empName : '')).join('、')"></wq-open-data>
            </div>
            <wq-open-data :openData="(itemData.emps || []).map((o) => o.userAccount + (o.empName ? '-' + o.empName : '')).join('、')"></wq-open-data>
          </el-tooltip>
        </el-row>
        <el-row class="innerDetail">
          {{ $t("card.applicable_role") }}：
          <el-tooltip placement="top" effect="light">
            <div slot="content">
              <span>{{ itemData.roles.join("、") }}</span>
            </div>
            <span>{{ itemData.roles.join("、") }}</span>
          </el-tooltip>
        </el-row>
      </div>
    </div>
    <div class="footerStyle">
      <div class="footerItem">
        <wq-icon url="/style/static/svgIcon/card/card-edit.svg" :width="16" :height="16" :hover="true" @click="editBtn" :isDisabled="!isupdate" :disabled="!isupdate"></wq-icon>
        <span class="line"></span>
      </div>
      <div class="footerItem">
        <wq-icon url="/style/static/svgIcon/card/card-duplicate.svg" :width="16" :height="16" :hover="true" @click="copyBtn" :isDisabled="!isadd" :disabled="!isadd"></wq-icon>
        <span class="line"></span>
      </div>
      <div class="footerItem">
        <wq-icon url="/style/static/svgIcon/card/card-delet.svg" :width="16" :height="16" :hover="true" @click="deleteBtn" :isDisabled="!isdelete" :disabled="!isdelete"></wq-icon>
      </div>
    </div>
  </div>
</template>

<script>
export default {
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
    isadd: {
      type: Boolean,
      default: false
    },
    isdelete: {
      type: Boolean,
      default: false
    },
    isupdate: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    cardData: {
      handler(val) {
        this.itemData = val;
      },
      deep: true
    },
    check(val) {
      this.checked = val;
    }
  },
  data() {
    return {
      itemData: {},
      checked: false
    };
  },
  created() {
    this.itemData = JSON.parse(JSON.stringify(this.cardData));
    this.checked = this.check;
  },
  computed: {},
  methods: {
    changeCheck() {
      this.$emit("setCheck", this.itemData.bid, this.checked);
    },
    editBtn() {
      this.$emit("editCard", this.itemData.bid);
    },
    copyBtn() {
      this.$emit("copyCard", this.itemData.bid);
    },
    deleteBtn() {
      this.$emit("deleteCard", this.itemData.bid);
    }
  }
};
</script>

<style lang="less" scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 242px;
  box-sizing: border-box;
  border: 1px solid rgba(234, 237, 242, 1);
  border-radius: 3px;
  margin-bottom: 16px;
  .headerStyle {
    height: 48px;
    min-height: 48px;
    border-bottom: 1px solid rgba(234, 237, 242, 1);
    display: flex;
    align-items: center;
    padding-left: 17px;
    .titleStyle {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-left: 10px;
      font-size: 15px;
      font-weight: 600;
      color: rgba(60, 82, 102, 1);
    }
  }
  .contain {
    flex: 1;
    overflow: hidden;
    padding: 10px 30px;
    .innerBox {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .innerDetail {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #6a7885;
        font-size: 12px;
      }
    }
  }
  .footerStyle {
    height: 44px;
    min-height: 44px;
    background: rgba(246, 248, 250, 1);
    display: flex;
    align-items: center;
    .footerItem {
      height: 16px;
      flex: 1;
      border-right: 1px solid rgba(234, 237, 242, 1);
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      &:last-child {
        border: none;
      }
    }
  }
  .more {
    width: 80px;
    position: absolute;
    bottom: 36px;
    right: 0px;
    color: #6a7885;
    z-index: 1000;
    padding: 5px 0;
    border: 1px solid #eaedf2;
    border-radius: 2px;
    background-color: #fff;
    margin-bottom: 20px;
    margin: 5px 0;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    .moreDetail {
      list-style: none;
      font-size: 12px;
      padding: 5px 0 5px 10px;
      cursor: pointer;
      &:hover {
        background-color: #f5f7f9;
      }
    }
  }
}
.bgColor {
  background-color: #ccc;
}
.card .footerStyle .line {
  position: absolute;
  width: 0px;
  height: 18px;
  border-right: 1px solid #ccc;
  top: 50%;
  margin-top: -9px;
  right: 0;
}
</style>
