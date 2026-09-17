import type { BadgeComponent } from "@/core/schema/basic";

export const badgeDefaultConfig: BadgeComponent = {
    id: "",
    type: "Badge",
    name: "徽标数",
    props: {
        count: 5,
        overflowCount: 99,
        showZero: false,
        dot: false,
        color: "#ff4d4f",
        text: "消息",
        fontSize: 14,
    },
    style: {
        top: 0,
        left: 0,
        width: 100,
        height: 40,
        zIndex: 1,
    },
};
