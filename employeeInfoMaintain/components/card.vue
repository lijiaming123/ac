<template>
  <div class="card">
    <el-form :model="itemData" :rules="rules" ref="form" label-width="80px" label-position="top" class="cardForm">
      <el-form-item :label="$t('zh_useful_mod')" class="cardFormItem">
        <el-select v-model="itemData.avBid" :placeholder="$t('zh_select')" @change="getweekInfo" clearable>
          <el-option v-for="item in selectList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('zh_start_date')" prop="startDate" :rules="rules.startDate" class="cardFormItem" :key="itemData.bid < 0 ? itemData.bid + '_start' : itemData.bid">
        <el-date-picker
          v-model="itemData.startDate"
          type="date"
          :placeholder="$t('zh_select_date')"
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptionsStart"
          @change="changeTime(itemData, 'startDate')"></el-date-picker>
      </el-form-item>

      <el-form-item :label="$t('zh_end_date')" prop="endDate" :rules="rules.endDate" :key="itemData.bid < 0 ? itemData.bid + '_end' : itemData.bid">
        <el-date-picker
          v-model="itemData.endDate"
          type="date"
          :placeholder="$t('zh_select_date')"
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptionsEnd"
          @change="changeTimeEnd(itemData, 'endDate')"></el-date-picker>
      </el-form-item>
    </el-form>
    <div>
      <div style="font-size: 14px">
        {{ $t("zh_special_set") }}
      </div>
      <div>
        <el-form
          :rules="formrules"
          :ref="'form' + index"
          v-if="item.avType != 3 && item.avType != 2"
          v-for="(item, index) in formData"
          label-width="80px"
          :label-position="labelPosition"
          :inline="true"
          :model="item"
          class="demo-form-inline"
          :key="'s' + index">
          <el-form-item :label="$t('zh_date')">
            <el-date-picker
              @change="datechange(item, index)"
              v-model="item.avdate"
              value-format="yyyy-MM-dd"
              type="daterange"
              :range-separator="$t('zh_to')"
              :start-placeholder="$t('zh_start_date')"
              :end-placeholder="$t('zh_end_date')"></el-date-picker>
          </el-form-item>
          <el-form-item :label="$t('zh_useful_type')" prop="avType">
            <el-select v-model="item.avType" :placeholder="$t('zh_select')">
              <el-option :label="$t('zh_unuseful')" value="0"></el-option>
              <el-option :label="$t('zh_useful')" value="1"></el-option>
              <!-- <el-option label="//优先可用" value="2"></el-option> -->
              <!-- <el-option label="//空白" value="3"></el-option> -->
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('zh_start_time')" prop="startHour">
            <el-time-select
              format="HH:mm"
              value-format="HH:mm"
              v-model="item.startHour"
              :picker-options="{
                start: '00:00',
                end: '24:00',
                maxTime: item.endHour,
                step: step
              }"
              :placeholder="$t('zh_start_time')"
              @change="startHourchange(item, index)"></el-time-select>
          </el-form-item>
          <el-form-item :label="$t('zh_end_time')" prop="endHour">
            <el-time-select
              format="HH:mm"
              value-format="HH:mm"
              v-model="item.endHour"
              :picker-options="{
                start: '00:00',
                end: '24:00',
                minTime: item.startHour,
                step: step
              }"
              @change="endHourchange(item, index)"
              :placeholder="$t('zh_end_time')"></el-time-select>
          </el-form-item>
          <el-form-item :label="$t('zh_operate')">
            <wq-icon url="/style/static/svgIcon/com/add1.svg" style="display: inline-block" @click="addtime(index)"></wq-icon>
            <wq-icon url="/style/static/svgIcon/com/delet1.svg" style="display: inline-block" @click="deletetime(index)"></wq-icon>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <!-- <div class="containBox">
      <el-radio-group v-model="radio" id="employeeRadio">
        <el-radio :label=0 class="radioStyle color1">//不可用</el-radio>
        <el-radio :label=1 class="radioStyle color2">//可用</el-radio>
        <el-radio :label=2 class="radioStyle color3">//优先可用</el-radio>
      </el-radio-group>
      <div class="mainBox">
        <div class="leftBox">
          <div class="headerStyle"></div>
          <div>//周一</div>
          <div>//周二</div>
          <div>//周三</div>
          <div>//周四</div>
          <div>//周五</div>
          <div>//周六</div>
          <div>//周日</div>
        </div>
        <div class="rightBox" ref="rightBox">
          <el-row>
            <el-col :span="1" v-for="(item, index) in 24" :key="index" class="colStyle colStyle1 headerStyle">
              {{index}}
            </el-col>
          </el-row>

          <div class="showContain" ref="dataShow" @mousedown="getStartPos" @mouseup="getEndPos">
            <el-row v-for="(rowItem, rowIndex) in 7" :key="rowIndex" class="colStyle">
              <el-col :span="1" v-for="(colItem, colIndex) in 24" :key="colIndex" class="smallStyle" ref="smallStyle">
              </el-col>
            </el-row>
            <div class="dataShow">
              <el-row v-for="(rowItem, rowIndex) in itemData.weekInfo" :key="rowIndex" class="colStyle">
                <el-col v-for="(colItem, colIndex) in (rowItem && rowItem.itemList)" :key="colIndex" :span="formatCol(colItem)" style="position:relative;">
                  <div class="timeRange" :class="{'color1': colItem.avType == 0, 'color2': colItem.avType == 1, 'color3': colItem.avType == 2}" :title="colItem.msg" @click.right="rightBtn(colItem)" @click.left="hideItem(colItem)">
                    {{colItem.msg}}
                  </div>
                  <el-button type="danger" class="deleteBox" v-if="colItem.right" @click.stop="deleteItem(colItem)">//删除</el-button>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
      </div>
    </div> -->
    <div @click="deleteBtn" class="deleteBtn" v-if="cntdelete">
      <wq-icon url="/style/static/svgIcon/com/delete.svg" :width="15" :height="15" :hover="true"></wq-icon>
      <span>{{ $t("zh_delete") }}</span>
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
    selectList: {
      type: Array,
      default() {
        return [];
      }
    },
    allIndex: {
      type: Number,
      default: 0
    },
    cntdelete: {
      type: Boolean,
      default: false
    },
    step: {
      type: String,
      default: "01:00"
    }
  },
  watch: {
    cardData: {
      handler(val) {
        // console.log(val, 'fgg')
        this.itemData = JSON.parse(JSON.stringify(val));
      },
      deep: true
    },
    formData: {
      handler(val) {
        console.log(val, "formdata");
        this.$emit("cardchange", this.formData, this.allIndex);
      },
      deep: true
    }
    // datearr: {
    //   handler(val) {
    //     console.log(val, 'datearr')
    //     this.$emit('cardchange', this.datearr, this.avdate, this.formData, this.allIndex)
    //   },
    //   deep: true
    // }
  },
  data() {
    return {
      formData: [],
      formrules: {
        avType: [
          {
            required: true,
            message: this.$t("zh_select_useful_type"),
            trigger: "change"
          }
        ],
        startHour: [
          {
            required: true,
            message: this.$t("zh_select_start_time"),
            trigger: "change"
          }
        ],
        endHour: [
          {
            required: true,
            message: this.$t("zh_select_end_time"),
            trigger: "change"
          }
        ]
      },
      labelPosition: "top",
      itemData: {},
      rules: {
        startDate: [
          {
            required: true,
            message: this.$t("zh_select_end_date"),
            trigger: "change"
          }
        ],
        endDate: [
          {
            required: true,
            message: this.$t("zh_select_end_date"),
            trigger: "change"
          }
        ]
      },
      pickerOptionsStart: {
        disabledDate: (time) => {
          const endDateVal = new Date(this.itemData.endDate).getTime();
          if (endDateVal) {
            return time.getTime() > endDateVal - 0;
          }
        }
      },
      pickerOptionsEnd: {
        disabledDate: (time) => {
          const beginDateVal = new Date(this.itemData.startDate).getTime();
          if (beginDateVal) {
            return time.getTime() < beginDateVal - 0;
          }
        }
      },
      radio: 0
    };
  },
  created() {
    this.itemData = JSON.parse(JSON.stringify(this.cardData));
    if (this.itemData.specialInfo == "" && this.itemData.formdata.length == 0) {
      this.formData = [
        {
          avdate: [],
          avType: "",
          startHour: "",
          endHour: "",
          startDate: "",
          endDate: ""
        }
      ];
    } else {
      if (this.itemData.specialInfo != "") {
        let specialarr = JSON.parse(this.itemData.specialInfo);
        if (specialarr.length > 0) {
          this.formData = this.itemData.formdata;
        } else {
          this.formData = [
            {
              avdate: [],
              avType: "",
              startHour: "",
              endHour: "",
              startDate: "",
              endDate: ""
            }
          ];
        }
      }
      if (this.itemData.formdata.length > 0) {
        this.formData = this.itemData.formdata;
      }
    }
    document.oncontextmenu = function () {
      return false;
    };
  },
  methods: {
    //     getDiffDate(start, end) {
    //     var startTime = this.getDate(start);
    //     var endTime = this.getDate(end);
    //     var dateArr = [];
    //     while ((endTime.getTime() - startTime.getTime()) >= 0) {
    //         var year = startTime.getFullYear();
    //         var month = startTime.getMonth().toString().length === 1 ? "0" + (parseInt(startTime.getMonth().toString(), 10) + 1) : (startTime.getMonth() + 1);
    //         var day = startTime.getDate().toString().length === 1 ? "0" + startTime.getDate() : startTime.getDate();
    //         dateArr.push(year + "-" + month + "-" + day);
    //         startTime.setDate(startTime.getDate() + 1);
    //         }
    //         return dateArr;
    //     },
    //  getDate (datestr) {
    //     var temp = datestr.split("-");
    //     if (temp[1] === '01') {
    //         temp[0] = parseInt(temp[0], 10) - 1;
    //         temp[1] = '12';
    //     } else {
    //         temp[1] = parseInt(temp[1], 10) - 1;
    //     }
    //     var date = new Date(temp[0], temp[1], temp[2]);
    //     return date;
    // },
    datechange(data, index) {
      console.log(data);
      if (data.avdate != null && data.avdate.length > 0) {
        data.startDate = data.avdate[0];
        data.endDate = data.avdate[1];
        if (!this.itemData.startDate == false && !this.itemData.endDate == false) {
          if (new Date(data.avdate[0]).getTime() < new Date(this.itemData.startDate).getTime() || new Date(data.avdate[1]).getTime() > new Date(this.itemData.endDate).getTime()) {
            this.$message.error(this.$t("zh_date_conflict"));
            data.avdate = [];
            data.startDate = "";
            data.endDate = "";
            return;
          }
        }
        this.formData.forEach((item, sindex) => {
          if (item.avdate != null && item.avdate.length > 0 && index != sindex) {
            if (
              new Date(data.avdate[0]).getTime() > new Date(item.avdate[1]).getTime() ||
              new Date(data.avdate[1]).getTime() < new Date(item.avdate[0]).getTime() ||
              (new Date(data.avdate[0]).getTime() == new Date(item.avdate[0]).getTime() && new Date(data.avdate[1]).getTime() == new Date(item.avdate[1]).getTime())
            ) {
              console.log(this.$t("zh_true"));
            } else {
              this.$message.error(this.$t("zh_date_conflict"));
              data.avdate = [];
              data.startDate = "";
              data.endDate = "";
              return;
            }
          }
        });
      }
    },
    startHourchange(data, index) {
      console.log(data);
      if (data.endHour && data.startHour) {
        let hours = 0;
        this.formData.forEach((item, sindex) => {
          if (new Date(data.avdate[0]).getTime() == new Date(item.avdate[0]).getTime() && new Date(data.avdate[1]).getTime() == new Date(item.avdate[1]).getTime()) {
            let datastartmin = parseInt(data.startHour.split(":")[0]) * 60 + parseInt(data.startHour.split(":")[1]);
            let dataendmin = parseInt(data.endHour.split(":")[0]) * 60 + parseInt(data.endHour.split(":")[1]);
            let itemstartmin = parseInt(item.startHour.split(":")[0]) * 60 + parseInt(item.startHour.split(":")[1]);
            let itemendmin = parseInt(item.endHour.split(":")[0]) * 60 + parseInt(item.endHour.split(":")[1]);
            hours += itemendmin - itemstartmin;
            if (index != sindex) {
              if (datastartmin >= itemendmin || dataendmin <= itemstartmin) {
                console.log(true);
              } else {
                this.$message.error(this.$t("zh_time_conflict"));
                data.startHour = "";
                return;
              }
            }
          }
        });
        if (hours > 24 * 60) {
          this.$message.error(this.$t("zh_settime_cannot_more_24_hours"));
          data.startHour = "";
          return;
        }
      }
      // this.formData.forEach(obj => {
      //     console.log(obj)
      //     if (obj.startHour !='' && obj.endHour != '') {
      //       if (parseInt(data.startHour) > parseInt(obj.startHour) && parseInt(data.startHour) < parseInt(obj.endHour)) {
      //         this.$message.error('//选择时间冲突。');
      //         data.startHour = ''
      //         return
      //       }
      //     }
      // })
    },
    endHourchange(data, index) {
      console.log(data);
      if (data.endHour && data.startHour) {
        let hours = 0;
        this.formData.forEach((item, sindex) => {
          if (new Date(data.avdate[0]).getTime() == new Date(item.avdate[0]).getTime() && new Date(data.avdate[1]).getTime() == new Date(item.avdate[1]).getTime()) {
            let datastartmin = parseInt(data.startHour.split(":")[0]) * 60 + parseInt(data.startHour.split(":")[1]);
            let dataendmin = parseInt(data.endHour.split(":")[0]) * 60 + parseInt(data.endHour.split(":")[1]);
            let itemstartmin = parseInt(item.startHour.split(":")[0]) * 60 + parseInt(item.startHour.split(":")[1]);
            let itemendmin = parseInt(item.endHour.split(":")[0]) * 60 + parseInt(item.endHour.split(":")[1]);
            hours += itemendmin - itemstartmin;
            if (index != sindex) {
              if (datastartmin >= itemendmin || dataendmin <= itemstartmin) {
                console.log(true);
              } else {
                this.$message.error(this.$t("zh_time_conflict"));
                data.endHour = "";
                return;
              }
            }
          }
        });
        if (hours > 24 * 60) {
          this.$message.error(this.$t("zh_settime_cannot_more_24_hours"));
          data.endHour = "";
          return;
        }
      }
      // this.formData.forEach(obj => {
      //     console.log(obj)
      //     if (obj.startHour !='' && obj.endHour != '') {
      //       if (parseInt(data.endHour) > parseInt(obj.startHour) && parseInt(data.endHour) < parseInt(obj.endHour)) {
      //         this.$message.error('//选择时间冲突。');
      //         data.endHour = ''
      //         return
      //       }
      //     }
      // })
    },
    judgtime() {},
    addtime(index) {
      console.log(this.$refs["form" + index][0]);
      let num = 0;
      if (this.formData.length < 2) {
        num = 0;
      } else {
        num = 1;
      }
      this.$refs["form" + num][0].validate((valid) => {
        if (valid) {
          // let hours = 0;
          // this.formData.forEach( item => {
          //   hours += (parseInt(item.endHour) - parseInt(item.startHour))
          // })
          // if (hours >= 24) {
          //   this.$message.error('//设置时间不能超过24小时');
          //   return
          // }
          this.formData.unshift({
            avdate: [],
            avType: "",
            startHour: "",
            endHour: "",
            startDate: "",
            endDate: ""
          });
        } else {
          console.log("1");
          return false;
        }
      });
    },
    deletetime(index) {
      console.log(index);
      if (this.formData.length > 0) {
        this.formData.splice(index, 1);
      }
    },
    changeTime(data, type) {
      console.log(data);
      let startarr = [];
      // let endarr = [];
      this.formData.forEach((item) => {
        if (item.avdate != null && item.avdate.length > 0) {
          startarr.push(new Date(item.avdate[0]).getTime());
          // endarr.push(new Date(item.avdate[1]).getTime())
        }
      });
      startarr = startarr.sort();
      // endarr = endarr.sort();
      if (startarr.length > 0 && data.startDate && new Date(data.startDate).getTime() > startarr[0]) {
        this.$message.error(this.$t("zh_time_conflict"));
        data.startDate = "";
        return;
      }
      this.$emit("compareTime", type, data, this.allIndex);
    },
    changeTimeEnd(data, type) {
      // let startarr = [];
      let endarr = [];
      this.formData.forEach((item) => {
        if (item.avdate != null && item.avdate.length > 0) {
          // startarr.push(new Date(item.avdate[0]).getTime())
          endarr.push(new Date(item.avdate[1]).getTime());
        }
      });
      // startarr = startarr.sort();
      endarr = endarr.sort();
      if (endarr.length > 0 && data.endDate && new Date(data.endDate).getTime() < endarr[endarr.length - 1]) {
        this.$message.error(this.$t("zh_time_conflict"));
        data.endDate = "";
        return;
      }
      this.$emit("compareTimeEnd", type, data, this.allIndex);
    },
    formatCol(data) {
      let x1 = parseInt(data.startHour);
      let x2 = parseInt(data.endHour);
      return x2 - x1;
    },
    rightBtn(data) {
      this.$emit("cardRight", data, this.itemData);
    },
    hideItem(data) {
      this.$emit("cardHide", data, this.itemData);
    },
    deleteItem(data) {
      this.$emit("cardDelete", data, this.itemData);
    },
    getStartPos(e) {
      this.$emit("cardGetStart", e, this.$refs.dataShow, this.$refs.rightBox);
    },
    getEndPos(e) {
      this.$emit("cardGetEnd", e, this.$refs.dataShow, this.$refs.rightBox, this.itemData, this.radio, this.allIndex);
    },
    getweekInfo() {
      this.$emit("cardGetWeekInfo", this.itemData, this.allIndex);
    },
    deleteBtn() {
      this.$emit("cardItemDelete", this.itemData);
    },
    validate(callback) {
      this.$refs.form.validate((valid) => {
        callback && callback(valid, this.itemData);
      });
    }
  }
};
</script>

