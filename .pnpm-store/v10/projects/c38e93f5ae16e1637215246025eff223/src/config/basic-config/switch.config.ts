import type { SwitchComponent } from "@/core/schema/basic";

export const switchDefaultConfig: SwitchComponent = {
    id: "",
    type: "Switch",
    name: "开关",
    props: {
        checked: true,
        checkedText: "开",
        uncheckedText: "关",
        size: "default",
        disabled: false,
    },
    style: {
        top: 0,
        left: 0,
        width: 80,
        height: 40,
        zIndex: 1,
    },
};
