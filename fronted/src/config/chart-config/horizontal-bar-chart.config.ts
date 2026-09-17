import type { HorizontalBarChartComponent } from "@/core/schema/chart";

/**
 * HorizontalBarChart 默认配置
 * - 以横向方式展示的单系列柱状图
 */
export const horizontalBarChartDefaultConfig: HorizontalBarChartComponent = {
    id: "",
    type: "HorizontalBarChart",
    name: "横向柱状图",
    props: {
        title: "示例横向柱状图",
        barColor: "#5470c6",
        showGrid: true,
        showLegend: false,
        tooltipEnabled: true,
    },
    dataSource: {
        sourceType: "static",
        data: [
            { name: "分类A", value: 120 },
            { name: "分类B", value: 200 },
            { name: "分类C", value: 150 },
            { name: "分类D", value: 80 },
        ],
        fieldMapping: { category: "name", value: "value" },
    },
    style: {
        top: 0,
        left: 0,
        width: 420,
        height: 320,
        zIndex: 1,
    },
};
