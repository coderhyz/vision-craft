import { Rate as AntRate } from "antd";
import type { RendererProps } from "@/core/schema/types";
import type { RateComponent } from "@/core/schema/basic";

export default function Rate({ node }: RendererProps) {
    const props = node.props as RateComponent["props"];

    return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AntRate
                value={props.value}
                count={props.count}
                allowHalf={props.allowHalf}
                disabled
                style={{
                    color: props.color,
                    fontSize: props.size,
                }}
            />
        </div>
    );
}
