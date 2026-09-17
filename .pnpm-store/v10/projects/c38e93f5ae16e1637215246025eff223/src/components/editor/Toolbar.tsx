import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { savePage, type SavePageResponse } from "@/api/page";
import { useSchemaStore } from "@/store/schema-store";
import { useShallow } from "zustand/shallow";
import { captureNodeThumbnail } from "@/utils/thumbnail";
import { getCurrentUserId } from "@/utils/auth";
import { Save, Eye, CheckCircle, AlertCircle } from "lucide-react";
// 状态类型
type StatusType = "idle" | "success" | "error";

interface ToolbarProps {
    pageId?: string | null;
    onPageIdChange?: (pageId: string) => void;
}
// 工具栏
export default function Toolbar({ pageId = null, onPageIdChange }: ToolbarProps) {
    const { schema } = useSchemaStore(useShallow((state) => ({ schema: state.schema })));
    const navigate = useNavigate();
    // 保存状态和提示信息
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: StatusType; message: string }>({ type: "idle", message: "" });
    const disabled = useMemo(() => !schema || saving, [schema, saving]);
    /**
     * 保存当前页面。
     * 使用 useCallback 保持函数引用稳定，方便按钮点击和 Ctrl+S 监听共同复用。
     */
    const handleSave = useCallback(async () => {
        // Schema 尚未加载或已有保存任务执行时，不再发起新的保存请求。
        if (!schema || saving) return;
        setSaving(true);
        setStatus({ type: "idle", message: "" });

        // 保存 Schema 的同时生成当前画布缩略图，用于项目列表展示。
        const canvasNode = document.querySelector<HTMLElement>("[data-canvas-content='true']");
        const thumbnailPromise = (async () => {
            const captured = await captureNodeThumbnail(canvasNode, {
                pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
                timeoutMs: 800,
                targetWidth: 720,
            });
            return captured ?? null;
        })();

        // 组装后端保存接口需要的数据；已有 pageId 时更新，否则由后端创建页面。
        const payload = {
            pageId: pageId || "",
            schema,
            meta: { title: schema.props?.title, description: schema.props?.description },
            thumbnail: (await thumbnailPromise) ?? undefined,
            userId: getCurrentUserId(),
        };

        try {
            // 保存页面
            const resp = await savePage(payload);
            const resBody = (resp as any)?.data ?? resp;
            const { code, message, data } = resBody || {};
            if (code !== undefined && code !== 0) throw new Error(message || "保存失败");
            const result = data as SavePageResponse["data"] | undefined;
            const newPageId = result?.pageId || (result as any)?._id;
            if (newPageId && onPageIdChange) onPageIdChange(newPageId);
            setStatus({ type: "success", message: message || "保存成功" });
        } catch (err: any) {
            setStatus({ type: "error", message: err?.message || "保存失败" });
        } finally {
            setSaving(false);
        }
    }, [onPageIdChange, pageId, saving, schema]);

    /**
     * 注册保存快捷键。
     * Ctrl+S 用于 Windows/Linux，Meta+S（Command+S）用于 macOS。
     */
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // 统一转成小写，兼容用户按下 Shift 或不同键盘布局时的 key 值。
            const isSaveShortcut =
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "s";
            if (!isSaveShortcut) return;

            // 阻止浏览器弹出“保存网页”窗口。
            event.preventDefault();
            // 长按快捷键会连续触发 keydown，只处理第一次按下。
            if (event.repeat) return;
            void handleSave();
        };

        window.addEventListener("keydown", handleKeyDown);
        // Toolbar 卸载或 handleSave 变化时移除旧监听，避免重复绑定和内存泄漏。
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleSave]);
    //切换到预览模式
    const handlePreview = () => {
        if (!pageId) return;
        navigate(`/preview/${pageId}`);
    };

    return (
        <div className="flex h-full items-center justify-between px-4 bg-white border-b border-slate-200">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-md bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-[10px] font-bold text-white shadow-brand-soft">
                        VC
                    </div>
                    <span className="text-sm font-medium text-slate-700">编辑器</span>
                </div>
                {pageId && (
                    <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                        ID: {pageId}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/projects')} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all bg-slate-100 text-slate-400 ">
                    返回项目
                </button>
                {status.message && (
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md ${status.type === "error" ? "text-red-600 bg-red-50" : "text-emerald-600 bg-emerald-50"
                        }`}>
                        {status.type === "error" ? <AlertCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                        {status.message}
                    </span>
                )}
                <button
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${disabled
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-brand-500 text-white hover:bg-brand-600 shadow-brand-soft"
                        }`}
                    disabled={disabled}
                    onClick={handleSave}
                    title="保存（Ctrl+S）"
                >
                    <Save className="h-3.5 w-3.5" />
                    {saving ? "保存中..." : "保存"}
                </button>
                <button
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${!pageId
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600"
                        }`}
                    disabled={!pageId}
                    onClick={handlePreview}
                >
                    <Eye className="h-3.5 w-3.5" />
                    预览
                </button>
            </div>
        </div>
    );
}
