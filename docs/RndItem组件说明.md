# `RndItem` 组件说明

## 1. 组件定位

`RndItem` 位于 `fronted/src/core/rnd/RndItem.tsx`。它是编辑器中普通画布节点的**交互包装层**：业务物料只负责渲染内容，`RndItem` 统一负责选中、拖拽、缩放、网格吸附、参考线高亮、删除以及 AI 精确编辑入口。

它由 `Renderer` 在编辑模式下使用：

```tsx
<RndItem node={node} scale={scale}>
    {renderComponent({ node, renderChildren })}
</RndItem>
```

根节点 `RootContainer` 不会被包裹；`preview` 模式也不会使用它，而是由 `Renderer` 直接以绝对定位的 `div` 渲染。因此，`RndItem` 不应承载预览态的样式或交互逻辑。

## 2. 依赖的库与项目模块

| 依赖 | 来源 | 在组件中的用途 |
| --- | --- | --- |
| `react` | 第三方，`^18.0.0` | 渲染组件；使用 `useCallback` 固定回调引用、`useEffect` 清理资源、`useRef` 保存动画帧 ID。 |
| `react-rnd` | 第三方，`^10.5.2` | `Rnd` 提供可拖拽、可缩放容器；同时提供 `DraggableData`、`ResizableDelta`、`Position` 类型。 |
| `react-draggable` | `react-rnd` 所用拖拽能力的类型来源 | `DraggableEvent` 标注拖拽事件参数类型。项目代码直接从该包导入类型，因此安装依赖时需要确保它可被 TypeScript 解析。 |
| `zustand` | 第三方，`^5.0.8` | `useShallow` 对多个 store 字段进行浅比较，避免无关状态变化导致 `RndItem` 重新渲染。 |
| `useSchemaStore` | `@/store/schema-store` | 读取/更新画布 Schema，维护选中状态，执行删除操作，读取页面网格尺寸。 |
| `useGuideStore` | `@/store/guide-store` | 写入当前命中的横、纵参考线位置，供引导线图层高亮。 |
| `normalizeGridSize`、`snapToGrid` | `@/core/utils/grid` | 规范化网格大小，并将位置或尺寸吸附到网格。 |
| `SelectionOverlay` | 同目录组件 | 选中时显示蓝色边框、节点名称、删除与取消选中操作。 |
| `AiEditInput` | 同目录组件 | 选中时显示 AI 修改输入框，并把指令与节点交给编辑 store。 |
| `ComponentNode` | `@/core/schema/basic` | 约束传入节点的 Schema 类型。 |

`@/` 是项目配置的路径别名；编译时需要由 TypeScript/Vite 的别名配置正确解析。

## 3. 对外接口

```ts
interface RndItemProps {
    node: ComponentNode;
    children: React.ReactNode;
    scale?: number;
}
```

| 属性 | 必填 | 说明 |
| --- | --- | --- |
| `node` | 是 | 当前渲染的 Schema 节点。主要使用 `id`、`name`、`type` 与 `style`。 |
| `children` | 是 | 实际的业务物料内容，例如文本、图表或容器。 |
| `scale` | 否 | 画布缩放比例，默认 `1`。原样传入 `Rnd` 的 `scale`，用于让拖拽/缩放坐标按画布缩放比例修正。 |

其中 `node.style` 应至少含有以下布局字段：

```ts
{
  top: number;
  left: number;
  width: number;
  height: number;
  zIndex: number;
}
```

如果 `style` 缺失，组件会使用 `{ top: 0, left: 0, width: 200, height: 50, zIndex: 1 }` 作为渲染兜底值，防止 `Rnd` 接收到无效的位置或尺寸。

## 4. 数据流与交互流程

```text
Schema node.style
      │
      ▼
Rnd 的 size / position / zIndex
      │
      ├─ 点击内容 ───────────────► schema-store.setSelectedId(node.id)
      │                                  │
      │                                  └─ 显示 SelectionOverlay 与 AiEditInput
      │
      ├─ 拖拽中 ────────────────► snapToGrid → guide-store.activeSnaps
      │
      ├─ 拖拽结束 ──────────────► snapToGrid → schema-store.updateItem
      │
      └─ 缩放结束 ──────────────► 尺寸/位置吸附 → schema-store.updateItem
```

### 4.1 状态读取

组件从 `useSchemaStore` 读取：

- `updateItem`：拖拽或缩放结束后回写节点的 `style`；
- `removeItem`：删除当前节点；
- `selectedId` 与 `setSelectedId`：判断和修改选中态；
- `schema.settings.gridSize`：读取当前画布网格尺寸。

从 `useGuideStore` 读取 `setActiveSnaps`，用于更新当前高亮的网格参考线。

两处 store 均使用 `useShallow`。这让订阅对象只有在其中某个字段实际变更时才更新，避免其它 store 字段变动引起不必要的渲染。

### 4.2 网格大小与吸附

`normalizeGridSize(gridSize)` 会保证网格尺寸为正的有限数字；否则使用 `DEFAULT_GRID_SIZE`（目前为 `15`）。

拖拽和缩放结束时，`snapToGrid` 分别处理：

- 拖拽：`data.x` 和 `data.y`，写回 `left`、`top`；
- 缩放：`ref.offsetWidth`、`ref.offsetHeight` 与 `position.x`、`position.y`，写回 `width`、`height`、`left`、`top`。

回写时使用 `{ ...style, ...新布局值 }`，因此节点已有的 `backgroundColor`、圆角或自定义样式字段会被保留。

