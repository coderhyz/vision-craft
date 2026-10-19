import { useMemo, useCallback, useEffect, useState } from "react";
import { Select, Input, InputNumber, Radio, Collapse, Typography } from "antd";
import type { ComponentType } from "@/core/schema/types";
import type { ChartDataSource } from "@/core/schema/types";
import { chartFieldSlots, type FieldSlot } from "@/config/chart-field-slots";

const { TextArea } = Input;
const { Text } = Typography;

/** 数据源编辑器组件的属性。 */
interface DataSourceEditorProps {
    /** 当前正在编辑的组件类型，用于匹配图表所需的字段槽位。 */
    componentType: ComponentType;
    /** 当前图表的数据源配置。 */
    dataSource: ChartDataSource;
    /** 数据源配置发生变化时通知父组件。 */
    onChange: (ds: ChartDataSource) => void;
}

/** 支持数据源配置的图表组件类型集合。 */
const CHART_TYPES = new Set<ComponentType>([
    "BarChart", "MultiBarChart", "LineChart", "PieChart",
    "ScatterChart", "BubbleChart", "AreaChart", "MultiLineChart",
    "HorizontalBarChart", "RosePieChart", "RadarChart",
    "FunnelChart", "GaugeChart", "TreemapChart",
]);

/**
 * 判断指定组件是否属于图表组件。
 *
 * @param type 待判断的组件类型。
 * @returns 属于图表组件时返回 true，否则返回 false。
 */
export function isChartType(type: ComponentType): boolean {
    return CHART_TYPES.has(type);
}

/**
 * 数据源编辑器
 * - sourceType 切换（static / api）
 * - 静态数据 JSON 编辑
 * - API 配置（url + refreshInterval）
 * - 字段映射下拉选择（根据 chartFieldSlots 自动生成）
 *
 * @param componentType 当前组件类型。
 * @param dataSource 当前数据源配置。
 * @param onChange 数据源更新回调。
 * @returns 数据来源与字段映射编辑面板。
 */
export default function DataSourceEditor({ componentType, dataSource, onChange }: DataSourceEditorProps) {
    /** 当前图表支持的字段槽位，例如分类字段、数值字段和系列字段。 */
    const slots: FieldSlot[] = chartFieldSlots[componentType] ?? [];
    /** 当前数据来源类型，未配置时默认使用静态数据。 */
    const sourceType = dataSource.sourceType ?? "static";
    /** 当前字段槽位与原始数据字段之间的映射关系。 */
    const fieldMapping = dataSource.fieldMapping ?? {};
    /** 静态 JSON 的输入草稿，允许用户暂时输入尚未完成的 JSON。 */
    const [dataJsonDraft, setDataJsonDraft] = useState("[]");

    /**
     * 从第一条静态数据中提取可用于字段映射的字段名。
     * 数据为空或第一项不是普通对象时返回空数组。
     */
    const availableFields = useMemo<string[]>(() => {
        const data = dataSource.data;
        if (!Array.isArray(data) || data.length === 0) return [];
        const first = data[0];
        if (typeof first !== "object" || first === null) return [];
        return Object.keys(first as Record<string, unknown>);
    }, [dataSource.data]);

    /**
     * 合并局部数据源配置，并将完整配置通知父组件。
     *
     * @param patch 本次需要更新的数据源字段。
     */
    const update = useCallback(
        (patch: Partial<ChartDataSource>) => {
            onChange({ ...dataSource, ...patch });
        },
        [dataSource, onChange],
    );

    /**
     * 更新单个字段槽位的映射关系。
     * 当 value 为空时删除该槽位的映射。
     *
     * @param key 图表字段槽位标识。
     * @param value 静态数据中的目标字段名。
     */
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

    /** 将静态数据格式化为供 TextArea 显示的 JSON 字符串。 */
    const dataJson = useMemo(() => {
        try {
            return JSON.stringify(dataSource.data ?? [], null, 2);
        } catch {
            return "[]";
        }
    }, [dataSource.data]);

    /** 外部静态数据发生变化时，同步更新输入框草稿。 */
    useEffect(() => {
        setDataJsonDraft(dataJson);
    }, [dataJson]);

    /**
     * 处理静态数据输入。
     * 无论 JSON 是否完整都会保留输入草稿；只有解析成功且结果为数组时才更新数据源。
     *
     * @param jsonStr 用户当前输入的 JSON 字符串。
     */
    const handleDataChange = useCallback(
        (jsonStr: string) => {
            setDataJsonDraft(jsonStr);
            try {
                const parsed = JSON.parse(jsonStr);
                if (Array.isArray(parsed)) {
                    update({ data: parsed });
                }
            } catch {
                /** 用户正在输入无效 JSON 时，保留草稿，不覆盖输入框内容。 */
            }
        },
        [update],
    );

    /**
     * Ant Design Collapse 的面板配置。
     * 数据来源面板始终显示；字段映射面板仅在当前图表声明了字段槽位时显示。
     */
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
