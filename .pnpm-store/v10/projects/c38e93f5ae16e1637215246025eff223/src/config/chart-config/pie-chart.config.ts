import type { PieChartComponent } from "@/core/schema/chart";

/**
 * PieChart 默认配置
 */
export const pieChartDefaultConfig: PieChartComponent = {
    id: "",
    type: "PieChart",
    name: "饼图",
    props: {
        title: "示例饼图",
        innerRadius: 30,
        showLegend: true,
        tooltipEnabled: true,
    },
    dataSource: {
        sourceType: "static",
        data: [
            { name: "分类A", value: 40 },
            { name: "分类B", value: 32 },
            { name: "分类C", value: 28 },
        ],
        fieldMapping: { name: "name", value: "value" },
    },
    style: {
        top: 0,
        left: 0,
        width: 380,
        height: 320,
        zIndex: 1,
    },
};
