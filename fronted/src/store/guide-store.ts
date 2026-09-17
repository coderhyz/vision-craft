import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type Orientation = "x" | "y";
interface SnapLine {
    orientation: Orientation; // 线的方向，x 表示竖线，y 表示横线
    value: number; // 线的位置，单位为像素
}
interface GuideState {
    activeSnaps: SnapLine[];
    setActiveSnaps: (
        snaps: SnapLine[],
    ) => void;
}

/**
 * 网格吸附高亮状态容器
 * - 仅记录当前被命中的网格线，用于 GuideLayer 高亮
 */
export const useGuideStore = create<GuideState>()(
    immer((set) => ({
        activeSnaps: [],//网格线的位置
        setActiveSnaps: (snaps) => {
            set((state) => {
                state.activeSnaps = snaps; // 更新当前吸附位置（高亮用）
            });
        },
    })),

);
