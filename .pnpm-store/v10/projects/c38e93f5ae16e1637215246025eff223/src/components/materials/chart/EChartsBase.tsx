import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import * as echarts from "echarts";

interface EChartsBaseProps {
    // 完整的 ECharts 配置项，由上层组件负责生成
    option: echarts.EChartsOption;
    // 允许外部自定义容器样式，默认占满父容器
    style?: CSSProperties;
}

/**
 * 通用 ECharts 容器组件
 * - 负责实例的创建、更新和销毁
 * - 上层组件只需要关心把 DSL 转换成 option
 */
export default function EChartsBase({ option, style }: EChartsBaseProps) {
    const domRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<echarts.ECharts | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    // 初始化和销毁 ECharts 实例
    useEffect(() => {
        if (!domRef.current) return;

        // 避免重复初始化
        if (!chartRef.current) {
            chartRef.current = echarts.init(domRef.current);
        }

        const chart = chartRef.current;
        chart.setOption(option, true);

        return () => {
            // 组件卸载时销毁图表实例，防止内存泄漏
            if (chartRef.current) {
                chartRef.current.dispose();
                chartRef.current = null;
            }
        };
    }, [option]);

    // 使用 ResizeObserver 监听容器尺寸变化，自动调用 chart.resize()
    useEffect(() => {
        if (!domRef.current) return;

        // 避免重复创建观察器
        if (!resizeObserverRef.current) {
            resizeObserverRef.current = new ResizeObserver(() => {
                if (chartRef.current) {
                    chartRef.current.resize();
                }
            });
        }

        const observer = resizeObserverRef.current;
        observer.observe(domRef.current);

        return () => {
            if (domRef.current) {
                observer.unobserve(domRef.current);
            }
            // 组件卸载时断开观察，防止内存泄漏
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
                resizeObserverRef.current = null;
            }
        };
    }, []);

    return (
        <div
            ref={domRef}
            style={{
                width: "100%",
                height: "100%",
                ...style,
            }}
        />
    );
}
