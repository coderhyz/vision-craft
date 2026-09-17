import type { ProgressBarComponent } from "@/core/schema/basic";

/**
 * ProgressBar 组件默认配置
 */
export const progressBarDefaultConfig: ProgressBarComponent = {
    id: "",
    type: "ProgressBar",
    name: "进度条",
    props: {
        value: 45,
        max: 100,
        showLabel: true,
        strokeColor: "#1677ff",
        trackColor: "#f5f5f5",
        strokeWidth: 12,
        rounded: true,
        animation: true,
    },
    style: {
        top: 0,
        left: 0,
        width: 320,
        height: 26,
        zIndex: 1,
        borderRadius: 12,
    },
};
