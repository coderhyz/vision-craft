import React, { useMemo, useRef } from "react";

interface RulerProps {
    orientation: "x" | "y";
    viewport: { width: number; height: number } | null;
    scale: number;
    scroll: number;
    containerSize: number;
    canvasOffset?: number;
    onAddGuide?: (value: number) => void;
}
//尺子的默认长度
const RULER_SIZE = 28;

export function Ruler({ orientation, viewport, scale, scroll, containerSize, canvasOffset = 0 }: RulerProps) {
    const ref = useRef<HTMLDivElement | null>(null);

    const { ticks } = useMemo(() => {
        if (!viewport) return { ticks: [] as { value: number; isMajor: boolean }[] };
        const visibleStart = Math.max(0, (scroll - canvasOffset) / Math.max(scale, 0.01));
        const visibleSize = containerSize / Math.max(scale, 0.01);
        const stepCandidates = [10, 20, 50, 100, 200, 500];
        const chosen = stepCandidates.find((s) => s * scale >= 40 && s * scale <= 120) ?? stepCandidates[stepCandidates.length - 1];
        const start = Math.floor(visibleStart / chosen) * chosen;
        const canvasSize = orientation === "x" ? viewport.width : viewport.height;
        const end = Math.min(canvasSize, visibleStart + visibleSize + chosen);
        const list: { value: number; isMajor: boolean }[] = [];
        for (let v = start; v <= end; v += chosen) list.push({ value: v, isMajor: (v / chosen) % 5 === 0 });
        return { ticks: list };
    }, [viewport, scale, scroll, containerSize, canvasOffset, orientation]);

    if (!viewport) return null;

    const isX = orientation === "x";
    return (
        <div
            ref={ref}
            className={`select-none bg-white text-slate-400 ${isX ? "border-b border-slate-200" : "border-r border-slate-200"}`}
            style={{ position: "relative", height: isX ? RULER_SIZE : `calc(100% - ${RULER_SIZE}px)`, width: isX ? `calc(100% - ${RULER_SIZE}px)` : RULER_SIZE, overflow: "hidden", fontSize: 10 }}
        >
            {ticks.map((tick) => {
                const pos = canvasOffset + tick.value * scale - scroll;
                const style = isX
                    ? { left: pos, top: 0, width: 1, height: tick.isMajor ? RULER_SIZE : RULER_SIZE / 2 }
                    : { top: pos, left: 0, height: 1, width: tick.isMajor ? RULER_SIZE : RULER_SIZE / 2 };
                return (
                    <div key={`${orientation}-${tick.value}`} className="absolute" style={{ ...style as React.CSSProperties, backgroundColor: tick.isMajor ? "#cbd5e1" : "#e2e8f0" }}>
                        {tick.isMajor && (
                            <span className="absolute text-[10px] text-slate-400" style={isX ? { top: 2, left: 2 } : { top: 2, left: 2, transform: "rotate(-90deg)", transformOrigin: "left top" }}>
                                {Math.round(tick.value)}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export const RULER_THICKNESS = RULER_SIZE;
