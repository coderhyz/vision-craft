import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import type { RendererProps } from "@/core/schema/types";
import type { CountdownComponent } from "@/core/schema/basic";

/**
 * 倒计时组件
 * - 根据目标时间实时刷新，支持格式模板与结束文案
 */
export default function Countdown({ node }: RendererProps) {
    const props = node.props as CountdownComponent["props"];

    // 中文对齐枚举 → CSS text-align
    const alignToCss = (align: CountdownComponent["props"]["textAlign"]) =>
        align === "居中" ? "center" : align === "右" ? "right" : "left";

    const normalizeTarget = (target: string) => {
        // 优先按用户填写的 YYYY-MM-DD HH:mm:ss 严格解析，失败再尝试退化解析
        const strictParsed = dayjs(target, "YYYY-MM-DD HH:mm:ss", true);
        if (strictParsed.isValid()) return strictParsed;
        const fallback = dayjs(target.replace(" ", "T"));
        return fallback.isValid() ? fallback : fallback; // 直接返回无效的dayjs实例
    };

    const calcRemaining = (target: string) => {
        const targetDate = normalizeTarget(target);
        if (!targetDate.isValid()) {
            return -1;
        }
        return Math.max(0, targetDate.diff(dayjs()));
    };

    const [remaining, setRemaining] = useState<number>(() =>
        calcRemaining(props.targetTime),
    );

    useEffect(() => {
        // 定时刷新剩余时间，毫秒模式提升刷新频率
        const tick = () => setRemaining(calcRemaining(props.targetTime));
        const interval = setInterval(tick, props.showMilliseconds ? 100 : 1000);
        tick();
        return () => clearInterval(interval);
    }, [props.targetTime, props.showMilliseconds]);

    const displayText = useMemo(() => {
        if (remaining < 0) {
            return "时间格式错误";
        }
        if (remaining === 0) {
            return props.finishedText ?? "已结束";
        }

        const totalMs = remaining;
        const totalSeconds = Math.floor(totalMs / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = totalMs % 1000;

        const pad = (value: number, length = 2) =>
            String(value).padStart(length, "0");

        let template = props.format || "HH:mm:ss";
        template = template.replace(/DD/g, pad(days));
        template = template.replace(/HH/g, pad(hours));
        template = template.replace(/mm/g, pad(minutes));
        template = template.replace(/ss/g, pad(seconds));

        if (props.showMilliseconds) {
            template = template.replace(/SSS/g, pad(milliseconds, 3));
        }

        return `${props.prefix ?? ""}${template}${props.suffix ?? ""}`;
    }, [
        remaining,
        props.format,
        props.prefix,
        props.suffix,
        props.finishedText,
        props.showMilliseconds,
    ]);

    const alignCss = alignToCss(props.textAlign);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent:
                    alignCss === "center"
                        ? "center"
                        : alignCss === "right"
                          ? "flex-end"
                          : "flex-start",
                color: props.color,
                fontSize: props.fontSize,
                fontWeight: props.fontWeight,
                textAlign: alignCss,
                lineHeight: 1.2,
            }}
        >
            {displayText}
        </div>
    );
}
