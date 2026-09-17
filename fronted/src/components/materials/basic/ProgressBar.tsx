import type { RendererProps } from "@/core/schema/types";
import type { ProgressBarComponent } from "@/core/schema/basic";

/**
 * 进度条组件
 * - 支持数值/百分比、圆角与动画
 */
export default function ProgressBar({ node }: RendererProps) {
    const props = node.props as ProgressBarComponent["props"];
    // 计算百分比，确保 0-100 范围
    const percent =
        props.max <= 0
            ? 0
            : Math.min(100, Math.max(0, (props.value / props.max) * 100));
    // 圆角半径由条厚度决定
    const radius = props.rounded ? props.strokeWidth / 2 : 0;

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 6,
            }}
        >
            <div
                style={{
                    width: "100%",
                    height: props.strokeWidth,
                    backgroundColor: props.trackColor,
                    borderRadius: radius,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: `${percent}%`,
                        height: "100%",
                        backgroundColor: props.strokeColor,
                        borderRadius: radius,
                        transition: props.animation
                            ? "width 0.35s ease"
                            : undefined,
                    }}
                />
            </div>

            {props.showLabel ? (
                <div
                    style={{
                        fontSize: 12,
                        color: "#595959",
                        textAlign: "right",
                        width: "100%",
                    }}
                >
                    {`${Math.round(percent)}% (${props.value}/${props.max})`}
                </div>
            ) : null}
        </div>
    );
}
