import { useMemo } from "react";
import * as echarts from "echarts";
import type { RendererProps } from "@/core/schema/types";
import type { AreaChartComponent } from "@/core/schema/chart";
import EChartsBase from "./EChartsBase";

/**
 * 面积图业务组件
 * - 基于折线图的填充变体
 */
export default function AreaChart({ node }: RendererProps) {
    const chartNode = node as AreaChartComponent;
    const { props, dataSource } = chartNode;
    const data = (dataSource?.data ?? []) as Record<string, any>[];
    const fm = dataSource?.fieldMapping ?? {};

    const option = useMemo(() => {
        const xField = fm.x ?? "name";
        const yField = fm.y ?? "value";
        const xData = data.map((item) => item[xField]);
        const yData = data.map((item) => item[yField]);
        const color = props.lineColor || "#73c0de";
        const enableArea = props.areaStyle !== false;

        return {
            title: {
                text: props.title,
                top: 0,
            },
            tooltip: {
                show: props.tooltipEnabled,
                trigger: "axis",
            },
            legend: {
                show: props.showLegend,
                data: props.showLegend ? [props.title] : [],
            },
            grid: {
                top: 40,
                right: 10,
                bottom: 10,
                left: 10,
                containLabel: true,
            },
            xAxis: {
                type: "category",
                data: xData,
            },
            yAxis: {
                type: "value",
                splitLine: {
                    show: props.showGrid !== false,
                },
            },
            series: [
                {
                    name: props.title,
                    type: "line",
                    smooth: props.smooth,
                    areaStyle: enableArea ? {} : undefined,
                    data: yData,
                    lineStyle: {
                        color,
                    },
                    itemStyle: {
                        color,
                    },
                    showSymbol: true,
                },
            ],
        } as echarts.EChartsOption;
    }, [data, fm, props]);

    return <EChartsBase option={option} />;
}
