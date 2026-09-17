import { useState } from "react";
import { Tabs, Form, Input, Button, message } from "antd";
import { login, register } from "@/api/login";
import { useLocation, useNavigate } from "react-router-dom";
import { Shield, Monitor, GitBranch } from "lucide-react";
type FieldType = {
    email: string;
    password: string;
    confirm?: string;
};
export default function AuthPage() {
    // 登录/注册模式
    const [mode, setMode] = useState<"login" | "register">("login");
    const [loading, setLoading] = useState(false);
    // 登录/注册表单实例
    const [form] = Form.useForm();
    const navigate = useNavigate();
    // 路由 location 对象，用于获取跳转前的页面信息
    const location = useLocation();
    // 提交登录/注册请求
    const handleSubmit = async (values: FieldType) => {
        setLoading(true);
        // 传递的参数
        const { email, password } = values;
        try {
            if (mode === "login") {
                // 登录模式
                const res = await login(email, password);
                if (res.code === 0) {
                    message.success(res.message);
                    localStorage.setItem("token", res.data.token);
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                    // 存储的userId
                    localStorage.setItem("userId", res.data.user.id);
                    const from = location.state?.from;
                    // 如果有跳转前的页面信息，则跳转回去，否则跳转到默认页面
                    const returnTo = from?.pathname
                        ? `${from.pathname}${from.search || ""}${from.hash || ""}`
                        : "/projects";
                    navigate(returnTo, { replace: true });
                } else {
                    message.error(res.message);
                }
            } else {
                // 注册模式
                const res = await register(email, password);
                if (res.code === 0) {
                    message.success(res.message);
                    setMode("login");
                    form.resetFields();
                } else {
                    message.error(res.message);
                }
            }
        } catch (error) {
            console.error(error);
            message.error("请求失败，请稍后重试");
        } finally {
            setLoading(false);
        }
    };
    // 切换登录/注册模式
    const onModeChange = (next: "login" | "register") => {
        setMode(next);
        form.resetFields();
    };

    const badges = [
        { icon: <Shield className="h-3.5 w-3.5" />, text: "安全登录" },
        { icon: <Monitor className="h-3.5 w-3.5" />, text: "多端预览" },
        { icon: <GitBranch className="h-3.5 w-3.5" />, text: "版本管理" },
    ];

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 text-slate-800 flex items-center justify-center px-4 py-10">
                {/* 淡雅装饰 */}
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-100/20 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-in">
                    {/* 左侧品牌 */}
                    <div className="space-y-6">
                        <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-xs font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                            Vision-Craft · 账户中心
                        </p>
                        <h1 className="text-4xl font-bold leading-tight text-slate-900">
                            登录 / 注册
                            <br />
                            <span className="text-brand-500">解锁你的可视化空间</span>
                        </h1>
                        <p className="text-slate-500 leading-relaxed">
                            登录后即可保存大屏、管理版本、预览与发布。注册新账号，开启你的
                            Vision-Craft 搭建之旅。
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {badges.map((b) => (
                                <span
                                    key={b.text}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-100 px-3 py-1.5 text-xs text-slate-500"
                                >
                                    {b.icon}
                                    {b.text}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* 右侧表单 */}
                    <div className="vc-card p-8">
                        <Tabs
                            activeKey={mode}
                            onChange={(key) =>
                                onModeChange(key as "login" | "register")
                            }
                            items={[
                                { key: "login", label: "登录" },
                                { key: "register", label: "注册" },
                            ]}
                            className="mb-4"
                        />
                        {/* 登录/注册表单 */}
                        <Form
                            // 注册表单
                            form={form}
                            layout="vertical"
                            requiredMark={false}
                            // 提交表单
                            onFinish={handleSubmit}
                            className="space-y-1"
                        >
                            {/* 邮箱 */}
                            <Form.Item
                                label={<span className="text-slate-600 text-sm">邮箱</span>}
                                name="email"
                                // 校验规则
                                rules={[
                                    { required: true, message: "邮箱不能为空" },
                                    { type: "email", message: "请输入有效邮箱" },
                                ]}
                            >
                                {/* 邮箱输入框 */}
                                <Input size="large" placeholder="you@example.com" />
                            </Form.Item>
                            {/* 密码 */}
                            <Form.Item
                                label={<span className="text-slate-600 text-sm">密码</span>}
                                name="password"
                                // 校验规则
                                rules={[
                                    { required: true, message: "密码不能为空" },
                                    { min: 6, message: "密码长度至少为6位" },
                                ]}
                            >
                                {/* 密码输入框 */}
                                <Input.Password size="large" placeholder="请输入密码" />
                            </Form.Item>

                            {mode === "register" && (
                                // 确认密码
                                <Form.Item
                                    label={<span className="text-slate-600 text-sm">确认密码</span>}
                                    name="confirm"
                                    dependencies={["password"]}
                                    rules={[
                                        { required: true, message: "请再次输入密码" },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue("password") === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error("两次输入的密码不一致"));
                                            },
                                        }),
                                    ]}
                                >
                                    {/* 确认密码输入框 */}
                                    <Input.Password size="large" placeholder="请再次输入密码" />
                                </Form.Item>
                            )}

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                    size="large"
                                    className="mt-3 !h-11 !font-medium"
                                >
                                    {mode === "login" ? "登录" : "注册"}
                                </Button>
                            </Form.Item>

                            <div className="text-xs text-slate-400 text-center">
                                点击按钮即表示同意《隐私政策》与《用户协议》
                            </div>
                        </Form>
                    </div>
                </div>
            </div></>

    );
}
