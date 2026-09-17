import { Badge as AntBadge } from "antd";
import type { RendererProps } from "@/core/schema/types";
import type { BadgeComponent } from "@/core/schema/basic";

export default function Badge({ node }: RendererProps) {
    const props = node.props as BadgeComponent["props"];

    return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AntBadge
                count={props.dot ? undefined : props.count}
                dot={props.dot}
                overflowCount={props.overflowCount}
                showZero={props.showZero}
                color={props.color}
            >
                <span style={{ fontSize: props.fontSize }}>{props.text}</span>
            </AntBadge>
        </div>
    );
}
