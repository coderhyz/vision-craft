import {
    Navigate,
    Outlet,
    createBrowserRouter,
    isRouteErrorResponse,
    useLocation,
    useRouteError,
} from "react-router-dom";
import { lazy, Suspense, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Result, Spin, message } from "antd";
// 首页
export const Home = lazy(() => import("../components/index/home"));
// 登录页
export const AuthPage = lazy(() => import("../components/login/auth-page"));
// 项目列表页
export const ProjectList = lazy(() => import("../components/projects/project-list"));
// 编辑器页
export const Editor = lazy(() => import("../components/editor/Index"));
// 预览页
export const Preview = lazy(() => import("../components/preview/preview-page"));
// 路由懒加载的统一兜底，让首屏不再空白
const RouteFallback = () => {

    return (<>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-950 text-slate-200">
            {/* 加载中 */}
            <Spin size="large" />
            <div>页面加载中，请稍候…</div>
        </div>
    </>)
}



// 捕获路由异常，避免白屏并给出可操作入口
const RouteErrorBoundary = () => {
    // 路由的错误信息
    const error = useRouteError();
    // 是否是404错误
    const is404 = isRouteErrorResponse(error) && error.status === 404;
    const navigate = useNavigate();
    return (
        // 路由错误的结果页面
        <Result
            status={is404 ? "404" : "500"}
            title={is404 ? "页面不存在" : "页面出错了"}
            subTitle="请重试或返回首页"
            extra={
                <Button
                    type="primary"
                    onClick={() => {
                        navigate("/");
                    }}
                >
                    返回首页
                </Button>
            }
        />
    );
};
// 受保护区域的通用守卫：无 token 时提醒并拉回登录
const AuthGuard = () => {
    // 当前路由的信息
    const location = useLocation();
    // 这里直接从 localStorage 读取 token
    const hasToken = Boolean(localStorage.getItem("token"));
    const warnedRef = useRef(false);
    console.log("AuthGuard: hasToken =", hasToken, "location =", location);
    useEffect(() => {
        if (!hasToken && !warnedRef.current) {
            warnedRef.current = true;
            message.warning("请先登录后访问该页面");
        }
    }, [hasToken]);

    if (!hasToken) {
        // 适合根据渲染条件重定向
        return <Navigate to="/auth"
            replace
            state={{
                from: location
            }} />;
    }

    return <Outlet />;
};
// 根容器，负责为所有懒加载页面提供 Suspense 兜底
const RouteContainer = () => (
    <Suspense fallback={<RouteFallback />}>
        <Outlet />
    </Suspense>
);
// eslint-disable-next-line react-refresh/only-export-components
export const routerFallbackElement = <RouteFallback />;

// eslint-disable-next-line react-refresh/only-export-components
export const router = createBrowserRouter([
    {
        // 全局的根路由，负责提供 Suspense 兜底，懒加载路由
        element: <RouteContainer />,
        // 全局路由错误边界，捕获所有子路由的异常
        errorElement: <RouteErrorBoundary />,
        children: [
            {
                path: "/",
                Component: Home,
            },
            {
                path: "/auth",
                Component: AuthPage,
            },
            {
                // 受保护的路由区域，未登录用户会被重定向到登录页
                element: <AuthGuard />,
                children: [
                    {
                        path: "/projects",
                        Component: ProjectList,
                    },
                    {
                        path: "/editor/:id",
                        Component: Editor,
                    },
                    {
                        path: "/preview/:id",
                        Component: Preview,
                    },
                ],
            },
        ],
    },
]);