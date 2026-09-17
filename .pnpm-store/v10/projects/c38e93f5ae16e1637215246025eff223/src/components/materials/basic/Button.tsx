import { Button as AntButton } from "antd";
import type { RendererProps } from "@/core/schema/types";
import type { ButtonComponent } from "@/core/schema/basic";

/**
 * 按钮组件渲染实现，基于 antd Button 包装
 */
export default function Button({ node }: RendererProps) {
    const props = node.props as ButtonComponent["props"];

    return (
        <AntButton
            type={props.type}
            size={props.size}
            danger={props.danger}
            block={props.block}
            disabled={props.disabled}
            style={{ width: "100%", height: "100%" }}
        >
            {props.text}
        </AntButton>
    );
}
