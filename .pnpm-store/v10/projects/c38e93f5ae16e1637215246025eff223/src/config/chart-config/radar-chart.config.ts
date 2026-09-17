import type { RadarChartComponent } from "@/core/schema/chart";

export const radarChartDefaultConfig: RadarChartComponent = {
    id: "",
    type: "RadarChart",
    name: "雷达图",
    props: {
        title: "示例雷达图",
        showGrid: true,
        showLegend: true,
        tooltipEnabled: true,
        indicators: [
            { name: "销售", max: 100 },
            { name: "管理", max: 100 },
            { name: "技术", max: 100 },
            { name: "客服", max: 100 },
            { name: "研发", max: 100 },
        ],
        colorPalette: ["#5470c6", "#91cc75"],
    },
    dataSource: {
        sourceType: "static",
        data: [
            { name: "部门A", "销售": 80, "管理": 70, "技术": 90, "客服": 60, "研发": 85 },
            { name: "部门B", "销售": 60, "管理": 85, "技术": 70, "客服": 80, "研发": 65 },
        ],
    },
    style: {
        top: 0,
        left: 0,
        width: 400,
        height: 350,
        zIndex: 1,
    },
};
