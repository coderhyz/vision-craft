// 页面大屏的类型
import type { ComponentNode } from "./basic";

/**
 * 页面配置 (Page Schema)
 * 这就是最终保存到数据库的那个 JSON 对象结构
 */
export interface PageDSL {
    id: string; // 大屏的唯一id
    name: string; // 大屏的名称
    type: "RootContainer"; // 页面根节点是一个特殊的container
    // 页面属性，就是看的见的东西
    props: {
        title: string; //大屏的标题
        description: string; //大屏的描述
    };

    // 画布设置
    settings: {
        width: number | string; // 大屏设计稿宽度 (如 1920)
        height: number | string; // 大屏设计稿高度 (如 1080)
        backgroundColor?: string; // 大屏背景颜色
        backgroundImage?: string; // 大屏背景图片
        gridSize?: number; // 大屏编辑时的吸附网格大小
    };

    // 组件树 (核心)
    // 这里的 children 就是第一层级的组件
    children?: ComponentNode[];
}