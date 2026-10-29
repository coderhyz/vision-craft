import { useMemo, useSyncExternalStore } from "react";
import type { ChartDataSource } from "@/core/schema/types";
import { parseChartApiData, type ChartDataRow } from "@/core/utils/chart-data-source";

/**
 * 阅读顺序：
 * 1. ApiSnapshot / ApiResource：约定共享数据的结构与操作方式。
 * 2. getApiResource：普通 TypeScript 函数，管理请求、订阅、轮询与取消。
 * 3. 文件末尾 useChartDataSource：真正的自定义 Hook，组合 React 内置 Hook。
 *
 * 图表和属性面板都要读取同一份接口数据。如果分别用 useState + useEffect
 * 请求，每次调用 Hook 都会有独立状态，默认不会共享请求结果。
 * 这里用模块级 Map 共享资源，再由 useSyncExternalStore 将变化同步给 React。
 */

/** 某一时刻的数据快照。只有内容变化时才创建新对象，供 React 判断是否更新。 */
interface ApiSnapshot {
    /** 已解析好的对象数组。刷新期间保留上一次成功返回的数据。 */
    data: ChartDataRow[];
    /** loading 只用于内部请求控制，不代表界面一定要显示加载提示。 */
    status: "idle" | "loading" | "success" | "error";
    error: string | null;
}

/** 一个共享请求资源，向 React 暴露“订阅变化、读取快照、手动刷新”三个入口。 */
interface ApiResource {
    /** React 传入通知函数；返回的函数负责取消本次订阅。 */
    subscribe: (listener: () => void) => () => void;
    getSnapshot: () => ApiSnapshot;
    reload: () => void;
}

// 空快照和兜底函数放在模块作用域，保持引用稳定。
// getSnapshot 在数据未变化时必须返回同一个对象，不能每次都返回新建的 {}。
const emptySnapshot: ApiSnapshot = { data: [], status: "idle", error: null };
const getEmptySnapshot = () => emptySnapshot;
// 静态数据无需订阅外部请求，但 Hook 仍要在每次渲染时按相同顺序调用。
const subscribeToNothing = () => () => { };
const doNothing = () => { };
// 这是共享的来源：同一模块的所有 Hook 调用都能访问这张表。
// key 包含组件 id、接口地址和刷新间隔，避免不同图表或不同配置串用数据。
const resources = new Map<string, ApiResource>();

/**
 * 获取或创建请求资源。此函数不是 Hook，也不依赖 React。
 * 创建资源时只准备状态与函数；首次订阅之后才启动请求。
 * 闭包中的 snapshot、listeners、定时器等由该资源的所有订阅者共享。
 */
