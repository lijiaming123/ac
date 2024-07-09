export default {
  // 标题
  zh_title1: "业务预测准确性分析",
  zh_export_title: "业务量预测-准确率分析",

  // tab切换

  // 按钮
  zh_export: "导出",
  // 表格
  zh_ori_name: "组织名称",
  zh_ori_id: "组织编码",
  zh_time_accuracy_rate_standard: "时段准确率达标值",
  zh_allowable_deviation_time: "时段允许偏差值",
  zh_standard_value_daily_accuracy: "日准确率达标值",
  zh_days_pass_rate: "天合格率（基于日准确率达标值）",
  zh_date: "日期",
  zh_accuracy_rate: "准确率",
  zh_pass_rate_deviation: "合格率（基于允许偏差值）",
  zh_pass_rate_accuracy: "合格率（基于时段准确率达标值）",
  zh_average_value: "平均值",

  // 分页栏

  // 提示
  zh_more_31: "日期范围最多支持选择31天",
  zh_time_accuracy_rate_standard_tip: "期望每个时段的业务预测结果可达到的准确率",
  zh_allowable_deviation_time_tip: "允许某个时段的业务量实际值与预测值之差小于该值，若超出则表示该时段的预测准确率不达标",
  zh_standard_value_daily_accuracy_tip: "期望每日的业务预测结果可达到的准确率",
  zh_days_pass_rate_tip: "计算公式为：所选天数中日准确率≥日准确率标准的天数之和/所选天数",
  zh_accuracy_rate_tip: "指日准确率，计算公式为：1-|（每日实际业务量汇总值-每日预测业务量汇总值）/每日实际业务量汇总值|",
  zh_pass_rate_deviation_tip_1: "指日合格率，计算公式为：|每日实际与预测业务量差|≤允许偏差值的时段数/日总时段数",
  zh_pass_rate_accuracy_tip: "指日合格率，计算公式为：每日中时段准确率≥时段准确率标准的时段/日总时段数"
};
