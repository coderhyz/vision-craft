import type { PageDSL, } from "./page";
import type { ComponentNode, ContainerComponent } from "./basic";
// 所有组件类型枚举
export type ComponentType =
    | "Text"
    | "Image"
    | "Button"
    | "Container"
    | "Clock"
    | "StatisticCard"
    | "ProgressBar"
    | "Countdown"
    | "Divider"
    | "Badge"
    | "Tag"
    | "Avatar"
    | "Rate"
    | "Switch"
    | "BarChart"
    | "MultiBarChart"
    | "LineChart"
    | "PieChart"
    | "ScatterChart"
    | "BubbleChart"
    | "AreaChart"
    | "MultiLineChart"
    | "HorizontalBarChart"
    | "RosePieChart"
    | "RadarChart"
    | "FunnelChart"
    | "GaugeChart"
    | "TreemapChart";

/**
* 基础组件节点接口
* 所有的具体组件都继承自这个接口
*/
export interface BaseComponentNode {
    // 核心标识
    id: string; // UUID，组件在当前页面的唯一标识
    type: ComponentType; // 组件类型枚举，用于渲染器决定渲染哪个 React 组件
    name?: string; // 组件在图层面板显示的名称 (如: "我的柱状图")
    isHidden?: boolean; // 是否隐藏
    isLocked?: boolean; // 是否锁定（防误触）
    // 样式属性 (CSS + 布局)
    style?: {
        // 基础定位与尺寸 (大屏强依赖绝对定位)
        top: number; // 左偏移
        left: number; // 上偏移
        width: number; // 宽度
        height: number; // 高度
        zIndex: number; // 层级

        // 视觉样式
        opacity?: number; // 透明度
        backgroundColor?: string; // 背景颜色
        border?: string; // 边框样式
        borderRadius?: number; // 圆角
        // ... 其他 CSS 属性
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    };

}



/**
 * 通用图表基础属性
 * - 只保留纯视觉/交互配置，dataSource 已提升到组件顶层
 */
export interface ChartBaseProps {
    title: string;
    // 视觉与交互
    showGrid?: boolean; // 是否显示网格
    showLegend: boolean; // 是否显示图例
    tooltipEnabled: boolean; // 是否启用提示框
}
/**
 * 通用图表数据源配置
 */
export interface ChartDataSource {
    sourceType: "static" | "api"; // 数据来源：静态JSON 或 API接口
    data?: unknown[]; // 静态数据
    apiUrl?: string; // API 地址
    refreshInterval?: number; // 自动刷新间隔
    // 字段映射（统一用语义化 key，如 x/y/name/value/series/category/size）
    fieldMapping?: Record<string, string>;
}
/**
 * 基础图表组件接口 继承自 BaseComponentNode
 * - 具体图表通过泛型约束自己的 props 结构
 * - dataSource 在组件顶层，不在 props 中
 */
export interface BaseChartComponent<
    TProps extends ChartBaseProps = ChartBaseProps,
> extends BaseComponentNode {
    type:
    | "BarChart" //柱状图
    | "MultiBarChart" //多柱状图
    | "LineChart" //折线图
    | "PieChart" //饼图
    | "ScatterChart" //散点图
    | "BubbleChart" //气泡图
    | "AreaChart" //面积图
    | "MultiLineChart" //多折线图
    | "HorizontalBarChart" //水平柱状图
    | "RosePieChart" //玫瑰饼图
    | "RadarChart" //雷达图
    | "FunnelChart" //漏斗图
    | "GaugeChart" //仪表图
    | "TreemapChart"; //树状图
    props: TProps; // 具体图表的 props 结构
    dataSource?: ChartDataSource;
}
/**
 * renderer对所有组件传入的props类型
 */
export interface RendererProps {
    node: ComponentNode | PageDSL;
    mode?: "edit" | "preview";
}
/**
 * renderer对容器组件传入的props类型
 */
export interface ContainerRendererProps extends RendererProps {
    node: ContainerComponent | PageDSL;
    renderChildren: (children: ComponentNode[]) => React.ReactNode;
}