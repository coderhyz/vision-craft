import { useMemo } from "react";
import * as echarts from "echarts";
import type { RendererProps } from "@/core/schema/types";
import type { HorizontalBarChartComponent } from "@/core/schema/chart";
import EChartsBase from "./EChartsBase";

/**
 * 横向柱状图业务组件
 */
export default function HorizontalBarChart({ node }: RendererProps) {
    const chartNode = node as HorizontalBarChartComponent;
    const { props, dataSource } = chartNode;
    const data = (dataSource?.data ?? []) as Record<string, any>[];
    const fm = dataSource?.fieldMapping ?? {};

    const option = useMemo(() => {
        const catField = fm.category ?? "name";
        const valField = fm.value ?? "value";
        const categories = data.map((item) => item[catField]);
        const values = data.map((item) => item[valField]);

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
                type: "value",
                splitLine: {
                    show: props.showGrid !== false,
                },
            },
            yAxis: {
                type: "category",
                data: categories,
            },
            series: [
                {
                    name: props.title,
                    type: "bar",
                    data: values,
                    itemStyle: {
                        color: props.barColor || "#5470c6",
                    },
                    barWidth: "40%",
                },
            ],
        } as echarts.EChartsOption;
    }, [data, fm, props]);

    return <EChartsBase option={option} />;
}
