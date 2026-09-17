import type { FormHints } from "./types";
// 表单提示配置
export const textHints: FormHints = {
    content: { title: "文本内容", widget: "textarea", placeholder: "请输入文本内容" },
    fontSize: { title: "字体大小", min: 12, max: 72 },
    fontWeight: { title: "字体粗细", enum: [300, 400, 500, 600, 700] },
    color: { title: "文字颜色", widget: "color", placeholder: "例如：#000000" },
    textAlign: { title: "对齐方式", enum: ["左", "居中", "右"], widget: "radio" },
};

export const imageHints: FormHints = {
    src: { title: "图片地址", placeholder: "请输入图片链接" },
    alt: { title: "备用文本", placeholder: "加载失败时的提示" },
    fit: { title: "填充方式", enum: ["fill", "contain", "cover", "none", "scale-down"], widget: "select" },
    preview: { title: "启用预览" },
};

export const buttonHints: FormHints = {
    text: { title: "按钮文本", placeholder: "请输入按钮内容" },
    type: { title: "按钮类型", enum: ["default", "primary", "dashed", "link", "text"], widget: "radio" },
    size: { title: "按钮尺寸", enum: ["small", "middle", "large"], widget: "radio" },
    danger: { title: "危险态" },
    block: { title: "通栏展示" },
    disabled: { title: "禁用" },
};

export const clockHints: FormHints = {
    format: { title: "时间格式", placeholder: "例如：HH:mm:ss" },
    fontSize: { title: "字体大小", min: 12, max: 72 },
    fontWeight: { title: "字体粗细", enum: [300, 400, 500, 600, 700] },
    color: { title: "文字颜色", widget: "color", placeholder: "例如：#000000" },
    textAlign: { title: "对齐方式", enum: ["左", "居中", "右"], widget: "radio" },
    showSeconds: { title: "显示秒" },
};

export const statisticCardHints: FormHints = {
    title: { title: "主标题", placeholder: "请输入主标题" },
    subtitle: { title: "副标题", placeholder: "可选的副标题" },
    value: { title: "数值" },
    prefix: { title: "前缀", placeholder: "如 ￥ / ¥" },
    suffix: { title: "后缀", placeholder: "如 % / 次" },
    valueColor: { title: "数值颜色", widget: "color", placeholder: "例如：#1f1f1f" },
    align: { title: "对齐方式", enum: ["左", "居中", "右"], widget: "radio" },
    trend: { title: "趋势方向", enum: ["上升", "下降", "持平"], widget: "radio" },
    showTrendIcon: { title: "显示趋势图标" },
    trendColorUp: { title: "上升颜色", widget: "color", placeholder: "例如：#52c41a" },
    trendColorDown: { title: "下降颜色", widget: "color", placeholder: "例如：#ff4d4f" },
    animated: { title: "启用数值动画" },
    valueFontSize: { title: "数值字号", min: 12, max: 72 },
    titleFontSize: { title: "标题字号", min: 10, max: 48 },
    subtitleFontSize: { title: "副标题字号", min: 10, max: 36 },
};

export const progressBarHints: FormHints = {
    value: { title: "当前值", min: 0 },
    max: { title: "最大值", min: 1 },
    showLabel: { title: "显示文本" },
    strokeColor: { title: "进度颜色", widget: "color", placeholder: "例如：#1677ff" },
    trackColor: { title: "轨道颜色", widget: "color", placeholder: "例如：#f5f5f5" },
    strokeWidth: { title: "进度条粗细", min: 2, max: 40 },
    rounded: { title: "圆角" },
    animation: { title: "平滑动画" },
};

export const countdownHints: FormHints = {
    targetTime: { title: "目标时间", placeholder: "YYYY-MM-DD HH:mm:ss" },
    format: { title: "格式模板", placeholder: "如 HH:mm:ss" },
    prefix: { title: "前缀", placeholder: "如：距离" },
    suffix: { title: "后缀", placeholder: "如：结束" },
    finishedText: { title: "结束文案", placeholder: "如：已结束" },
    fontSize: { title: "字体大小", min: 12, max: 72 },
    fontWeight: { title: "字体粗细", enum: [300, 400, 500, 600, 700] },
    color: { title: "文字颜色", widget: "color", placeholder: "例如：#000000" },
    textAlign: { title: "对齐方式", enum: ["左", "居中", "右"], widget: "radio" },
    showMilliseconds: { title: "显示毫秒" },
};

export const dividerHints: FormHints = {
    direction: { title: "方向", enum: ["horizontal", "vertical"], widget: "radio" },
    text: { title: "中间文字", placeholder: "可选" },
    textPosition: { title: "文字位置", enum: ["left", "center", "right"], widget: "radio" },
    lineStyle: { title: "线型", enum: ["solid", "dashed", "dotted"], widget: "radio" },
    color: { title: "线条颜色", widget: "color", placeholder: "例如：#d9d9d9" },
};

export const badgeHints: FormHints = {
    count: { title: "展示数字", min: 0 },
    overflowCount: { title: "封顶数字", min: 1, description: "超出此值显示为 xx+" },
    showZero: { title: "零值显示", description: "值为 0 时是否仍然展示" },
    dot: { title: "小红点模式", description: "开启后不展示数字，只显示一个点" },
    color: { title: "徽标颜色", widget: "color", placeholder: "例如：#ff4d4f" },
    text: { title: "正文内容", placeholder: "请输入正文" },
    fontSize: { title: "正文字号", min: 12, max: 72 },
};

export const tagHints: FormHints = {
    text: { title: "标签文字", placeholder: "请输入标签内容" },
    color: { title: "标签颜色", widget: "color", placeholder: "例如：#1677ff" },
    bordered: { title: "显示边框" },
    fontSize: { title: "字号", min: 12, max: 48 },
};

export const avatarHints: FormHints = {
    src: { title: "图片地址", placeholder: "可选，留空则显示文字" },
    text: { title: "文字", placeholder: "无图片时展示" },
    shape: { title: "形状", enum: ["circle", "square"], widget: "radio" },
    size: { title: "尺寸", min: 16, max: 128 },
    backgroundColor: { title: "背景色", widget: "color", placeholder: "例如：#1677ff" },
    color: { title: "文字颜色", widget: "color", placeholder: "例如：#ffffff" },
};

export const rateHints: FormHints = {
    value: { title: "评分值", min: 0 },
    count: { title: "总星数", min: 1, max: 10 },
    allowHalf: { title: "允许半选" },
    color: { title: "选中颜色", widget: "color", placeholder: "例如：#fadb14" },
    size: { title: "星星大小", min: 12, max: 64 },
};

export const switchHints: FormHints = {
    checked: { title: "选中状态" },
    checkedText: { title: "选中文字", placeholder: "如：开" },
    uncheckedText: { title: "未选中文字", placeholder: "如：关" },
    size: { title: "尺寸", enum: ["default", "small"], widget: "radio" },
    disabled: { title: "禁用" },
};
