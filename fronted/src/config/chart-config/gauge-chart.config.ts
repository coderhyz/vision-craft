import type { GaugeChartComponent } from "@/core/schema/chart";

export const gaugeChartDefaultConfig: GaugeChartComponent = {
    id: "",
    type: "GaugeChart",
    name: "仪表盘",
    props: {
        title: "示例仪表盘",
        showGrid: false,
        showLegend: false,
        tooltipEnabled: true,
        value: 72,
        min: 0,
        max: 100,
        gaugeColor: "#5470c6",
        unit: "%",
    },
    style: {
        top: 0,
        left: 0,
        width: 350,
        height: 300,
        zIndex: 1,
    },
};
