import type { AreaChartComponent } from "@/core/schema/chart";

/**
 * AreaChart 默认配置
 * - 折线填充成面积图的基础示例
 */
export const areaChartDefaultConfig: AreaChartComponent = {
    id: "",
    type: "AreaChart",
    name: "面积图",
    props: {
        title: "示例面积图",
        lineColor: "#73c0de",
        smooth: true,
        areaStyle: true,
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
