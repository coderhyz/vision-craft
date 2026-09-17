// 组件注册器
import type React from "react";
// 组件节点类型
import type { ComponentType } from "@/core/schema/types";
// 组件节点
import type { ComponentNode } from "@/core/schema/basic";
import type { PageDSL } from "@/core/schema/page";
import RootContainer from "./basic/RootContainer";
import Container from "./basic/container";
import Text from "./basic/text";
import Image from "./basic/Image";
import ErrorCallback from "./basic/ErrorCallback";

/**
 * 组件注册表类
 * 用于注册已实现的组件
 * 使用Map()结构存储，查找时时间复杂度为O(1)，效率更高
 */
// 每个注册组件都约定接收 renderer 传入的节点数据和可选的 renderChildren 回调
type RegistryComponent = (props: {
    node: ComponentNode | PageDSL;
    // 可选的 renderChildren 回调，如果有 children 节点，则调用该回调渲染子节点
    renderChildren?: (children: ComponentNode[]) => React.ReactNode;
    mode?: "edit" | "preview";
}) => React.ReactNode;
// 自定义 Map 类型，让 get 在类型层面**一定**返回一个可用于 JSX 的组件（避免 Renderer 中出现 undefined 报错）
// 根据当前节点的 type，找到应该用哪个 React 组件来渲染它。
interface ComponentRegistry extends Map<
    ComponentType | "error-callback" | "RootContainer",
    RegistryComponent
> {
    // 重新定义get方法，确保返回值类型为RegistryComponent
    get(
        key: ComponentType | "error-callback" | "RootContainer",
    ): RegistryComponent;
}
/**
 * 组件注册表管理类
 * 提供组件的注册、获取、查询等静态方法
 */
class ComponentRegistryManager {
    // 组件注册 map
    private static readonly registry: ComponentRegistry = new Map();

    /**
     * 注册组件
     * @param type 组件类型
     * @param component 组件函数
     */
    static register(
        type: ComponentType | "error-callback" | "RootContainer",
        component: RegistryComponent,
    ): void {
        this.registry.set(type, component);
    }

    /**
     * 获取组件
     * @param type 组件类型
     * @returns 组件函数
     */
    static get(
        type: ComponentType | "error-callback" | "RootContainer",
    ): RegistryComponent {
        return this.registry.get(type);
    }

    /**
     * 获取所有已注册的组件
     * @returns 包含所有组件的Map
     */
    static getAllComponents(): ComponentRegistry {
        return this.registry;
    }

    /**
     * 获取已注册组件的数量
     * @returns 组件数量
     */
    static size(): number {
        return this.registry.size;
    }
}
// 预注册基础组件，键为 Schema 中的 type 字段
ComponentRegistryManager.register("Container", Container as unknown as RegistryComponent);
ComponentRegistryManager.register("Text", Text as unknown as RegistryComponent);
ComponentRegistryManager.register("RootContainer", RootContainer as unknown as RegistryComponent);
ComponentRegistryManager.register("Image", Image as unknown as RegistryComponent);
ComponentRegistryManager.register("error-callback", ErrorCallback as unknown as RegistryComponent);
// 导出类实例和类型
export { ComponentRegistryManager };
export type { RegistryComponent, ComponentRegistry };

// 为了保持向后兼容，导出原有的 componentRegistry
export const componentRegistry: ComponentRegistry =
    ComponentRegistryManager.getAllComponents();
