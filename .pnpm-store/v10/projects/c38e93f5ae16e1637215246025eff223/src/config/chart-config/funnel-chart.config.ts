import type { FunnelChartComponent } from "@/core/schema/chart";

export const funnelChartDefaultConfig: FunnelChartComponent = {
    id: "",
    type: "FunnelChart",
    name: "漏斗图",
    props: {
        title: "示例漏斗图",
        showGrid: false,
        showLegend: true,
        tooltipEnabled: true,
        sort: "descending",
    },
    dataSource: {
        sourceType: "static",
        data: [
            { name: "展现", value: 100 },
            { name: "点击", value: 80 },
            { name: "访问", value: 60 },
            { name: "咨询", value: 40 },
            { name: "成交", value: 20 },
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
