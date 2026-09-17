import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { deletePage, listPages, savePage, type PageSummary } from "@/api/page";
import { useSchemaStore } from "@/store/schema-store";
import { useShallow } from "zustand/shallow";
import { getCurrentUserId } from "@/utils/auth";
import {
    Plus,
    Settings,
    ArrowLeft,
    Trash2,
    LayoutDashboard,
} from "lucide-react";
// 显示错误信息
const getErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;
// 项目列表
export default function ProjectList() {
    const navigate = useNavigate();
    // 项目列表
    const [projects, setProjects] = useState<PageSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [manageMode, setManageMode] = useState(false);
    // 选中的id
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
        null,
    );
    // 删除的id
    const [deletingId, setDeletingId] = useState("");
    // 缩略图占位图 ，里边就是有的项目id的用缩略图占位
    const [thumbErrorMap, setThumbErrorMap] = useState<Record<string, boolean>>(
        {},
    );
    // 提取 setSchema方法
    const { setSchema } = useSchemaStore(
        useShallow((state) => ({ setSchema: state.setSchema })),
    );
    // 格式化时间
    const formatTime = (value?: string) =>
        value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "--";

    useEffect(() => {
        let cancelled = false;
        // 获取项目列表
        const fetchProjects = async () => {
            setLoading(true);
            setError("");
            try {
                // 判断当前用户是否登录 ，如果登录获取到用户id
                const userId = getCurrentUserId();
                if (!userId) {
                    throw new Error("用户未登录");
                }
                // 请求当前用户所有的项目列表
                const resp = await listPages(userId);
                console.log("项目列表接口响应：", resp);
                if (resp.code !== 0) {
                    throw new Error(resp.message || "获取项目失败");
                }
                if (cancelled) return;
                // 设置项目列表
                setProjects(Array.isArray(resp.data) ? resp.data : []);
            } catch (error: unknown) {
                if (cancelled) return;
                // 显示错误
                setError(getErrorMessage(error, "获取项目失败"));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        // 请求项目列表
        fetchProjects();
        return () => {
            cancelled = true;
        };
    }, []);
    // 新建项目
    const handleCreateProject = useCallback(async () => {
        // 初始化schema 传进去的为空的schema
        setSchema();
        // 获取最新的 schema 并保存到后端
        const latestSchema = useSchemaStore.getState().schema;
        if (!latestSchema) return;
        // 保存当前的 schema 到后端，创建新项目，没有pageId
        const resp = await savePage({
            schema: latestSchema,
            // meta信息就是标题和描述
            meta: {
                title: latestSchema.props?.title, //大屏的标题
                description: latestSchema.props?.description, //大屏的描述
            },
            userId: getCurrentUserId(), // 当前用户id
        });
        // 创建成功直接跳转
        if (resp.code === 0) navigate(`/editor/${resp.data.pageId}`);
    }, [navigate, setSchema]);
    // 切换管理模式
    const toggleManageMode = () => {
        setManageMode((prev) => {
            if (prev) setSelectedProjectId(null);
            return !prev;
        });
    };
    // 进入特定项目编辑页面
    const handleEnterProject = (pageId: string) => {
        // 如果在管理项目的模式下就直接选中
        if (manageMode) {
            setSelectedProjectId(pageId);
            return;
        }
        navigate(`/editor/${pageId}`);
    };
    // 如果缩略图加载失败就显示占位图
    const handleThumbError = (pageId: string) => {
        setThumbErrorMap((prev) => ({ ...prev, [pageId]: true }));
    };
    // 删除项目
    const handleDeleteProject = (pageId: string) => {
        const target = projects.find((item) => item.pageId === pageId);
        const title = target?.title || target?.name || "该项目";
        Modal.confirm({
            title: "确认删除项目",
            content: `确定删除项目「${title}」吗？删除后不可恢复。`,
            okText: "确定",
            cancelText: "取消",
            okButtonProps: { danger: true },
            centered: true,
            async onOk() {
                // 删除整个项目
                setDeletingId(pageId);
                setError("");
                try {
                    // 删除当前页面
                    const resp = await deletePage(pageId);
                    if (resp.code !== 0) {
                        throw new Error(resp.message || "删除失败");
                    }
                    // 删除成功后从列表中移除
                    setProjects((prev) => prev.filter((item) => item.pageId !== pageId));
                    setSelectedProjectId(null);
                } catch (error: unknown) {
                    setError(getErrorMessage(error, "删除失败"));
                    throw error;
                } finally {
                    setDeletingId("");
                }
            },
        });
    };
    // 空状态提示 新建项目
    const emptyState = useMemo(
        () =>
            !loading &&
            !projects.length &&
            !error && (
                <div className="vc-card p-12 text-center animate-fade-in">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                        <LayoutDashboard className="h-7 w-7" />
                    </div>
                    <div className="text-lg font-semibold mb-2 text-slate-800">
                        还没有项目
                    </div>
                    <div className="text-sm text-slate-400 mb-6">
                        点击新建项目，开始你的第一块大屏
                    </div>
                    {/* 新建项目按钮 */}
                    <button className="vc-btn" onClick={handleCreateProject}>
                        <Plus className="h-4 w-4" /> 新建项目
                    </button>
                </div>
            ),
        [error, handleCreateProject, loading, projects.length],
    );

    return (
        <div className="h-screen bg-slate-50 text-slate-800 flex flex-col">
            {/* 工具栏头部 */}
            <header className="mx-auto w-full max-w-6xl flex-shrink-0 px-6 py-8">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-400 mb-1">
                            管理你的可视化大屏项目
                        </p>
                        <h1 className="text-3xl font-bold text-slate-900">我的项目</h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            className="vc-btn-ghost"
                            onClick={toggleManageMode}
                            type="button"
                        >
                            <Settings className="h-4 w-4" />
                            {/* 状态管理 */}
                            {manageMode ? "退出管理" : "管理项目"}
                        </button>
                        {manageMode && (
                            <button
                                className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                onClick={() => {
                                    if (selectedProjectId) {
                                        handleDeleteProject(selectedProjectId);
                                    }
                                }}
                                type="button"
                                disabled={
                                    !selectedProjectId || deletingId === selectedProjectId
                                }
                            >
                                {deletingId === selectedProjectId ? (
                                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                                删除选中项目
                            </button>
                        )}
                        <button
                            className="vc-btn"
                            onClick={handleCreateProject}
                            type="button"
                        >
                            <Plus className="h-4 w-4" /> 新建项目
                        </button>
                        <button
                            className="vc-btn-ghost"
                            onClick={() => navigate("/")}
                            type="button"
                        >
                            <ArrowLeft className="h-4 w-4" /> 返回首页
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto px-6 pb-12">
                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}
                {loading && (
                    <div className="flex items-center gap-2 mb-4 text-sm text-slate-400">
                        {/* 加载项目 */}
                        <div className="h-4 w-4 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
                        正在加载项目...
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* 项目列表 */}
                    {projects.map((project, index) => {
                        // 项目的标题和描述
                        const title = project.title || project.name || "未命名项目";
                        const desc = project.description || "暂无描述";
                        const isSelected = selectedProjectId === project.pageId;
                        // 缩略图
                        const showImage =
                            project.thumbnailUrl && !thumbErrorMap[project.pageId];
                        return (
                            <div
                                key={project.pageId}
                                role="button"
                                tabIndex={0}
                                className={`group vc-card relative p-0 overflow-hidden text-left cursor-pointer animate-slide-up transition-all ${isSelected
                                    ? "ring-2 ring-red-500 ring-offset-2 shadow-lg"
                                    : manageMode
                                        ? "hover:ring-2 hover:ring-red-200"
                                        : ""
                                    }`}
                                style={{ animationDelay: `${index * 50}ms` }}
                                onClick={() => handleEnterProject(project.pageId)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        // 进入项目编辑页面
                                        handleEnterProject(project.pageId);
                                    }
                                }}
                            >
                                {isSelected && (
                                    <div className="absolute right-3 top-3 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white shadow-md">
                                        已选中
                                    </div>
                                )}
                                <div className="relative flex h-[210px] items-center justify-center overflow-hidden bg-slate-50 border-b border-slate-100">
                                    {/* 是否有图片 */}
                                    {showImage ? (
                                        <img
                                            src={project.thumbnailUrl}
                                            alt={`${title} 缩略图`}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                            // 如果加载出错了就加入到map中
                                            onError={() => handleThumbError(project.pageId)}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-slate-300">
                                            <LayoutDashboard className="h-8 w-8" />
                                            <span className="text-xs">缩略图占位</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 space-y-2">
                                    <div className="text-base font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">
                                        {title}
                                    </div>
                                    <div className="text-sm text-slate-400 line-clamp-2">
                                        {desc}
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400 pt-1">
                                        <span>创建：{formatTime(project.createdAt)}</span>
                                        <span>更新：{formatTime(project.updatedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {/* 没有项目 */}
                {emptyState}
            </main>
        </div>
    );
}
