import { useState } from "react";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import { Puzzle, ChartArea } from "lucide-react";
import BasicPanel from "./BasicPanel";
import ChartPanel from "./ChartPanel";

type MenuItem = Required<MenuProps>["items"][number];
// 菜单项类型
type ItemType = "basic" | "charts-bar" | "charts-line" | "charts-pie" | "charts-scatter" | "charts-other";
// 菜单项
/**
 * 主要配置
 * key: 菜单项的唯一标识
 * icon: 菜单项的图标
 * label: 菜单项的显示文本
 * children: 子菜单项的数组
 */
const items: MenuItem[] = [
    {
        key: "basic",
        icon: <Puzzle className="h-4 w-4" />,
        label: "基础组件"
    },
    {
        key: "charts",
        icon: <ChartArea className="h-4 w-4" />,
        label: "图表组件",
        children: [
            { key: "charts-bar", label: "柱状图" },
            { key: "charts-line", label: "折线图" },
            { key: "charts-pie", label: "饼图" },
            { key: "charts-scatter", label: "散点/气泡图" },
            { key: "charts-other", label: "其他图表" },
        ],
    },
];

/**
 * 图表菜单键值映射
 */
const chartMenuKeyMap: Partial<Record<ItemType, "bar" | "line" | "pie" | "scatter" | "other">> = {
    "charts-bar": "bar",
    "charts-line": "line",
    "charts-pie": "pie",
    "charts-scatter": "scatter",
    "charts-other": "other",
};
// 物料区域
export default function SidebarMenu({ className }: { className?: string }) {
    // 菜单栏的选中项
    const [selectedKey, setSelectedKey] = useState<ItemType>("basic");
    const handleItemSelected: MenuProps["onSelect"] = ({ key }) => {
        // 更新选中的菜单项
        setSelectedKey(key as ItemType);
    };
    // 根据选中的菜单项获取对应的图表类别
    const chartCategory = chartMenuKeyMap[selectedKey];

    return (
        <div className={`flex min-h-0 overflow-hidden ${className}`}>
            {/* 菜单组件 */}
            <Menu className="w-[155px] h-full shrink-0 overflow-y-auto"
                mode="inline"
                inlineIndent={16}
                // 菜单项目
                items={items}
                // 选中的菜单项
                selectedKeys={[selectedKey]}
                // 默认展开的菜单项
                defaultOpenKeys={["charts"]}
                // 菜单项点击事件
                onSelect={handleItemSelected}
            />
            {/* 组件面板 */}
            {selectedKey === "basic" && <BasicPanel />}
            {chartCategory && <ChartPanel category={chartCategory} />}
        </div>
    );
}
