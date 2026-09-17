import type { ComponentType } from "@/core/schema/types";

/**
 * 字段映射槽位定义
 * - 每个图表类型声明需要哪些数据字段映射
 * - 供 DataSourceEditor 自动渲染字段映射下拉选择
 */
export interface FieldSlot {
    key: string; // 映射 key，对应 fieldMapping 中的 key（如 "x", "y", "name", "value"）
    label: string; // 中文标签（如 "X 轴(类目)"）
    required?: boolean; // 是否必填
}

export const chartFieldSlots: Partial<Record<ComponentType, FieldSlot[]>> = {
    BarChart: [
        { key: "x", label: "X 轴(类目)", required: true },
        { key: "y", label: "Y 轴(数值)", required: true },
    ],
    MultiBarChart: [
        { key: "x", label: "X 轴(类目)", required: true },
        { key: "y", label: "Y 轴(数值)", required: true },
        { key: "series", label: "系列字段", required: true },
    ],
    LineChart: [
        { key: "x", label: "X 轴", required: true },
        { key: "y", label: "Y 轴", required: true },
    ],
    AreaChart: [
        { key: "x", label: "X 轴", required: true },
        { key: "y", label: "Y 轴", required: true },
    ],
    MultiLineChart: [
        { key: "x", label: "X 轴", required: true },
        { key: "y", label: "Y 轴", required: true },
        { key: "series", label: "系列字段", required: true },
    ],
    ScatterChart: [
        { key: "x", label: "X 轴", required: true },
        { key: "y", label: "Y 轴", required: true },
    ],
    BubbleChart: [
        { key: "x", label: "X 轴", required: true },
        { key: "y", label: "Y 轴", required: true },
        { key: "size", label: "气泡大小", required: true },
        { key: "category", label: "分组字段" },
    ],
    HorizontalBarChart: [
        { key: "category", label: "类目", required: true },
        { key: "value", label: "数值", required: true },
    ],
    PieChart: [
        { key: "name", label: "名称", required: true },
        { key: "value", label: "数值", required: true },
    ],
    RosePieChart: [
        { key: "name", label: "名称", required: true },
        { key: "value", label: "数值", required: true },
    ],
    FunnelChart: [
        { key: "name", label: "名称", required: true },
        { key: "value", label: "数值", required: true },
    ],
    TreemapChart: [
        { key: "name", label: "名称", required: true },
        { key: "value", label: "数值", required: true },
    ],
    // RadarChart: 走 indicators 定义维度，不使用 fieldMapping
    // GaugeChart: 直接传 value，不需要 fieldMapping
};
