import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Renderer from "@/core/render/Renderer"
import { getPageById } from "@/api/page";
import type { PageDSL } from "@/core/schema/page";
import { useZoom } from "@/hooks/useZoom";

const toNumber = (value: number | string | undefined, fallback: number) => {
    if (typeof value === "number") return value;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export default function PreviewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [schema, setSchema] = useState<PageDSL | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // 视口尺寸
    const [viewport, setViewport] = useState<{
        width: number;
        height: number;
    } | null>(null);
    // 预览schema
    const previewSchema = useMemo(() => {
        if (!schema || !viewport) return null;
        return {
            ...schema,
            settings: {
                ...schema.settings,
                width: viewport.width,
                height: viewport.height,
            },
        };
    }, [schema, viewport]);

    // 发请求，拿到对应页面的schema
    useEffect(() => {
        let cancelled = false;

        const bootstrap = async () => {
            if (!id) {
                setError("未找到页面标识");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            try {
                const resp = await getPageById(id);
                const { code, message, data } = (resp as any) || {};
                if (code !== undefined && code !== 0) {
                    throw new Error(message || "获取页面失败");
                }
                if (!data?.schema) {
                    throw new Error("页面数据为空");
                }
                if (cancelled) return;
                setSchema(data.schema);
            } catch (err: any) {
                if (cancelled) return;
                setError(err?.message || "加载失败");
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        bootstrap();

        return () => {
            cancelled = true;
        };
    }, [id]);

    // 监听schema变化，当接口拿到schema后，设置视口尺寸
    useEffect(() => {
        if (!schema) return;
        const width = toNumber(schema.settings?.width, 1920);
        const height = toNumber(schema.settings?.height, 1080);
        setViewport({ width, height });
    }, [schema]);

    const {
        autoFit,
        manualZoom,
        scale,
        scaledWidth,
        scaledHeight,
        setAutoFit,
        handleZoomChange,
        handleResetZoom,
    } = useZoom({
        viewport,
        containerRef,
        resetOnViewportChange: true,
    });

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
                正在加载预览...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
                <div className="space-y-4 text-center">
                    <div className="text-lg font-semibold">预览加载失败</div>
                    <div className="text-sm text-slate-300">{error}</div>
                    <div className="flex justify-center gap-3">
                        <button
                            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            onClick={() => window.location.reload()}
                        >
                            重试
                        </button>
                        <button
                            className="rounded-md border border-slate-500 px-4 py-2 text-slate-100 hover:border-blue-400"
                            onClick={() => navigate(-1)}
                        >
                            返回
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!previewSchema || !viewport) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
                未找到可预览的页面
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
            <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                <div className="flex items-center gap-3">
                    <button
                        className="rounded-md border border-slate-700 px-3 py-1 text-sm hover:border-blue-500"
                        onClick={() => navigate(-1)}
                    >
                        返回编辑
                    </button>
                    <div className="text-sm text-slate-300">
                        预览模式 · 尺寸 {viewport.width} x {viewport.height} ·
                        缩放 {Math.round(scale * 100)}%
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        className={`rounded-md border px-3 py-1 text-sm ${autoFit ? "border-blue-500 text-blue-300" : "border-slate-700 hover:border-blue-500"}`}
                        onClick={() => setAutoFit((v) => !v)}
                    >
                        {autoFit ? "自适应中" : "开启自适应"}
                    </button>
                    <div className="flex items-center gap-1">
                        <button
                            className="rounded-md border border-slate-700 px-2 py-1 text-sm hover:border-blue-500"
                            onClick={() => handleZoomChange(manualZoom - 0.1)}
                        >
                            -
                        </button>
                        <span className="w-16 text-center text-sm">
                            {Math.round(scale * 100)}%
                        </span>
                        <button
                            className="rounded-md border border-slate-700 px-2 py-1 text-sm hover:border-blue-500"
                            onClick={() => handleZoomChange(manualZoom + 0.1)}
                        >
                            +
                        </button>
                        <button
                            className="rounded-md border border-slate-700 px-3 py-1 text-sm hover:border-blue-500"
                            onClick={handleResetZoom}
                        >
                            重置
                        </button>
                    </div>
                </div>
            </header>

            <main
                ref={containerRef}
                className="flex flex-1 overflow-auto bg-slate-900 p-4"
            >
                <div className="flex h-full w-full items-center justify-center">
                    <div
                        className="relative rounded-lg border border-slate-800 bg-slate-950 shadow-2xl"
                        style={{
                            width: scaledWidth,
                            height: scaledHeight,
                            minWidth: 320,
                            minHeight: 180,
                        }}
                    >
                        <div
                            style={{
                                width: viewport.width,
                                height: viewport.height,
                                transform: `scale(${scale})`,
                                transformOrigin: "top left",
                                position: "absolute",
                                inset: 0,
                            }}
                        >
                            {/* 预览的内容 */}
                            <Renderer schema={previewSchema} mode="preview" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
