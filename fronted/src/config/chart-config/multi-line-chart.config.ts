import type { MultiLineChartComponent } from "@/core/schema/chart";

/**
 * MultiLineChart 默认配置
 * - 多系列折线/面积示例，支持平滑与填充
 */
export const multiLineChartDefaultConfig: MultiLineChartComponent = {
    id: "",
    type: "MultiLineChart",
    name: "多系列折线图",
    props: {
        title: "多系列折线图",
        smooth: true,
        areaStyle: false,
        showGrid: true,
        showLegend: true,
        tooltipEnabled: true,
        colorPalette: ["#5470c6", "#91cc75", "#fac858"],
    },
    dataSource: {
        sourceType: "static",
        data: [
            { category: "一月", series: "今年", value: 120 },
            { category: "一月", series: "去年", value: 100 },
            { category: "二月", series: "今年", value: 180 },
            { category: "二月", series: "去年", value: 150 },
            { category: "三月", series: "今年", value: 160 },
            { category: "三月", series: "去年", value: 170 },
            { category: "四月", series: "今年", value: 240 },
            { category: "四月", series: "去年", value: 210 },
        ],
        fieldMapping: { x: "category", y: "value", series: "series" },
    },
    style: {
        top: 0,
        left: 0,
        width: 440,
        height: 320,
        zIndex: 1,
    },
};