<style lang="less">
#employeeRadio {
  .el-radio__inner {
    width: 16px;
    height: 16px;
    border: none;
  }
  .el-radio__inner::after {
    width: 8px;
    height: 8px;
  }
}
</style>
<style lang="less" scoped>
* {
  box-sizing: border-box;
}
.card {
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  position: relative;
  .cardForm {
    display: flex;
    .cardFormItem {
      margin-right: 20px;
    }
  }
  .containBox {
    height: 373px;
    margin-bottom: 20px;
    #employeeRadio {
      width: 100%;
      text-align: right;
      height: 50px;
      line-height: 50px;
      .radioStyle {
        height: 32px;
        line-height: 32px;
        border-radius: 3px;
        color: #fff;
        padding: 0 10px;
      }
      .color1 {
        background: #d7d7d7;
      }
      .color2 {
        background: #03a7f0;
      }
      .color3 {
        background: #70b602;
      }
    }
    .mainBox {
      width: 100%;
      display: flex;
      border: 1px solid #eaedf2;
      border-right: none;
      border-bottom: none;
      .leftBox {
        div {
          width: 72px;
          height: 40px;
          line-height: 40px;
          text-align: center;
          color: #3c5266;
          font-size: 13px;
          border-right: 1px solid #eaedf2;
          border-bottom: 1px solid #eaedf2;
        }
        .headerStyle {
          border-right: none;
          background: #f8fafc;
        }
      }
      .rightBox {
        flex: 1;
        .colStyle {
          height: 40px;
          line-height: 40px;
          box-sizing: border-box;
          border-bottom: 1px solid #eaedf2;
          color: #3c5266;
          display: flex;
          align-items: center;
        }
        .timeRange {
          width: 100%;
          overflow: hidden;
          white-space: no-wrap;
          text-overflow: ellipsis;
          height: 20px;
          line-height: 20px;
          color: #fff;
          font-size: 13px;
          border-radius: 2px;
          cursor: pointer;
        }
        .deleteBox {
          position: absolute;
          right: 0;
          top: 0;
          z-index: 999;
          height: 20px;
          line-height: 20px;
          padding: 0;
        }
        .colStyle1 {
          background: #f8fafc;
        }
        .color1 {
          background: #d7d7d7;
        }
        .color2 {
          background: #03a7f0;
        }
        .color3 {
          background: #70b602;
        }
        .colStyle1:last-child {
          border-right: 1px solid #eaedf2;
        }
        .showContain {
          position: relative;
          .dashedBox {
            position: absolute;
            left: 0;
            top: 0;
            width: 100px;
            height: 100px;
            border: 1px dashed #000;
          }
          .dataShow {
            width: 100%;
            height: 100%;
            position: absolute;
            left: 0;
            top: 0;
          }
        }
        .smallStyle {
          height: 40px;
          border-right: 1px solid #eaedf2;
        }
      }
    }
  }
  .deleteItem {
    position: absolute;
    right: 0;
    top: 10px;
    border: none;
    color: #03a7f0;
  }
  .deleteBtn {
    position: absolute;
    right: 0;
    top: 10px;
    width: 60px;
    font-size: 13px;
    color: #27a9f8;
    display: flex;
    cursor: pointer;
    span {
      margin-left: 4px;
      display: inline-block;
      vertical-align: middle;
    }
  }
}
</style>
