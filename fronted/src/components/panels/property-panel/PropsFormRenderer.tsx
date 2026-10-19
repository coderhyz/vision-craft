import { useCallback, useEffect } from "react";
import { Input, InputNumber, Switch, Select, Radio, ColorPicker } from "antd";
import type { ComponentType } from "@/core/schema/types";
import type { FormHints, FormHint } from "@/config/hints";
import { componentHintsRegistry } from "@/config/hints";

interface PropsFormRendererProps {
    componentType: ComponentType; // 组件类型
    values: Record<string, any>; //node.props 对象
    onChange: (newValues: Record<string, any>) => void; // 当某个字段的值改变时，回调函数会被调用，传入新的 props 对象
}

/**
 * 自建表单渲染器
 * - 遍历 props 对象的每个字段
 * - 根据值的类型自动推断控件（boolean→Switch, number→InputNumber, string→Input/Select/Radio）
 * - 查 hints 注解表补中文标题、枚举、min/max 等
 */
export default function PropsFormRenderer({ componentType, values, onChange }: PropsFormRendererProps) {
    // 获取该组件的表单提示信息 
    // 例如 Text 组件的 hints
    const hints: FormHints = componentHintsRegistry[componentType] ?? {};
    useEffect(() => {
        console.log("values", values);
    }, [values]);
    // 处理字段值改变的回调函数
    const handleChange = useCallback(
        (key: string, val: any) => {
            // TODO: 改变了某个字段的值，调用 onChange 回调
            onChange({ ...values, [key]: val });
        },
        [values, onChange],
    );
    // props 对象的 entries，过滤掉 hidden 的字段
    const entries = Object.entries(values).filter(([key]) => {
        // 过滤掉 hidden 的字段
        const hint = hints[key];
        // console.log("hint", key, hint);
        return !hint?.hidden;
    });

    return (
        <div className="flex flex-col gap-3 p-3">
            {entries.map(([key, val]) => {
                // 获取该字段的提示信息
                const hint = hints[key];
                // console.log("hint", key, hint);
                return (
                    <FieldRow
                        key={key}
                        // 这是字段的唯一标识
                        fieldKey={key}
                        //  字段的值
                        value={val}
                        // 字段的提示信息
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
    // 获取字段的标签和描述
    const label = hint?.title ?? fieldKey;
    const description = hint?.description;

    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">{label}</label>
            {description && <span className="text-[10px] text-slate-400">{description}</span>}
            {/* 主要的内容 */}
            <FieldControl fieldKey={fieldKey} value={value} hint={hint} onChange={onChange} />
        </div>
    );
}
// 表单控制组件
function FieldControl({ fieldKey, value, hint, onChange }: FieldRowProps) {
    // 获取字段值的类型
    const type = typeof value;

    // color → ColorPicker（同时保留文字输入） 颜色选择器
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
                    // 选择器的配置项
                    options={hint.enum.map((e) => (
                        {
                            label: String(e),
                            value: e

                        }))}
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
                // 单选按钮的配置项
                options={hint.enum.map((e) => (
                    {
                        label: String(e),
                        value: e
                    }
                ))}
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
