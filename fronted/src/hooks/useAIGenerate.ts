import { useRef, useState } from "react";
import { nanoid } from "nanoid";
import { useSchemaStore } from "@/store/schema-store";
import { useShallow } from "zustand/shallow";
import type { ComponentNode } from "@/core/schema/basic";
import type { ChatMessage } from "@/types/chat";

export type { ChatMessage };

export interface SubmitOptions {
    /** 指定要精准修改的目标组件，携带完整配置注入 prompt 上下文 */
    targetComponent?: ComponentNode;
}

const formatChangeValue = (value: unknown) => {
    if (value === undefined) return "未设置";
    if (typeof value === "string") return value || '""';
    return JSON.stringify(value);
};

/** 对比修改前后的节点，生成可核对的字段变更列表 */
const collectChanges = (before: unknown, after: unknown, path = ""): string[] => {
    if (Object.is(before, after)) return [];
    if (JSON.stringify(before) === JSON.stringify(after)) return [];

    const beforeIsObject = before !== null && typeof before === "object" && !Array.isArray(before);
    const afterIsObject = after !== null && typeof after === "object" && !Array.isArray(after);
    if (beforeIsObject && afterIsObject) {
        const beforeRecord = before as Record<string, unknown>;
        const afterRecord = after as Record<string, unknown>;
        const keys = new Set([...Object.keys(beforeRecord), ...Object.keys(afterRecord)]);
        return [...keys].flatMap((key) =>
            collectChanges(beforeRecord[key], afterRecord[key], path ? `${path}.${key}` : key),
        );
    }

    return [`- ${path}: ${formatChangeValue(before)} → ${formatChangeValue(after)}`];
};

