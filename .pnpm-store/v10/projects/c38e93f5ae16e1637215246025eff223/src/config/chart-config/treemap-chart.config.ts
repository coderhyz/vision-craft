import type { TreemapChartComponent } from "@/core/schema/chart";

export const treemapChartDefaultConfig: TreemapChartComponent = {
    id: "",
    type: "TreemapChart",
    name: "矩形树图",
    props: {
        title: "示例矩形树图",
        showGrid: false,
        showLegend: false,
        tooltipEnabled: true,
    },
    dataSource: {
        sourceType: "static",
        data: [
            { name: "技术部", value: 120 },
            { name: "产品部", value: 90 },
            { name: "设计部", value: 60 },
            { name: "市场部", value: 80 },
            { name: "运营部", value: 50 },
            { name: "销售部", value: 70 },
        ],
        fieldMapping: { name: "name", value: "value" },
    },
    style: {
        top: 0,
        left: 0,
        width: 400,
        height: 300,
        zIndex: 1,
    },
};
