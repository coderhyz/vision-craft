import type { BubbleChartComponent } from "@/core/schema/chart";

/**
 * BubbleChart 默认配置
 */
export const bubbleChartDefaultConfig: BubbleChartComponent = {
    id: "",
    type: "BubbleChart",
    name: "气泡图",
    props: {
        title: "示例气泡图",
        sizeRange: [10, 50],
        pointSize: 12,
        pointColor: "#5470c6",
        colorPalette: ["#5470c6", "#91cc75", "#fac858"],
        showGrid: true,
        showLegend: true,
        tooltipEnabled: true,
    },
    dataSource: {
        sourceType: "static",
        data: [
            { x: 12, y: 16, size: 15, category: "区域A" },
            { x: 18, y: 24, size: 28, category: "区域A" },
            { x: 30, y: 20, size: 35, category: "区域B" },
            { x: 22, y: 32, size: 25, category: "区域B" },
            { x: 28, y: 12, size: 18, category: "区域C" },
        ],
        fieldMapping: { x: "x", y: "y", size: "size", category: "category" },
    },
    style: {
        top: 0,
        left: 0,
        width: 440,
        height: 340,
        zIndex: 1,
    },
};
