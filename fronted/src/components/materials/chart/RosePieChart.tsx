import { useMemo } from "react";
import * as echarts from "echarts";
import type { RendererProps } from "@/core/schema/types";
import type { RosePieChartComponent } from "@/core/schema/chart";
import EChartsBase from "./EChartsBase";

/**
 * 南丁格尔玫瑰图业务组件
 */
export default function RosePieChart({ node }: RendererProps) {
    const chartNode = node as RosePieChartComponent;
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
        const radius =
            typeof props.innerRadius === "number" && props.innerRadius > 0
                ? [`${props.innerRadius}%`, "70%"]
                : ["0%", "70%"];

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
                    roseType: props.roseType ?? "area",
                    radius,
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
        props.roseType,
        props.showLegend,
        props.title,
        props.tooltipEnabled,
        seriesData,
    ]);

    return <EChartsBase option={option} />;
}
