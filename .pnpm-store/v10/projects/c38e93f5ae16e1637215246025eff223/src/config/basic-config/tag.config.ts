import type { TagComponent } from "@/core/schema/basic";

export const tagDefaultConfig: TagComponent = {
    id: "",
    type: "Tag",
    name: "标签",
    props: {
        text: "标签",
        color: "blue",
        bordered: true,
        fontSize: 14,
    },
    style: {
        top: 0,
        left: 0,
        width: 80,
        height: 40,
        zIndex: 1,
    },
};
