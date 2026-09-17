import type { MultiBarChartComponent } from "@/core/schema/chart";

/**
 * MultiBarChart 组件默认配置
 * - 支持分组或堆叠的多系列柱状图
 */
export const multiBarChartDefaultConfig: MultiBarChartComponent = {
    id: "",
    type: "MultiBarChart",
    name: "多系列柱状图",
    props: {
        title: "多系列柱状图",
        showGrid: true,
        showLegend: true,
        tooltipEnabled: true,
        isStack: false,
        colorPalette: ["#5470c6", "#91cc75", "#fac858"],
    },
    dataSource: {
        sourceType: "static",
        data: [
            { category: "分类A", series: "2023", value: 120 },
            { category: "分类A", series: "2024", value: 180 },
            { category: "分类B", series: "2023", value: 140 },
            { category: "分类B", series: "2024", value: 160 },
            { category: "分类C", series: "2023", value: 110 },
            { category: "分类C", series: "2024", value: 130 },
        ],
        fieldMapping: { x: "category", y: "value", series: "series" },
    },
    style: {
        top: 0,
        left: 0,
        width: 420,
        height: 320,
        zIndex: 1,
    },
};
