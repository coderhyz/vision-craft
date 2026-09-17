import { useMemo } from "react";
import * as echarts from "echarts";
import type { RendererProps } from "@/core/schema/types";
import type { FunnelChartComponent } from "@/core/schema/chart";
import EChartsBase from "./EChartsBase";

/**
 * 漏斗图业务组件
 */
export default function FunnelChart({ node }: RendererProps) {
    const chartNode = node as FunnelChartComponent;
    const { props, dataSource } = chartNode;
    const data = (dataSource?.data ?? []) as Record<string, any>[];
    const fm = dataSource?.fieldMapping ?? {};

    const option = useMemo(() => {
        const nameKey = fm.name ?? "name";
        const valueKey = fm.value ?? "value";
        const seriesData = data.map((item) => ({
            name: String(item[nameKey] ?? ""),
            value: item[valueKey],
        }));

        // legend 显示时需要给 series 留出底部空间，避免遮挡
        const seriesBottom = props.showLegend ? 48 : 10;

        return {
            title: {
                text: props.title,
                left: "center",
                top: 0,
            },
            tooltip: {
                show: props.tooltipEnabled,
                trigger: "item",
                formatter: "{b}: {c}",
            },
            legend: {
                show: props.showLegend,
                bottom: 4,
                data: seriesData.map((d) => d.name),
            },
            series: [
                {
                    type: "funnel",
                    left: "10%",
                    top: 40,
                    bottom: seriesBottom,
                    width: "80%",
                    sort: props.sort ?? "descending",
                    gap: 2,
                    label: {
                        show: true,
                        position: "inside",
                    },
                    data: seriesData,
                },
            ],
            // colorPalette 未设置时不传 color，保留 ECharts 默认色板
            ...(props.colorPalette?.length ? { color: props.colorPalette } : {}),
        } as echarts.EChartsOption;
    }, [data, fm, props]);

    return <EChartsBase option={option} />;
}
