import { useEffect, useRef, useState } from "react";
import { Bubble, Sender } from "@ant-design/x";
import { Modal } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAIGenerate } from "@/hooks/useAIGenerate";
import { useAIChat } from "@/hooks/useAIChat";
import { useSchemaStore } from "@/store/schema-store";
import { useComponentEditStore } from "@/store/component-edit-store";
import { RotateCcw, Info, Sparkles, BookOpen, FileText } from "lucide-react";
import type { ChatMessage } from "@/types/chat";

type ChatMode = "create" | "ask";

const CREATE_EXAMPLES = [
    "智慧园区运营大屏，显示园区概览、能耗、客流、工单",
    "电商实时数据大屏，包含 GMV、转化、订单分布、品类占比",
    "生产制造监控，展示产线 OEE、停线告警、设备状态、良率趋势",
];

const ASK_EXAMPLES = [
    "饼图的 fieldMapping 怎么配置？",
    "如何为图表组件配置 API 数据源？",
    "StatisticCard 有哪些可配置的属性？",
];

export default function AIChatPanel({ visible }: { visible: boolean }) {
    const schema = useSchemaStore((state) => state.schema);
    const generate = useAIGenerate();
    const chat = useAIChat();
    const { pendingEdit, clearPendingEdit } = useComponentEditStore();

    const [mode, setMode] = useState<ChatMode>("create");
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 当前模式对应的状态
    const isCreate = mode === "create";
    const messages = isCreate ? generate.messages : chat.messages;
    const loading = isCreate ? generate.loading : chat.loading;
    const sessionId = isCreate ? generate.sessionId : chat.sessionId;

    // 滚动到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // create 模式下处理 pendingEdit（组件精准修改）
    useEffect(() => {
        if (!isCreate) return;
        const currentEdit = useComponentEditStore.getState().pendingEdit;
        if (!currentEdit || generate.loading) return;
        clearPendingEdit();
        setTimeout(() => {
            generate.submit(currentEdit.prompt, { targetComponent: currentEdit.node });
        }, 0);
    }, [pendingEdit, generate.loading, isCreate]);

    // pendingEdit 触发时自动切换到 create 模式
    useEffect(() => {
        if (pendingEdit && mode !== "create") {
            setMode("create");
        }
    }, [pendingEdit]);

    const handleCancel = () => {
        if (isCreate) generate.cancel();
        else chat.cancel();
    };

    const handleReset = () => {
        const resetFn = isCreate ? generate.reset : chat.reset;
        Modal.confirm({
            title: "重置对话",
            content: "确认重置？当前所有对话记录和会话状态将被清空，此操作不可撤销。",
            okText: "确认重置",
            cancelText: "取消",
            okButtonProps: { danger: true },
            onOk: () => resetFn(),
        });
    };

    const handleSubmit = () => {
        const prompt = inputValue.trim();
        if (!prompt) return;
        setInputValue("");
        if (isCreate) generate.submit(prompt);
        else chat.submit(prompt);
    };

    // 卸载时兜底关闭连接
    useEffect(() => () => {
        generate.closeSSE();
        chat.closeSSE();
    }, []);

    // 首次打开 create 模式时预填页面标题
    useEffect(() => {
        if (schema?.props?.title && generate.messages.length === 0 && isCreate) {
            setInputValue(schema.props.title);
        }
    }, []);

    const examples = isCreate ? CREATE_EXAMPLES : ASK_EXAMPLES;
    const placeholder = isCreate
        ? (messages.length === 0 ? "例如：智慧园区运营大屏，包含客流、能耗..." : "继续描述需求，例如：再加一个折线图...")
        : (messages.length === 0 ? "例如：饼图的 fieldMapping 怎么配置？" : "继续提问...");

    // 渲染单条消息内容
    const renderMessageContent = (msg: ChatMessage) => {
        // ask 模式下 AI 回复用 Markdown 渲染
        if (!isCreate && msg.role === "ai" && msg.content && !msg.loading) {
            return (
                <div>
                    <div className="prose prose-sm prose-slate max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 border-t border-slate-200 pt-2">
                            <p className="mb-1 text-[11px] font-medium text-slate-400">参考来源</p>
                            <div className="flex flex-col gap-1">
                                {msg.sources.map((src, i) => (
                                    <div key={i} className="flex items-start gap-1.5 rounded border border-slate-100 bg-slate-50/50 px-2 py-1 text-[11px] text-slate-500">
                                        <FileText className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="font-medium text-slate-600">{src.title}</span>
                                            {src.snippet && <p className="mt-0.5 leading-relaxed text-slate-400">{src.snippet}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }
        return msg.content;
    };

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden" style={{ display: visible ? "flex" : "none" }}>
            {/* 顶部栏：模式切换 + 会话状态 + 重置 */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-3 py-1.5">
                <div className="flex items-center gap-1">
                    {/* 模式切换 Tab */}
                    <button
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${isCreate
                            ? "bg-brand-50 text-brand-600 font-medium"
                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            }`}
                        onClick={() => setMode("create")}
                        disabled={loading}
                    >
                        <Sparkles className="h-3 w-3" />
                        创建大屏
                    </button>
                    <button
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${!isCreate
                            ? "bg-brand-50 text-brand-600 font-medium"
                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            }`}
                        onClick={() => setMode("ask")}
                        disabled={loading}
                    >
                        <BookOpen className="h-3 w-3" />
                        知识问答
                    </button>
                    {/* 会话状态 */}
                    {loading && (
                        <span className="ml-1 inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {isCreate ? "多轮对话中" : "问答中"}
                        </span>
                    )}
                </div>
                {messages.length > 0 && (
                    <button
                        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        onClick={handleReset}
                        disabled={loading}
                    >
                        <RotateCcw className="h-3 w-3" /> 重置
                    </button>
                )}
            </div>

            {/* 消息区域 */}
            <div className="min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden p-3">
                {messages.length === 0 ? (
                    <div className="flex flex-col gap-3 py-2">
                        <p className="text-sm text-slate-500">
                            {isCreate
                                ? "描述你想要的大屏需求，AI 将直接产出可编辑的 Schema。多轮对话可在现有画布基础上追加或修改。"
                                : "向 AI 助手提问关于组件配置、数据源设置、图表映射等问题，将基于平台知识库为你解答。"
                            }
                        </p>
                        <div className="flex items-start gap-2 rounded-lg border border-brand-100 bg-brand-50/50 px-3 py-2 text-xs text-brand-600">
                            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            <span>
                                {isCreate
                                    ? "生成结果会追加到当前画布，不会自动保存。"
                                    : "回答基于平台知识库，涵盖组件文档、配置规范和使用指南。"
                                }
                            </span>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-xs text-slate-400">{isCreate ? "示例提示词（点击填充）" : "示例问题（点击填充）"}</p>
                            <div className="flex flex-col gap-1.5">
                                {examples.map((item) => (
                                    <div
                                        key={item}
                                        className="w-full cursor-pointer rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 text-xs leading-relaxed text-slate-500 transition-all hover:border-brand-200 hover:text-brand-600 hover:bg-brand-50/30"
                                        onClick={() => setInputValue(item)}
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex w-full flex-col gap-3 py-1">
                        {messages.map((msg) => (
                            <Bubble
                                key={msg.id}
                                placement={msg.role === "user" ? "end" : "start"}
                                loading={msg.loading}
                                content={renderMessageContent(msg)}
                                styles={{
                                    content: {
                                        background: msg.role === "user" ? "#6366f1" : "#f8fafc",
                                        color: msg.role === "user" ? "#fff" : "#334155",
                                        border: msg.role === "user" ? "none" : "1px solid #e2e8f0",
                                        fontSize: "13px",
                                        lineHeight: "1.6",
                                        padding: "8px 12px",
                                        maxWidth: "100%",
                                        wordBreak: "break-word" as const,
                                        whiteSpace: "pre-wrap" as const,
                                        borderRadius: "10px",
                                    },
                                }}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* 输入区域 */}
            <div className="w-full shrink-0 border-t border-slate-200 p-3">
                <Sender
                    value={inputValue}
                    onChange={setInputValue}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={loading}
                    disabled={false}
                    placeholder={placeholder}
                    allowSpeech={false}
                    styles={{ input: { fontSize: "13px", color: "#1e293b" } }}
                />
            </div>
        </div>
    );
}
