import { useMemo } from "react";
import * as echarts from "echarts";
import type { RendererProps } from "@/core/schema/types";
import type { ScatterChartComponent } from "@/core/schema/chart";
import EChartsBase from "./EChartsBase";

/**
 * 散点图业务组件
 */
export default function ScatterChart({ node }: RendererProps) {
    const chartNode = node as ScatterChartComponent;
    const { props, dataSource } = chartNode;
    const data = (dataSource?.data ?? []) as Record<string, any>[];
    const fm = dataSource?.fieldMapping ?? {};

    const option = useMemo(() => {
        const xField = fm.x ?? "x";
        const yField = fm.y ?? "y";
        const baseSize = props.pointSize ?? 10;
        const seriesData = data.map((item) => ({
            value: [item[xField], item[yField]],
            name: item.label ?? item[xField],
        }));

        return {
            title: {
                text: props.title,
                top: 0,
            },
            tooltip: {
                show: props.tooltipEnabled,
                trigger: "item",
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
                type: "value",
                name: xField,
            },
            yAxis: {
                type: "value",
                name: yField,
                splitLine: {
                    show: props.showGrid !== false,
                },
            },
            series: [
                {
                    type: "scatter",
                    data: seriesData,
                    symbolSize: baseSize,
                    itemStyle: {
                        color: props.pointColor || "#56ccf2",
                        opacity: 0.85,
                    },
                },
            ],
        } as echarts.EChartsOption;
    }, [data, fm, props]);

    return <EChartsBase option={option} />;
}
