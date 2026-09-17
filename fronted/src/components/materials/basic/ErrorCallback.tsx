import { TriangleAlert } from "lucide-react";
import type { RendererProps } from "@/core/schema/types";

export const ERROR_COMPONENT_DEFAULT_SIZE = {
    width: 320,
    height: 180,
} as const;

/**
 * 物料渲染兜底组件：当 DSL 中的组件类型没有对应实现时显示错误信息，避免画布白屏。
 */
export default function ErrorCallback({ node }: RendererProps) {
    const nodeStyle = "style" in node ? node.style : undefined;
    const width = Number(nodeStyle?.width ?? ERROR_COMPONENT_DEFAULT_SIZE.width);
    const height = Number(nodeStyle?.height ?? ERROR_COMPONENT_DEFAULT_SIZE.height);
    const isCompact = width < 240 || height < 96;
    const message = `未找到类型为“${node.type}”的组件，请检查页面 Schema 或组件注册表。`;

    if (isCompact) {
        return (
            <div
                className="box-border flex h-full w-full items-center gap-1.5 overflow-hidden rounded border border-red-200 bg-red-50 px-2 text-red-600"
                title={message}
            >
                <TriangleAlert className="h-4 w-4 shrink-0" />
                <span className="min-w-0 truncate text-xs">组件渲染出错：{node.type}</span>
            </div>
        );
    }

    return (
        <div className="box-border flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-red-200 bg-red-50/70 p-4 text-center">
            <div className="mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
                <TriangleAlert className="h-6 w-6" />
            </div>
            <div className="text-sm font-semibold text-slate-800">组件渲染出错</div>
            <p className="mt-1 max-w-full overflow-hidden text-xs leading-5 text-slate-500" title={message}>
                {message}
            </p>
        </div>
    );
}
