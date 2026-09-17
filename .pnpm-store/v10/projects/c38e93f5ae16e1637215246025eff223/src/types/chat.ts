export interface ChatMessage {
    id: string;
    role: "user" | "ai";
    content: string;
    /** ai 消息额外展示的组件计数（仅 create 模式） */
    componentCount?: number;
    /** ai 消息是否仍在流式输出中 */
    loading?: boolean;
    /** RAG 问答引用的文档来源（仅 ask 模式） */
    sources?: DocumentSource[];
}

export interface DocumentSource {
    /** 来源文档标题或文件名 */
    title: string;
    /** 匹配的文本片段 */
    snippet?: string;
}
