import type { StatisticCardComponent } from "@/core/schema/basic";

/**
 * StatisticCard 组件默认配置
 */
export const statisticCardDefaultConfig: StatisticCardComponent = {
    id: "",
    type: "StatisticCard",
    name: "指标卡",
    props: {
        title: "核心指标",
        subtitle: "今日",
        value: 12345,
        prefix: "",
        suffix: "",
        valueColor: "#1f1f1f",
        align: "左",
        trend: "上升",
        showTrendIcon: true,
        trendColorUp: "#52c41a",
        trendColorDown: "#ff4d4f",
        animated: true,
        valueFontSize: 32,
        titleFontSize: 16,
        subtitleFontSize: 14,
    },
    style: {
        top: 0,
        left: 0,
        width: 240,
        height: 120,
        zIndex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
    },
};