export function useAIGenerate() {
    const { schema, addItem, updateItem, findItem, updatePage } = useSchemaStore(
        useShallow((state) => ({
            schema: state.schema,
            addItem: state.addItem,
            updateItem: state.updateItem,
            findItem: state.findItem,
            updatePage: state.updatePage,
        })),
    );

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const sessionIdRef = useRef<string | null>(null);
    const sseRef = useRef<EventSource | null>(null);

    const closeSSE = () => {
        sseRef.current?.close();
        sseRef.current = null;
    };

    const updateLastAiMessage = (updater: (msg: ChatMessage) => Partial<ChatMessage>) => {
        setMessages((prev) => {
            const idx = [...prev].reverse().findIndex((m) => m.role === "ai");
            if (idx === -1) return prev;
            const realIdx = prev.length - 1 - idx;
            const updated = { ...prev[realIdx], ...updater(prev[realIdx]) };
            return [...prev.slice(0, realIdx), updated, ...prev.slice(realIdx + 1)];
        });
    };

    const appendMessage = (msg: Omit<ChatMessage, "id">) => {
        setMessages((prev) => [...prev, { ...msg, id: nanoid() }]);
    };

    const cancel = () => {
        if (!loading) return;
        updateLastAiMessage((msg) => ({
            content:
                (msg.componentCount ?? 0) > 0
                    ? `已取消，已生成 ${msg.componentCount} 个组件（未完成）`
                    : "已取消生成",
            loading: false,
        }));
        setLoading(false);
        closeSSE();
    };

    /** 重置整个对话状态：清空消息、断开 SSE、清除 sessionId */
    const reset = () => {
        closeSSE();
        setMessages([]);
        setLoading(false);
        sessionIdRef.current = null;
    };

    const submit = (userPrompt: string, options?: SubmitOptions) => {
        if (loading || !userPrompt.trim()) return;

        const targetComponent = options?.targetComponent;

        // 对话列表中显示的用户消息（带组件标记更直观）
        const displayContent = targetComponent
            ? `[修改 ${targetComponent.name || targetComponent.type}] ${userPrompt}`
            : userPrompt;

        appendMessage({ role: "user", content: displayContent });
        appendMessage({ role: "ai", content: "正在生成...", componentCount: 0, loading: true });
        setLoading(true);

        closeSSE();

        const token = localStorage.getItem("token");

        // 序列化当前画布组件清单，让后端注入到 AI 上下文中，防止编造 id
        const existingComponents = (schema?.children || []).map((c) => ({
            id: c.id,
            type: c.type,
            name: (c as unknown as Record<string, unknown>).name || "",
        }));

        // 当指定了目标组件时，构建增强 prompt，将组件完整配置注入上下文
        // 注意：组件 JSON 使用紧凑格式（无缩进），因为 EventSource 通过 GET 传参，URL 长度有限
        const finalPrompt = targetComponent
            ? [
                `请精准修改以下组件（id: "${targetComponent.id}", type: "${targetComponent.type}"），只修改用户要求变动的字段，其他保持不变。`,
                `修改指令：${userPrompt}`,
                `当前组件完整配置：`,
                JSON.stringify(targetComponent),
            ].join("\n")
            : userPrompt;

        const params = new URLSearchParams({
            prompt: finalPrompt,
            mode: "step",
            token: token || "",
            pageId: schema?.id || "",
            existingComponents: JSON.stringify(existingComponents),
        });
        if (sessionIdRef.current) {
            params.set("sessionId", sessionIdRef.current);
        }

        const sse = new EventSource(
            `http://localhost:3000/api/ai/schema/generate?${params.toString()}`,
        );
        sseRef.current = sse;

        let generatedCount = 0;
        let editProcessContent: string | null = null;

        sse.addEventListener("start", (evt) => {
            try {
                const data = JSON.parse((evt as MessageEvent).data);
                if (data?.sessionId) sessionIdRef.current = data.sessionId;
                updateLastAiMessage(() => ({ content: "正在思考并生成中..." }));
            } catch (_err) {
                console.error("[useAIGenerate][start][parse_error]", _err);
            }
        });

        sse.addEventListener("ai_chunk", (evt) => {
            try {
                const payload = JSON.parse((evt as MessageEvent).data);
                const node =
                    typeof payload?.chunk === "string"
                        ? JSON.parse(payload.chunk)
                        : payload?.chunk;

                // update_page_config 输出：含 props/settings，无 type 字段
                if (!node?.type && (node?.props || node?.settings)) {
                    updatePage(node);
                    updateLastAiMessage(() => ({ content: "页面配置已更新，继续生成中..." }));
                    return;
                }

                // 普通组件节点：upsert 逻辑（ID 已存在则更新，否则新增）
                const existingNode = node?.id && schema ? findItem(node.id, schema) : null;
                if (node?.id && existingNode) {
                    // 已有组件：原地更新完整配置
                    const changes = collectChanges(existingNode, node);
                    const updated = updateItem(node.id, node);

                    if (targetComponent?.id === node.id) {
                        const componentName = node.name || targetComponent.name || node.type;
                        const componentLabel = componentName.endsWith("组件")
                            ? componentName
                            : `${componentName}组件`;
                        editProcessContent = [
                            `目标组件：${componentLabel}（id: ${node.id}）`,
                            "收到修改数据",
                            "修改内容：",
                            ...(changes.length ? changes : ["- 未检测到字段变化"]),
                            `Schema 更新${updated ? "成功 ✓" : "失败"}`,
                        ].join("\n");
                    }

                    updateLastAiMessage(() => ({
                        content:
                            editProcessContent ||
                            `已更新组件 ${node.name || node.id}，继续生成中...`,
                        componentCount: generatedCount,
                    }));
                } else {
                    // 新组件：确保有 id 后追加
                    const component = node?.id ? node : { ...node, id: nanoid() };
                    addItem(schema?.id || "", component);
                    generatedCount++;
                    updateLastAiMessage(() => ({
                        content: `已生成 ${generatedCount} 个组件，继续生成中...`,
                        componentCount: generatedCount,
                    }));
                }
            } catch (e) {
                console.error("[useAIGenerate][ai_chunk][parse_error]", e);
            }
        });

        sse.addEventListener("end", () => {
            updateLastAiMessage((msg) => ({
                content:
                    editProcessContent ??
                    ((msg.componentCount ?? 0) > 0
                        ? `生成完成，共 ${msg.componentCount} 个组件，记得保存 ✓`
                        : "操作完成，记得保存 ✓"),
                loading: false,
            }));
            setLoading(false);
            closeSSE();
        });

        sse.addEventListener("stream_error", (evt) => {
            console.error("[useAIGenerate][stream_error]", (evt as MessageEvent).data);
        });

        sse.addEventListener("error", () => {
            updateLastAiMessage(() => ({ content: "生成失败，请重试", loading: false }));
            setLoading(false);
            closeSSE();
        });
    };

    return {
        messages,
        loading,
        sessionId: sessionIdRef.current,
        submit,
        cancel,
        reset,
        closeSSE,
    };
}
