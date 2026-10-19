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
    // 解构出 props 和 dataSource
    const { props, dataSource } = chartNode;
    // 静态数据
    const data = (dataSource?.data ?? []) as Record<string, any>[];
    // 字段映射，默认 x 映射 name，y 映射 value
    const fm = dataSource?.fieldMapping ?? {};

    const option = useMemo(() => {
        // 字段映射x
        const xField = fm.x ?? "name";
        // 字段映射y
        const yField = fm.y ?? "value";
        const xData = data.map((item) => item[xField]);
        const yData = data.map((item) => item[yField]);

        return {
            // 标题
            title: {
                text: props.title,
                top: 0,
            },
            // 提示框
            tooltip: {
                show: props.tooltipEnabled,
                trigger: "axis",
            },
            // 网格
            grid: {
                top: 40,
                right: 10,
                bottom: 10,
                left: 10,
                containLabel: true,
            },
            // x坐标轴
            xAxis: {
                type: "category",
                data: xData,
            },
            // y坐标轴
            yAxis: {
                type: "value",
                splitLine: {
                    show: props.showGrid ?? true,
                },
            },
            legend: {
                show: props.showLegend,
            },
            // 系列
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
