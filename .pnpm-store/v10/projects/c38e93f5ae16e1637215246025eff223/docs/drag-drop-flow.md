# 组件从拖拽到写入 Schema 的完整流程

本文说明编辑器中的组件如何从左侧物料面板开始拖拽，经过 dnd-kit 的事件处理和坐标换算，最终写入 Zustand 中的页面 Schema 并渲染到画布。

## 一、整体流程

```text
BasicPanel 创建物料卡片
        ↓
DraggableItem 注册拖拽源
        ↓
DndWrapper 监听拖拽事件
        ↓
DragOverlay 显示静态拖拽预览
        ↓
DroppableItem 判断是否落入画布
        ↓
DndWrapper 计算画布逻辑坐标
        ↓
复制组件默认配置并生成唯一 ID
        ↓
schemaStore.addItem() 写入组件树
        ↓
Zustand 通知 React 更新
        ↓
Renderer 渲染新组件
```

## 二、注册拖拽源

左侧物料面板通过 `DraggableItem` 包裹每一个组件卡片：

```tsx
<DraggableItem id="Image">
    <div>图片组件</div>
</DraggableItem>
```

这里的 `id` 表示组件类型，例如：

```text
Text
Image
Button
ProgressBar
```

`DraggableItem` 内部通过 `useDraggable` 向 dnd-kit 注册拖拽源：

```tsx
const { listeners, attributes, setNodeRef, isDragging } = useDraggable({
    id,
    data: {
        overlay: children,
    },
});
```

注册完成后，dnd-kit 可以在拖拽事件中提供以下信息：

```ts
event.active.id;
event.active.data.current;
event.active.rect.current;
```

对应含义如下：

| 数据 | 说明 |
| --- | --- |
| `event.active.id` | 当前拖拽的组件类型 |
| `event.active.data.current` | 拖拽源附带的自定义数据 |
| `event.active.rect.current` | 拖拽源的位置和尺寸 |

真实 DOM 通过 `setNodeRef` 交给 dnd-kit：

```tsx
<div ref={setNodeRef} {...attributes} {...listeners}>
    {children}
</div>
```

## 三、显示拖拽遮罩层

开始拖拽时，`DndWrapper` 会触发 `handleDragStart`：

```tsx
const handleDragStart = (event: DragStartEvent) => {
    const activeData = event.active.data.current as {
        overlay?: React.ReactNode;
    } | undefined;

    setActiveOverlay(activeData?.overlay ?? null);
};
```

随后使用 `DragOverlay` 显示静态预览卡片：

```tsx
<DragOverlay dropAnimation={null}>
    {activeOverlay && (
        <div style={{ pointerEvents: "none", cursor: "grabbing" }}>
            {activeOverlay}
        </div>
    )}
</DragOverlay>
```

遮罩层只负责表示当前拖拽的组件，不是真正写入画布的业务组件。

## 四、注册可放置区域

画布根容器通过 `DroppableItem` 注册为可放置区域：

```tsx
const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
        getBoundingClientRect: () =>
            nodeRef.current?.getBoundingClientRect(),
    },
});
```

当拖拽元素进入画布时，dnd-kit 会通过 `event.over` 提供当前命中的区域：

```ts
event.over?.id;
event.over?.rect;
event.over?.data.current;
```

如果拖拽结束时 `event.over` 不存在，说明组件没有落入有效画布，不会创建组件。

编辑器使用 `pointerWithin` 作为碰撞检测策略：

```tsx
<DndContext collisionDetection={pointerWithin}>
    {children}
</DndContext>
```

因此只有鼠标指针真正进入画布可放置区域时才会产生 `event.over`。拖拽遮罩的边缘与画布相交、但鼠标仍在画布外时，不会触发放置感应。

## 五、处理拖拽结束事件

松开鼠标后会触发 `handleDragEnd`：

```tsx
const handleDragEnd = (event: DragEndEvent) => {
    setActiveOverlay(null);

    const dropItemId = event.over?.id;
    if (!dropItemId) return;

    // 后续执行组件配置创建、坐标计算和 Schema 写入。
};
```

`dropItemId` 是当前目标父容器的 ID。根画布的情况可能类似：

```ts
dropItemId = "root-container-id";
```

## 六、获取组件默认配置

拖拽源的 ID 就是组件类型：

```tsx
const activeType = String(event.active.id) as keyof typeof componentDefaultConfigs;
```

先检查组件类型是否存在：

```tsx
if (!(activeType in componentDefaultConfigs)) return;
```

然后复制对应的默认配置：

```tsx
const newConfig = getNewComponentConfig(activeType);
```

例如图片组件的默认配置可能是：

```ts
{
    id: "",
    type: "Image",
    name: "图片",
    props: {
        src: "https://example.com/image.png",
        fit: "contain",
        preview: true,
    },
    style: {
        left: 0,
        top: 0,
        width: 300,
        height: 200,
        zIndex: 1,
    },
}
```

`getNewComponentConfig` 会执行深拷贝，保证后续修改新实例时不会污染公共默认配置。

## 七、计算组件在画布中的位置

### 1. 获取真实画布矩形

```tsx
const canvasRect = document
    .querySelector<HTMLElement>('[data-canvas-content="true"]')
    ?.getBoundingClientRect();
```

`getBoundingClientRect()` 返回的是相对于浏览器视口的位置，其中已经包含：

