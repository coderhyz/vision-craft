// 默认吸附网格尺寸（同时充当吸附阈值）
export const DEFAULT_GRID_SIZE = 15;

/**
 * 规范化 DSL 中的网格尺寸 / 吸附阈值
 * - 非法值回退到默认 6px，避免拖拽计算异常
 */
export function normalizeGridSize(gridSize?: number): number {
    // 只接受大于 0 的有限数；否则回退默认值
    if (
        typeof gridSize === "number" &&
        Number.isFinite(gridSize) &&
        gridSize > 0
    ) {
        return gridSize;
    }
    return DEFAULT_GRID_SIZE;
}

/**
 * 将数值吸附到网格
 * - gridSize 同时作为网格步进与吸附阈值
 * - 当距离最近网格线不超过阈值时吸附，否则维持原值
 * @param value 要吸附的数值
 * @param gridSize 网格尺寸
 * @returns 吸附后的数值
 */
export function snapToGrid(value: number, gridSize?: number) {
    // 一个网格的边长
    const step = normalizeGridSize(gridSize);
    // 距离左侧或下侧的偏移，总长对边长取余，将讨论范围集中在一个单元格内
    const remainder = value % step;
    // 左侧或上侧网格线
    const lower = value - remainder;
    // 右侧或下侧网格线
    const upper = lower + step;

    // 距离左侧或下侧网格线的距离
    const distanceToLower = Math.abs(remainder);
    // 距离右侧或上侧网格线的距离
    const distanceToUpper = Math.abs(step - remainder);
    // 离谁近吸附谁
    const nearest = distanceToLower <= distanceToUpper ? lower : upper;
    // 距离最近的网格线的距离
    const distance = Math.min(distanceToLower, distanceToUpper);

    const threshold = step; // 使用 DSL 配置的步进作为吸附阈值
    const isSnapped = distance <= threshold; // 是否触发吸附

    return {
        value: isSnapped ? nearest : value, // 吸附后/原始值
        isSnapped,
        step,
    };
}
