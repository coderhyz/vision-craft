import type React from "react";
import { AlignJustify, Box, Clock3, Image, MousePointerClick, TrendingUp, Activity, Timer, Minus, Bell, TagIcon, UserCircle, Star, ToggleLeft } from "lucide-react";
import DraggableItem from "@/core/dnd-kit/DraggableItem";

interface BaseComponentItem {
    type: string; // 组件类型
    name: string; // 组件名称
    icon: React.ReactNode; // 组件图标
}
// 基础组件
function PanelItem({ type, name, icon }: BaseComponentItem) {
    return (
        // 可拖拽的子项 传递的都是组件的类型、名称、图标
        // DraggableItem 组件是一个封装了 dnd-kit 的拖拽源组件，它会把子元素注册为可拖拽的元素，并在拖拽时显示一个静态预览。
        // 这里的 id 是组件的类型，例如 "Text"，用于标识拖拽源。
        <DraggableItem id={type}>
            {/* children */}
            <div className="
                w-[100px] h-[100px] flex flex-col items-center justify-evenly 
                rounded-lg border border-slate-200 bg-white cursor-grab
                text-slate-500 text-xs transition-all duration-200 
                hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-600 active:scale-95 shadow-soft">
                {/*  组件图标 */}
                <div>{icon}</div>
                {/* 组件名称 */}
                <p>{name}</p>
            </div>
        </DraggableItem>
    );
}

export default function BasicPanel() {
    const component: BaseComponentItem[] = [
        { type: "Text", name: "文字组件", icon: <AlignJustify className="h-5 w-5" /> },
        { type: "Image", name: "图片组件", icon: <Image className="h-5 w-5" /> },
        { type: "Button", name: "按钮组件", icon: <MousePointerClick className="h-5 w-5" /> },
        { type: "Clock", name: "时钟组件", icon: <Clock3 className="h-5 w-5" /> },
        { type: "StatisticCard", name: "指标卡", icon: <TrendingUp className="h-5 w-5" /> },
        { type: "ProgressBar", name: "进度条", icon: <Activity className="h-5 w-5" /> },
        { type: "Countdown", name: "倒计时", icon: <Timer className="h-5 w-5" /> },
        { type: "Divider", name: "分割线", icon: <Minus className="h-5 w-5" /> },
        { type: "Badge", name: "徽标数", icon: <Bell className="h-5 w-5" /> },
        { type: "Tag", name: "标签", icon: <TagIcon className="h-5 w-5" /> },
        { type: "Avatar", name: "头像", icon: <UserCircle className="h-5 w-5" /> },
        { type: "Rate", name: "评分", icon: <Star className="h-5 w-5" /> },
    ];

    return (
        <div className="w-[245px]  h-full min-h-0 grid grid-cols-2 gap-3 grid-rows-component content-start
        overflow-y-auto p-3 ">
            {component.map((item) => {
                // 展开语法 
                return <PanelItem key={item.type}  {...item} />
            })}
        </div>
    );
}
