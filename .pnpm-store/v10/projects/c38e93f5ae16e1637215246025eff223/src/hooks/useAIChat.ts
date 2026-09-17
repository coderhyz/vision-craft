import { useRef, useState } from "react";
import { nanoid } from "nanoid";
import type { ChatMessage, DocumentSource } from "@/types/chat";

export function useAIChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const sessionIdRef = useRef<string | null>(null);
    const sseRef = useRef<EventSource | null>(null);

    const closeSSE = () => {
        sseRef.current?.close();
        sseRef.current = null;
    };
    // 更新最后一条 AI 消息的内容
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
        updateLastAiMessage(() => ({
            content: "已取消回答",
            loading: false,
        }));
        setLoading(false);
        closeSSE();
    };

    const reset = () => {
        closeSSE();
        setMessages([]);
        setLoading(false);
        sessionIdRef.current = null;
    };

    const submit = (question: string) => {
        if (loading || !question.trim()) return;

        appendMessage({ role: "user", content: question });
        appendMessage({ role: "ai", content: "", loading: true });
        setLoading(true);

        closeSSE();

        const token = localStorage.getItem("token");

        const params = new URLSearchParams({
            question,
            token: token || "",
        });
        if (sessionIdRef.current) {
            params.set("sessionId", sessionIdRef.current);
        }

        const sse = new EventSource(
            `http://localhost:3000/api/ai/chat?${params.toString()}`,
        );
        sseRef.current = sse;

        let fullText = "";

        sse.addEventListener("start", (evt) => {
            try {
                const data = JSON.parse((evt as MessageEvent).data);
                if (data?.sessionId) sessionIdRef.current = data.sessionId;
                updateLastAiMessage(() => ({ content: "正在思考中..." }));
            } catch (_) { }
        });

        sse.addEventListener("text_chunk", (evt) => {
            try {
                const payload = JSON.parse((evt as MessageEvent).data);
                const chunk = payload?.text ?? "";
                fullText += chunk;
                updateLastAiMessage(() => ({ content: fullText }));
            } catch (e) {
                console.error("[useAIChat][text_chunk][parse_error]", e);
            }
        });

        sse.addEventListener("sources", (evt) => {
            try {
                const payload = JSON.parse((evt as MessageEvent).data);
                const sources: DocumentSource[] = payload?.sources ?? [];
                updateLastAiMessage(() => ({ sources }));
            } catch (_) { }
        });

        sse.addEventListener("end", () => {
            updateLastAiMessage(() => ({ loading: false }));
            setLoading(false);
            closeSSE();
        });

        sse.addEventListener("stream_error", (evt) => {
            console.error("[useAIChat][stream_error]", (evt as MessageEvent).data);
        });

        sse.addEventListener("error", () => {
            updateLastAiMessage(() => ({ content: fullText || "回答失败，请重试", loading: false }));
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
