import { useMemo, useCallback, useEffect, useState } from "react";
import { Select, Input, InputNumber, Radio, Collapse, Typography } from "antd";
import type { ComponentType } from "@/core/schema/types";
import type { ChartDataSource } from "@/core/schema/types";
import { chartFieldSlots, type FieldSlot } from "@/config/chart-field-slots";

const { TextArea } = Input;
const { Text } = Typography;

interface DataSourceEditorProps {
    componentType: ComponentType;
    dataSource: ChartDataSource;
    onChange: (ds: ChartDataSource) => void;
}

/** 判断是否为图表组件 */
const CHART_TYPES = new Set<ComponentType>([
    "BarChart", "MultiBarChart", "LineChart", "PieChart",
    "ScatterChart", "BubbleChart", "AreaChart", "MultiLineChart",
    "HorizontalBarChart", "RosePieChart", "RadarChart",
    "FunnelChart", "GaugeChart", "TreemapChart",
]);

export function isChartType(type: ComponentType): boolean {
    return CHART_TYPES.has(type);
}

/**
 * 数据源编辑器
 * - sourceType 切换（static / api）
 * - 静态数据 JSON 编辑
 * - API 配置（url + refreshInterval）
 * - 字段映射下拉选择（根据 chartFieldSlots 自动生成）
 */
export default function DataSourceEditor({ componentType, dataSource, onChange }: DataSourceEditorProps) {
    const slots: FieldSlot[] = chartFieldSlots[componentType] ?? [];
    const sourceType = dataSource.sourceType ?? "static";
    const fieldMapping = dataSource.fieldMapping ?? {};
    const [dataJsonDraft, setDataJsonDraft] = useState("[]");

    // 从静态数据中提取可用的字段名
    const availableFields = useMemo<string[]>(() => {
        const data = dataSource.data;
        if (!Array.isArray(data) || data.length === 0) return [];
        const first = data[0];
        if (typeof first !== "object" || first === null) return [];
        return Object.keys(first as Record<string, unknown>);
    }, [dataSource.data]);

    const update = useCallback(
        (patch: Partial<ChartDataSource>) => {
            onChange({ ...dataSource, ...patch });
        },
        [dataSource, onChange],
    );

    const updateMapping = useCallback(
        (key: string, value?: string) => {
            const nextMapping = { ...fieldMapping };
            if (value) {
                nextMapping[key] = value;
            } else {
                delete nextMapping[key];
            }
            update({ fieldMapping: nextMapping });
        },
        [fieldMapping, update],
    );

    // 静态数据的 JSON 字符串（用于 TextArea 显示）
    const dataJson = useMemo(() => {
        try {
            return JSON.stringify(dataSource.data ?? [], null, 2);
        } catch {
            return "[]";
        }
    }, [dataSource.data]);

    useEffect(() => {
        setDataJsonDraft(dataJson);
    }, [dataJson]);

    const handleDataChange = useCallback(
        (jsonStr: string) => {
            setDataJsonDraft(jsonStr);
            try {
                const parsed = JSON.parse(jsonStr);
                if (Array.isArray(parsed)) {
                    update({ data: parsed });
                }
            } catch {
                // 用户正在输入无效 JSON 时，保留草稿，不覆盖输入框内容
            }
        },
        [update],
    );

    const collapseItems = [
        {
            key: "source",
            label: "数据来源",
            children: (
                <div className="flex flex-col gap-2">
                    <Radio.Group
                        size="small"
                        value={sourceType}
                        onChange={(e) => update({ sourceType: e.target.value })}
                        optionType="button"
                        buttonStyle="solid"
                        options={[
                            { label: "静态数据", value: "static" },
                            { label: "API 接口", value: "api" },
                        ]}
                    />
                    {sourceType === "static" ? (
                        <TextArea
                            size="small"
                            rows={8}
                            className="font-mono text-xs"
                            value={dataJsonDraft}
                            onChange={(e) => handleDataChange(e.target.value)}
                        />
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Input
                                size="small"
                                placeholder="API 地址"
                                value={dataSource.apiUrl ?? ""}
                                onChange={(e) => update({ apiUrl: e.target.value })}
                            />
                            <div className="flex items-center gap-2">
                                <Text className="shrink-0 text-xs text-slate-500">刷新间隔(s)</Text>
                                <InputNumber
                                    size="small"
                                    min={0}
                                    value={dataSource.refreshInterval}
                                    onChange={(v) => update({ refreshInterval: v ?? undefined })}
                                />
                            </div>
                        </div>
                    )}
                </div>
            ),
        },
        ...(slots.length > 0
            ? [
                {
                    key: "mapping",
                    label: "字段映射",
                    children: (
                        <div className="flex flex-col gap-2">
                            {slots.map((slot) => (
                                <div key={slot.key} className="flex items-center gap-2">
                                    <Text className="w-24 shrink-0 text-xs text-slate-600">
                                        {slot.label}
                                        {slot.required && <span className="text-red-400"> *</span>}
                                    </Text>
                                    <Select
                                        size="small"
                                        className="flex-1"
                                        value={fieldMapping[slot.key] ?? undefined}
                                        placeholder="选择字段"
                                        allowClear
                                        onChange={(v) => updateMapping(slot.key, v)}
                                        options={availableFields.map((f) => ({ label: f, value: f }))}
                                    />
                                </div>
                            ))}
                        </div>
                    ),
                },
            ]
            : []),
    ];

    return (
        <Collapse
            size="small"
            defaultActiveKey={["source", "mapping"]}
            items={collapseItems}
            className="bg-white"
        />
    );
}
