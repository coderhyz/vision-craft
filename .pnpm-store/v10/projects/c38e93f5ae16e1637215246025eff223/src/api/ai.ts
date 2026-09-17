import { http } from "./request";
import type { PageDSL } from "@/core/schema/page";

export type GeneratePhase = "layout" | "components" | "data" | "full";
export type GenerateMode = "step" | "full";

export interface GenerateSchemaPayload {
    prompt: string;
    phase?: GeneratePhase;
    mode?: GenerateMode;
    prevSchema?: PageDSL | null;
    sessionId?: string;
    stream?: boolean;
}

export interface GenerateSchemaResult {
    schema: PageDSL;
    validation?: { ok: boolean; errors?: string[] };
    cached?: boolean;
}

export interface GenerateSchemaResponse {
    code: number;
    message: string;
    data: GenerateSchemaResult;
}

/**
 * 非流式生成 Schema
 */
export const generateSchema = (
    payload: GenerateSchemaPayload,
): Promise<GenerateSchemaResponse> => {
    return http.post("/ai/schema/generate", payload);
};

export type GenerateSchemaStreamHandlers = {
    onEvent?: (evt: { event: string; data: any }) => void;
    onResult?: (data: GenerateSchemaResult) => void;
    onError?: (message: string) => void;
    onDone?: () => void;
};

// ===================== RAG 问答相关类型 =====================

export interface AskPayload {
    question: string;
    sessionId?: string;
}

export interface AskStreamHandlers {
    onTextChunk?: (text: string) => void;
    onSources?: (sources: { title: string; snippet?: string }[]) => void;
    onError?: (message: string) => void;
    onDone?: () => void;
}

