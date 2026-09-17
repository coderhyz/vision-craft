# `renderComponent({ node, renderChildren })` 详细流程说明

本文说明 `fronted/src/core/render/render.tsx` 中下面这段 JSX 的完整执行链路：

```tsx
{renderComponent({
    node,
    renderChildren,
})}
```

这里的 `renderComponent` 不是固定的某一个 React 组件，而是根据当前节点 `node.type` 从组件注册表中动态取出的“组件渲染函数”。这段调用负责把 Schema 节点交给具体的物料组件；如果物料组件需要渲染子节点，则通过 `renderChildren` 回调把子节点重新交回 `Renderer`，形成递归渲染。

## 一、涉及的核心角色

| 角色 | 位置 | 作用 |
| --- | --- | --- |
| `Renderer` | `fronted/src/core/render/render.tsx` | 递归遍历 Schema，并决定当前节点的渲染包装方式 |
| `componentRegistry` | `fronted/src/components/materials/registery.ts` | 根据 `node.type` 找到具体物料组件 |
| `RegistryComponent` | `fronted/src/components/materials/registery.ts:16-21` | 约束物料组件接收的参数：`node`、`renderChildren`、`mode` |
| `renderComponent` | `render.tsx:35-37` | 当前节点最终要调用的具体组件函数 |
| `renderChildren` | `render.tsx:41-43` | 将子节点再次交给 `Renderer` 的回调函数 |
| `RndItem` | `fronted/src/core/rnd/RndItem.tsx` | 编辑模式下提供拖拽、缩放、选中和删除能力 |

## 二、整体调用链

```text
Renderer(schema)
  |
  |-- schema 为空 ----------------------------> return null
  |
  |-- schema 是数组 ---------------------------> 对每个 node 递归调用 Renderer
  |
  |-- schema 是单个节点
        |
        |-- componentRegistry.get(schema.type)
        |       |
        |       `-- 找不到时尝试 get("error-callback")
        |
        |-- 创建 renderChildren(children)
        |       `-- <Renderer schema={children} mode={mode} scale={scale} />
        |
        |-- RootContainer ---------------------> 直接调用 renderComponent
        |
        |-- preview ---------------------------> 绝对定位 div
        |                                           `-- 调用 renderComponent
        |
        `-- edit 普通组件 ----------------------> RndItem
                                                    `-- 调用 renderComponent
```

## 三、`Renderer` 进入当前节点前做了什么

### 1. 空值保护

`Renderer` 首先判断 `schema` 是否存在。如果传入 `null` 或 `undefined`，直接返回 `null`，不会进入注册表查询，也不会执行 `renderComponent`。

位置：`render.tsx:23-25`。

### 2. 数组节点展开

如果 `schema` 是数组，代码会执行：

```tsx
return schema.map((node) => (
    <Renderer key={node.id} schema={node} mode={mode} scale={scale} />
));
```

这通常对应一个容器的 `children`。数组本身不会直接查注册表，而是拆成多个单节点的 `Renderer`。因此，`renderComponent({ node, renderChildren })` 是在每一个具体节点的递归调用中执行的。

位置：`render.tsx:27-31`。

### 3. 查找具体渲染组件

```tsx
const renderComponent: RegistryComponent =
    componentRegistry.get(schema.type) ||
    componentRegistry.get("error-callback");
```

查找依据是 Schema 节点的 `type` 字段。例如：

```json
{
  "id": "text-001",
  "type": "Text",
  "props": {
    "content": "你好"
  }
}
```

对于上面的节点，查找键是 `"Text"`，注册表应返回 `Text` 函数。

注册表本质上是一个 `Map`。目前代码中明确注册的组件是：

```tsx
ComponentRegistryManager.register("Container", Container);
ComponentRegistryManager.register("Text", Text);
```

位置：`registery.ts:79-81`。后续新增物料组件时，也需要使用相同的 `register(type, component)` 方式注册。

## 四、`renderChildren` 到底做什么

`renderChildren` 是当前 `Renderer` 创建的闭包：

```tsx
const renderChildren = (children: ComponentNode[]) => (
    <Renderer schema={children} mode={mode} scale={scale} />
);
```

它有三个重要特点：

1. **延迟执行**：创建回调时不会马上渲染子节点。只有物料组件内部真正调用 `renderChildren(children)` 时，子节点才会开始递归渲染。
2. **保留当前上下文**：回调捕获了当前层的 `mode` 和 `scale`，所以子节点会继承相同的渲染模式和画布缩放比例。
3. **组件解耦**：容器组件不需要自己知道如何查注册表，也不需要手动判断子节点是文本、图片还是图表，只需要调用回调即可。

可以把它理解成“把递归引擎的下一步交给容器组件”：

```tsx
function ContainerRenderer({ node, renderChildren }) {
    return (
        <div>
            {renderChildren?.(node.children ?? [])}
        </div>
    );
}
```

## 五、这段 JSX 在三种分支中的位置

### 1. 根容器分支

当 `schema.type === "RootContainer"` 时，`Renderer` 不进入 `RndItem`，而是直接执行：

```tsx
return renderComponent({
    node: schema,
    renderChildren,
    mode,
});
```

原因是根容器代表整个画布，不应该像普通组件一样被单独拖拽。根容器组件通常会：

1. 根据 `node.settings` 设置画布宽高、背景色和背景图。
2. 在编辑模式叠加网格背景。
3. 调用 `renderChildren(node.children || [])` 渲染第一层组件。

对应实现见 `fronted/src/components/materials/basic/RootContainer.tsx:14-55`。

### 2. 预览模式分支

当 `mode === "preview"` 时，普通节点会被一个绝对定位的 `div` 包起来：

```tsx
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
        node,
        renderChildren,
        mode,
    })}
