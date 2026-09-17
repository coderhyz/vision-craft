import { useEffect, useRef, useState } from "react";
import type { RendererProps } from "@/core/schema/types";
import type { StatisticCardComponent } from "@/core/schema/basic";

/**
 * KPI 指标卡渲染组件
 * - 支持前后缀、趋势箭头、可选数值动画
 */
export default function StatisticCard({ node }: RendererProps) {
    const props = node.props as StatisticCardComponent["props"];

    // 使用类型断言确保 node 有 style 属性
    const componentNode = node as StatisticCardComponent;

    const [displayValue, setDisplayValue] = useState<number>(props.value);
    const lastValueRef = useRef<number>(props.value);

    // 中文对齐枚举 → CSS text-align
    const alignToCss = (align: StatisticCardComponent["props"]["align"]) =>
        align === "居中" ? "center" : align === "右" ? "right" : "left";
    const alignCss = alignToCss(props.align);

    useEffect(() => {
        if (!props.animated) {
            setDisplayValue(props.value);
            lastValueRef.current = props.value;
            return;
        }

        const startValue = lastValueRef.current; // 数值动画起始值
        const targetValue = props.value;
        const start = performance.now();
        const duration = 600;
        let rafId = 0;

        const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            const nextValue =
                startValue + (targetValue - startValue) * progress;
            setDisplayValue(nextValue);

            if (progress < 1) {
                rafId = requestAnimationFrame(tick);
            }
        };

        rafId = requestAnimationFrame(tick);
        lastValueRef.current = targetValue;

        return () => cancelAnimationFrame(rafId);
    }, [props.animated, props.value]);

    const alignItems =
        alignCss === "center"
            ? "center"
            : alignCss === "right"
              ? "flex-end"
              : "flex-start";
    const trendSymbol =
        props.trend === "上升" ? "↑" : props.trend === "下降" ? "↓" : "→"; // 纯文本箭头，避免额外图标依赖
    const trendColor =
        props.trend === "上升"
            ? (props.trendColorUp ?? "#52c41a")
            : props.trend === "下降"
              ? (props.trendColorDown ?? "#ff4d4f")
              : "#8c8c8c";
    const formattedValue = Number.isFinite(displayValue)
        ? displayValue.toLocaleString()
        : String(displayValue);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems,
                textAlign: alignCss,
                padding: componentNode.style?.padding ?? 0,
                gap: 6,
            }}
        >
            <div
                style={{
                    fontSize: props.titleFontSize,
                    fontWeight: 600,
                    color: "#4a4a4a",
                    width: "100%",
                }}
            >
                {props.title}
            </div>

            <div
                style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                    width: "100%",
                    justifyContent:
                        alignCss === "center"
                            ? "center"
                            : alignCss === "right"
                              ? "flex-end"
                              : "flex-start",
                }}
            >
                {props.prefix ? (
                    <span
                        style={{
                            color: "#8c8c8c",
                            fontWeight: 500,
                            fontSize: props.subtitleFontSize,
                        }}
                    >
                        {props.prefix}
                    </span>
                ) : null}

                <span
                    style={{
                        fontSize: props.valueFontSize,
                        fontWeight: 700,
                        color: props.valueColor,
                        lineHeight: 1.1,
                    }}
                >
                    {formattedValue}
                </span>

                {props.suffix ? (
                    <span
                        style={{
                            color: "#8c8c8c",
                            fontWeight: 500,
                            fontSize: props.subtitleFontSize,
                        }}
                    >
                        {props.suffix}
                    </span>
                ) : null}

                {props.showTrendIcon && props.trend ? (
                    <span
                        style={{
                            color: trendColor,
                            fontWeight: 700,
                            fontSize: props.subtitleFontSize,
                        }}
                    >
                        {trendSymbol}
                    </span>
                ) : null}
            </div>

            {props.subtitle ? (
                <div
                    style={{
                        fontSize: props.subtitleFontSize,
                        fontWeight: 400,
                        color: "#8c8c8c",
                        width: "100%",
                    }}
                >
                    {props.subtitle}
                </div>
            ) : null}
        </div>
    );
}
