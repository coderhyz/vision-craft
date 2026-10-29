import { useMemo } from "react";
import * as echarts from "echarts";
import type { RendererProps } from "@/core/schema/types";
import type { GaugeChartComponent } from "@/core/schema/chart";
import EChartsBase from "./EChartsBase";

/**
 * 仪表盘业务组件
 */
export default function GaugeChart({ node }: RendererProps) {
    const chartNode = node as GaugeChartComponent;
    const { props, dataSource } = chartNode;
    // 仪表盘只显示一个值，因此从数据源第一条记录读取映射的字段。
    const firstRow = dataSource?.data?.[0];
    const valueField = dataSource?.fieldMapping?.value ?? "value";
    const dataValue = firstRow && typeof firstRow === "object" ? Number((firstRow as Record<string, unknown>)[valueField]) : NaN;
    // 有有效数据就使用它；静态模式无数据时沿用属性值，API 无数据时不冒用旧属性值。
    const value = Number.isFinite(dataValue) ? dataValue : dataSource?.sourceType === "api" ? 0 : props.value;

    const option = useMemo(() => {
        return {
            title: {
                text: props.title,
                left: "center",
                top: 0,
            },
            tooltip: {
                show: props.tooltipEnabled,
            },
            series: [
                {
                    type: "gauge",
                    min: props.min,
                    max: props.max,
                    progress: {
                        show: true,
                        width: 18,
                        itemStyle: {
                            color: props.gaugeColor ?? "#5470c6",
                        },
                    },
                    axisLine: {
                        lineStyle: { width: 18 },
                    },
                    axisTick: { show: false },
                    splitLine: {
                        length: 12,
                        lineStyle: { width: 2 },
                    },
                    pointer: { show: true },
                    detail: {
                        valueAnimation: true,
                        formatter: props.unit
                            ? `{value} ${props.unit}`
                            : "{value}",
                        fontSize: 20,
                    },
                    data: [{ value }],
                },
            ],
        } as echarts.EChartsOption;
    }, [props, value]);

    return <EChartsBase option={option} />;
}
