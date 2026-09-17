import type { ContainerComponent } from "@/core/schema/basic";

/**
 * Container组件默认配置
 */
export const containerDefaultConfig: ContainerComponent = {
    id: "",
    type: "Container",
    name: "容器",
    props: {
        layoutMode: "absolute",
        gap: 0,
    },
    children: [],
    style: {
        top: 0,
        left: 0,
        width: 300,
        height: 300,
        zIndex: 1,
        backgroundColor: "#ffffff",
        border: "1px solid #e0e0e0",
        borderRadius: 4,
    },
};
