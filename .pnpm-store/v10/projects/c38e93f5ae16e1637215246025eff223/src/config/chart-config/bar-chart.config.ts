import type { BarChartComponent } from "@/core/schema/chart";

/**
 * BarChart 组件默认配置
 * - 用于拖拽创建时初始化一个可用的柱状图示例
 */
export const barChartDefaultConfig: BarChartComponent = {
    id: "",
    type: "BarChart",
    name: "柱状图",
    props: {
        title: "示例柱状图",
        showGrid: true,
        showLegend: false,
        tooltipEnabled: true,
        barColor: "#5470c6",
    },
    dataSource: {
        sourceType: "static",
        data: [
            { name: "A", value: 120 },
            { name: "B", value: 200 },
            { name: "C", value: 150 },
        ],
        fieldMapping: { x: "name", y: "value" },
    },
    style: {
        top: 0,
        left: 0,
        width: 400,
        height: 300,
        zIndex: 1,
    },
};
