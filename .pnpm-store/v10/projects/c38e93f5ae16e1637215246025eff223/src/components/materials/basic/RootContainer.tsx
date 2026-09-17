import type React from "react";
import type { RootContainerRendererProps } from "@/core/schema/types";
import DroppableItem from "@/core/dnd-kit/DroppableItem";
import type { PageDSL } from "@/core/schema/page";
// import { nanoid } from "nanoid"
import { normalizeGridSize } from "@/core/utils/grid";

/**
 * 根容器组件
 * @param node renderer传进来的节点数据
 * @param renderChildren 渲染子组件的函数
 * @returns 返回一个div，里面渲染子组件
 */
export default function RootContainer({
    node,
    renderChildren,
    mode = "edit",
}: RootContainerRendererProps) {
    // 跟容器节点
    const pageNode = node as PageDSL;
    // 依据页面 DSL 规范化网格尺寸，供可视网格与吸附参考
    const gridSize = normalizeGridSize(pageNode.settings.gridSize);
    // 根组件的样式，依据页面 DSL 的设置来渲染背景色、背景图等
    const RootContainerStyle: React.CSSProperties = {
        position: "relative",
        width: pageNode.settings.width,
        height: pageNode.settings.height,
        backgroundColor: pageNode.settings.backgroundColor || "#ffffff",
        backgroundImage: pageNode.settings.backgroundImage
            ? `url(${pageNode.settings.backgroundImage})`
            : undefined,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
    };

    // 编辑态叠加网格背景，作为吸附可视化提示；不拦截指针事件 预览模式不显示
    const gridLayer =
        mode === "edit" ? (
            <div
                style={{
                    position: "absolute",
                    inset: 0, // 等价于 top: 0, left: 0, right: 0, bottom: 0
                    pointerEvents: "none", // 不拦截指针事件
                    backgroundSize: `${gridSize}px ${gridSize}px`,
                    backgroundImage:
                        "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)",
                    opacity: 0.6,
                }}
            />
        ) : null;
    // 容器的内容
    const content = (
        <div style={RootContainerStyle}>
            {/* 网格层 */}
            {gridLayer}
            {/* 渲染第一层组件 */}
            {renderChildren(node.children || [])}
        </div>
    );
    // 预览态不包裹 DroppableItem，直接渲染内容
    if (mode === "preview") {
        return content;
    }
    // 渲染态包裹DroppableItem，可拖拽组件
    return (
        <DroppableItem id={node.id}>
            {content}
        </DroppableItem>
    );
}
