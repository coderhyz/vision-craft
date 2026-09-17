interface SelectionOverlayProps {
    /** 组件显示名称 */
    name: string;
    /** 组件靠近画布顶部时标签需要翻转到下方 */
    isNearTop: boolean;
    /** 删除按钮回调 */
    onDelete: () => void;
    /** 取消选中回调 */
    onDeselect: () => void;
}

/**
 * 选中态覆盖层：蓝色边框 + 名称标签 + 删除/取消操作按钮
 */
export default function SelectionOverlay({
    name,
    isNearTop,
    onDelete,
    onDeselect,
}: SelectionOverlayProps) {
    return (
        <>
            {/* 四边全包围的高亮边框 */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    border: "1px solid #1677ff",
                    boxShadow: "0 0 0 1px rgba(22,119,255,0.3)",
                    borderRadius: 2,
                    pointerEvents: "none",
                }}
            />

            {/* 名称标签：靠近顶部时翻转到组件下方 */}
            <div
                style={{
                    position: "absolute",
                    ...(isNearTop
                        ? { bottom: -20, left: 0 }
                        : { top: -18, left: 0 }),
                    padding: "0 6px",
                    height: 16,
                    lineHeight: "16px",
                    fontSize: 12,
                    backgroundColor: "#1677ff",
                    color: "#ffffff",
                    borderRadius: 2,
                    whiteSpace: "nowrap",
                }}
            >
                {name}
            </div>

            {/* 操作按钮区域 */}
            <div
                style={{
                    position: "absolute",
                    ...(isNearTop
                        ? { bottom: -20, right: 0 }
                        : { top: -18, right: 0 }),
                    display: "flex",
                    gap: 4,
                }}
            >
                <div
                    style={{
                        padding: "0 6px",
                        height: 16,
                        lineHeight: "16px",
                        fontSize: 12,
                        backgroundColor: "#ff4d4f",
                        color: "#ffffff",
                        borderRadius: 2,
                        cursor: "pointer",
                        userSelect: "none",
                    }}
                    onClick={(event) => {
                        // 阻止事件冒泡，避免触发 RndItem 的点击选中逻辑
                        event.stopPropagation();
                        //  删除节点事件
                        onDelete();
                    }}
                >
                    删除
                </div>

                <div
                    style={{
                        padding: "0 6px",
                        height: 16,
                        lineHeight: "16px",
                        fontSize: 12,
                        backgroundColor: "rgba(0,0,0,0.65)",
                        color: "#ffffff",
                        borderRadius: 2,
                        cursor: "pointer",
                        userSelect: "none",
                    }}
                    onClick={(event) => {
                        event.stopPropagation();
                        // 取消选中事件
                        onDeselect();
                    }}
                >
                    取消
                </div>
            </div>
        </>
    );
}
