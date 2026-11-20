// 负责 HTTP 请求、流式读取、UTF-8 解码和 SSE 事件解析


export interface SSEOptions {
    url: string;
    token: string;
    body: unknown;
    signal: AbortSignal;
    onEvent: (event: string, data: any) => void;
}

/**
 * 使用 fetch POST 接收 SSE。
 * 兼容当前 Vision-Craft 后端的 event/data JSON 事件格式。
 */
export async function postSSE({
    url,
    token,
    body,
    signal,
    onEvent,
}: SSEOptions): Promise<void> {
    // 1. 使用 POST 发送生成参数
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        signal,
    });

    if (!response.ok) {
        throw new Error(`SSE 请求失败：HTTP ${response.status}`);
    }

    const contentType = response.headers.get("Content-Type");
    if (!contentType?.includes("text/event-stream")) {
        throw new Error("服务端未返回 SSE 响应");
    }

    if (!response.body) {
        throw new Error("浏览器无法读取响应流");
    }

    // 2. 获取读取器和 UTF-8 解码器
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let buffer = "";
    let streamFinished = false;

    // 3. 解析一个完整的 SSE 事件
    const parseEvent = (raw: string) => {
        let eventName = "message";
        const dataLines: string[] = [];

        for (const line of raw.split("\n")) {
            // 忽略注释或心跳
            if (line.startsWith(":")) continue;

            const index = line.indexOf(":");
            const field = index === -1
                ? line
                : line.slice(0, index);

            let value = index === -1
                ? ""
                : line.slice(index + 1);

            if (value.startsWith(" ")) {
                value = value.slice(1);
            }

            if (field === "event") {
                eventName = value || "message";
            }

            if (field === "data") {
                dataLines.push(value);
            }
        }

        if (dataLines.length === 0) return;

        // 当前后端所有业务事件都采用 JSON 格式
        const data = JSON.parse(dataLines.join("\n"));

        onEvent(eventName, data);
    };

    try {
        // 4. 持续读取响应流
        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                streamFinished = true;
                break;
            }

            // stream:true 防止中文字符跨 Chunk 后乱码
            buffer += decoder.decode(value, {
                stream: true,
            });

            // 当前后端使用 LF；顺便兼容 CRLF。
            // 跨 Chunk 的 \r 会保留到下次与 \n 合并。
            buffer = buffer.replace(/\r\n/g, "\n");

            // 5. 一个 Chunk 可能有多个完整事件
            let index: number;

            while ((index = buffer.indexOf("\n\n")) !== -1) {
                const rawEvent = buffer.slice(0, index);
                buffer = buffer.slice(index + 2);

                parseEvent(rawEvent);
            }

            // 防止异常服务端无限输出不完整事件
            if (buffer.length > 8 * 1024 * 1024) {
                throw new Error("SSE 单条事件超过缓冲区限制");
            }
        }

        // 刷新 TextDecoder 尚未完成的字符
        buffer += decoder.decode();

        // 有未完成事件，交给业务层视为异常
        if (buffer.length > 0) {
            throw new Error("SSE 连接结束时仍存在不完整事件");
        }
    } finally {
        // 如果未正常读完，主动取消剩余响应
        if (!streamFinished) {
            try {
                await reader.cancel();
            } catch {
                // 连接可能已经中断
            }
        }

        reader.releaseLock();
    }
}
