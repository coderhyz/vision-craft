import { useDroppable } from "@dnd-kit/core";
import { useRef } from "react";

/**
 * 可放置区域组件的入参。
 *event.over
 * DroppableItem 只负责向 dnd-kit 注册一个“可以接收拖拽元素”的区域，
 * 不负责创建组件或修改 Schema；真正的新增逻辑由 DndWrapper 的
 * onDragEnd 统一处理。
 */
interface DroppableItemProps {
    /**
     * 可放置区域的唯一标识。
     * 拖拽结束后可以通过 event.over?.id 获取这个值，进而确定目标父节点。
     */
    id: string;
    /** 放置区域内部需要正常渲染的内容。 */
    children: React.ReactNode;
    /** 调用方需要补充到最外层容器上的样式。 */
    style?: React.CSSProperties;
}

/**
 * dnd-kit 可放置区域包装组件。 
 * 放置区封装
 * 主要职责：
 * 1. 使用 useDroppable 将当前 DOM 注册到最近的 DndContext；
 * 2. 暴露区域的滚动量和视口位置，供 DndWrapper 计算组件落点；
 * 3. 通过 isOver 提供拖拽元素进入该区域时的视觉反馈。
 */
export default function DroppableItem({
    id,
    children,
    style,
}: DroppableItemProps) {
    // 保存真实 DOM。除了交给 dnd-kit 使用，还需要读取其滚动量和位置。
    const nodeRef = useRef<HTMLDivElement | null>(null);

    // 注册可放置区域：
    // - setNodeRef：把真实 DOM 交给 dnd-kit 测量和参与碰撞检测；
    // - isOver：当前拖拽元素是否位于该区域上方。
    const { setNodeRef, isOver } = useDroppable({
        id,
        // 这个组件可以携带
        data: {
            // 获取区域自身的滚动偏移，计算落点时可用于补偿滚动距离。
            getScrollOffset: () => ({
                left: nodeRef.current?.scrollLeft ?? 0,
                top: nodeRef.current?.scrollTop ?? 0,
            }),
            // 获取区域相对于浏览器视口的位置和尺寸。
            // DndWrapper 会用它与拖拽元素的矩形相减，得到容器内部坐标。
            getBoundingClientRect: () => nodeRef.current?.getBoundingClientRect(),
        },
    });

    // 同一个 DOM 同时需要被本组件和 dnd-kit 引用，因此在这里组合两个 ref。
    const handleRef = (node: HTMLDivElement | null) => {
        nodeRef.current = node;
        setNodeRef(node);
    };

    return (
        // relative 为高亮描边提供定位上下文；描边使用独立覆盖层，不参与盒模型计算。
        <div ref={handleRef} style={style} className="relative h-full">
            {/* 可放下的内容 */}
            {children}
            {isOver && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-[9998] box-border border-2 border-emerald-500 bg-emerald-50/10"
                />
            )}
        </div>
    );
}
