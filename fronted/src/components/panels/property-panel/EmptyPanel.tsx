import { MousePointer2 } from "lucide-react";

export default function EmptyPanel() {
    return (
        <div className="h-full flex items-center justify-center px-4">
            <div className="w-full rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                    <MousePointer2 className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium text-slate-700">尚未选择组件</div>
                <p className="text-xs text-slate-400">点击左侧组件或画布节点后，这里会展示可配置的属性。</p>
            </div>
        </div>
    );
}
