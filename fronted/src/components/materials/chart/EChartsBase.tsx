import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import * as echarts from "echarts";

interface EChartsBaseProps {
    // 完整的 ECharts 配置项（如坐标轴、图例、系列数据），由上层组件负责生成
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
    // 保存图表挂载的 DOM 节点，ECharts 会在这个 div 中创建画布。
    const domRef = useRef<HTMLDivElement | null>(null);
    // 保存图表实例，供设置配置、调整尺寸和销毁时使用。
    // ref 可以跨渲染保存对象，修改 current 不会触发 React 重新渲染。
    const chartRef = useRef<echarts.ECharts | null>(null);
    // 保存尺寸观察器，方便在组件卸载时统一释放。
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    // 组件挂载后创建一次 ECharts 实例，组件卸载时再销毁。
    useEffect(() => {
        // DOM 尚未挂载时无法初始化图表。
        if (!domRef.current) return;

        // 将 ECharts 绑定到容器 DOM，并保存实例供其他 effect 使用。
        const chart = echarts.init(domRef.current);
        chartRef.current = chart;

        return () => {
            // 只在组件卸载时释放图表资源，防止内存泄漏。
            chart.dispose();
            chartRef.current = null;
        };
    }, []);

    // option 变化时只更新已有图表，不销毁和重建 ECharts 实例。
    useEffect(() => {
        if (!chartRef.current) return;

        // 第二个参数 true 表示 notMerge：不与旧配置合并，使用本次完整配置绘制图表。
        chartRef.current.setOption(option, true);
    }, [option]);

    // 监听容器本身的尺寸变化，父级布局调整等情况也能触发图表自适应。
    useEffect(() => {
        const element = domRef.current;
        if (!element) return;

        // 避免重复创建观察器
        if (!resizeObserverRef.current) {
            resizeObserverRef.current = new ResizeObserver(() => {
                // 每次回调都读取最新实例；resize() 让图表按容器当前尺寸重新布局。
                if (chartRef.current) {
                    chartRef.current.resize();
                }
            });
        }

        const observer = resizeObserverRef.current;
        // 开始观察图表容器。
        observer.observe(element);

        return () => {
            // 使用 effect 建立时保存的 DOM 节点，确保准确取消对同一节点的观察。
            observer.unobserve(element);
            // 断开所有观察并清空引用；即使 DOM 引用已置空，也能释放观察器。
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
                resizeObserverRef.current = null;
            }
        };
    }, []); // 空依赖数组：普通重新渲染时不重建观察器，卸载时执行清理。

    // React 提供挂载容器，具体图表内容由 ECharts 绘制。
    return (
        <div
            ref={domRef}
            style={{
                // 默认填满父容器；父容器需要有可用的宽高，图表才能正常显示。
                width: "100%",
                height: "100%",
                // 外部样式放在最后，可覆盖默认宽高或补充其他样式。
                ...style,
            }}
        />
    );
}
