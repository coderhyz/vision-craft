import { Divider as AntDivider } from "antd";
import type { RendererProps } from "@/core/schema/types";
import type { DividerComponent } from "@/core/schema/basic";

export default function Divider({ node }: RendererProps) {
    const props = node.props as DividerComponent["props"];

    return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center" }}>
            <AntDivider
                type={props.direction}
                orientation={props.textPosition}
                style={{
                    borderColor: props.color,
                    borderStyle: props.lineStyle,
                    margin: 0,
                }}
            >
                {props.text || undefined}
            </AntDivider>
        </div>
    );
}
