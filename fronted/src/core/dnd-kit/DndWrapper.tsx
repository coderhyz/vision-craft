import {
    DndContext,
    DragOverlay,
    pointerWithin,
    type DragStartEvent,
    type DragEndEvent,
} from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { useSchemaStore } from "@/store/schema-store";
import { componentDefaultConfigs, getNewComponentConfig } from "@/config";
import { nanoid } from "nanoid";
import { normalizeGridSize, snapToGrid } from "@/core/utils/grid";

/**
 * 该组件是一个拖拽的上下文环境，统一封装各种事件处理逻辑 拖拽系统
 * 主要是处理拖放事件、落点换算、创造实例
 */

export default function DndWrapper({
    children,
    scale = 1,
}: {
    children: React.ReactNode;
    scale?: number;
}) {
    // 获取 schemaStore 实例
    const schemaStore = useSchemaStore();
    // 当前拖拽源提供的静态卡片，用于在 DragOverlay 中显示拖拽预览。
    const [activeOverlay, setActiveOverlay] = useState<React.ReactNode>(null);
    // 缩放比例，默认为 1（无缩放），用于计算拖拽元素的落点坐标
    const zoom = scale && scale > 0 ? scale : 1;

    // DragOverlay 不接收指针事件，光标样式需要在拖拽期间应用到整个页面。
    useEffect(() => {
        if (!activeOverlay) return;

        document.body.classList.add("is-dnd-dragging");
        return () => {
            document.body.classList.remove("is-dnd-dragging");
        };
    }, [activeOverlay]);

    // 拖拽开始事件处理
    const handleDragStart = (event: DragStartEvent) => {
        // TODO: 需要新增组件config，拖拽开始时，深拷贝一份拖拽组件对应config，在useDraggable中注册数据
        // 目前仅做调试输出，真正的实例 id 在拖拽结束时统一生成，保证「每次成功拖拽一个新实例就得到一个全新的 id」
        console.log("DragStartEvent:", event);
        const activeData = event.active.data.current as {
            overlay?: React.ReactNode;
        } | undefined;
        // 拖拽开始时，设置当前拖拽源的静态预览到 DragOverlay 中显示
        setActiveOverlay(activeData?.overlay ?? null);
    };

    // 拖拽结束事件处理
    const handleDragEnd = (event: DragEndEvent) => {
        console.log("DragEndEvent:", event);
        // 拖拽结束时，移除静态预览。
        setActiveOverlay(null);
        // 拖拽结束时，更新组件树结构，更新组件的默认位置配置
        const dropItemId = event.over?.id;
        console.log("dropItemId:", dropItemId);
        if (!dropItemId) return;

        // 根据拖拽源的 id 获取对应组件的基础配置（类型信息等）
        const activeType = String(event.active.id) as keyof typeof componentDefaultConfigs;
        // 如果拖拽源的类型不在默认配置中，说明没有对应的组件实现，直接返回
        if (!(activeType in componentDefaultConfigs)) return;
        const newConfig = getNewComponentConfig(activeType);
        console.log("newConfig:", newConfig);
        // ===== 计算新组件在父容器中的实际落点坐标 =====
        // 利用 dnd-kit 提供的 rect 信息：
        // - active.rect.current.translated：拖拽结束时，拖拽源在视口中的最终位置
        // - over.rect：当前命中的可放置区域在视口中的位置
        // 通过两者相减，得到组件在父容器内部的相对 left / top

        // 优先使用真实画布内容的矩形作为坐标原点。
        // DOMRect 已经包含画布居中、缩放和滚动产生的视觉偏移，不能再额外累加 scroll。
        const canvasRect = document
            .querySelector<HTMLElement>('[data-canvas-content="true"]')
            ?.getBoundingClientRect();

        // 真实画布不存在时，回退到 dnd-kit 当前命中区域的矩形。
        const overData = event.over?.data?.current as {
            getBoundingClientRect?: () => DOMRect | undefined;
        };
        // 如果连命中区域的矩形也不存在，说明拖拽结束时没有命中任何可放置区域，直接返回。
        const overRect =
            canvasRect ?? overData?.getBoundingClientRect?.() ?? event.over?.rect;

        // 放置的目标元素相对于浏览器视口左上角的相对位置
        const activeRect = event.active.rect.current?.translated;
        if (activeRect && overRect) {
            // 缩放后需要把落点还原为原始坐标系
            // 两个矩形都是浏览器视口坐标，相减后得到缩放状态下的画布内坐标，
            // 再除以缩放比例，还原成画布的逻辑坐标。
            const offsetLeft = (activeRect.left - overRect.left) / zoom;
            const offsetTop = (activeRect.top - overRect.top) / zoom;

            // 使用页面配置的网格尺寸做吸附：取最近网格点
            const gridSize = normalizeGridSize(
                schemaStore.schema?.settings?.gridSize,
            );
            const snappedLeft = snapToGrid(offsetLeft, gridSize).value;
            const snappedTop = snapToGrid(offsetTop, gridSize).value;
            // 将计算得到的落点坐标更新到新组件的配置中 绝对定位
            if (newConfig.style) {
                newConfig.style = {
                    ...newConfig.style,
                    left: snappedLeft,
                    top: snappedTop,
                };
            }
        }

        // 这里为「实际落下的组件实例」生成一个全新的 id，
        // 不依赖 DraggableItem 中的状态，保证每一次成功拖拽得到的实例 id 都唯一
        newConfig.id = nanoid();
        // 添加到 schemaStore 中，触发组件树更新
        schemaStore.addItem(dropItemId.toString(), newConfig);
    };

    // 拖拽被取消（例如 ESC 或拖拽到无效区域）时重置状态
    const handleDragCancel = () => {
        // 做一些清理工作，例如重置拖拽状态等
        setActiveOverlay(null);
    };

    return (
        <DndContext
            // 只有鼠标指针真正进入画布可放置区域才算命中，
            // 避免拖拽遮罩仅与画布边缘相交时就提前触发感应。
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            {children}
            {/* 全局拖拽浮层，保证拖拽预览始终在画布上层显示 */}
            <DragOverlay dropAnimation={null}>
                {activeOverlay && (
                    <div
                        style={{
                            zIndex: 9999,
                            pointerEvents: "none",
                            cursor: "grabbing",
                        }}
                    >
                        {/* 显示的就是拖拽的组件
                        从 DraggableItem  data.overlay 传递过来的 */}
                        {activeOverlay}
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