- 画布居中偏移；
- 页面布局偏移；
- 滚动偏移；
- CSS 缩放后的尺寸。

因此使用这个矩形计算坐标时，不需要再次手动累加 `scrollLeft` 或 `scrollTop`。

### 2. 获取拖拽遮罩的位置

```tsx
const activeRect = event.active.rect.current?.translated;
```

`translated` 表示拖拽元素移动后的最终位置。

### 3. 换算逻辑坐标

```tsx
const offsetLeft = (activeRect.left - canvasRect.left) / zoom;
const offsetTop = (activeRect.top - canvasRect.top) / zoom;
```

假设：

```ts
canvasRect.left = 300;
canvasRect.top = 100;

activeRect.left = 500;
activeRect.top = 250;

zoom = 0.5;
```

那么逻辑坐标是：

```ts
left = (500 - 300) / 0.5;
// 400

top = (250 - 100) / 0.5;
// 300
```

这里需要除以 `zoom`，因为 DOM 矩形使用的是缩放后的屏幕坐标，而 Schema 保存的是缩放前的画布逻辑坐标。

## 八、进行网格吸附

组件坐标会按照页面设置的网格大小进行吸附：

```tsx
const gridSize = normalizeGridSize(
    schemaStore.schema?.settings?.gridSize,
);

const snappedLeft = snapToGrid(offsetLeft, gridSize).value;
const snappedTop = snapToGrid(offsetTop, gridSize).value;
```

假设网格大小为 `10`：

```text
left: 403 → 400
top: 297  → 300
```

把吸附后的坐标写入新组件配置：

```tsx
if (newConfig.style) {
    newConfig.style = {
        ...newConfig.style,
        left: snappedLeft,
        top: snappedTop,
    };
}
```

## 九、生成组件实例 ID

同一种组件可以被拖入画布多次，因此每个实际实例都需要独立 ID：

```tsx
newConfig.id = nanoid();
```

例如：

```ts
{
    id: "V1StGXR8_Z5jdHi6B-myT",
    type: "Image",
}
```

`type` 决定渲染哪个组件，`id` 用于区分多个组件实例。

## 十、写入 Zustand Schema

创建完成后调用：

```tsx
schemaStore.addItem(dropItemId.toString(), newConfig);
```

`schemaStore.addItem` 会先限制组件的位置和尺寸，避免组件超出根画布：

```tsx
const safeNode = newNode.style
    ? {
        ...newNode,
        style: clampStyleToCanvas(
            newNode.style,
            state.schema.settings,
        ),
    }
    : newNode;
```

随后找到目标父节点并插入：

```tsx
success = addNodeToParent(
    parentId,
    state.schema,
    safeNode,
);
```

写入后，Schema 大致如下：

```ts
{
    id: "root-id",
    type: "RootContainer",
    children: [
        {
            id: "V1StGXR8_Z5jdHi6B-myT",
            type: "Image",
            style: {
                left: 400,
                top: 300,
                width: 300,
                height: 200,
                zIndex: 1,
            },
        },
    ],
}
```

Zustand 使用 Immer 更新状态。组件树发生变化后，订阅 Schema 的 React 组件会重新渲染。

## 十一、Renderer 渲染新增组件

`Renderer` 会遍历 `schema.children`，根据节点的 `type` 从组件注册表中查找实现：

```tsx
const renderComponent = componentRegistry.get(node.type);
```

例如：

```ts
node.type === "Image";
```

会找到图片组件，最终形成类似结构：

```tsx
<RndItem node={node}>
    <Image node={node} />
</RndItem>
```

其中：

- `RndItem` 负责绝对定位、拖动、缩放和选中状态；
- `Image` 负责渲染实际业务内容；
- 如果组件没有注册，则由 `ErrorCallback` 显示错误兜底。

## 十二、组件选中流程

`addItem()` 只负责把组件写入 Schema，不会主动选中新组件。

组件的选中发生在 `RndItem` 的点击事件中：

```tsx
const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedId(node.id);
};
```

选中后，store 中会保存：

```ts
selectedId = node.id;
selectedNode = node;
```

随后 `RndItem` 根据下面的判断显示选中框、删除按钮和 AI 编辑输入框：

```tsx
const isSelected = selectedId === node.id;
```

## 十三、写入内存与保存后端的区别

拖拽结束后的 `schemaStore.addItem()` 只会更新前端 Zustand 状态，也就是浏览器内存中的页面 Schema。

```text
拖拽写入 → 更新前端 Schema
点击保存 → 调用 API 持久化到后端
```

如果用户刷新页面之前没有执行保存接口，新增组件是否保留取决于项目是否还有自动保存或本地缓存逻辑。

## 十四、相关文件

| 文件 | 职责 |
| --- | --- |
| `src/components/panels/component-panel/BasicPanel.tsx` | 展示左侧物料列表 |
| `src/core/dnd-kit/DraggableItem.tsx` | 注册拖拽源 |
| `src/core/dnd-kit/DroppableItem.tsx` | 注册可放置区域 |
| `src/core/dnd-kit/DndWrapper.tsx` | 处理拖拽事件、坐标计算和组件创建 |
| `src/config/index.ts` | 管理组件默认配置 |
| `src/store/schema-store.ts` | 管理页面 Schema 状态 |
| `src/core/render/Renderer.tsx` | 根据 Schema 渲染组件 |
| `src/core/rnd/RndItem.tsx` | 处理画布内拖动、缩放和选中 |
