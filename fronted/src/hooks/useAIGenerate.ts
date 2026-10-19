import { useRef, useState } from "react";
import { nanoid } from "nanoid";
import { useSchemaStore } from "@/store/schema-store";
import { useShallow } from "zustand/shallow";
import type { ComponentNode } from "@/core/schema/basic";
import type { AgentStep, ChatMessage } from "@/types/chat";
import { API_BASE_URL } from "@/api/config";
export type { ChatMessage };

export interface SubmitOptions {
    /** 指定要精准修改的目标组件，携带完整配置注入 prompt 上下文 */
    targetComponent?: ComponentNode;
}

export function useAIGenerate() {
    // schema 仓库
    const { schema, addItem, updateItem, findItem, updatePage } = useSchemaStore(
        useShallow((state) => ({
            schema: state.schema,
            addItem: state.addItem,
            updateItem: state.updateItem,
            findItem: state.findItem,
            updatePage: state.updatePage,
        }))
    );
    // 消息列表
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    // 是否在生成中
    const [loading, setLoading] = useState(false);
    // 会话 ID
    const sessionIdRef = useRef<string | null>(null);
    // SSE 连接引用
    const sseRef = useRef<EventSource | null>(null);

    const closeSSE = () => {
        // 关闭 SSE 连接
        sseRef.current?.close();
        // 重置 SSE 引用，避免重复关闭
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

    const appendProgressStep = (data: any) => {
        updateLastAiMessage((msg) => {
            const id = `progress:${data?.stage || nanoid()}`;
            const steps = (msg.agentSteps || []).map((step) =>
                step.kind === "thinking" && step.status === "running"
                    ? { ...step, status: "done" as const }
                    : step
            );
            const nextStep: AgentStep = {
                id,
                kind: "thinking",
                title: data?.title || "处理请求",
                detail: data?.detail,
                status: "running",
            };
            const index = steps.findIndex((step) => step.id === id);
            if (index >= 0) steps[index] = nextStep;
            else steps.push(nextStep);
            return { content: nextStep.title, agentSteps: steps };
        });
    };
    // 在生成过程中，AI 可能会调用外部工具（如数据库查询、API 调用等），我们需要在消息中显示这些工具调用的状态
    const appendToolCall = (data: any) => {
        updateLastAiMessage((msg) => {
            const id = `tool:${data?.id || nanoid()}`;
            const steps = [...(msg.agentSteps || [])];
            if (!steps.some((step) => step.id === id)) {
                steps.push({
                    id,
                    kind: "tool",
                    title: data?.label || data?.name || "调用工具",
                    detail: data?.inputSummary,
                    status: "running",
                });
            }
            return { content: `正在${data?.label || "调用工具"}...`, agentSteps: steps };
        });
    };

    const appendReasoning = (data: any) => {
        const content = typeof data?.content === "string" ? data.content.trim() : "";
        if (!content) return;

        updateLastAiMessage((msg) => {
            const id = `reasoning:${data?.id || nanoid()}`;
            const steps = [...(msg.agentSteps || [])];
            const reasoningStep: AgentStep = {
                id,
                kind: "reasoning",
                title: `模型思考${data?.round ? ` · 第 ${data.round} 轮` : ""}`,
                detail: content,
                status: "done",
            };
            const index = steps.findIndex((step) => step.id === id);
            if (index >= 0) steps[index] = reasoningStep;
            else steps.push(reasoningStep);
            return { content: "已完成一轮思考，正在执行下一步...", agentSteps: steps };
        });
    };

    const completeToolCall = (data: any) => {
        updateLastAiMessage((msg) => {
            const steps = [...(msg.agentSteps || [])];
            const exactId = data?.id ? `tool:${data.id}` : null;
            let index = exactId ? steps.findIndex((step) => step.id === exactId) : -1;
            if (index < 0) {
                for (let i = steps.length - 1; i >= 0; i--) {
                    const step = steps[i];
                    if (
                        step.kind === "tool" &&
                        step.status === "running" &&
                        step.title === (data?.label || data?.name)
                    ) {
                        index = i;
                        break;
                    }
                }
            }

            const completedStep: AgentStep = {
                id: exactId || `tool-result:${nanoid()}`,
                kind: "tool",
                title: data?.label || data?.name || "工具执行完成",
                detail: data?.summary,
                status: data?.status === "success" ? "done" : "error",
            };
            if (index >= 0)
                steps[index] = { ...steps[index], ...completedStep, id: steps[index].id };
            else steps.push(completedStep);
            return { agentSteps: steps };
        });
    };

    const finishRunningSteps = (status: AgentStep["status"] = "done") => {
        updateLastAiMessage((msg) => ({
            agentSteps: (msg.agentSteps || []).map((step) =>
                step.status === "running" ? { ...step, status } : step
            ),
        }));
    };

    const cancel = () => {
        if (!loading) return;
        updateLastAiMessage((msg) => ({
            content:
                (msg.componentCount ?? 0) > 0
                    ? `已取消，已生成 ${msg.componentCount} 个组件（未完成）`
                    : "已取消生成",
            loading: false,
            agentSteps: (msg.agentSteps || []).map((step) =>
                step.status === "running" ? { ...step, status: "error" as const } : step
            ),
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
    // 提交的请求
    const submit = (userPrompt: string, options?: SubmitOptions) => {
        if (loading || !userPrompt.trim()) return;
        // 这个是要精准修改的目标组件，携带完整配置注入 prompt 上下文
        const targetComponent = options?.targetComponent;

        // 对话列表中显示的用户消息（带组件标记更直观）
        const displayContent = targetComponent
            ? `[修改 ${targetComponent.name || targetComponent.type}] ${userPrompt}`
            : userPrompt;
        // 显示用户输入的内容
        appendMessage({ role: "user", content: displayContent });
        // 显示 AI 正在生成的提示
        appendMessage({ role: "ai", content: "正在生成...", componentCount: 0, loading: true });
        setLoading(true);
        // 关闭之前的 SSE 连接
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
        // 最终传递的参数
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
            `${API_BASE_URL}/ai/schema/generate?${params.toString()}`
        );
        sseRef.current = sse;

        let generatedCount = 0;

        sse.addEventListener("start", (evt) => {
            try {
                const data = JSON.parse((evt as MessageEvent).data);
                if (data?.sessionId) sessionIdRef.current = data.sessionId;
                // 更新最后一条 AI 消息
                updateLastAiMessage(() => ({ content: "正在思考并生成中..." }));
            } catch (error) {
                console.error("[useAIGenerate][start][parse_error]", error);
            }
        });

        sse.addEventListener("progress", (evt) => {
            try {
                appendProgressStep(JSON.parse((evt as MessageEvent).data));
            } catch (e) {
                console.error("[useAIGenerate][progress][parse_error]", e);
            }
        });

        sse.addEventListener("tool_call", (evt) => {
            try {
                appendToolCall(JSON.parse((evt as MessageEvent).data));
            } catch (e) {
                console.error("[useAIGenerate][tool_call][parse_error]", e);
            }
        });

        sse.addEventListener("thinking", (evt) => {
            try {
                appendReasoning(JSON.parse((evt as MessageEvent).data));
            } catch (e) {
                console.error("[useAIGenerate][thinking][parse_error]", e);
            }
        });

        sse.addEventListener("tool_result", (evt) => {
            try {
                completeToolCall(JSON.parse((evt as MessageEvent).data));
            } catch (e) {
                console.error("[useAIGenerate][tool_result][parse_error]", e);
            }
        });

        sse.addEventListener("cached", () => {
            appendProgressStep({
                stage: "cached",
                title: "复用缓存结果",
                detail: "检测到相同请求，已跳过重复的模型调用。",
            });
        });

        sse.addEventListener("ai_chunk", (evt) => {
            try {
                // 监听到后端返回的组件节点数据，进行 upsert（更新或新增）操作
                const payload = JSON.parse((evt as MessageEvent).data);
                const node =
                    typeof payload?.chunk === "string" ? JSON.parse(payload.chunk) : payload?.chunk;

                // update_page_config 输出：含 props/settings，无 type 字段
                if (!node?.type && (node?.props || node?.settings)) {
                    // 更新整个页面配置（props/settings），不涉及新增组件
                    updatePage(node);
                    // 更新最后一条 AI 消息
                    updateLastAiMessage(() => ({ content: "页面配置已更新，继续生成中..." }));
                    return;
                }

                // 普通组件节点：upsert 逻辑（ID 已存在则更新，否则新增）
                if (node?.id && schema && findItem(node.id, schema)) {
                    // 已有组件：原地更新完整配置
                    updateItem(node.id, node);
                    // 更新最后一条 AI 消息
                    updateLastAiMessage(() => ({
                        content: `已更新组件 ${node.name || node.id}，继续生成中...`,
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
            finishRunningSteps();
            updateLastAiMessage((msg) => ({
                content:
                    (msg.componentCount ?? 0) > 0
                        ? `生成完成，共 ${msg.componentCount} 个组件，记得保存 ✓`
                        : "操作完成，记得保存 ✓",
                loading: false,
            }));
            setLoading(false);
            closeSSE();
        });

        sse.addEventListener("stream_error", (evt) => {
            console.error("[useAIGenerate][stream_error]", (evt as MessageEvent).data);
        });

        sse.addEventListener("error", () => {
            finishRunningSteps("error");
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
