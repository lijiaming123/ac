<template>
  <div class="sch-com-stats-chart">
    <div class="chart-main">
      <div class="chart-wrap" ref="chartWrap">
        <div class="chart" ref="chart" :style="{width: chartWidth, height: chartHeight + 'px'}"></div>
      </div>
    </div>
  </div>
</template>

<script>
import echarts from "echarts";
export default {
  components: {},
  props: {
    rangeArr: Array,
    typeList: Array,
    data: Array,
    chartWidth: {
      type: String,
      default: "0px"
    },
    chartHeight: {
      type: Number,
      default: 0
    }
  },
  watch: {
    data(val) {
      this.$nextTick(() => {
        this.initChart();
      });
    }
  },
  mounted() {
    console.log(this.chartWidth);
    this.initChart();
  },
  data() {
    return {
      chartType: 0,
      historyData: []
    };
  },
  computed: {
    renderData() {
      // if (this.chartType) {
      //   return this.data.find(item => item.typeBid === this.chartType).period || [];
      // }
      // return [];
      return this.data[0].period;
    },
    getXAxisData() {
      let result = [];
      this.rangeArr.forEach((obj, i, arr) => {
        if (i === arr.length - 1) {
          result.push(obj.start, obj.end);
        } else {
          result.push(obj.start);
        }
      });
      return result;
    }
  },
  methods: {
    initChart() {
      const chartOption = {
        grid: {
          show: true,
          left: "107",
          right: "50",
          top: "40",
          bottom: "30",
          containLabel: true,
          borderWidth: 0
        },
        color: [],
        xAxis: {
          axisLine: {
            lineStyle: {
              color: "#EAEDF2"
            }
          },
          axisTick: {
            show: true
          },
          splitLine: {
            show: false
          },
          data: this.getXAxisData,
          axisLabel: {
            textStyle: {
              color: "#3C5266",
              fontSize: 13
            }
          },
          type: "category",
          boundaryGap: false
        },
        yAxis: {
          axisLine: {
            show: false
          },
          axisLabel: {
            textStyle: {
              color: "#555",
              fontSize: 12
            }
          },
          splitLine: {
            lineStyle: {
              color: "#EAEDF2"
            }
          }
        },
        tooltip: {
          trigger: "item",
          position: "top",
          backgroundColor: "#fff",
          borderColor: "#E5E5E5",
          borderWidth: 1,
          extraCssText: "box-shadow:0px 2px 5px 1px rgba(226,226,226,0.5);padding:10px 12px;margin-left:-50px;",
          textStyle: {
            color: "#555",
            fontSize: 13,
            lineHeight: 80
          },
          formatter(d, t, c) {
            var html = "";
            html += '<span style="display:inline-block;margin-right:10px;border-radius:4px;width:8px;height:8px;background-color:';
            html += d.color;
            html += ';"></span>';
            html += d.seriesName;
            html += "：";
            html += d.name;
            html += "：";
            html += d.value;
            c(t, html);
            return html;
          }
        },
        series: [],
        dataZoom: [
          {
            type: "inside",
            disabled: true,
            start: 0,
            end: 100,
            xAxisIndex: 0,
            filterMode: "empty"
          }
        ]
      };
      chartOption.series = [];
      chartOption.color = [];
      chartOption.series.push({
        name: this.$t("zh_predictive_value"),
        type: "line",
        symbolSize: 7,
        data: [0, ...this.renderData]
      });
      chartOption.color.push("#0091FF");
      this.$nextTick(() => {
        let chart = echarts.init(this.$refs.chart);
        this.chart = chart;
        this.chartOption = chartOption;
        chart.setOption(chartOption, true);
      });
    },
    wrapScroll(left) {
      this.$refs.chartWrap.scrollLeft = left;
    }
  }
};
</script>

<style lang="less" scoped>
.sch-com-stats-chart {
  // box-shadow: 0px -5px 3px 0px rgba(243, 243, 243, 0.5);
  border-top: 1px solid #eaedf2;
  position: relative;
  .chart-main {
    width: 100%;
    .chart-wrap {
      overflow: auto;
      overflow-x: hidden;
      margin-left: 20px;
    }
  }
}
</style>
