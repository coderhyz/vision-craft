import { useMemo } from "react";
import * as echarts from "echarts";
import type { RendererProps } from "@/core/schema/types";
import type { BarChartComponent } from "@/core/schema/chart";
import EChartsBase from "./EChartsBase";

/**
 * BarChart 业务组件
 * - 从 node.dataSource 读取数据和字段映射
 * - 从 node.props 读取视觉配置
 */
export default function BarChart({ node }: RendererProps) {
    const chartNode = node as BarChartComponent;
    const { props, dataSource } = chartNode;

    const data = (dataSource?.data ?? []) as Record<string, any>[];
    const fm = dataSource?.fieldMapping ?? {};

    const option = useMemo(() => {
        const xField = fm.x ?? "name";
        const yField = fm.y ?? "value";
        const xData = data.map((item) => item[xField]);
        const yData = data.map((item) => item[yField]);

        return {
            title: {
                text: props.title,
                top: 0,
            },
            tooltip: {
                show: props.tooltipEnabled,
                trigger: "axis",
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
                    show: props.showGrid ?? true,
                },
            },
            legend: {
                show: props.showLegend,
            },
            series: [
                {
                    type: "bar",
                    data: yData,
                    itemStyle: {
                        color: props.barColor || "#5470c6",
                    },
                },
            ],
        } as echarts.EChartsOption;
    }, [data, fm, props]);

    return <EChartsBase option={option} />;
}
