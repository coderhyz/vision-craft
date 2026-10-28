import type { RootContainerRendererProps } from "@/core/schema/types";
import DroppableItem from "@/core/dnd-kit/DroppableItem";
import type { ContainerComponent } from "@/core/schema/basic";
import type { CSSProperties } from "react";

/**
 * 容器组件
 * @param node renderer传进来的节点数据
 * @param renderChildren 渲染子组件的函数
 * @returns 返回一个div，里面渲染子组件
 */
export default function Container({
    node,
    renderChildren,
    mode = "edit",
}: RootContainerRendererProps) {
    const container = node as ContainerComponent;
    const isFlex = container.props?.layoutMode === "flex";
    // 坐标和尺寸由 Renderer / RndItem 管理，内部只负责外观和子节点布局。
    const appearance: CSSProperties = { ...container.style };
    for (const key of ["top", "left", "width", "height", "zIndex", "opacity", "minWidth", "minHeight", "maxWidth", "maxHeight"] as const) {
        delete appearance[key];
    }
    const contentStyle: CSSProperties = {
        position: "relative",
        width: "100%",
        height: "100%",
        ...(isFlex ? {
            display: "flex",
            flexWrap: "wrap",
            alignContent: "flex-start",
            alignItems: "flex-start",
            gap: Math.max(0, Number(container.props?.gap) || 0),
            overflow: "auto",
        } : {}),
    };
    const children = renderChildren(container.children ?? []);

    return (
        <div data-container-id={node.id} style={{ position: "relative", width: "100%", height: "100%", opacity: container.style?.opacity }}>
            {/* 外观层不占用内容尺寸，避免边框改变子节点的坐标原点。 */}
            <div aria-hidden style={{ ...appearance, position: "absolute", inset: 0, boxSizing: "border-box", pointerEvents: "none" }} />
            {mode === "preview" ? (
                <div style={contentStyle}>{children}</div>
            ) : (
                <DroppableItem id={node.id} style={contentStyle}>{children}</DroppableItem>
            )}
        </div>
    );
}
