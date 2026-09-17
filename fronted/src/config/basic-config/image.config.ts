import type { ImageComponent } from "@/core/schema/basic";

/**
 * Image 组件默认配置
 */
export const imageDefaultConfig: ImageComponent = {
    id: "",
    type: "Image",
    name: "图片",
    props: {
        src: "https://via.placeholder.com/300x200.png",
        alt: "示例图片",
        fit: "contain",
        preview: true,
    },
    style: {
        top: 0,
        left: 0,
        width: 300,
        height: 200,
        zIndex: 1,
        backgroundColor: "#f5f5f5",
        border: "1px solid #e0e0e0",
        borderRadius: 4,
    },
};
