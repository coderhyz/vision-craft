import type { RateComponent } from "@/core/schema/basic";

export const rateDefaultConfig: RateComponent = {
    id: "",
    type: "Rate",
    name: "评分",
    props: {
        value: 3.5,
        count: 5,
        allowHalf: true,
        color: "#fadb14",
        size: 24,
    },
    style: {
        top: 0,
        left: 0,
        width: 200,
        height: 40,
        zIndex: 1,
    },
};
