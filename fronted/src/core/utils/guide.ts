/** 将父容器内的吸附坐标转换为 GuideLayer 使用的画布逻辑坐标。 */
export function getCanvasGuidePosition(
    element: HTMLElement,
    position: { left: number; top: number },
    scale: number,
) {
    const canvas = element.closest<HTMLElement>('[data-canvas-content="true"]');
    const parent = element.parentElement;
    if (!canvas || !parent) return position;

    const zoom = Number.isFinite(scale) && scale > 0 ? scale : 1;
    const canvasRect = canvas.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    // DOM 矩形已包含祖先容器的位移和滚动；仅补偿直接父容器自身的滚动。
    // 除以 zoom 还原逻辑坐标，GuideLayer 会统一乘回缩放比例。
    return {
        left: (parentRect.left - canvasRect.left) / zoom + parent.clientLeft - parent.scrollLeft + position.left,
        top: (parentRect.top - canvasRect.top) / zoom + parent.clientTop - parent.scrollTop + position.top,
    };
}
