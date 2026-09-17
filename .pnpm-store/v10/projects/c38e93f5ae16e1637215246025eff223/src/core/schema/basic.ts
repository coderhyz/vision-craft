// 基础的组件
// 所有的组件都是由这个组件派生
import type { BaseComponentNode } from "./types";
import type {
    BarChartComponent,
    LineChartComponent,
    MultiBarChartComponent,
    PieChartComponent,
    ScatterChartComponent,
    BubbleChartComponent,
    AreaChartComponent,
    MultiLineChartComponent,
    HorizontalBarChartComponent,
    RosePieChartComponent,
    RadarChartComponent,
    FunnelChartComponent,
    GaugeChartComponent,
    TreemapChartComponent,
} from "./chart";

/**
 * 文字组件
 */
type AlignCN = "左" | "居中" | "右";
type VerticalAlignCN = "上" | "居中" | "下";
type TrendCN = "上升" | "下降" | "持平";
// 先从一个text组件开始，后续再扩展其他组件
export interface TextComponent extends BaseComponentNode {
    type: "Text"; //组件类型收窄
    props: {
        content: string; // 内容
        fontSize: number; // 字体大小
        fontWeight: number; // 字体粗细
        color: string; // 颜色
        textAlign: AlignCN; // 对齐方式
        verticalAlign?: VerticalAlignCN; // 垂直对齐方式
    };
}

/**
 * 图片组件
 */
export interface ImageComponent extends BaseComponentNode {
    type: "Image";
    props: {
        src: string; // 图片地址
        alt?: string; // 备用文案
        fit: "fill" | "contain" | "cover" | "none" | "scale-down"; // 对齐模式
        preview?: boolean; // 是否启用预览
    };
}

/**
 * 按钮组件
 */
export interface ButtonComponent extends BaseComponentNode {
    type: "Button";
    props: {
        text: string; // 按钮文案
        type: "default" | "primary" | "dashed" | "link" | "text"; // 视觉类型
        size: "small" | "middle" | "large"; // 尺寸
        danger?: boolean; // 危险态
        block?: boolean; // 是否通栏
        disabled?: boolean; // 是否禁用
    };
}

/**
 * 时钟组件
 */
export interface ClockComponent extends BaseComponentNode {
    type: "Clock";
    props: {
        format: string; // 时间格式，例如：HH:mm:ss
        fontSize: number; // 字体大小
        fontWeight: number; // 字体粗细
        color: string; // 颜色
        textAlign: AlignCN; // 对齐方式
        showSeconds?: boolean; // 是否显示秒
    };
}

/**
 * KPI 统计卡组件
 */
export interface StatisticCardComponent extends BaseComponentNode {
    type: "StatisticCard";
    props: {
        title: string; // 主标题
        subtitle?: string; // 副标题
        value: number; // 数值
        prefix?: string; // 前缀
        suffix?: string; // 后缀
        valueColor: string; // 数值颜色
        align: AlignCN; // 对齐
        trend?: TrendCN; // 趋势方向
        showTrendIcon?: boolean; // 显示趋势图标
        trendColorUp?: string; // 上升颜色
        trendColorDown?: string; // 下降颜色
        animated?: boolean; // 数值动画
        valueFontSize: number; // 数值字体大小
        titleFontSize: number; // 标题字体大小
        subtitleFontSize: number; // 副标题字体大小
    };
}

/**
 * 进度条组件
 */
export interface ProgressBarComponent extends BaseComponentNode {
    type: "ProgressBar";
    props: {
        value: number; // 当前值
        max: number; // 最大值
        showLabel: boolean; // 显示文案
        strokeColor: string; // 进度条颜色
        trackColor: string; // 底色
        strokeWidth: number; // 粗细
        rounded: boolean; // 圆角
        animation: boolean; // 动画过渡
    };
}

/**
 * 倒计时组件
 */
