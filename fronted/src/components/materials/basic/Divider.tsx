import { Divider as AntDivider } from "antd";
import type { RendererProps } from "@/core/schema/types";
import type { DividerComponent } from "@/core/schema/basic";
/**
 *  分割线组件
 *  @param node 组件节点数据
 *  @returns React.ReactNode
 */
export default function Divider({ node }: RendererProps) {
    // 将节点的 props 类型断言为 DividerComponent["props"]
    const props = node.props as DividerComponent["props"];

    return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center" }}>
            <AntDivider
                orientation={props.direction}
                titlePlacement={props.textPosition}
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
