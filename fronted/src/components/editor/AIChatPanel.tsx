import { useEffect, useRef } from "react";
import { Tag } from "antd";
import { Bubble, Sender } from "@ant-design/x";
import { useAIGenerate } from "@/hooks/useAIGenerate";
import { useState } from "react";
import { useSchemaStore } from "@/store/schema-store";

/**
 * @description AI 生成悬浮窗组件（多轮对话版）
 * @description 无遮罩层设计，右下角固定定位，让用户可以实时看到画布变化
 * @description 使用 ant-design-x Bubble + Sender 构建对话界面
 */

interface AIChatPanelProps {
    open: boolean;
    onClose: () => void;
}

// 示例提示词
const PROMPT_EXAMPLES = [
    "智慧园区运营大屏，显示园区概览、能耗、客流、工单",
    "电商实时数据大屏，包含 GMV、转化、订单分布、品类占比",
    "生产制造监控，展示产线 OEE、停线告警、设备状态、良率趋势",
];

export default function AIChatPanel({ open, onClose }: AIChatPanelProps) {
    const schema = useSchemaStore((state) => state.schema);
    const { messages, loading, sessionId, submit, cancel, closeSSE } = useAIGenerate();

    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 滚动到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleCancel = () => cancel();

    const handleClose = () => {
        if (loading) cancel();
        onClose();
    };

    const handleSubmit = () => {
        const prompt = inputValue.trim();
        if (!prompt) return;
        setInputValue("");
        submit(prompt);
    };

    // ESC 键关闭
    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, loading]);

    // 组件卸载时兜底关闭连接
    useEffect(() => () => closeSSE(), []);

    // 打开时预填当前页面标题（仅首次打开且无历史消息时）
    useEffect(() => {
        if (open && schema?.props?.title && messages.length === 0) {
            setInputValue(schema.props.title);
        }
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="fixed bottom-4 right-4 z-50 flex flex-col rounded-xl bg-white shadow-2xl"
            style={{
                width: "calc(min(420px, 100vw - 2rem))",
                maxHeight: "calc(100vh - 2rem)",
            }}
        >
            {/* 头部 */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
                <div className="flex items-center gap-2">
                    <svg
                        className="h-5 w-5 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                    </svg>
                    <h3 className="text-base font-semibold text-gray-800">AI 生成页面</h3>
                    {sessionId && (
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-600">
                            多轮对话中
                        </span>
                    )}
                </div>
                <button
                    className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={handleClose}
                    disabled={loading}
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>

            {/* 对话区域 */}
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3">
                {messages.length === 0 ? (
                    /* 空状态：引导提示 */
                    <div className="flex flex-col gap-3 py-2">
                        <p className="text-sm text-gray-500">
                            描述你想要的大屏需求，AI 将直接产出可编辑的
                            Schema。多轮对话可在现有画布基础上追加或修改。
                        </p>
                        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                            💡 生成结果会追加到当前画布，不会自动保存。
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-xs text-gray-400">示例提示词（点击填充）</p>
                            <div className="flex flex-wrap gap-1.5">
                                {PROMPT_EXAMPLES.map((item) => (
                                    <Tag
                                        key={item}
                                        className="cursor-pointer border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-700 hover:border-emerald-500 hover:text-emerald-600"
                                        onClick={() => setInputValue(item)}
                                    >
                                        {item}
                                    </Tag>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* 对话气泡列表 */
                    <div className="flex flex-col gap-3 py-1">
                        {messages.map((msg) => (
                            <Bubble
                                key={msg.id}
                                placement={msg.role === "user" ? "end" : "start"}
                                loading={msg.loading}
                                content={msg.content}
                                styles={{
                                    content: {
                                        background: msg.role === "user" ? "#059669" : "#f3f4f6",
                                        color: msg.role === "user" ? "#fff" : "#374151",
                                        fontSize: "13px",
                                        lineHeight: "1.6",
                                        padding: "8px 12px",
                                    },
                                }}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* 输入区域 */}
            <div className="shrink-0 border-t border-gray-200 p-3">
                <Sender
                    value={inputValue}
                    onChange={setInputValue}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={loading}
                    disabled={false}
                    placeholder={
                        messages.length === 0
                            ? "例如：智慧园区运营大屏，包含客流、能耗、工单、告警的多卡片布局"
                            : "继续描述需求，例如：再加一个折线图..."
                    }
                    allowSpeech={false}
                    styles={{
                        input: {
                            fontSize: "13px",
                            color: "black",
                        },
                    }}
                />
            </div>
        </div>
    );
}
