/**
 * 从 localStorage 读取当前登录用户的 id
 * 优先读取独立的 "userId" key，兜底从 "user" 对象中解析
 */
export function getCurrentUserId(): string {
    // 获取本地保存的user_id
    const direct = localStorage.getItem("userId");
    if (direct) return direct;
    try {
        const user = JSON.parse(localStorage.getItem("user") ?? "{}");
        return user?.id ?? "";
    } catch {
        return "";
    }
}
