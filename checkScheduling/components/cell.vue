<script>
function renderShiftDetail(h, context, payload) {
  let {name, gmtStart, gmtEnd} = payload;
  if (!gmtStart && !gmtEnd) {
    name = name || context.$t("zh_no_schedule");
  }
  name = name || context.$t("zh_unnamed_schedule");
  return (
    <el-tooltip open-delay={500} hide-after={0} placement="top">
      <div
        class="task-name"
        on-click={() => {
          console.log(`班次===>  ${name} - ${gmtStart}`, payload);
        }}>
        {name}
      </div>
      <div slot="content">
        <div>
          {context.$t("zh_start_time")}: {gmtStart}
        </div>
        <div>
          {context.$t("zh_end_time")}: {gmtEnd}
        </div>
      </div>
    </el-tooltip>
  );
}

export default {
  name: "cell",
  data() {
    return {};
  },
  computed: {
    // hasSourceTasks() {
    //     return ['gmtStart', 'gmtEnd'].every(key => Reflect.has(this.source, key))
    // },
    // hasTargetTasks() {
    //     return ['gmtStart', 'gmtEnd'].every(key => Reflect.has(this.target, key))
    // }
  },
  props: {
    target: Array,
    source: Array,
    diff: {
      default: false,
      type: Boolean
    }
  },
  render() {
    const {diff, target, source} = this;
    return (
      <div class={{diff, "cell-content": true, "flex-center": true}}>
        {(() => {
          if (!source.length && !target.length) {
            return null;
          } else if (diff && source.length) {
            return (
              <div class="flex">
                <div class="shift-detail flex-center">{this.source.map((task) => renderShiftDetail(this.$createElement, this, task))}</div>
                <div class="ml-5 mr-5 flex-center">→</div>
                <div class="shift-detail flex-center">{this.target.map((task) => renderShiftDetail(this.$createElement, this, task))}</div>
              </div>
            );
          } else {
            return <div class="shift-detail">{this.target.map((task) => renderShiftDetail(this.$createElement, this, task))}</div>;
          }
        })()}
      </div>
    );
  }
};
</script>
<style lang="less" scoped>
.cell-content {
  min-height: 42px;
  overflow: auto;
}
// .diff {
//     background: #d3e6f0;
// }
:deep(.el-tooltip) {
  line-height: initial;
}
:deep(.shift-detail) {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.flex-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.task-name {
  & + .task-name {
    margin-top: 6px;
  }
  &:hover {
    background: #d3e6f0;
  }
}
</style>
