import type { CountdownComponent } from "@/core/schema/basic";

const pad2 = (num: number) => String(num).padStart(2, "0");
const formatDateTime = (date: Date) =>
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
const oneHourLaterString = () =>
    formatDateTime(new Date(Date.now() + 60 * 60 * 1000));

/**
 * Countdown 组件默认配置
 */
export const countdownDefaultConfig: CountdownComponent = {
    id: "",
    type: "Countdown",
    name: "倒计时",
    props: {
        targetTime: oneHourLaterString(), // 默认一小时后
        format: "HH:mm:ss",
        prefix: "剩余",
        suffix: "",
        finishedText: "已结束",
        fontSize: 28,
        fontWeight: 600,
        color: "#1f1f1f",
        textAlign: "居中",
        showMilliseconds: false,
    },
    style: {
        top: 0,
        left: 0,
        width: 240,
        height: 80,
        zIndex: 1,
    },
};
