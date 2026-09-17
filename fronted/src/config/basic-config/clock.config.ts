import type { ClockComponent } from "@/core/schema/basic";

/**
 * Clock 组件默认配置
 */
export const clockDefaultConfig: ClockComponent = {
    id: "",
    type: "Clock",
    name: "时钟",
    props: {
        format: "HH:mm:ss",
        fontSize: 24,
        fontWeight: 500,
        color: "#000000",
        textAlign: "居中",
        showSeconds: true,
    },
    style: {
        top: 0,
        left: 0,
        width: 200,
        height: 60,
        zIndex: 1,
    },
};
