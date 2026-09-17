import type { LineChartComponent } from "@/core/schema/chart";

/**
 * LineChart 默认配置
 */
export const lineChartDefaultConfig: LineChartComponent = {
    id: "",
    type: "LineChart",
    name: "折线图",
    props: {
        title: "示例折线图",
        lineColor: "#73c0de",
        smooth: true,
        areaStyle: false,
        showGrid: true,
        showLegend: false,
        tooltipEnabled: true,
    },
    dataSource: {
        sourceType: "static",
        data: [
            { name: "一月", value: 120 },
            { name: "二月", value: 200 },
            { name: "三月", value: 150 },
            { name: "四月", value: 260 },
            { name: "五月", value: 210 },
            { name: "六月", value: 180 },
        ],
        fieldMapping: { x: "name", y: "value" },
    },
    style: {
        top: 0,
        left: 0,
        width: 420,
        height: 300,
        zIndex: 1,
    },
};
