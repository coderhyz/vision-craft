import { MousePointerClick } from "lucide-react";
// 画布为空的提示组件，提示用户从左侧拖拽组件到画布
export default function CanvasEmpty() {
    return (
        <div className="absolute box-border inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="flex min-h-64 w-[calc(100%_-_2rem)] max-w-md flex-col justify-center space-y-4 rounded-xl border border-dashed border-slate-200 bg-white/90  text-center shadow-soft backdrop-blur-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                    <MousePointerClick className="h-6 w-6" />
                </div>
                <div className="text-sm font-medium text-slate-700">画布为空</div>
                <p className="text-xs text-slate-400">从左侧拖拽组件到画布，或点击组件后再拖动进行布局。</p>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <span className="rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5">拖拽放置</span>
                    <span className="rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5">选中调整</span>
                </div>
            </div>
        </div>
    );
}
