export type { FormHint, FormHints, ComponentHintsRegistry } from "./types";

import type { ComponentHintsRegistry } from "./types";
import {
    textHints, imageHints, buttonHints, clockHints, statisticCardHints,
    progressBarHints, countdownHints, dividerHints, badgeHints, tagHints,
    avatarHints, rateHints, switchHints,
} from "./basic";
import {
    barChartHints, multiBarChartHints, lineChartHints, areaChartHints,
    multiLineChartHints, scatterChartHints, bubbleChartHints, horizontalBarChartHints,
    pieChartHints, rosePieChartHints, radarChartHints, funnelChartHints,
    gaugeChartHints, treemapChartHints,
} from "./chart";

export const componentHintsRegistry: ComponentHintsRegistry = {
    // 基础组件
    Text:          textHints,
    Image:         imageHints,
    Button:        buttonHints,
    Clock:         clockHints,
    StatisticCard: statisticCardHints,
    ProgressBar:   progressBarHints,
    Countdown:     countdownHints,
    Divider:       dividerHints,
    Badge:         badgeHints,
    Tag:           tagHints,
    Avatar:        avatarHints,
    Rate:          rateHints,
    Switch:        switchHints,
    // 图表组件
    BarChart:           barChartHints,
    MultiBarChart:      multiBarChartHints,
    LineChart:          lineChartHints,
    AreaChart:          areaChartHints,
    MultiLineChart:     multiLineChartHints,
    ScatterChart:       scatterChartHints,
    BubbleChart:        bubbleChartHints,
    HorizontalBarChart: horizontalBarChartHints,
    PieChart:           pieChartHints,
    RosePieChart:       rosePieChartHints,
    RadarChart:         radarChartHints,
    FunnelChart:        funnelChartHints,
    GaugeChart:         gaugeChartHints,
    TreemapChart:       treemapChartHints,
};
