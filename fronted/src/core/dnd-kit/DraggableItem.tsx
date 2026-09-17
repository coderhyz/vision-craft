import { useDraggable } from "@dnd-kit/core";

interface DraggableItemProps {
    id: string;
    children: React.ReactNode;
}
/**
 * 拖拽源的封装 在菜单栏的部分 
 * event.active
 * @param id 拖拽源的唯一标识符，这里是组件的类型，例如 "Text"
 * @param children 拖拽源的内容，通常是一个可视化的组件预览
 * @returns 
 */
export default function DraggableItem({ id, children }: DraggableItemProps) {
    // 这里只负责注册拖拽源，id 表示「拖拽的类型或节点本身」，不在这里生成实例 id。
    // overlay 保存一份静态预览，拖动时交给 DragOverlay 渲染。
    const { listeners, attributes, setNodeRef, isDragging } = useDraggable({
        id,
        data: {
            // 传递给拖拽系统的数据，包括静态预览
            overlay: children,
        },
    });

    return (
        <div
            ref={setNodeRef}
            style={{ opacity: isDragging ? 0.4 : 1 }}
            {...attributes}
            {...listeners}
        >
            {/* 拖拽源内容 */}
            {children}
        </div>
    );
}
