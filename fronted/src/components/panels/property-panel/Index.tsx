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
// 
export default function PropertyPanel() {
    // 
    const { selectedId, findItem, schema, updateItem, updatePage } = useSchemaStore(
        useShallow((state) => ({
            selectedId: state.selectedId,
            findItem: state.findItem,
            schema: state.schema as PageDSL | null,
            updateItem: state.updateItem,
            updatePage: state.updatePage,
            setSelectedId: state.setSelectedId,
        })),
    );

    const [mode, setMode] = useState<"component" | "page" | "ai">("component");
    const pendingEdit = useComponentEditStore((state) => state.pendingEdit);

    useEffect(() => {
        if (pendingEdit) setMode("ai");
    }, [pendingEdit]);

    const selectedNode = useMemo<ComponentNode | PageDSL | null>(() => {
        if (!selectedId || !schema) return null;
        return findItem(selectedId, schema) as ComponentNode | PageDSL | null;
    }, [selectedId, schema, findItem]);

    const isPageFormVisible = useMemo(() => {
        if (!schema) return false;
        if (mode === "page") return true;
        if (!selectedId) return false;
        return (selectedNode as PageDSL | null)?.type === "RootContainer";
    }, [schema, mode, selectedId, selectedNode]);

    const parseNumber = useCallback((value: unknown, fallback: number) => {
        if (typeof value === "number" && !Number.isNaN(value)) return value;
        if (typeof value === "string") { const p = parseFloat(value); return Number.isFinite(p) ? p : fallback; }
        return fallback;
    }, []);

    // 页面配置的扁平化值（从 schema 中提取）
    const pageValues = useMemo(() => {
        if (!schema) return {};
        return {
            name: schema.name ?? "",
            title: schema.props?.title ?? "",
            description: schema.props?.description ?? "",
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
                values={pageValues}
                hints={pageHints}
                groups={pageFieldGroups}
                onChange={handlePageFieldChange}
            />
        </div>
    );

    const tabs = [
        { key: "component" as const, label: "组件属性", icon: <Settings2 className="h-3.5 w-3.5" /> },
        { key: "page" as const, label: "页面设置", icon: <FileText className="h-3.5 w-3.5" /> },
        { key: "ai" as const, label: "AI 对话", icon: <Sparkles className="h-3.5 w-3.5" /> },
    ];

    const renderHeader = () => (
        <div className="flex items-center gap-1 border-b border-slate-200 px-2 py-1.5">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${mode === tab.key
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

    const renderContent = () => {
        if (mode === "page") { if (!schema) return <EmptyPanel />; return renderPageForm(); }
        if (mode === "component") {
            if (!selectedNode) return <EmptyPanel />;
            const node = selectedNode as ComponentNode;
            if (node.type === "RootContainer") return renderPageForm();
            const cType = node.type as ComponentType;
            const showDataSource = isChartType(cType) && "dataSource" in node;
            return (
                <div className="flex h-full w-full flex-col overflow-y-auto overflow-x-hidden">
                    <PropsFormRenderer
                        key={`props-${selectedId}`}
                        componentType={cType}
                        values={node.props as Record<string, any>}
                        onChange={handlePropsChange}
                    />
                    {showDataSource && (
                        <div className="border-t border-slate-200 p-3">
                            <DataSourceEditor
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
            {renderHeader()}
            {mode !== "ai" && renderContent()}
            <AIChatPanel visible={mode === "ai"} />
        </div>
    );
}
