import { Switch as AntSwitch } from "antd";
import type { RendererProps } from "@/core/schema/types";
import type { SwitchComponent } from "@/core/schema/basic";

export default function Switch({ node }: RendererProps) {
    const props = node.props as SwitchComponent["props"];

    return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AntSwitch
                checked={props.checked}
                checkedChildren={props.checkedText}
                unCheckedChildren={props.uncheckedText}
                size={props.size}
                disabled={props.disabled}
            />
        </div>
    );
}
