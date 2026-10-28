import { useMemo, useEffect, useCallback, useState } from "react";
import type { ComponentNode } from "@/core/schema/basic";
import type { PageDSL } from "@/core/schema/page";
import type { ChartDataSource, ComponentType } from "@/core/schema/types";
import { useSchemaStore } from "@/store/schema-store";
import { useShallow } from "zustand/shallow";
import EmptyPanel from "./EmptyPanel";
import AIChatPanel from "./AIChatPanel";
import PropsFormRenderer from "./PropsFormRenderer";
import DataSourceEditor, { isChartType } from "./DataSourceEditor";
import PageFormRenderer, { pageHints, pageFieldGroups } from "./PageFormRenderer";
import { useComponentEditStore } from "@/store/component-edit-store";
import { Settings2, FileText, Sparkles } from "lucide-react";
// 属性面板组件
export default function PropertyPanel() {
    // 更新属性面板的模式
    const { selectedId, findItem, schema, updateItem, updatePage } = useSchemaStore(
        useShallow((state) => ({
            selectedId: state.selectedId, //选中的组件id
            findItem: state.findItem, //查找到的组件节点
            schema: state.schema as PageDSL | null, //页面组件树
            updateItem: state.updateItem,
            updatePage: state.updatePage, //更新页面级配置
            setSelectedId: state.setSelectedId, //更新当前选中的组件 id
        })),
    );
    // 组件属性面板的模式
    const [mode, setMode] = useState<"component" | "page" | "ai">("component");
    const pendingEdit = useComponentEditStore((state) => state.pendingEdit);

    useEffect(() => {
        // 如果有待处理的 AI 编辑请求，则切换到 AI 模式
        if (pendingEdit) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMode("ai");
        }
    }, [pendingEdit]);
    // 从组件树中找到这个节点
    const selectedNode = useMemo<ComponentNode | PageDSL | null>(() => {
        if (!selectedId || !schema) return null;
        //  找到选中的组件节点
        return findItem(selectedId, schema) as ComponentNode | PageDSL | null;
    }, [selectedId, schema, findItem]);

    const parseNumber = useCallback((value: unknown, fallback: number) => {
        if (typeof value === "number" && !Number.isNaN(value)) return value;
        if (typeof value === "string") {
            const p = parseFloat(value);
            return Number.isFinite(p) ? p : fallback;
        }
        return fallback;
    }, []);

    // 页面配置的扁平化值（从 schema 中提取）
    const pageValues = useMemo(() => {
        if (!schema) return {};
        return {
            // 页面的名称
            name: schema.name ?? "",
            // 页面props部分
            title: schema.props?.title ?? "",
            description: schema.props?.description ?? "",
            // settings部分
            width: parseNumber(schema.settings?.width, 1920),
            height: parseNumber(schema.settings?.height, 1080),
            gridSize: schema.settings?.gridSize ?? 10,
            backgroundColor: schema.settings?.backgroundColor ?? "#ffffff",
            backgroundImage: schema.settings?.backgroundImage ?? "",
        };
    }, [schema, parseNumber]);

    // 页面字段变化 → 即时写入 store
    const handlePageFieldChange = useCallback(
        (key: string, value: any) => {
            if (!schema) return;
            switch (key) {
                case "name":
                    updatePage({ name: value });
                    break;
                case "title":
                case "description":
                    updatePage({ props: { ...schema.props, [key]: value } });
                    break;
                case "width":
                case "height":
                case "gridSize":
                    updatePage({ settings: { ...schema.settings, [key]: typeof value === "number" ? value : parseNumber(value, 0) } });
                    break;
                case "backgroundColor":
                case "backgroundImage":
                    updatePage({ settings: { ...schema.settings, [key]: value } });
                    break;
            }
        },
        [schema, updatePage, parseNumber],
    );

    // 组件属性变化 → 写入 store
    const handlePropsChange = useCallback(
        (newProps: Record<string, any>) => {
            if (!selectedId) return;
            // 更新当前选中组件的 props
            updateItem(selectedId, { props: newProps } as Partial<ComponentNode>);
        },
        [selectedId, updateItem],
    );

    // 数据源变化 → 写入 store
    const handleDataSourceChange = useCallback(
        (ds: ChartDataSource) => {
            if (!selectedId) return;
            updateItem(selectedId, { dataSource: ds } as Partial<ComponentNode>);
        },
        [selectedId, updateItem],
    );
    // 属性表单
    const renderPageForm = () => (
        <div className="flex h-full w-full flex-col overflow-y-auto overflow-x-hidden p-3">
            <PageFormRenderer
                // 当前页面的扁平化配置值
                values={pageValues}
                // 页面字段的提示信息
                hints={pageHints}
                // 控制每一个字段的分组显示
                groups={pageFieldGroups}
                // 字段变化时的回调
                onChange={handlePageFieldChange}
            />
        </div>
    );
    // 可选的选项
    const tabs = [
        { key: "component" as const, label: "组件属性", icon: <Settings2 className="h-3.5 w-3.5" /> },
        { key: "page" as const, label: "页面设置", icon: <FileText className="h-3.5 w-3.5" /> },
        { key: "ai" as const, label: "AI 对话", icon: <Sparkles className="h-3.5 w-3.5" /> },
    ];
    // 头部的选项
    const renderHeader = () => (
        <div className="grid shrink-0 grid-cols-3 gap-1 border-b border-slate-200 px-1.5 py-1.5">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    className={`inline-flex min-w-0 items-center justify-center gap-1 whitespace-nowrap rounded-md px-1 py-1.5 text-xs font-medium transition-all ${mode === tab.key
                        ? tab.key === "ai"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-brand-50 text-brand-600 border border-brand-200"
                        : "border border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        }`}
                    onClick={() => setMode(tab.key)}
                >
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
        </div>
    );
    //  根据当前模式渲染内容
    const renderContent = () => {
        if (mode === "page") {
            if (!schema) return <EmptyPanel />;
            // 渲染页面配置表单
            return renderPageForm();
        }
        if (mode === "component") {
            // 没有选中就是一个空面板
            if (!selectedNode) return <EmptyPanel />;
            // 选中了一个组件节点，渲染属性表单
            const node = selectedNode as ComponentNode;
            // 组件类型
            const cType = node.type as ComponentType;
            //  判断是否需要显示数据源编辑器
            const showDataSource = isChartType(cType) && "dataSource" in node;
            return (
                <div className="flex h-full w-full flex-col overflow-y-auto overflow-x-hidden">
                    <PropsFormRenderer
                        key={`props-${selectedId}`}
                        componentType={cType}
                        // 当前节点完整的 props 数据
                        values={node.props as Record<string, any>}
                        // 更新后的完整 props 交还给 `PropertyPanel`。
                        onChange={handlePropsChange}
                    />
                    {/* 只有图表组件才显示数据源编辑器 */}
                    {showDataSource && (
                        <div className="border-t border-slate-200 p-3">
                            <DataSourceEditor
                                // 组件类型
                                componentType={cType}
                                dataSource={(node as any).dataSource as ChartDataSource}
                                onChange={handleDataSourceChange}
                            />
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-white">
            {/* 属性面板头部 */}
            {renderHeader()}
            {mode !== "ai" && renderContent()}
            {/* AI 聊天面板 */}
            <AIChatPanel visible={mode === "ai"} />
        </div>
    );
}
