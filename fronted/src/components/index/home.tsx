import { useMemo } from "react";
import { Zap, Layers, Eye } from "lucide-react";
import { NavLink } from "react-router-dom";
export default function Home() {
    const highlights = useMemo(
        () => [
            {
                title: "所见即所得的可视化搭建",
                desc: "通过拖拽组件、配置属性即可完成数据大屏搭建，无需手写繁琐样式。",
                icon: <Layers className="h-5 w-5" />,
                iconBg: "bg-brand-50 text-brand-500",
            },
            {
                title: "丰富物料与图表生态",
                desc: "内置基础组件与多种 ECharts 图表，支持扩展自定义物料与主题。",
                icon: <Zap className="h-5 w-5" />,
                iconBg: "bg-amber-50 text-amber-500",
            },
            {
                title: "实时预览与发布",
                desc: "编辑/预览一键切换，结合后端保存与发布能力，让团队协作更高效。",
                icon: <Eye className="h-5 w-5" />,
                iconBg: "bg-emerald-50 text-emerald-500",
            },
        ],
        [],
    );

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-800">
            {/* 顶部淡雅装饰 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-100/30 rounded-full blur-[100px] pointer-events-none" />

            {/* 导航 */}
            <header className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-sm font-bold text-white shadow-brand-soft">
                        VC
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-slate-800">
                            Vision-Craft
                        </div>
                        <div className="text-xs text-slate-400">
                            可视化体验打造平台
                        </div>
                    </div>
                </div>
                <NavLink to="/auth" className="vc-btn-ghost text-sm">
                    登录 / 注册
                </NavLink>
            </header>

            {/* Hero */}
            <section className="relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 animate-fade-in">
                    <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-xs font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                        新一代可视化搭建 · 拖拽驱动 · 极速上线
                    </p>
                    <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-slate-900">
                        用 Vision-Craft
                        <br />
                        让数据体验
                        <span className="text-brand-500">一步到位</span>
                    </h1>
                    <p className="text-slate-500 text-lg leading-relaxed max-w-lg">
                        为产品、运营、数据团队打造的可视化搭建平台。拖拽组件、连接数据源、实时预览与发布，帮助你快速交付高品质数据大屏与业务看板。
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <a href="/auth" className="vc-btn">
                            开始体验
                        </a>
                    </div>
                    <div className="flex flex-wrap gap-5 text-sm text-slate-400">
                        {["丰富物料", "图表主题", "实时预览", "团队协作"].map(
                            (tag) => (
                                <span key={tag} className="flex items-center gap-1.5">
                                    <span className="h-1 w-1 rounded-full bg-brand-300" />
                                    {tag}
                                </span>
                            ),
                        )}
                    </div>
                </div>

                <div className="relative animate-slide-up">
                    {/* 示意卡片 */}
                    <div className="vc-card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5">
                                <span className="h-3 w-3 rounded-full bg-red-300" />
                                <span className="h-3 w-3 rounded-full bg-amber-300" />
                                <span className="h-3 w-3 rounded-full bg-emerald-300" />
                            </div>
                            <span className="text-slate-400 text-xs">
                                实时预览
                            </span>
                        </div>
                        <div className="aspect-video rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 p-4 relative overflow-hidden">
                            <div className="grid grid-cols-2 gap-3 h-full">
                                <div className="rounded-lg bg-white border border-slate-100 p-3 flex flex-col justify-between shadow-soft">
                                    <div className="text-xs text-slate-400 font-medium">实时指标</div>
                                    <div className="text-2xl font-bold text-brand-500">92.4%</div>
                                    <div className="text-xs text-emerald-500">▲ 同比 +12.3%</div>
                                </div>
                                <div className="rounded-lg bg-white border border-slate-100 p-3 shadow-soft">
                                    <div className="text-xs text-slate-400 font-medium mb-2">流量趋势</div>
                                    <div className="w-full h-20 rounded bg-gradient-to-t from-brand-100/60 to-brand-50/30 relative overflow-hidden">
                                        <svg className="absolute bottom-0 w-full h-14" viewBox="0 0 200 60" preserveAspectRatio="none">
                                            <path d="M0,50 Q25,20 50,35 T100,15 T150,30 T200,10" fill="none" stroke="#6366f1" strokeWidth="2" opacity="0.5" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-white border border-slate-100 p-3 shadow-soft">
                                    <div className="text-xs text-slate-400 font-medium mb-2">销售分布</div>
                                    <div className="w-full h-20 bg-gradient-to-t from-emerald-100/60 to-emerald-50/30 rounded" />
                                </div>
                                <div className="rounded-lg bg-white border border-slate-100 p-3 flex flex-col gap-2 shadow-soft">
                                    <div className="text-xs text-slate-400 font-medium">即拖即用</div>
                                    <div className="text-xs text-slate-500 leading-relaxed">
                                        拖拽组件、调整样式、绑定数据，几分钟即可上线。
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 卖点卡片 */}
            <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
                <div className="flex flex-col md:flex-row gap-5">
                    {highlights.map((item, index) => (
                        <div
                            key={item.title}
                            className="vc-card p-6 animate-slide-up"
                            style={{ animationDelay: `${index * 80}ms` }}
                        >
                            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${item.iconBg}`}>
                                {item.icon}
                            </div>
                            <div className="text-base font-semibold mb-2 text-slate-800">
                                {item.title}
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
