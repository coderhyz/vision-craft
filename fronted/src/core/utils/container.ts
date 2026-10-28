import type { ComponentNode, ContainerComponent } from "@/core/schema/basic";
import type { PageDSL } from "@/core/schema/page";

type ParentNode = ContainerComponent | PageDSL;
type ComponentStyle = NonNullable<ComponentNode["style"]>;

export function findParentContainer(id: string, root: ParentNode): ParentNode | null {
    for (const child of root.children ?? []) {
        if (child.id === id) return root;
        if (child.type === "Container") {
            const parent = findParentContainer(id, child);
            if (parent) return parent;
        }
    }
    return null;
}

export function getContainerBounds(parent: ParentNode): { width: number; height: number } {
    return parent.type === "RootContainer"
        ? { width: Math.max(1, Number(parent.settings.width) || 1920), height: Math.max(1, Number(parent.settings.height) || 1080) }
        : { width: parent.style?.width ?? 200, height: parent.style?.height ?? 50 };
}

export function clampStyleToBounds(
    style: ComponentStyle,
    bounds: { width: number; height: number },
): ComponentStyle {
    const parentWidth = Math.max(1, Number(bounds.width) || 1);
    const parentHeight = Math.max(1, Number(bounds.height) || 1);
    const width = Math.min(Math.max(1, Number(style.width) || 1), parentWidth);
    const height = Math.min(Math.max(1, Number(style.height) || 1), parentHeight);
    return {
        ...style,
        width,
        height,
        left: Math.min(Math.max(0, Number(style.left) || 0), parentWidth - width),
        top: Math.min(Math.max(0, Number(style.top) || 0), parentHeight - height),
    };
}

/** 容器缩小时同步约束后代，避免保存或预览后子组件仍留在容器外。 */
export function clampContainerChildren(container: ContainerComponent): void {
    for (const child of container.children ?? []) {
        if (child.style) child.style = clampStyleToBounds(child.style, getContainerBounds(container));
        if (child.type === "Container") clampContainerChildren(child);
    }
}
