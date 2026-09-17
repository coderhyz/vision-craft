import type { RendererProps } from "@/core/schema/types";
import type { TextComponent } from "@/core/schema/basic";
/**
 * 文本组件
 * @param param0 
 * @returns 
 */
export default function Text({ node }: RendererProps) {
    // 文本组件的参数
    const props = node.props as TextComponent["props"];
    // 是否居中
    const alignToCss = (align: TextComponent["props"]["textAlign"]) =>
        align === "居中" ? "center" : align === "右" ? "right" : "left";
    return (
        <div
            style={{
                fontSize: props.fontSize + "px",
                fontWeight: props.fontWeight,
                color: props.color,
                // 居中
                textAlign: alignToCss(props.textAlign),
            }}
        >
            {props.content}
        </div>
    );
}