</div>
```

这里的 `node.style` 会先拆出 `top`、`left`、`width`、`height`、`zIndex`，剩余样式放入 `restStyle`。因此，预览模式下的定位和尺寸由外层 `div` 负责，组件函数本身主要负责绘制内容。

对应位置：`render.tsx:67-87`。

### 3. 编辑模式普通组件分支

编辑模式下，普通节点会进入：

```tsx
<RndItem node={node} scale={scale}>
    {renderComponent({
        node,
        renderChildren,
    })}
</RndItem>
```

执行顺序可以理解为：

1. `RndItem` 根据 `node.style` 设置 React-RND 的位置和尺寸。
2. `RndItem` 负责选中、拖动、缩放、删除等编辑交互。
3. `renderComponent` 绘制真正的业务内容。
4. 真正的业务内容会作为 `children` 传回 `RndItem` 内部显示。

`RndItem` 中的 `onDragStop` 和 `onResizeStop` 会把最新位置、尺寸写回 `schema-store`，所以 `renderComponent` 本身不负责拖拽和持久化。

对应位置：`render.tsx:90-99`，交互实现见 `RndItem.tsx:166-205`。

## 六、一次完整渲染示例

假设页面 Schema 如下：

```text
RootContainer
└── children
    ├── Text
    └── Container
        └── children
            └── Text
```

理论上的调用顺序是：

```text
1. Renderer(RootContainer)
2. componentRegistry.get("RootContainer")
3. RootContainer({ node, renderChildren, mode })
4. RootContainer 调用 renderChildren(root.children)
5. Renderer([Text, Container])
6. Renderer(Text)
7. componentRegistry.get("Text")
8. RndItem(node=Text)
9. Text({ node, renderChildren })
10. Renderer(Container)
11. componentRegistry.get("Container")
12. RndItem(node=Container)
13. Container({ node, renderChildren })
14. Container 如果调用 renderChildren(container.children)，继续渲染下一级 Text
```

关键点是第 14 步：递归不会自动发生，必须由容器组件显式调用 `renderChildren`。

## 七、当前代码需要特别注意的地方

### 1. `RootContainer` 当前没有注册

仓库中存在 `basic/RootContainer.tsx`，但 `registery.ts` 当前只注册了 `Container` 和 `Text`，没有看到：

```tsx
ComponentRegistryManager.register("RootContainer", RootContainer);
```

因此，执行 `Renderer` 遇到根节点时：

```tsx
componentRegistry.get("RootContainer") // undefined
componentRegistry.get("error-callback") // 当前也没有注册
```

最终 `renderComponent` 可能是 `undefined`，调用 `renderComponent(...)` 会触发运行时错误。注册表的 TypeScript 类型把 `get` 声明成了必定返回函数，但原生 `Map.get` 实际上仍可能返回 `undefined`，这属于类型声明和运行时行为不一致。

### 2. `error-callback` 当前也没有注册

代码设计上为未知类型准备了兜底键 `"error-callback"`，但目前没有对应注册。要让兜底逻辑真正生效，需要注册一个返回错误提示 UI 的组件，例如：

```tsx
ComponentRegistryManager.register("error-callback", ({ node }) => (
    <div>Unsupported component: {node.type}</div>
));
```

### 3. 当前 `Container` 没有使用 `renderChildren`

现有 `basic/container.tsx` 只返回固定文本：

```tsx
function Container() {
    return <div className="Container">Container content</div>;
}
```

它没有接收 `node`，也没有调用 `renderChildren`。因此，即使 `Container` 节点带有 `children`，这些子节点也不会被实际渲染。若目标是支持嵌套容器，需要让它接收并调用回调。

### 4. 编辑模式调用中没有显式传 `mode`

预览分支和根容器分支都传了 `mode`，而编辑模式普通组件分支的调用是：

```tsx
renderComponent({ node, renderChildren })
```

因为 `mode` 在注册组件类型中是可选的，这不会造成 TypeScript 参数错误；但组件如果依赖 `mode` 来区分编辑态和预览态，编辑分支收到的值会是 `undefined`。如果希望所有物料组件都能可靠判断模式，建议编辑分支也传入 `mode`。

## 八、用一句话概括

`renderComponent({ node, renderChildren })` 的本质是：**把当前 Schema 节点和“继续递归渲染子节点”的能力交给注册表中匹配的 React 物料组件；外层 `Renderer` 决定它处于根容器、预览定位还是编辑拖拽哪一种渲染环境。**

