import { useCallback } from "react";
import { Input, InputNumber, Collapse, ColorPicker } from "antd";
import type { FormHints, FormHint } from "@/config/hints";

/**
 * 页面配置表单字段分组
 */
interface PageFieldGroup {
    key: string;
    title: string;
    fields: string[];
}

interface PageFormRendererProps {
    values: Record<string, any>;
    hints: FormHints;
    groups: PageFieldGroup[];
    onChange: (key: string, value: any) => void;
}

/**
 * 页面配置自建表单渲染器
 * - 支持 Collapse 分组布局
 * - 与 PropsFormRenderer 共享 FieldRow 渲染逻辑但更简单（页面字段类型有限）
 */
export default function PageFormRenderer({ values, hints, groups, onChange }: PageFormRendererProps) {
    const collapseItems = groups.map((group) => ({
        key: group.key,
        label: group.title,
        children: (
            <div className="flex flex-col gap-3">
                {group.fields.map((fieldKey) => (
                    <PageFieldRow
                        key={fieldKey}
                        fieldKey={fieldKey}
                        value={values[fieldKey]}
                        hint={hints[fieldKey]}
                        onChange={onChange}
                    />
                ))}
            </div>
        ),
    }));

    return (
        <Collapse
            size="small"
            defaultActiveKey={groups.map((g) => g.key)}
            items={collapseItems}
            className="bg-white"
        />
    );
}

interface PageFieldRowProps {
    fieldKey: string;
    value: any;
    hint?: FormHint;
    onChange: (key: string, val: any) => void;
}

function PageFieldRow({ fieldKey, value, hint, onChange }: PageFieldRowProps) {
    const label = hint?.title ?? fieldKey;
    const description = hint?.description;

    const handleChange = useCallback(
        (val: any) => onChange(fieldKey, val),
        [fieldKey, onChange],
    );

    const type = typeof value;

    // color → ColorPicker（同时保留文字输入）
    if (hint?.widget === "color") {
        return (
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">{label}</label>
                {description && <span className="text-[10px] text-slate-400">{description}</span>}
                <ColorPicker
                    size="small"
                    value={value || "#ffffff"}
                    showText
                    format="hex"
                    onChange={(_, hex) => handleChange(hex)}
                />
            </div>
        );
    }

    let control: React.ReactNode;
    if (type === "number") {
        control = (
            <InputNumber
                size="small"
                className="w-full"
                value={value}
                min={hint?.min}
                max={hint?.max}
                onChange={(v) => handleChange(v ?? 0)}
            />
        );
    } else if (hint?.widget === "textarea") {
        control = (
            <Input.TextArea
                size="small"
                rows={2}
                value={value ?? ""}
                placeholder={hint?.placeholder}
                onChange={(e) => handleChange(e.target.value)}
            />
        );
    } else {
        control = (
            <Input
                size="small"
                value={value ?? ""}
                placeholder={hint?.placeholder}
                onChange={(e) => handleChange(e.target.value)}
            />
        );
    }

    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">{label}</label>
            {description && <span className="text-[10px] text-slate-400">{description}</span>}
            {control}
        </div>
    );
}

/** 页面配置 hints */
export const pageHints: FormHints = {
    name: { title: "页面名称", placeholder: "如：销售大屏" },
    title: { title: "展示标题", placeholder: "用于对外展示的标题" },
    description: { title: "页面描述", widget: "textarea", placeholder: "简要描述页面用途" },
    width: { title: "宽度", min: 320 },
    height: { title: "高度", min: 180 },
    gridSize: { title: "吸附网格", min: 1, description: "可选，编辑态的吸附步进" },
    backgroundColor: { title: "背景色", widget: "color", placeholder: "例如：#ffffff" },
    backgroundImage: { title: "背景图 URL", placeholder: "https://example.com/bg.png" },
};

/** 页面配置分组 */
export const pageFieldGroups = [
    { key: "basic", title: "基础信息", fields: ["name", "title", "description"] },
    { key: "size", title: "画布尺寸 (px)", fields: ["width", "height", "gridSize"] },
    { key: "style", title: "背景样式", fields: ["backgroundColor", "backgroundImage"] },
];
