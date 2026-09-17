import type { FormHints } from "./types";

export const barChartHints: FormHints = {
    title:          { title: "图表标题" },
    showGrid:       { title: "显示网格" },
    showLegend:     { title: "显示图例" },
    tooltipEnabled: { title: "启用提示" },
    barColor:       { title: "柱体颜色", widget: "color", placeholder: "例如：#5470c6" },
};

export const multiBarChartHints: FormHints = {
    title:          { title: "图表标题" },
    showGrid:       { title: "显示网格" },
    showLegend:     { title: "显示图例" },
    tooltipEnabled: { title: "启用提示" },
    isStack:        { title: "堆叠模式" },
    colorPalette:   { title: "色板", hidden: true },
};

export const lineChartHints: FormHints = {
    title:          { title: "图表标题" },
    showGrid:       { title: "显示网格" },
    showLegend:     { title: "显示图例" },
    tooltipEnabled: { title: "启用提示" },
    lineColor:      { title: "线条颜色", widget: "color", placeholder: "例如：#73c0de" },
    smooth:         { title: "平滑曲线" },
    areaStyle:      { title: "填充面积" },
};

export const areaChartHints: FormHints = {
    title:          { title: "图表标题" },
    showGrid:       { title: "显示网格" },
    showLegend:     { title: "显示图例" },
    tooltipEnabled: { title: "启用提示" },
    lineColor:      { title: "线条颜色", widget: "color", placeholder: "例如：#73c0de" },
    smooth:         { title: "平滑曲线" },
    areaStyle:      { title: "填充面积" },
};

export const multiLineChartHints: FormHints = {
    title:          { title: "图表标题" },
    showGrid:       { title: "显示网格" },
    showLegend:     { title: "显示图例" },
    tooltipEnabled: { title: "启用提示" },
    smooth:         { title: "平滑曲线" },
    areaStyle:      { title: "填充面积" },
    colorPalette:   { title: "色板", hidden: true },
};

export const scatterChartHints: FormHints = {
    title:          { title: "图表标题" },
    showGrid:       { title: "显示网格" },
    showLegend:     { title: "显示图例" },
    tooltipEnabled: { title: "启用提示" },
    pointSize:      { title: "点大小", min: 1, max: 50 },
    pointColor:     { title: "点颜色", widget: "color", placeholder: "例如：#56ccf2" },
};

export const bubbleChartHints: FormHints = {
    title:          { title: "图表标题" },
    showGrid:       { title: "显示网格" },
    showLegend:     { title: "显示图例" },
    tooltipEnabled: { title: "启用提示" },
    pointSize:      { title: "基础点大小", min: 1, max: 50 },
    pointColor:     { title: "默认颜色", widget: "color", placeholder: "例如：#5470c6" },
    sizeRange:      { title: "气泡尺寸范围", hidden: true },
    colorPalette:   { title: "色板", hidden: true },
};

export const horizontalBarChartHints: FormHints = {
    title:          { title: "图表标题" },
    showGrid:       { title: "显示网格" },
    showLegend:     { title: "显示图例" },
    tooltipEnabled: { title: "启用提示" },
    barColor:       { title: "柱体颜色", widget: "color", placeholder: "例如：#5470c6" },
};

export const pieChartHints: FormHints = {
    title:          { title: "图表标题" },
    showLegend:     { title: "显示图例" },
    tooltipEnabled: { title: "启用提示" },
    innerRadius:    { title: "内半径(%)", min: 0, max: 70 },
};

export const rosePieChartHints: FormHints = {
    title:          { title: "图表标题" },
    showLegend:     { title: "显示图例" },
    tooltipEnabled: { title: "启用提示" },
    innerRadius:    { title: "内半径(%)", min: 0, max: 70 },
    roseType:       { title: "玫瑰模式", enum: ["area", "radius"], widget: "radio" },
};

export const radarChartHints: FormHints = {
    title:          { title: "图表标题" },
    showGrid:       { title: "显示网格" },
    showLegend:     { title: "显示图例" },
    tooltipEnabled: { title: "启用提示" },
    indicators:     { title: "雷达指标", hidden: true },
    colorPalette:   { title: "色板", hidden: true },
};

export const funnelChartHints: FormHints = {
    title:          { title: "图表标题" },
    showGrid:       { title: "显示网格" },
    showLegend:     { title: "显示图例" },
    tooltipEnabled: { title: "启用提示" },
    sort:           { title: "排序方式", enum: ["ascending", "descending", "none"], widget: "select" },
    colorPalette:   { title: "色板", hidden: true },
};

export const gaugeChartHints: FormHints = {
    title:          { title: "图表标题" },
    showGrid:       { title: "显示网格" },
    showLegend:     { title: "显示图例" },
    tooltipEnabled: { title: "启用提示" },
    value:          { title: "当前值" },
    min:            { title: "最小值" },
    max:            { title: "最大值" },
    gaugeColor:     { title: "仪表盘颜色", widget: "color", placeholder: "例如：#5470c6" },
    unit:           { title: "单位", placeholder: "例如：%" },
};

export const treemapChartHints: FormHints = {
    title:          { title: "图表标题" },
    showGrid:       { title: "显示网格" },
    showLegend:     { title: "显示图例" },
    tooltipEnabled: { title: "启用提示" },
    colorPalette:   { title: "色板", hidden: true },
};
