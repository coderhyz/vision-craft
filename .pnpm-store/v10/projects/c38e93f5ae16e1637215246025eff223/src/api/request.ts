import axios, {
    type InternalAxiosRequestConfig,
    type AxiosResponse,
    type AxiosError,
} from "axios";
// axios实例
const http = axios.create({
    baseURL: "http://localhost:3000/api",
    timeout: 300000,
});

// 请求拦截器：自动注入 token
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

// 响应拦截器：403 清空本地数据并跳转登录页
http.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    (error: AxiosError) => {
        if (error.response?.status === 403) {
            // 只清理 auth 相关 key，不清空整个 localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("userId");
            if (window.location.pathname !== "/auth") {
                window.location.href = "/auth";
            }
        }
        return Promise.reject(error);
    },
);

export { http };
