import { toJpeg, toPng } from "html-to-image";
// 
interface ThumbnailOptions {
    pixelRatio?: number;
    timeoutMs?: number;
    background?: string;
    targetWidth?: number;
    targetHeight?: number;
    format?: "png" | "jpeg";
    jpegQuality?: number;
}

export async function captureNodeThumbnail(
    target: HTMLElement | null | undefined,
    options: ThumbnailOptions = {},
): Promise<string | null> {
    if (!target) return null;

    const {
        pixelRatio = 1,
        timeoutMs = 500,
        background = "#0b1220",
        targetWidth = 720,
        targetHeight,
        format = "jpeg",
        jpegQuality = 0.72,
    } = options;

    // 读取未缩放的原始宽高：优先用 computed width/height，可回退到 clientWidth/Height
    const computed = window.getComputedStyle(target);
    const originalWidth =
        parseFloat(computed.width || "0") || target.clientWidth;
    const originalHeight =
        parseFloat(computed.height || "0") || target.clientHeight;
    if (!originalWidth || !originalHeight) return null;

    const outputWidth = targetWidth ?? originalWidth;
    const outputHeight =
        targetHeight ??
        Math.round((originalHeight / originalWidth) * outputWidth);
    const backgroundColor = computed.backgroundColor || background;

    const renderPromise = (async () => {
        const commonOptions = {
            cacheBust: true,
            pixelRatio,
            backgroundColor,
            width: originalWidth,
            height: originalHeight,
            canvasWidth: outputWidth,
            canvasHeight: outputHeight,
            style: {
                // 若不去掉 transform，会按缩放后的小尺寸去渲染，导致只截到左上角或黑屏
                transform: "none",
                transformOrigin: "top left",
                width: `${originalWidth}px`,
                height: `${originalHeight}px`,
                position: "relative",
            },
            // html-to-image 类型未暴露 useCORS，仍传递以避免跨域图片失败
            useCORS: true as unknown as boolean,
        };

        if (format === "png") {
            return await toPng(target, commonOptions as any);
        }

        return await toJpeg(target, {
            ...(commonOptions as any),
            quality: jpegQuality,
        });
    })().catch(() => null);

    const result = await Promise.race<string | null>([
        renderPromise,
        new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), timeoutMs),
        ),
    ]);

    return result || null;
}
