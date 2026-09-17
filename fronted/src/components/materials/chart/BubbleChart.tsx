import { useMemo } from "react";
import * as echarts from "echarts";
import type { RendererProps } from "@/core/schema/types";
import type { BubbleChartComponent } from "@/core/schema/chart";
import EChartsBase from "./EChartsBase";

/**
 * 气泡图业务组件（基于散点图变体）
 */
export default function BubbleChart({ node }: RendererProps) {
    const chartNode = node as BubbleChartComponent;
    const { props, dataSource } = chartNode;
    const data = (dataSource?.data ?? []) as Record<string, any>[];
    const fm = dataSource?.fieldMapping ?? {};
    const xField = fm.x ?? "x";
    const yField = fm.y ?? "y";
    const sizeField = fm.size ?? "size";
    const categoryField = fm.category;

    const option = useMemo(() => {
        const baseSize = props.pointSize ?? 10;
        const [minSize, maxSize] = props.sizeRange ?? [
            baseSize,
            Math.max(baseSize * 3, baseSize + 20),
        ];
        const sizeValues = data.map((item) =>
            Number(item[sizeField] ?? 0),
        );
        const sizeMin = sizeValues.length > 0 ? Math.min(...sizeValues) : 0;
        const sizeMax = sizeValues.length > 0 ? Math.max(...sizeValues) : 0;

        const scaleSymbolSize = (value: number) => {
            if (!Number.isFinite(value)) return minSize;
            if (sizeMax === sizeMin) return (minSize + maxSize) / 2;
            const ratio = (value - sizeMin) / (sizeMax - sizeMin);
            return minSize + ratio * (maxSize - minSize);
        };

        const grouped: Record<string, Record<string, any>[]> = {};

        if (categoryField) {
            data.forEach((item) => {
                const key = (item[categoryField] ?? "默认分组") as string;
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(item);
            });
        } else {
            grouped[props.title || "气泡图"] = data;
        }

        const palette =
            props.colorPalette && props.colorPalette.length > 0
                ? props.colorPalette
                : undefined;
        const fallbackColor = props.pointColor;

        const series = Object.entries(grouped).map(([name, list], idx) => ({
            name,
            type: "scatter",
            data: list.map((item) => [
                item[xField],
                item[yField],
                item[sizeField],
            ]),
            symbolSize: (val: number[]) =>
                scaleSymbolSize(Number(val?.[2] ?? 0)),
            itemStyle: {
                color: palette
                    ? palette[idx % palette.length]
                    : fallbackColor || undefined,
                opacity: 0.8,
            },
        }));

        return {
            title: {
                text: props.title,
                top: 0,
            },
            tooltip: {
                show: props.tooltipEnabled,
                trigger: "item",
                formatter: (params: any) => {
                    const [x, y, size] = params.value || [];
                    return `${xField}: ${x}<br/>${yField}: ${y}<br/>${sizeField}: ${size}`;
                },
            },
            legend: {
                show: props.showLegend,
                data: series.map((s) => s.name),
            },
            grid: {
                top: 40,
                right: 20,
                bottom: 40,
                left: 10,
                containLabel: true,
            },
            xAxis: {
                type: "value",
                name: xField,
            },
            yAxis: {
                type: "value",
                name: yField,
                splitLine: {
                    show: props.showGrid !== false,
                },
            },
            series,
        } as echarts.EChartsOption;
    }, [data, xField, yField, sizeField, categoryField, props]);

    return <EChartsBase option={option} />;
}
