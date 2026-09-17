import { useState } from "react";
import type { ComponentNode } from "@/core/schema/basic";
import { useComponentEditStore } from "@/store/component-edit-store";
// import { useShallow } from "zustand/shallow";
interface AiEditInputProps {
    /** 当前选中的节点 */
    node: ComponentNode;
    /** 组件靠近画布顶部时，输入框位置需向下偏移 */
    isNearTop: boolean;
}

/**
 * 选中态底部的 AI 精准修改输入框
 */
export default function AiEditInput({ node, isNearTop }: AiEditInputProps) {
    const setPendingEdit = useComponentEditStore(
        (state) => state.setPendingEdit,
    );
    // 输入框
    const [aiInput, setAiInput] = useState("");
    // 提交一下ai的输入
    const handleSubmit = () => {
        if (aiInput.trim()) {
            setPendingEdit(aiInput.trim(), node);
            setAiInput("");
        }
    };

    return (
        <div
            style={{
                position: "absolute",
                bottom: isNearTop ? -56 : -36,
                left: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                gap: 4,
                zIndex: 999,
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <input
                type="text"
                placeholder="AI 修改此组件..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => {
                    if (
                        e.key === "Enter" &&
                        !e.nativeEvent.isComposing &&
                        aiInput.trim()
                    ) {
                        handleSubmit();
                    }
                }}
                style={{
                    flex: 1,
                    height: 28,
                    padding: "0 8px",
                    fontSize: 12,
                    border: "1px solid #1677ff",
                    borderRadius: 4,
                    outline: "none",
                    backgroundColor: "#fff",
                    color: "#333",
                    minWidth: 0,
                }}
            />
            <div
                style={{
                    padding: "0 10px",
                    height: 28,
                    lineHeight: "28px",
                    fontSize: 12,
                    backgroundColor: "#1677ff",
                    color: "#fff",
                    borderRadius: 4,
                    cursor: aiInput.trim() ? "pointer" : "not-allowed",
                    userSelect: "none",
                    opacity: aiInput.trim() ? 1 : 0.5,
                    whiteSpace: "nowrap",
                }}
                onClick={handleSubmit}
            >
                发送
            </div>
        </div>
    );
}
