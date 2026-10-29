import type { ComponentType } from "@/core/schema/types";

// 统一维护图表类型，供渲染器判断是否接入 API、属性面板判断是否显示数据源配置。
const chartTypes = new Set<ComponentType>([
    "BarChart", "MultiBarChart", "LineChart", "PieChart", "ScatterChart",
    "BubbleChart", "AreaChart", "MultiLineChart", "HorizontalBarChart",
    "RosePieChart", "RadarChart", "FunnelChart", "GaugeChart", "TreemapChart",
]);

export function isChartType(type: ComponentType | "RootContainer"): boolean {
    return type !== "RootContainer" && chartTypes.has(type);
}

// 一条数据是“字段名 -> 字段值”的对象。unknown 表示读到之后还需要判断实际类型。
export type ChartDataRow = Record<string, unknown>;

/**
 * 将未知响应统一转换为对象数组，例如：
 * [{ name: "A", value: 120 }]
 * { data: [{ name: "A", value: 120 }] }
 * { data: { list: [{ name: "A", value: 120 }] } }
 *
 * 这里只负责解析数据结构，不负责请求或 React 状态更新。
 */
export function parseChartApiData(payload: unknown): ChartDataRow[] {
    function findArray(value: unknown, depth: number): unknown[] | undefined {
        if (Array.isArray(value)) return value;
        // 限制包装层数，避免对异常深的返回结构一直递归查找。
        if (!value || typeof value !== "object" || depth > 4) return undefined;
        const record = value as Record<string, unknown>;
        for (const key of ["data", "list", "rows", "items"]) {
            const rows = findArray(record[key], depth + 1);
            if (rows) return rows;
        }
        return undefined;
    }

    const rows = findArray(payload, 0);
    // 图表按 item[fieldMapping.xxx] 取值，所以每条记录必须是对象。
    // 空数组 [] 是有效结果；[null]、[123]、[[1, 2]] 等格式则明确报错。
    if (!rows || rows.some((row) => !row || typeof row !== "object" || Array.isArray(row))) {
        throw new Error('接口需返回对象数组，例如 [{"name":"A","value":120}]，也支持 data、list、rows、items 包装。');
    }
    return rows as ChartDataRow[];
}
