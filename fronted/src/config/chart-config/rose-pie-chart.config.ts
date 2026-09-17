import type { RosePieChartComponent } from "@/core/schema/chart";

/**
 * RosePieChart 默认配置
 * - 展示南丁格尔玫瑰图示例
 */
export const rosePieChartDefaultConfig: RosePieChartComponent = {
    id: "",
    type: "RosePieChart",
    name: "玫瑰图",
    props: {
        title: "示例玫瑰图",
        innerRadius: 10,
        roseType: "area",
        showLegend: true,
        tooltipEnabled: true,
    },
    dataSource: {
        sourceType: "static",
        data: [
            { name: "分类A", value: 40 },
            { name: "分类B", value: 32 },
            { name: "分类C", value: 28 },
            { name: "分类D", value: 20 },
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
