import { useRef, useState } from "react";
import { nanoid } from "nanoid";
import { useSchemaStore } from "@/store/schema-store";
import { useShallow } from "zustand/shallow";
import type { ComponentNode } from "@/core/schema/basic";
import type { AgentStep, ChatMessage } from "@/types/chat";
import { API_BASE_URL } from "@/api/config";
import { postSSE } from "@/utils/readSSE";
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
    // const sseRef = useRef<EventSource | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    // const closeSSE = () => {
    // 关闭 SSE 连接
    //     sseRef.current?.close();
    // 重置 SSE 引用，避免重复关闭
    //     sseRef.current = null;
    // };
    // 
    const closeSSE = () => {
        // 关闭 SSE 连接
        abortRef.current?.abort();
        // 重置 SSE 引用，避免重复关闭
        abortRef.current = null;
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

        const targetComponent = options?.targetComponent;

        // 1. 添加用户消息
        const displayContent = targetComponent
            ? `[修改 ${targetComponent.name || targetComponent.type}] ${userPrompt}`
            : userPrompt;

        appendMessage({
            role: "user",
            content: displayContent,
        });

        appendMessage({
            role: "ai",
            content: "正在生成...",
            componentCount: 0,
            loading: true,
        });

        setLoading(true);

        // 2. 创建本次请求专属的 AbortController
        closeSSE();
        const controller = new AbortController();
        abortRef.current = controller;

        // 3. 读取登录 JWT
        const token = localStorage.getItem("token") || "";

        // 4. 构建当前画布组件清单
        const existingComponents = (schema?.children || []).map(
            (component) => ({
                id: component.id,
                type: component.type,
                name: component.name || "",
            })
        );

        // 5. 保留原来精准修改组件的 Prompt 逻辑
        const finalPrompt = targetComponent
            ? [
                `请精准修改以下组件（id: "${targetComponent.id}", type: "${targetComponent.type}"），只修改用户要求变动的字段，其他保持不变。`,
                `修改指令：${userPrompt}`,
                "当前组件完整配置：",
                JSON.stringify(targetComponent),
            ].join("\n")
            : userPrompt;

        let generatedCount = 0;
        let receivedEnd = false;

        // submit 仍保持同步调用方式，兼容现有 UI
        void (async () => {
            try {
                if (!token) {
                    throw new Error("请先登录后再生成");
                }

                // 6. 发起 POST SSE 请求
                await postSSE({
                    url: `${API_BASE_URL}/ai/schema/generate`,
                    token,
                    signal: controller.signal,

                    body: {
                        prompt: finalPrompt,
                        mode: "step",
                        pageId: schema?.id || "",
                        sessionId: sessionIdRef.current || undefined,
                        existingComponents,
                    },

                    // 7. 按事件类型处理业务
                    // 自己解析的 ReadableStream
                    onEvent(event, data) {
                        // 忽略已经取消或被替换的请求
                        if (
                            controller.signal.aborted ||
                            abortRef.current !== controller
                        ) {
                            return;
                        }

                        switch (event) {
                            case "start": {
                                if (data?.sessionId) {
                                    sessionIdRef.current = data.sessionId;
                                }

                                updateLastAiMessage(() => ({
                                    content: "正在思考并生成中...",
                                }));
                                break;
                            }

                            case "progress": {
                                appendProgressStep(data);
                                break;
                            }

                            case "thinking": {
                                appendReasoning(data);
                                break;
                            }

                            case "tool_call": {
                                appendToolCall(data);
                                break;
                            }

                            case "tool_result": {
                                completeToolCall(data);
                                break;
                            }

                            case "cached": {
                                appendProgressStep({
                                    stage: "cached",
                                    title: "复用缓存结果",
                                    detail: "命中了相同请求的缓存。",
                                });
                                break;
                            }

                            case "ai_chunk": {
                                // 后端 data.chunk 是 JSON 字符串
                                const node =
                                    typeof data?.chunk === "string"
                                        ? JSON.parse(data.chunk)
                                        : data?.chunk;

                                if (
                                    !node ||
                                    typeof node !== "object" ||
                                    Array.isArray(node)
                                ) {
                                    throw new Error("AI 返回了无效组件数据");
                                }

                                // A. 更新页面级 props/settings
                                if (
                                    !node.type &&
                                    (node.props || node.settings)
                                ) {
                                    updatePage(node);

                                    updateLastAiMessage(() => ({
                                        content: "页面配置已更新，继续生成中...",
                                    }));
                                    break;
                                }

                                if (!node.type) {
                                    throw new Error("组件缺少 type 字段");
                                }

                                // B. 从 Store 读取最新 Schema，
                                // 避免使用请求开始时的旧 Schema。
                                const latestSchema = useSchemaStore.getState().schema;

                                if (!latestSchema) {
                                    throw new Error("当前画布不存在");
                                }

                                if (
                                    node.id &&
                                    findItem(node.id, latestSchema)
                                ) {
                                    // C. 更新已有组件
                                    const updated = updateItem(node.id, node);

                                    if (!updated) {
                                        throw new Error(`组件 ${node.id} 更新失败`);
                                    }

                                    updateLastAiMessage(() => ({
                                        content: `已更新组件 ${node.name || node.id}，继续生成中...`,
                                        componentCount: generatedCount,
                                    }));
                                } else {
                                    // D. 新增组件
                                    const component = node.id
                                        ? node
                                        : { ...node, id: nanoid() };

                                    const added = addItem(
                                        latestSchema.id,
                                        component
                                    );

                                    if (!added) {
                                        throw new Error("组件添加到画布失败");
                                    }

                                    generatedCount++;

                                    updateLastAiMessage(() => ({
                                        content: `已生成 ${generatedCount} 个组件，继续生成中...`,
                                        componentCount: generatedCount,
                                    }));
                                }
                                break;
                            }

                            case "stream_error":
                            case "error": {
                                throw new Error(
                                    data?.message || "AI 生成失败"
                                );
                            }

                            case "end": {
                                receivedEnd = true;

                                if (data?.ok !== true) {
                                    throw new Error(
                                        data?.cancelled
                                            ? "服务端取消了生成"
                                            : "生成未成功完成"
                                    );
                                }
                                break;
                            }
                        }
                    },
                });

                // 8. 必须收到 end，不能只看 HTTP 正常结束
                if (!receivedEnd) {
                    throw new Error("SSE 提前断开，未收到 end 事件");
                }

                if (
                    controller.signal.aborted ||
                    abortRef.current !== controller
                ) {
                    return;
                }

                // 9. 完成生成
                finishRunningSteps();

                updateLastAiMessage((msg) => ({
                    content:
                        (msg.componentCount ?? 0) > 0
                            ? `生成完成，共 ${msg.componentCount} 个组件，记得保存 ✓`
                            : "操作完成，记得保存 ✓",
                    loading: false,
                }));
            } catch (error) {
                // 用户主动停止时，cancel 已经处理了 UI
                if (
                    controller.signal.aborted ||
                    abortRef.current !== controller
                ) {
                    return;
                }

                finishRunningSteps("error");

                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "未知错误";

                updateLastAiMessage(() => ({
                    content: `生成失败：${errorMessage}`,
                    loading: false,
                }));

                console.error("[useAIGenerate]", error);
            } finally {
                // 只允许本次请求清理自身的状态
                if (abortRef.current === controller) {
                    abortRef.current = null;
                    setLoading(false);
                }
            }
        })();
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