function getApiResource(key: string, apiUrl: string, refreshSeconds: number): ApiResource {
    const existing = resources.get(key);
    if (existing) return existing;

    let snapshot: ApiSnapshot = apiUrl ? { ...emptySnapshot, status: "loading" } : emptySnapshot;
    // 通常包含画布和属性面板的订阅；Set 防止同一个通知函数重复加入。
    const listeners = new Set<() => void>();
    // 每次请求有自己的取消控制器，换地址、重新请求或卸载时可以中止旧请求。
    let controller: AbortController | undefined;
    // requestTimer 用于首次请求防抖和后续轮询；timeoutTimer 限制单次请求耗时。
    let requestTimer: ReturnType<typeof setTimeout> | undefined;
    let timeoutTimer: ReturnType<typeof setTimeout> | undefined;
    // 请求版本号。即使某次旧请求取消后仍返回，也不能覆盖较新的结果。
    let version = 0;

    /** 替换快照并通知订阅者；React 随后读取新快照，更新使用该数据的组件。 */
    function publish(next: ApiSnapshot) {
        snapshot = next;
        listeners.forEach((listener) => listener());
    }

    /** 首次加载、手动刷新与定时刷新共用这一条请求流程。 */
    async function load() {
        if (!apiUrl || listeners.size === 0) return;
        const currentVersion = ++version;
        // 手动刷新时撤销原有计划，并取消仍在进行的请求。
        clearTimeout(requestTimer);
        clearTimeout(timeoutTimer);
        controller?.abort();
        const requestController = new AbortController();
        controller = requestController;
        let timedOut = false;
        // 保留已有 data，只更新状态和错误；界面刷新时不必清空当前图表。
        publish({ ...snapshot, status: "loading", error: null });

        // 15 秒未完成就取消；catch 根据 timedOut 给出超时原因。
        timeoutTimer = setTimeout(() => {
            timedOut = true;
            requestController.abort();
        }, 15000);

        try {
            // 支持完整 HTTP(S) 地址，也支持相对于当前站点的 /api/... 地址。
            const url = new URL(apiUrl, window.location.href);
            if (url.protocol !== "http:" && url.protocol !== "https:") {
                throw new Error("接口地址必须使用 HTTP 或 HTTPS。");
            }
            // 外部数据接口不使用项目 http 实例，避免附带应用登录 token。
            const response = await fetch(url.href, {
                signal: requestController.signal,
                headers: { Accept: "application/json" },
                credentials: "omit",
                cache: "no-store",
            });
            // fetch 收到 HTTP 404/500 时也会正常返回 Response，需要手动检查状态码。
            if (!response.ok) throw new Error(`接口请求失败：HTTP ${response.status}`);
            let payload: unknown;
            try {
                payload = await response.json();
            } catch {
                if (requestController.signal.aborted) throw new Error("请求已取消");
                throw new Error("接口返回的内容不是有效 JSON。");
            }
            // 将直接数组、{ data: [...] } 等响应格式统一转换成图表需要的数组。
            const data = parseChartApiData(payload);
            if (currentVersion !== version) return;
            publish({ data, status: "success", error: null });
        } catch (error) {
            // 旧请求不再更新状态，避免显示过期错误，或覆盖新请求的成功结果。
            if (currentVersion !== version) return;
            const message = timedOut ? "接口请求超时，请稍后重试。"
                : error instanceof TypeError ? "请求失败，请检查接口地址、网络及跨域（CORS）配置。"
                    : error instanceof Error ? error.message : "接口请求失败。";
            publish({ ...snapshot, status: "error", error: message });
        } finally {
            // 只有当前请求能安排下一轮，旧请求的 finally 不能干扰新请求。
            if (currentVersion === version) {
                clearTimeout(timeoutTimer);
                controller = undefined;
                // 完成后再用 setTimeout 计时，而不是用 setInterval 不断叠加请求。
                // refreshSeconds 为 0 时只加载一次，不安排定时刷新。
                if (listeners.size > 0 && refreshSeconds > 0) {
                    requestTimer = setTimeout(() => void load(), refreshSeconds * 1000);
                }
            }
        }
    }

    const resource: ApiResource = {
        // 直接返回已缓存的快照，数据不变时保持对象引用不变。
        getSnapshot: () => snapshot,
        // void 表示此入口不返回 Promise；成功或失败由快照通知组件。
        reload: () => { void load(); },
        subscribe: (listener) => {
            listeners.add(listener);
            if (listeners.size === 1 && apiUrl) {
                // 只由第一个订阅者启动请求，其他组件复用这份资源。
                // 地址输入停止 300ms 后请求，避免每输入一个字符就发送一次。
                requestTimer = setTimeout(() => void load(), 300);
            }
            // React 卸载组件或切换资源时，会调用这里返回的清理函数。
            return () => {
                listeners.delete(listener);
                // 例如面板关闭但图表还在时，不能停止图表使用的轮询。
                if (listeners.size !== 0) return;
                // 最后一个订阅者离开后，使旧结果失效，再清理定时器和请求。
                version++;
                clearTimeout(requestTimer);
                clearTimeout(timeoutTimer);
                controller?.abort();
                controller = undefined;
                // 延迟到微任务再移除缓存：StrictMode 在开发时可能先清理再立即订阅。
                // 再次确认 Map 中仍是本资源，避免误删同 key 的其他资源。
                queueMicrotask(() => {
                    if (listeners.size === 0 && resources.get(key) === resource) resources.delete(key);
                });
            };
        },
    };
    resources.set(key, resource);
    return resource;
}

/**
 * 自定义 Hook：为组件统一提供 data、status、error、reload。
 *
 * 这里组合的是 useMemo + useSyncExternalStore，和组合 useState + useEffect
 * 一样属于自定义 Hook，只是数据保存在共享资源中，而不是组件自己的 state 中。
 *
 * @param componentId 图表实例 id。图表与其属性面板应传入相同的 id。
 * @param dataSource DSL 中的数据源配置。接口返回值不写回该配置的静态 data。
 */
export function useChartDataSource(componentId: string, dataSource?: ChartDataSource) {
    const isApi = dataSource?.sourceType === "api";
    const apiUrl = dataSource?.apiUrl?.trim() ?? "";
    const configuredInterval = dataSource?.refreshInterval ?? 0;
    const refreshSeconds = Number.isFinite(configuredInterval) && configuredInterval > 0 ? configuredInterval : 0;
    // useMemo 为当前 Hook 调用保存所选资源，配置未变时保持引用稳定。
    // 多个组件之间的共享由上面的 resources Map 实现，不是由 useMemo 实现。
    // 改字段映射不影响请求参数，所以没有把 fieldMapping 放进依赖数组。
    const resource = useMemo(() => {
        if (!isApi) return undefined;
        const key = JSON.stringify([componentId, apiUrl, refreshSeconds]);
        return getApiResource(key, apiUrl, refreshSeconds);
    }, [isApi, componentId, apiUrl, refreshSeconds]);
    // React 内置的外部状态订阅 Hook：负责订阅、检查快照，以及组件卸载时退订。
    // publish(next) -> 通知 listener -> React 读取 getSnapshot -> 组件重新渲染。
    const snapshot = useSyncExternalStore(
        // 1. 如何订阅数据变化；返回值是取消订阅函数。
        resource?.subscribe ?? subscribeToNothing,
        // 2. 客户端渲染时如何读取当前数据。
        resource?.getSnapshot ?? getEmptySnapshot,
        // 3. 服务端渲染和首次水合使用的快照；此时不发起浏览器接口请求。
        getEmptySnapshot,
    );

    return {
        ...snapshot,
        // 静态模式直接返回 DSL 的 data；API 模式返回请求结果，两者互不覆盖。
        data: isApi ? snapshot.data : dataSource?.data ?? emptySnapshot.data,
        reload: resource?.reload ?? doNothing,
    };
}