### 4.3 选中与编辑限制

```tsx
disableDragging={node.id !== selectedId}
enableResizing={node.id === selectedId}
```

未选中节点只能通过内部容器点击选中，不能拖动或缩放；选中后才开放两项操作。这一限制有助于避免画布上的误拖动。

点击处理调用 `event.stopPropagation()`，防止点击节点继续冒泡到画布，从而触发外层的取消选中逻辑。

选中时会额外渲染：

- `SelectionOverlay`：边框、名称、删除、取消选中；
- `AiEditInput`：输入自然语言修改指令。标签或输入框在节点距画布顶部不足 `20px` 时会下移，避免被画布顶部裁切。

### 4.4 拖拽期间的参考线

`handleDrag` 只更新高亮参考线，不会持续写入 Schema。它会对当前坐标吸附后写入横、纵两条参考线。

为避免拖拽事件高频触发 store 更新，`updateSnapsSafely` 用 `requestAnimationFrame` 合并同一帧内的多次更新：先取消尚未执行的帧，再在下一帧执行 `setActiveSnaps`。组件卸载时通过 `useEffect` 清除遗留帧，避免卸载后更新 store。

拖拽/缩放停止时都会执行 `updateSnapsSafely([])`，清除参考线高亮。

## 5. 渲染结构

组件最终结构可概括为：

```tsx
<Rnd /* 位置、尺寸、边界、交互回调 */>
  <div /* 相对定位，承载背景和点击事件 */>
    {isSelected && <SelectionOverlay />}
    {isSelected && <AiEditInput />}
    {children}
  </div>
</Rnd>
```

`Rnd` 的重要配置：

| 配置 | 当前值 | 效果 |
| --- | --- | --- |
| `size` | `style.width`、`style.height` | 受控地显示节点尺寸。 |
| `position` | `style.left`、`style.top` | 受控地显示节点坐标。 |
| `bounds` | `"parent"` | 将移动范围限制在直接父容器内。父容器应建立正确的画布定位与尺寸边界。 |
| `scale` | `scale` 属性 | 适配画布缩放后的指针坐标。 |
| `style` | `{ zIndex: style.zIndex }` | 保持 Schema 指定的层级。 |
| `onDrag` | `handleDrag` | 更新参考线。 |
| `onDragStop` | `handleDragStop` | 吸附并保存拖拽后的坐标。 |
| `onResizeStop` | `handleResizeStop` | 吸附并保存缩放后的尺寸和坐标。 |

内层 `div` 使用 `position: "relative"` 和 `width/height: "100%"`，让覆盖层能相对当前节点绝对定位；它只额外消费 `style.backgroundColor`，其它视觉样式主要由业务物料或其它渲染层处理。

## 6. 删除和取消选中

- 删除：`SelectionOverlay` 调用 `handleDelete`；它先 `removeItem(node.id)`，若节点仍是选中项则调用 `setSelectedId(null)`。`schema-store.removeItem` 也会在实际删除成功且目标为当前选中节点时清除选中状态，因此这里的额外清理属于防御性处理。
- 取消选中：`SelectionOverlay` 调用 `handleDeselect`，直接执行 `setSelectedId(null)`。

## 7. 维护注意点

1. `scale` 必须与画布实际的 CSS 缩放比例一致。若遗漏或传错，视觉位置虽可能正确，鼠标拖拽距离会出现偏差。
2. `bounds="parent"` 只约束移动区域，不自动保证缩放后的右/下边界；如需严格限制最小/最大尺寸或容器边界，应补充 `minWidth`、`minHeight`、`maxWidth`、`maxHeight` 或自定义缩放校正。
3. 当前代码仅在拖拽过程中显示参考线，缩放过程中不会显示；若要补齐体验，可增加 `onResize` 并复用 `updateSnapsSafely`。
4. 当前 `snapToGrid` 的阈值等于网格步长；由于任意点到最近网格线的距离至多为半个步长，正数网格下实际上每次都会吸附到最近网格。若产品希望存在“不吸附区”，应将阈值降至小于 `step / 2` 的值。
5. 对文本输入、按钮、图表等内部可交互物料，应测试拖拽手柄和鼠标事件是否冲突；必要时利用 `react-rnd` 的 `cancel` 或 `dragHandleClassName` 指定不可拖拽区域或专用拖拽区域。
6. `style` 的兜底值只保障渲染安全，并不会自动写回 Schema。新建节点时仍应提供完整的布局样式，避免下次由其它逻辑读取时出现不一致。

## 8. 相关文件

| 文件 | 关系 |
| --- | --- |
| `fronted/src/core/rnd/RndItem.tsx` | 本组件实现。 |
| `fronted/src/core/render/render.tsx` | 编辑模式下创建 `RndItem`，预览模式绕过它。 |
| `fronted/src/core/rnd/SelectionOverlay.tsx` | 选中态的边框、名称和操作按钮。 |
| `fronted/src/core/rnd/AiEditInput.tsx` | 选中态的 AI 精确编辑输入框。 |
| `fronted/src/core/utils/grid.ts` | 网格大小规范化与吸附计算。 |
| `fronted/src/store/schema-store.ts` | Schema、选中节点和增删改操作。 |
| `fronted/src/store/guide-store.ts` | 参考线高亮状态。 |
| `fronted/src/core/schema/basic.ts`、`types.ts` | 节点及其布局字段的类型定义。 |
