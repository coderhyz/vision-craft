import { textDefaultConfig } from "./basic-config/text.config";
import { containerDefaultConfig } from "./basic-config/container.config";
import { clockDefaultConfig } from "./basic-config/clock.config";
import { barChartDefaultConfig } from "./chart-config/bar-chart.config";
import { imageDefaultConfig } from "./basic-config/image.config";
import { buttonDefaultConfig } from "./basic-config/button.config";
import { statisticCardDefaultConfig } from "./basic-config/statistic-card.config";
import { progressBarDefaultConfig } from "./basic-config/progress-bar.config";
import { countdownDefaultConfig } from "./basic-config/countdown.config";
import { dividerDefaultConfig } from "./basic-config/divider.config";
import { badgeDefaultConfig } from "./basic-config/badge.config";
import { tagDefaultConfig } from "./basic-config/tag.config";
import { avatarDefaultConfig } from "./basic-config/avatar.config";
import { rateDefaultConfig } from "./basic-config/rate.config";
import { switchDefaultConfig } from "./basic-config/switch.config";
import { lineChartDefaultConfig } from "./chart-config/line-chart.config";
import { pieChartDefaultConfig } from "./chart-config/pie-chart.config";
import { multiBarChartDefaultConfig } from "./chart-config/multi-bar-chart.config";
import { scatterChartDefaultConfig } from "./chart-config/scatter-chart.config";
import { bubbleChartDefaultConfig } from "./chart-config/bubble-chart.config";
import { areaChartDefaultConfig } from "./chart-config/area-chart.config";
import { multiLineChartDefaultConfig } from "./chart-config/multi-line-chart.config";
import { horizontalBarChartDefaultConfig } from "./chart-config/horizontal-bar-chart.config";
import { rosePieChartDefaultConfig } from "./chart-config/rose-pie-chart.config";
import { radarChartDefaultConfig } from "./chart-config/radar-chart.config";
import { funnelChartDefaultConfig } from "./chart-config/funnel-chart.config";
import { gaugeChartDefaultConfig } from "./chart-config/gauge-chart.config";
import { treemapChartDefaultConfig } from "./chart-config/treemap-chart.config";
import { smartDeepClone } from "@/utils/deepClone";
import type { ComponentNode } from "@/core/schema/basic";

/**
 * 组件默认配置映射
 * - key 对应 Schema 中的组件类型 type
 * - value 为组件的默认 DSL 配置
 */
export const componentDefaultConfigs = {
    Text: textDefaultConfig,
    Image: imageDefaultConfig,
    Button: buttonDefaultConfig,
    Container: containerDefaultConfig,
    Clock: clockDefaultConfig,
    StatisticCard: statisticCardDefaultConfig,
    ProgressBar: progressBarDefaultConfig,
    Countdown: countdownDefaultConfig,
    Divider: dividerDefaultConfig,
    Badge: badgeDefaultConfig,
    Tag: tagDefaultConfig,
    Avatar: avatarDefaultConfig,
    Rate: rateDefaultConfig,
    Switch: switchDefaultConfig,
    BarChart: barChartDefaultConfig,
    HorizontalBarChart: horizontalBarChartDefaultConfig,
    MultiBarChart: multiBarChartDefaultConfig,
    LineChart: lineChartDefaultConfig,
    AreaChart: areaChartDefaultConfig,
    MultiLineChart: multiLineChartDefaultConfig,
    PieChart: pieChartDefaultConfig,
    RosePieChart: rosePieChartDefaultConfig,
    ScatterChart: scatterChartDefaultConfig,
    BubbleChart: bubbleChartDefaultConfig,
    RadarChart: radarChartDefaultConfig,
    FunnelChart: funnelChartDefaultConfig,
    GaugeChart: gaugeChartDefaultConfig,
    TreemapChart: treemapChartDefaultConfig,
};

/**
 * 获取新的组件配置
 * @param type 组件类型
 * @returns 组件的默认配置
 */
export const getNewComponentConfig = (
    type: keyof typeof componentDefaultConfigs,
): ComponentNode => {
    // 根据type 获取对应的默认配置
    return smartDeepClone(componentDefaultConfigs[type]);
};
