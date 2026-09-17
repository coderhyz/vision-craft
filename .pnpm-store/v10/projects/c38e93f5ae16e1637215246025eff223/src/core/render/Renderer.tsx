
import { componentRegistry, type RegistryComponent } from "@/components/materials/registery"
import type { ComponentNode } from "../schema/basic";
import type { PageDSL } from "../schema/page";
import RndItem from "@/core/rnd/RndItem"
import { ERROR_COMPONENT_DEFAULT_SIZE } from "@/components/materials/basic/ErrorCallback";

interface RendererProps {
    // schema 可以是单个组件，也可以是组件数组，或者是整个页面schema
    schema: ComponentNode | ComponentNode[] | PageDSL;
    mode?: "edit" | "preview";
    scale?: number;
}

/**
 * 递归渲染器，递归渲染组件树
 * 查注册表,判断模式，调用具体组件
 * @param schema 组件的schema
 */
export default function Renderer({
    schema,
    mode = "edit",
    scale = 1,
}: RendererProps): React.ReactNode {
    // 如果 schema 为空，直接返回 null
    if (!schema) {
        return null;
    }
    // 1. 如果scheme是一个数组，说明传入了children，遍历children渲染
    if (Array.isArray(schema)) {
        return schema.map((node) => (
            // 递归调用 Renderer 来渲染子节点
            <Renderer key={node.id} schema={node} mode={mode} scale={scale} />
        ));
    }

    // 在组件注册表中查找对应类型的组件
    const registeredComponent = componentRegistry.get(schema.type);
    // 如果没有找到对应的组件，则使用错误回调组件进行兜底渲染
    const isErrorFallback = !registeredComponent;
    const renderComponent: RegistryComponent =
        registeredComponent || componentRegistry.get("error-callback");

    // 这里的 renderChildren 是为了让容器组件能够回调引擎来渲染它的子节点
    // 实现了 "控制反转"，容器不需要知道子节点具体是什么类型
    const renderChildren = (children: ComponentNode[]) => (
        <Renderer schema={children} mode={mode} scale={scale} />
    );

    // 4. 非preview模式：根容器占满画布本身，不参与 Rnd 拖拽
    // 根容器单独走一个分支
    if ((schema as PageDSL).type === "RootContainer") {
        return renderComponent({
            node: schema,
            renderChildren,
            mode,
        });
    }

    // 获取当前渲染节点的schema配置 最底下的子组件
    const node = schema as ComponentNode;
    // 获取当前渲染节点schema配置中的样式数据，并进行空值兜底
    const defaultStyle = {
        top: 0,
        left: 0,
        width: isErrorFallback ? ERROR_COMPONENT_DEFAULT_SIZE.width : 200,
        height: isErrorFallback ? ERROR_COMPONENT_DEFAULT_SIZE.height : 50,
        zIndex: 1,
    };
    const style = { ...defaultStyle, ...node.style };
    // 错误兜底也需要完整尺寸，确保 Rnd 选框与实际显示区域保持一致。
    const resolvedNode = isErrorFallback
        ? ({ ...node, style } as ComponentNode)
        : node;
    // 传入的style
    const { top, left, width, height, zIndex, ...restStyle } = style;

    // 3. preview模式：所有组件以绝对定位方式渲染，不参与 Rnd 拖拽
    if (mode === "preview") {
        return (
            <div
                style={{
                    position: "absolute",
                    top,
                    left,
                    width,
                    height,
                    zIndex,
                    ...restStyle,
                }}
            >
                {renderComponent({
                    node: resolvedNode,
                    renderChildren,
                    mode,
                })}
            </div>
        );
    }

    // 4. 非preview模式且非根容器：普通组件统一通过 RndItem 包裹，使其在画布内可拖拽 / 缩放
    return (
        // RndItem 组件内部会根据传入的 node.style 来设置 Rnd 的位置和大小
        <RndItem node={resolvedNode} scale={scale}>
            {renderComponent({
                node: resolvedNode,
                renderChildren,
                mode,
            })}
        </RndItem>
    );
}