export interface CountdownComponent extends BaseComponentNode {
    type: "Countdown";
    props: {
        targetTime: string; // 目标时间字符串（用户填写 YYYY-MM-DD HH:mm:ss）
        format: string; // 展示格式，如 HH:mm:ss
        prefix?: string; // 前缀文案
        suffix?: string; // 后缀文案
        finishedText?: string; // 结束文案
        fontSize: number; // 字号
        fontWeight: number; // 字重
        color: string; // 颜色
        textAlign: AlignCN; // 对齐
        showMilliseconds?: boolean; // 是否显示毫秒
    };
}

/**
 * 分割线组件
 */
export interface DividerComponent extends BaseComponentNode {
    type: "Divider";
    props: {
        direction: "horizontal" | "vertical"; // 方向
        text?: string; // 中间文字
        textPosition: "left" | "center" | "right"; // 文字位置
        lineStyle: "solid" | "dashed" | "dotted"; // 线型
        color: string; // 颜色
    };
}

/**
 * 徽标数组件
 */
export interface BadgeComponent extends BaseComponentNode {
    type: "Badge";
    props: {
        count: number; // 展示的数字
        overflowCount: number; // 封顶数字
        showZero: boolean; // 值为 0 时是否显示
        dot: boolean; // 不展示数字，只展示一个点
        color: string; // 自定义小圆点颜色
        text: string; // 正文内容
        fontSize: number; // 正文字号
    };
}

/**
 * 标签组件
 */
export interface TagComponent extends BaseComponentNode {
    type: "Tag";
    props: {
        text: string; // 标签文字
        color: string; // 标签颜色
        bordered: boolean; // 是否有边框
        fontSize: number; // 字号
    };
}

/**
 * 头像组件
 */
export interface AvatarComponent extends BaseComponentNode {
    type: "Avatar";
    props: {
        src?: string; // 图片地址
        text: string; // 文字（无图时展示）
        shape: "circle" | "square"; // 形状
        size: number; // 尺寸 px
        backgroundColor: string; // 背景色
        color: string; // 文字颜色
    };
}

/**
 * 评分组件
 */
export interface RateComponent extends BaseComponentNode {
    type: "Rate";
    props: {
        value: number; // 当前值
        count: number; // 总星数
        allowHalf: boolean; // 允许半选
        color: string; // 选中颜色
        size: number; // 星星大小 px
    };
}

/**
 * 开关组件
 */
export interface SwitchComponent extends BaseComponentNode {
    type: "Switch";
    props: {
        checked: boolean; // 是否选中
        checkedText: string; // 选中时文字
        uncheckedText: string; // 未选中时文字
        size: "default" | "small"; // 尺寸
        disabled: boolean; // 是否禁用
    };
}

/**
 * 容器组件
 * 核心：拥有 children 属性
 */
export interface ContainerComponent extends BaseComponentNode {
    type: "Container";
    props?: {
        layoutMode: "absolute" | "flex"; // 布局模式：自由拖拽 vs 自动排列
        gap?: number; // flex 模式下的间距
    };
    // 核心关系定义：递归结构
    children?: ComponentNode[];
}

// 所有可能的组件类型集合
export type ComponentNode =
    | TextComponent
    | ImageComponent
    | ButtonComponent
    | ClockComponent
    | StatisticCardComponent
    | ProgressBarComponent
    | CountdownComponent
    | DividerComponent
    | BadgeComponent
    | TagComponent
    | AvatarComponent
    | RateComponent
    | SwitchComponent
    | ContainerComponent
    | BarChartComponent
    | MultiBarChartComponent
    | LineChartComponent
    | PieChartComponent
    | ScatterChartComponent
    | BubbleChartComponent
    | AreaChartComponent
    | MultiLineChartComponent
    | HorizontalBarChartComponent
    | RosePieChartComponent
    | RadarChartComponent
    | FunnelChartComponent
    | GaugeChartComponent
    | TreemapChartComponent;