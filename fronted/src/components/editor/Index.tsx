import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SidebarMenu from "@/components/panels/component-panel/SidebarMenu";
import DndWrapper from "@/core/dnd-kit/DndWrapper";
import Renderer from "@/core/render/Renderer";
import CanvasEmpty from "./CanvasEmpty";
import PropertyPanel from "@/components/panels/property-panel/Index";
import { useSchemaStore } from "@/store/schema-store";
import { useShallow } from "zustand/shallow";
import Toolbar from "./Toolbar";
import { getPageById } from "@/api/page";
import { useZoom } from "@/hooks/useZoom";
import { Ruler, RULER_THICKNESS } from "@/components/editor/ruler/Ruler";
import { GuideLayer } from "@/components/editor/ruler/GuideLayer";
import { Minus, Plus, Maximize, RotateCcw, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button, Layout, Tooltip } from "antd";
// 将值转换为数字，如果无法转换则返回默认值
const toNumber = (value: number | string | undefined, fallback: number) => {
    if (typeof value === "number") return value;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
// 编辑器页面
export default function Index() {
    // 组件的id参数
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // 是否折叠物料面板和属性面板
    const [materialsCollapsed, setMaterialsCollapsed] = useState(false);
    const [propertiesCollapsed, setPropertiesCollapsed] = useState(false);
    // 页面的id
    const [pageId, setPageId] = useState<string | null>(null);
    // 刷新间隔
    const [refreshFlag, setRefreshFlag] = useState(0);
    // 画布容器
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    // 画布的可视区域尺寸
    const [viewport, setViewport] = useState<{ width: number; height: number } | null>(null);
    const [scroll, setScroll] = useState({ left: 0, top: 0 });
    // 获取 schema 和 setSchema 方法
    const { schema, setSchema } = useSchemaStore(
        useShallow((state) =>
        ({
            schema: state.schema,
            setSchema: state.setSchema
        }))
    );
    // 缩放系统
    const { autoFit, manualZoom, scale, scaledWidth, scaledHeight, setAutoFit, handleZoomChange, handleResetZoom } = useZoom({
        viewport, containerRef, resetOnViewportChange: true,
    });

    useEffect(() => {
        let cancelled = false;
        const bootstrap = async () => {
            if (!id) {
                setSchema(null);
                setPageId(null);
                setError("未找到页面标识");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError("");
            // 先设置 schema 为 null，避免在切换页面时出现旧页面的闪现
            setSchema(null);
            try {
                // 获取单个id页面的数据
                const resp = await getPageById(id);
                // console.log("getPageById resp", resp);
                // 解析页面大屏的响应数据
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { code, message, data } = (resp as any) || {};
                if (code !== undefined && code !== 0) throw new Error(message || "获取页面失败");
                if (!data?.schema) throw new Error("页面数据为空");
                if (cancelled) return;
                // 请求成功，设置 schema 和 pageId
                setSchema(data.schema);
                // 设置页面id
                setPageId(data.pageId || id);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                if (cancelled) return;
                setError(err?.message || "加载失败");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        bootstrap();
        return () => { cancelled = true; };
    }, [id, refreshFlag, setSchema]);

    useEffect(() => {
        if (!schema) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setViewport(null);
            return;
        }
        const width = toNumber(schema.settings?.width, 1920);
        const height = toNumber(schema.settings?.height, 1080);
        // 画布的可视化区域
        setViewport((prev) => {
            if (prev && prev.width === width && prev.height === height) return prev;
            return { width, height };
        });
    }, [schema]);
    // 组件树是否为空
    const isCanvasEmpty = !schema?.children || schema.children.length === 0;
    // 处理滚动事件
    const handleScroll = () => {
        const node = containerRef.current;
        if (!node) return;
        setScroll({
            left: node.scrollLeft,
            top: node.scrollTop
        });
    };
    // 侧栏动画和窗口变化都会改变可视区域；手动缩放时也要更新标尺和居中位置。
    useLayoutEffect(() => {
        const node = containerRef.current;
        if (!node) return;

        const observer = new ResizeObserver(() => {
            const width = node.clientWidth;
            const height = node.clientHeight;
            setContainerSize((previous) =>
                previous.width === width && previous.height === height
                    ? previous
                    : { width, height },
            );
        });
        observer.observe(node);
        return () => observer.disconnect();
    }, [loading, error]);

    // 缩放后始终让可视区域对准画布中心；画布小于容器时由下方舞台负责居中。
    useLayoutEffect(() => {
        const node = containerRef.current;
        if (!node || !viewport) return;

        const frame = requestAnimationFrame(() => {
            const left = Math.max(0, (node.scrollWidth - node.clientWidth) / 2);
            const top = Math.max(0, (node.scrollHeight - node.clientHeight) / 2);
            node.scrollTo({ left, top });
            setScroll({ left, top });
        });

        return () => cancelAnimationFrame(frame);
    }, [scaledWidth, scaledHeight, viewport, containerSize]);

    const canvasOffsetX = Math.max(
        (containerSize.width - scaledWidth) / 2,
        0,
    );
    const canvasOffsetY = Math.max(
        (containerSize.height - scaledHeight) / 2,
        0,
    );
    // 标尺视口
    const rulerViewport = useMemo(() => {
        if (!schema) return null;
        return {
            width: toNumber(schema.settings?.width, 1920),
            height: toNumber(schema.settings?.height, 1080)
        };
    }, [schema]);
    // 加载状态
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3 animate-fade-in">
                    <div className="h-8 w-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
                    <span className="text-sm text-slate-400">正在加载页面...</span>
                </div>
            </div>
        );
    }
    // 错误状态
    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="vc-card p-8 max-w-sm text-center space-y-4 animate-fade-in">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    </div>
                    <div className="text-base font-semibold text-slate-800">页面加载失败</div>
                    <div className="text-sm text-slate-500">{error}</div>
                    <div className="flex justify-center gap-3">
                        <button className="vc-btn text-sm" onClick={() => setRefreshFlag((v) => v + 1)}>重试</button>
                        <button className="vc-btn-ghost text-sm" onClick={() => navigate("/projects")}>返回项目列表</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* 总体的页面布局 */}
            <div className="flex h-screen flex-col overflow-hidden bg-slate-100/60">
                {/* 工具栏 */}
                <div className="h-14 shrink-0">
                    <Toolbar pageId={pageId} onPageIdChange={setPageId} />
                </div>
                {/*   组装拖拽上下文、物料面板和画布 */}
                <DndWrapper scale={scale}>
                    <Layout hasSider className="min-h-0 flex-1" style={{ background: "transparent" }}>
                        {/* 侧边栏菜单 */}
                        <Layout.Sider
                            id="editor-materials-panel"
                            aria-label="物料面板"
                            theme="light"
                            width={400}
                            collapsible
                            collapsed={materialsCollapsed}
                            collapsedWidth={0}
                            trigger={null}
                            style={{ overflow: "hidden" }}
                        >
                            {/* 保留挂载，折叠时不丢失菜单分类和面板状态。 */}
                            <div className={`h-full w-[400px] ${materialsCollapsed ? "invisible" : "visible"}`}>
                                <SidebarMenu className="h-full border-r border-slate-200 bg-white" />
                            </div>
                        </Layout.Sider>
                        {/* 中间的画布编辑器 */}
                        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
                            {/* 缩放栏 */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-1.5 text-xs">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <Tooltip title={materialsCollapsed ? "展开左侧物料面板" : "隐藏左侧物料面板"}>
                                        <Button
                                            size="small"
                                            type={materialsCollapsed ? "default" : "text"}
                                            aria-label={materialsCollapsed ? "显示物料面板" : "隐藏物料面板"}
                                            aria-expanded={!materialsCollapsed}
                                            aria-controls="editor-materials-panel"
                                            icon={materialsCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
                                            onClick={() => setMaterialsCollapsed((value) => !value)}
                                        >
                                            物料面板
                                        </Button>
                                    </Tooltip>
                                    <span className="whitespace-nowrap">画布 {viewport?.width ?? "--"} × {viewport?.height ?? "--"}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        className={`rounded-md border p-1 transition-all ${autoFit ? "border-brand-200 text-brand-500 bg-brand-50" : "border-slate-200 text-slate-400 hover:border-brand-200 hover:text-brand-500"}`}
                                        onClick={() => setAutoFit((v) => !v)}
                                    >
                                        <Maximize className="h-3.5 w-3.5" />
                                    </button>
                                    <div className="flex items-center gap-0.5 ml-1">
                                        <button className="rounded-md border border-slate-200 p-1 text-slate-400 hover:border-brand-200 hover:text-brand-500 transition-all" onClick={() => handleZoomChange(manualZoom - 0.1)}>
                                            <Minus className="h-3.5 w-3.5" />
                                        </button>
                                        <span className="w-12 text-center text-xs text-slate-500">{Math.round(scale * 100)}%</span>
                                        <button className="rounded-md border border-slate-200 p-1 text-slate-400 hover:border-brand-200 hover:text-brand-500 transition-all" onClick={() => handleZoomChange(manualZoom + 0.1)}>
                                            <Plus className="h-3.5 w-3.5" />
                                        </button>
                                        <button className="rounded-md border border-slate-200 p-1 text-slate-400 hover:border-brand-200 hover:text-brand-500 transition-all ml-0.5" onClick={handleResetZoom}>
                                            <RotateCcw className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <div className="ml-2 border-l border-slate-200 pl-2">
                                        <Tooltip title={propertiesCollapsed ? "展开右侧属性面板" : "隐藏右侧属性面板"}>
                                            <Button
                                                size="small"
                                                type={propertiesCollapsed ? "default" : "text"}
                                                aria-label={propertiesCollapsed ? "显示属性面板" : "隐藏属性面板"}
                                                aria-expanded={!propertiesCollapsed}
                                                aria-controls="editor-properties-panel"
                                                icon={propertiesCollapsed ? <PanelRightOpen size={15} /> : <PanelRightClose size={15} />}
                                                onClick={() => setPropertiesCollapsed((value) => !value)}
                                            >
                                                属性面板
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                            {/* 画布区域 */}
                            <div className="relative flex min-h-0 flex-1 overflow-hidden">
                                {/* 白色小方块 */}
                                <div className="absolute left-0 top-0 z-20 bg-white"
                                    style={{
                                        width: RULER_THICKNESS, height: RULER_THICKNESS,
                                        borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0"
                                    }} />
                                <div className="absolute left-[28px] right-0 top-0 z-20">
                                    {/* x标尺 */}
                                    <Ruler orientation="x" viewport={rulerViewport} scale={scale} scroll={scroll.left} containerSize={containerSize.width} canvasOffset={canvasOffsetX} />
                                </div>
                                <div className="absolute bottom-0 left-0 top-[28px] z-20">
                                    <Ruler orientation="y" viewport={rulerViewport} scale={scale} scroll={scroll.top} containerSize={containerSize.height} canvasOffset={canvasOffsetY} />
                                </div>
                                {/* 画布 */}
                                <div className="ml-[28px] mt-[28px] flex-1 overflow-hidden" style={{ minWidth: 0, minHeight: 0 }}>
                                    {/* 画布容器；真正的可放置区域由 RootContainer 注册，避免同一 id 重复注册。 */}
                                    <div
                                        ref={containerRef}
                                        id="canvas"
                                        className="relative h-full w-full min-w-0 overflow-auto bg-slate-100/80"
                                        style={{
                                            backgroundImage: "radial-gradient(circle, #e2e8f0 0.5px, transparent 0.5px)",
                                            backgroundSize: "16px 16px"
                                        }}
                                        onScroll={handleScroll}
                                    >
                                        {/* 居中舞台：画布较小时居中，较大时扩展为可滚动区域 */}
                                        <div
                                            className="grid min-h-full min-w-full place-items-center"
                                            style={{
                                                width: `max(100%, ${scaledWidth}px)`,
                                                height: `max(100%, ${scaledHeight}px)`,
                                            }}
                                        >
                                            {/* 画布内容 */}
                                            <div className="relative" style={{
                                                width: scaledWidth, height: scaledHeight
                                            }}>
                                                <div
                                                    data-canvas-content="true"
                                                    style={{
                                                        width: viewport?.width ?? 0, height: viewport?.height ?? 0,
                                                        transform: `scale(${scale})`, transformOrigin: "top left",
                                                        position: "absolute", inset: 0
                                                    }}
                                                >
                                                    {/*组件数据为空  */}
                                                    {isCanvasEmpty && <CanvasEmpty />}
                                                    {/* 渲染组件树 */}
                                                    <Renderer schema={schema!} scale={scale} />
                                                </div>
                                                {/* 指南层 */}
                                                <GuideLayer scale={scale} width={scaledWidth} height={scaledHeight} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>
                        {/* 属性面板 */}
                        <Layout.Sider
                            id="editor-properties-panel"
                            aria-label="属性面板"
                            theme="light"
                            width={350}
                            collapsible
                            collapsed={propertiesCollapsed}
                            collapsedWidth={0}
                            trigger={null}
                            style={{ overflow: "hidden" }}
                        >
                            <div className={`h-full w-[350px] overflow-hidden border-l border-slate-200 bg-white ${propertiesCollapsed ? "invisible" : "visible"}`}>
                                <PropertyPanel />
                            </div>
                        </Layout.Sider>
                    </Layout>
                </DndWrapper>
            </div>
        </>
    );
}
