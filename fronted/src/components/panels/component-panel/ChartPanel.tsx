import type React from "react";
import {
    BarChart2, BarChart3, BarChartHorizontal,
    AreaChart as AreaChartIcon, LineChart, PieChart, CircleDot, Circle, Radar, GitMerge, Gauge, LayoutGrid
} from "lucide-react";
import DraggableItem from "@/core/dnd-kit/DraggableItem";
// 图表类型
type ChartCategory = "bar" | "line" | "pie" | "scatter" | "other";
interface ChartItem { type: string; name: string; icon: React.ReactNode; }
// 图表面板子项
function ChartPanelItem({ type, name, icon }: ChartItem) {
    return (
        <DraggableItem id={type}>
            <div className="w-[100px] h-[100px] 
            flex flex-col items-center justify-evenly 
            rounded-lg border border-slate-200
            bg-white cursor-grab text-slate-500 text-xs transition-all duration-200
            hover:border-cyan-300 hover:bg-cyan-50/50 hover:text-cyan-600 active:scale-95 shadow-soft">
                <div>{icon}</div>
                <p>{name}</p>
            </div>
        </DraggableItem>
    );
}

const chartItemsByCategory: Record<ChartCategory, ChartItem[]> = {
    bar: [
        { type: "BarChart", name: "基础柱状图", icon: <BarChart2 className="h-5 w-5" /> },
        { type: "HorizontalBarChart", name: "横向柱状图", icon: <BarChartHorizontal className="h-5 w-5" /> },
        { type: "MultiBarChart", name: "多系列柱状图", icon: <BarChart3 className="h-5 w-5" /> },
    ],
    line: [
        { type: "LineChart", name: "折线图", icon: <LineChart className="h-5 w-5" /> },
        { type: "AreaChart", name: "面积图", icon: <AreaChartIcon className="h-5 w-5" /> },
        { type: "MultiLineChart", name: "多系列折线图", icon: <LineChart className="h-5 w-5" /> },
    ],
    pie: [
        { type: "PieChart", name: "饼图/环形图", icon: <PieChart className="h-5 w-5" /> },
        { type: "RosePieChart", name: "玫瑰图", icon: <PieChart className="h-5 w-5" /> },
    ],
    scatter: [
        { type: "ScatterChart", name: "散点图", icon: <CircleDot className="h-5 w-5" /> },
        { type: "BubbleChart", name: "气泡图", icon: <Circle className="h-5 w-5" /> },
    ],
    other: [
        { type: "RadarChart", name: "雷达图", icon: <Radar className="h-5 w-5" /> },
        { type: "FunnelChart", name: "漏斗图", icon: <GitMerge className="h-5 w-5" /> },
        { type: "GaugeChart", name: "仪表盘", icon: <Gauge className="h-5 w-5" /> },
        { type: "TreemapChart", name: "矩形树图", icon: <LayoutGrid className="h-5 w-5" /> },
    ],
};

export default function ChartPanel({ category }: { category: ChartCategory }) {
    const chartItems = chartItemsByCategory[category] ?? chartItemsByCategory.bar;
    return (
        <div className="h-full min-h-0 w-[245px]
            grid grid-cols-2 grid-rows-component 
            gap-3 overflow-y-auto p-3">
            {chartItems.map((item) => <ChartPanelItem key={item.type} {...item} />)}
        </div>
    );
}
