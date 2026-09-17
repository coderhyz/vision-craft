import type { ComponentType } from "@/core/schema/types";

/**
 * 字段注解类型 —— 用于补充自动推断无法获取的信息
 * widget 仅在需要覆盖默认推断时才写（如 textarea / radio / hidden）
 */
export interface FormHint {
    title: string;
    enum?: (string | number)[];
    widget?: "radio" | "select" | "textarea" | "hidden" | "color";
    min?: number;
    max?: number;
    placeholder?: string;
    description?: string;
    hidden?: boolean;
}

export type FormHints = Record<string, FormHint>;

/**
 * 组件 hints 注册表类型
 */
export type ComponentHintsRegistry = Partial<Record<ComponentType, FormHints>>;
