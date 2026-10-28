import type { RootContainerRendererProps } from "@/core/schema/types";
import DroppableItem from "@/core/dnd-kit/DroppableItem";
import type { ContainerComponent } from "@/core/schema/basic";
// import { nanoid } from "nanoid"  // 不再需要

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
    if (mode === "preview") {
        return (
            <div style={{ width: "100%", height: "100%" }}>
                {/* 回调渲染子组件 */}
                {renderChildren(node.children || [])}
            </div>
        );
    }

    return (
        <DroppableItem id={node.id} style={(node as ContainerComponent).style}>
            <div>{renderChildren(node.children!)}</div>
        </DroppableItem>
    );
}
