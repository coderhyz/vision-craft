import type { ScatterChartComponent } from "@/core/schema/chart";

/**
 * ScatterChart 默认配置
 */
export const scatterChartDefaultConfig: ScatterChartComponent = {
    id: "",
    type: "ScatterChart",
    name: "散点图",
    props: {
        title: "示例散点图",
        pointSize: 10,
        pointColor: "#56ccf2",
        showGrid: true,
        showLegend: false,
        tooltipEnabled: true,
    },
    dataSource: {
        sourceType: "static",
        data: [
            { x: 10, y: 8, label: "A" },
            { x: 20, y: 18, label: "B" },
            { x: 15, y: 12, label: "C" },
            { x: 25, y: 30, label: "D" },
            { x: 30, y: 22, label: "E" },
        ],
        fieldMapping: { x: "x", y: "y" },
    },
    style: {
        top: 0,
        left: 0,
        width: 420,
        height: 320,
        zIndex: 1,
    },
};
