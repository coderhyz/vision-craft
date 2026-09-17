/**
 * 深拷贝函数
 * 支持基本数据类型、对象、数组、Date、RegExp、Map、Set等
 *
 * @param source - 需要深拷贝的源数据
 * @param hash - WeakMap用于处理循环引用
 * @returns 深拷贝后的数据
 */
export function deepClone<T>(source: T, hash = new WeakMap()): T {
    // 处理null或非对象类型
    if (source === null || typeof source !== "object") {
        return source;
    }

    // 处理循环引用
    if (hash.has(source as object)) {
        return hash.get(source as object);
    }

    // 处理Date对象
    if (source instanceof Date) {
        return new Date(source.getTime()) as T;
    }

    // 处理RegExp对象
    if (source instanceof RegExp) {
        return new RegExp(source.source, source.flags) as T;
    }

    // 处理Map对象
    if (source instanceof Map) {
        const clone = new Map();
        hash.set(source as object, clone);
        source.forEach((value, key) => {
            clone.set(deepClone(key, hash), deepClone(value, hash));
        });
        return clone as T;
    }

    // 处理Set对象
    if (source instanceof Set) {
        const clone = new Set();
        hash.set(source as object, clone);
        source.forEach((value) => {
            clone.add(deepClone(value, hash));
        });
        return clone as T;
    }

    // 处理Array对象
    if (Array.isArray(source)) {
        const clone = [] as any[];
        hash.set(source as object, clone);
        source.forEach((value, index) => {
            clone[index] = deepClone(value, hash);
        });
        return clone as T;
    }

    // 处理普通对象
    if (typeof source === "object") {
        const clone = {} as T;
        hash.set(source as object, clone);

        // 获取所有属性，包括Symbol属性
        const allKeys = [
            ...Object.keys(source as object),
            ...Object.getOwnPropertySymbols(source as object),
        ];

        allKeys.forEach((key) => {
            clone[key as keyof T] = deepClone((source as any)[key], hash);
        });

        return clone;
    }

    return source;
}

/**
 * 简化版深拷贝函数，适用于大多数场景
 * @param source - 需要深拷贝的源数据
 * @returns 深拷贝后的数据
 */
export function simpleDeepClone<T>(source: T): T {
    return JSON.parse(JSON.stringify(source));
}

/**
 * 判断是否为简单可序列化的数据类型
 * @param value - 要判断的值
 * @returns 是否为简单可序列化类型
 */
export function isSimpleSerializable(value: any): boolean {
    const type = typeof value;
    if (
        type === "string" ||
        type === "number" ||
        type === "boolean" ||
        value === null
    ) {
        return true;
    }
    if (Array.isArray(value)) {
        return value.every((item) => isSimpleSerializable(item));
    }
    if (type === "object") {
        return Object.keys(value).every((key) =>
            isSimpleSerializable(value[key]),
        );
    }
    return false;
}

/**
 * 智能深拷贝函数，根据数据类型自动选择最优的拷贝方式
 * @param source - 需要深拷贝的源数据
 * @returns 深拷贝后的数据
 */
export function smartDeepClone<T>(source: T): T {
    if (isSimpleSerializable(source)) {
        return simpleDeepClone(source);
    }
    return deepClone(source);
}
