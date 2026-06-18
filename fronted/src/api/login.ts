import { http } from "./request";

export interface AuthResponse {
    code: number;
    message: string;
    data: {
        token: string;
        user: {
            id: string;
            [key: string]: unknown;
        };
    };
}
// 登录
export const login = (
    email: string,
    password: string,
): Promise<AuthResponse> => {
    return http.post("/auth/login", {
        email,
        password,
    });
};
// 注册
export const register = (
    email: string,
    password: string,
): Promise<AuthResponse> => {
    return http.post("/auth/register", {
        email,
        password,
    });
};
