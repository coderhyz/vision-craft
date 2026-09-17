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
    const { props } = chartNode;

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
                    data: [{ value: props.value }],
                },
            ],
        } as echarts.EChartsOption;
    }, [props]);

    return <EChartsBase option={option} />;
}
