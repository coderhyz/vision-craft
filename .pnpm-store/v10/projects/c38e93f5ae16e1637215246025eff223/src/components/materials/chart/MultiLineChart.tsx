import { useMemo } from "react";
import * as echarts from "echarts";
import type { RendererProps } from "@/core/schema/types";
import type { MultiLineChartComponent } from "@/core/schema/chart";
import EChartsBase from "./EChartsBase";

/**
 * 多系列折线/面积图业务组件
 * - 支持分组与可选面积填充
 */
export default function MultiLineChart({ node }: RendererProps) {
    const chartNode = node as MultiLineChartComponent;
    const { props, dataSource } = chartNode;
    const data = (dataSource?.data ?? []) as Record<string, any>[];
    const fm = dataSource?.fieldMapping ?? {};
    const xField = fm.x ?? "category";
    const yField = fm.y ?? "value";
    const seriesKey = fm.series ?? "series";

    const categories = useMemo(
        () =>
            Array.from(
                new Set(
                    data
                        .map((item) => item[xField])
                        .filter((item) => item !== undefined),
                ),
            ),
        [data, xField],
    );

    const seriesNames = useMemo(
        () =>
            Array.from(
                new Set(
                    data
                        .map((item) => item[seriesKey])
                        .filter((item) => item !== undefined),
                ),
            ),
        [data, seriesKey],
    );

    const option = useMemo(() => {
        const palette =
            props.colorPalette && props.colorPalette.length > 0
                ? props.colorPalette
                : undefined;
        const fillArea = props.areaStyle === true;

        const series = seriesNames.map((seriesName, idx) => {
            const color = palette ? palette[idx % palette.length] : undefined;

            return {
                name: seriesName as string,
                type: "line",
                smooth: props.smooth,
                areaStyle: fillArea ? {} : undefined,
                data: categories.map((cate) => {
                    const found = data.find(
                        (item) =>
                            item[xField] === cate &&
                            item[seriesKey] === seriesName,
                    );
                    return found ? found[yField] : 0;
                }),
                lineStyle: {
                    color,
                },
                itemStyle: {
                    color,
                },
                showSymbol: true,
            };
        });

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
                data: seriesNames,
            },
            grid: {
                top: 40,
                right: 10,
                bottom: 40,
                left: 10,
                containLabel: true,
            },
            xAxis: {
                type: "category",
                data: categories,
            },
            yAxis: {
                type: "value",
                splitLine: {
                    show: props.showGrid !== false,
                },
            },
            color: palette,
            series,
        } as echarts.EChartsOption;
    }, [
        categories,
        data,
        props.areaStyle,
        props.colorPalette,
        seriesKey,
        props.showGrid,
        props.showLegend,
        props.smooth,
        props.title,
        props.tooltipEnabled,
        xField,
        yField,
        seriesNames,
    ]);

    return <EChartsBase option={option} />;
}
