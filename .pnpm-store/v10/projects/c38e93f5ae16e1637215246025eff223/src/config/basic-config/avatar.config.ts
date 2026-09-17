import type { AvatarComponent } from "@/core/schema/basic";

export const avatarDefaultConfig: AvatarComponent = {
    id: "",
    type: "Avatar",
    name: "头像",
    props: {
        src: "",
        text: "U",
        shape: "circle",
        size: 48,
        backgroundColor: "#1677ff",
        color: "#ffffff",
    },
    style: {
        top: 0,
        left: 0,
        width: 60,
        height: 60,
        zIndex: 1,
    },
};
