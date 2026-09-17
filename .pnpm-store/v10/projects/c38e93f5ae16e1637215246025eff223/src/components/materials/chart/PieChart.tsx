import { useMemo } from "react";
import * as echarts from "echarts";
import type { RendererProps } from "@/core/schema/types";
import type { PieChartComponent } from "@/core/schema/chart";
import EChartsBase from "./EChartsBase";

/**
 * 饼图/环形图业务组件
 */
export default function PieChart({ node }: RendererProps) {
    const chartNode = node as PieChartComponent;
    const { props, dataSource } = chartNode;
    const data = (dataSource?.data ?? []) as Record<string, any>[];
    const fm = dataSource?.fieldMapping ?? {};
    const nameKey = fm.name ?? "name";
    const valueKey = fm.value ?? "value";

    const seriesData = useMemo(
        () =>
            data.map((item) => ({
                name: item[nameKey],
                value: item[valueKey],
            })),
        [data, nameKey, valueKey],
    );

    const option = useMemo(() => {
        const innerRadius =
            typeof props.innerRadius === "number" && props.innerRadius > 0
                ? [`${props.innerRadius}%`, "70%"]
                : "70%";

        return {
            title: {
                text: props.title,
                left: "center",
                top: 0,
            },
            tooltip: {
                show: props.tooltipEnabled,
                trigger: "item",
            },
            legend: {
                show: props.showLegend,
                bottom: 0,
            },
            series: [
                {
                    type: "pie",
                    radius: innerRadius,
                    center: ["50%", "50%"],
                    data: seriesData,
                    label: {
                        formatter: "{b}: {c}",
                    },
                },
            ],
        } as echarts.EChartsOption;
    }, [
        props.innerRadius,
        props.showLegend,
        props.title,
        props.tooltipEnabled,
        seriesData,
    ]);

    return <EChartsBase option={option} />;
}
