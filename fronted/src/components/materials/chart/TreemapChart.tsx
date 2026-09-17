import { useMemo } from "react";
import * as echarts from "echarts";
import type { RendererProps } from "@/core/schema/types";
import type { TreemapChartComponent } from "@/core/schema/chart";
import EChartsBase from "./EChartsBase";

/**
 * 矩形树图业务组件
 */
export default function TreemapChart({ node }: RendererProps) {
    const chartNode = node as TreemapChartComponent;
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

        // legend 显示时 bottom 留出空间；series bottom 也跟随调整
        const legendBottom = 4;
        const seriesBottom = props.showLegend ? 36 : 4;

        return {
            title: {
                text: props.title,
                left: "center",
                top: 0,
            },
            tooltip: {
                show: props.tooltipEnabled,
                trigger: "item",
                formatter: (params: any) =>
                    `${params.name}: ${params.value}`,
            },
            legend: {
                show: props.showLegend,
                bottom: legendBottom,
                data: seriesData.map((d) => d.name),
            },
            series: [
                {
                    type: "treemap",
                    top: 30,
                    left: 0,
                    right: 0,
                    bottom: seriesBottom,
                    roam: false,
                    nodeClick: false,
                    data: seriesData,
                    breadcrumb: { show: false },
                    label: {
                        show: true,
                        formatter: "{b}",
                    },
                },
            ],
            // colorPalette 未设置时不传 color，保留 ECharts 默认色板
            ...(props.colorPalette?.length ? { color: props.colorPalette } : {}),
        } as echarts.EChartsOption;
    }, [data, fm, props]);

    return <EChartsBase option={option} />;
}
