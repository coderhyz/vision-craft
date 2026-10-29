import type { ComponentNode } from "@/core/schema/basic";
import type { ChartDataSource } from "@/core/schema/types";
import type { RegistryComponent } from "../registery";
import { useChartDataSource } from "@/hooks/useChartDataSource";

interface ChartDataRendererProps {
    node: ComponentNode & { dataSource?: ChartDataSource };
    component: RegistryComponent;
    mode: "edit" | "preview";
}

/**
 * 图表与请求层之间的适配组件：
 * Renderer -> 本组件订阅数据 -> 具体图表根据 data 生成 ECharts option。
 * 因此柱状图、折线图等组件都不需要各自再写一次 fetch。
 */
export default function ChartDataRenderer({ node, component: Component, mode }: ChartDataRendererProps) {
    // 与属性面板传入同一个 node.id，两处会订阅同一份请求资源。
    const { data, status, error } = useChartDataSource(node.id, node.dataSource);
    const isApi = node.dataSource?.sourceType === "api";
    // 只创建供本次渲染使用的新节点，不修改原 DSL，切回静态模式仍有原来的数据。
    const resolvedNode = isApi
        ? { ...node, dataSource: { ...node.dataSource!, data } }
        : node;

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {/* 用 JSX 创建真正的 React 组件，具体图表可以正常使用自己的 Hook。 */}
            <Component node={resolvedNode} mode={mode} />
            {/* 请求进行时继续绘制图表，不显示加载文字、遮罩或转圈。 */}
            {isApi && (status === "error" || status === "idle") && (
                <div role={error ? "alert" : "status"} style={{
                    position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 12, fontSize: 12, color: error ? "#dc2626" : "#64748b",
                    background: "rgba(255,255,255,0.88)", pointerEvents: "none", overflow: "hidden",
                }}>
                    {error ?? "请配置 API 地址"}
                </div>
            )}
        </div>
    );
}
