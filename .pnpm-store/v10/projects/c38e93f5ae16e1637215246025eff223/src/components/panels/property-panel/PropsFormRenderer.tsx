import { useCallback } from "react";
import { Input, InputNumber, Switch, Select, Radio, ColorPicker } from "antd";
import type { ComponentType } from "@/core/schema/types";
import type { FormHints, FormHint } from "@/config/hints";
import { componentHintsRegistry } from "@/config/hints";

interface PropsFormRendererProps {
    componentType: ComponentType;
    values: Record<string, any>;
    onChange: (newValues: Record<string, any>) => void;
}

/**
 * 自建表单渲染器
 * - 遍历 props 对象的每个字段
 * - 根据值的类型自动推断控件（boolean→Switch, number→InputNumber, string→Input/Select/Radio）
 * - 查 hints 注解表补中文标题、枚举、min/max 等
 */
export default function PropsFormRenderer({ componentType, values, onChange }: PropsFormRendererProps) {
    const hints: FormHints = componentHintsRegistry[componentType] ?? {};

    const handleChange = useCallback(
        (key: string, val: any) => {
            onChange({ ...values, [key]: val });
        },
        [values, onChange],
    );

    const entries = Object.entries(values).filter(([key]) => {
        const hint = hints[key];
        return !hint?.hidden;
    });

    return (
        <div className="flex flex-col gap-3 p-3">
            {entries.map(([key, val]) => {
                const hint = hints[key];
                return (
                    <FieldRow
                        key={key}
                        fieldKey={key}
                        value={val}
                        hint={hint}
                        onChange={handleChange}
                    />
                );
            })}
        </div>
    );
}

interface FieldRowProps {
    fieldKey: string;
    value: any;
    hint?: FormHint;
    onChange: (key: string, val: any) => void;
}

function FieldRow({ fieldKey, value, hint, onChange }: FieldRowProps) {
    const label = hint?.title ?? fieldKey;
    const description = hint?.description;

    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">{label}</label>
            {description && <span className="text-[10px] text-slate-400">{description}</span>}
            <FieldControl fieldKey={fieldKey} value={value} hint={hint} onChange={onChange} />
        </div>
    );
}

function FieldControl({ fieldKey, value, hint, onChange }: FieldRowProps) {
    const type = typeof value;

    // color → ColorPicker（同时保留文字输入）
    if (hint?.widget === "color") {
        return (
            <ColorPicker
                size="small"
                value={value || "#ffffff"}
                showText
                format="hex"
                onChange={(_, hex) => onChange(fieldKey, hex)}
            />
        );
    }

    // boolean → Switch
    if (type === "boolean") {
        return (
            <Switch
                size="small"
                checked={value}
                onChange={(checked) => onChange(fieldKey, checked)}
            />
        );
    }

    // number with enum (fontWeight etc.) → Select
    if (type === "number" && hint?.enum && hint.enum.length > 0) {
        return (
            <Select
                size="small"
                className="w-full"
                value={value}
                onChange={(v) => onChange(fieldKey, v)}
                options={hint.enum.map((e) => ({ label: String(e), value: e }))}
            />
        );
    }

    // number → InputNumber
    if (type === "number") {
        return (
            <InputNumber
                size="small"
                className="w-full"
                value={value}
                min={hint?.min}
                max={hint?.max}
                onChange={(v) => onChange(fieldKey, v ?? 0)}
            />
        );
    }

    // string with enum → Radio / Select
    if (type === "string" && hint?.enum && hint.enum.length > 0) {
        if (hint.widget === "select" || hint.enum.length > 4) {
            return (
                <Select
                    size="small"
                    className="w-full"
                    value={value}
                    onChange={(v) => onChange(fieldKey, v)}
                    options={hint.enum.map((e) => ({ label: String(e), value: e }))}
                />
            );
        }
        return (
            <Radio.Group
                size="small"
                value={value}
                onChange={(e) => onChange(fieldKey, e.target.value)}
                optionType="button"
                buttonStyle="solid"
                options={hint.enum.map((e) => ({ label: String(e), value: e }))}
            />
        );
    }

    // string → textarea / Input
    if (type === "string") {
        if (hint?.widget === "textarea") {
            return (
                <Input.TextArea
                    size="small"
                    rows={3}
                    value={value}
                    placeholder={hint?.placeholder}
                    onChange={(e) => onChange(fieldKey, e.target.value)}
                />
            );
        }
        return (
            <Input
                size="small"
                value={value}
                placeholder={hint?.placeholder}
                onChange={(e) => onChange(fieldKey, e.target.value)}
            />
        );
    }

    // 复杂类型（array/object）不渲染
    return null;
}
