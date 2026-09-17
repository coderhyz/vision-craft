import { useMemo } from "react";
import * as echarts from "echarts";
import type { RendererProps } from "@/core/schema/types";
import type { RadarChartComponent } from "@/core/schema/chart";
import EChartsBase from "./EChartsBase";

/**
 * 雷达图业务组件
 * - 雷达图不使用 fieldMapping，而是通过 indicators 定义维度
 */
export default function RadarChart({ node }: RendererProps) {
    const chartNode = node as RadarChartComponent;
    const { props, dataSource } = chartNode;
    const data = (dataSource?.data ?? []) as Record<string, any>[];

    const option = useMemo(() => {
        const seriesData = data.map((item, idx) => ({
            name: item.name ?? `系列${idx + 1}`,
            value: props.indicators.map((ind) => item[ind.name] ?? 0),
        }));

        return {
            title: {
                text: props.title,
                left: "center",
                top: 0,
            },
            tooltip: {
                show: props.tooltipEnabled,
            },
            legend: {
                show: props.showLegend,
                bottom: 0,
                data: seriesData.map((s) => s.name),
            },
            radar: {
                indicator: props.indicators.map((ind) => ({
                    name: ind.name,
                    max: ind.max,
                })),
            },
            series: [
                {
                    type: "radar",
                    data: seriesData,
                    areaStyle: { opacity: 0.15 },
                },
            ],
            ...(props.colorPalette?.length ? { color: props.colorPalette } : {}),
        } as echarts.EChartsOption;
    }, [data, props]);

    return <EChartsBase option={option} />;
}
