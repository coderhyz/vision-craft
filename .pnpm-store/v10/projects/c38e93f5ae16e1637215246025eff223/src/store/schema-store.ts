import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { PageDSL } from "@/core/schema/page";
import { nanoid } from "nanoid";
import type { ComponentNode } from "@/core/schema/basic";
// 
import { createTreeOperations } from "@/hooks/useTreeOperation";
import { DEFAULT_GRID_SIZE, normalizeGridSize } from "@/core/utils/grid";

type ComponentStyle = NonNullable<ComponentNode["style"]>;

/** 将组件的坐标和尺寸限制在根画布范围内 */
const clampStyleToCanvas = (
    style: ComponentStyle,
    settings: PageDSL["settings"],
): ComponentStyle => {
    const canvasWidth = Math.max(1, Number(settings.width) || 1920);
    const canvasHeight = Math.max(1, Number(settings.height) || 1080);
    const width = Math.min(Math.max(1, Number(style.width) || 1), canvasWidth);
    const height = Math.min(Math.max(1, Number(style.height) || 1), canvasHeight);

    return {
        ...style,
        width,
        height,
        left: Math.min(Math.max(0, Number(style.left) || 0), canvasWidth - width),
        top: Math.min(Math.max(0, Number(style.top) || 0), canvasHeight - height),
    };
};
// 创建树操作方法
const { findNodeById, addNodeToParent, removeNodeById, updateNodeById } =
    createTreeOperations();

/**
 * 页面 DSL 的状态容器
 * 统一封装对 schema 的增删改查操作
 */
interface SchemaState {
    // 页面组件树
    schema: PageDSL | null;
    // 当前选中的组件 id（用于属性面板、图层面板等联动）
    selectedId: string | null;
    // 当前选中的组件节点配置
    selectedNode: ComponentNode | null;
    // 更新页面级配置（名称、描述、画布尺寸等）
    // Partial<PageDSL> 允许只更新部分字段，内部会做合并处理
    updatePage: (patch: Partial<PageDSL>) => void;
    // 初始化页面组件树
    setSchema: (schema?: PageDSL | null) => void;
    // 更新当前选中的组件 id
    setSelectedId: (id: string | null) => void;
    // 查找节点
    findItem: (
        id: string,
        componentNode: ComponentNode | PageDSL,
    ) => ComponentNode | PageDSL | null;
    // 新增节点
    addItem: (parentId: string, newNode: ComponentNode) => boolean;
    // 删除节点
    removeItem: (id: string) => boolean;
    // 更新节点
    updateItem: (id: string, updates: Partial<ComponentNode>) => boolean;
}

// TODO 创建一份全新的默认 Schema，避免复用旧草稿
const createDefaultSchema = (): PageDSL => ({
    id: nanoid(), //生成独特的唯一标识符
    name: "", // 大屏名称
    type: "RootContainer", //特殊的容器名称
    props: {
        title: "", // 大屏标题
        description: "",    // 大屏描述
    },
    settings: {
        width: 1920, //大屏设计稿默认宽度
        height: 1080,   //大屏设计稿默认高度
        gridSize: DEFAULT_GRID_SIZE, // 默认吸附网格尺寸
    },
    children: [],
});

/**
 * 页面 schema 的全局 store
 * - 负责初始化页面 DSL
 * - 提供对组件树的查找 / 新增 / 删除 / 更新方法
 */
export const useSchemaStore = create<SchemaState>()(
    immer((set, get) => ({
        // 页面组件树
        schema: null,
        // 当前选中的组件 id，初始为空
        selectedId: null,
        // 当前选中的组件节点配置
        selectedNode: null,

        /**
         * 更新页面级配置，保持组件树不变
         * @param patch 需要更新的字段集合
         */
        updatePage: (patch: Partial<PageDSL>) => {
            set((state) => {
                if (!state.schema) return;
                // 直接在 immer 草稿上做就地合并，避免替换引用
                if (patch.name !== undefined) {
                    state.schema.name = patch.name;
                }
                if (patch.props) {
                    Object.assign(state.schema.props, patch.props);
                }
                if (patch.settings) {
                    // 在合并前先规范 gridSize，避免存入非法值
                    const nextSettings = {
                        ...patch.settings,
                        gridSize:
                            patch.settings.gridSize !== undefined
                                ? normalizeGridSize(patch.settings.gridSize)
                                : state.schema.settings.gridSize,
                    };
                    Object.assign(state.schema.settings, nextSettings);
                }
            });
        },

        /**
         * 初始化页面组件树，可传入Schema或不传
         * @param schema 页面组件树
         * @returns
         */
        setSchema: (schema?: PageDSL | null) => {
            set((state) => {
                // 如果传入 null，则清空 schema；如果未传入，则创建默认 schema
                const resolvedSchema =
                    schema === null ? null : (schema ?? createDefaultSchema());
                // 传入的schema
                state.schema = resolvedSchema;
                // 初始化选择的组件为 null，确保属性面板等联动组件正确响应
                state.selectedId = null;
                state.selectedNode = null;
                if (state.schema) {
                    // 确保 settings 完整性并统一 gridSize 规范化
                    const currentSettings: PageDSL["settings"] = state.schema.settings;
                    //组件的setting
                    state.schema.settings = {
                        ...currentSettings,
                        width: currentSettings.width ?? 1920,
                        height: currentSettings.height ?? 1080,
                        // 规范化 gridSize，避免存入非法值
                        gridSize: normalizeGridSize(currentSettings.gridSize),
                    };
                }
            });
        },

        // 更新当前选中的组件 id，并同步选中节点配置
        setSelectedId: (id: string | null) => {
            set((state) => {
                // 选中的ID更新后需要在组件树中找到对应节点，更新 selectedNode
                state.selectedId = id;
                if (id && state.schema) {
                    // 通过通用工具函数查找节点
                    const node = findNodeById(id, state.schema);
                    // 如果找到节点且不是根节点，则更新 selectedNode，否则置为 null
                    state.selectedNode =
                        // 表示根画布 RootContainer 不会被放进 selectedNode。
                        node && node.id !== state.schema.id
                            ? (node as ComponentNode)
                            : null;
                } else {
                    state.selectedNode = null;
                }
            });
        },

        /**
         * 查找组件树中的某个组件
         * @param id 组件id
         * @param componentNode 组件树节点
         * @returns
         */
        findItem: (
            id: string,
            componentNode: ComponentNode | PageDSL,
        ): ComponentNode | PageDSL | null => {
            // 对外暴露的查找接口，内部复用通用 DFS 函数
            return findNodeById(id, componentNode);
        },

        /**
         * 在指定父节点下添加新节点
         * @param parentId 父节点id
         * @param newNode 要添加的新节点
         * @returns 是否添加成功
         */
        addItem: (parentId: string, newNode: ComponentNode): boolean => {
            // 获取当前的 schema，确保存在
            const { schema } = get();
            if (!schema) return false;

            let success = false;
            set((state) => {
                if (!state.schema) return;
                const safeNode = newNode.style
                    ? {
                        ...newNode,
                        style: clampStyleToCanvas(newNode.style, state.schema.settings),
                    } as ComponentNode
                    : newNode;
                // 通过通用工具函数向指定父节点添加子节点
                // 注意：依赖 immer 提供的草稿对象，直接修改即可触发更新
                success = addNodeToParent(parentId, state.schema, safeNode);
            });
            // 返回是否成功
            return success;
        },

        /**
         * 删除指定ID的节点
         * @param id 要删除的节点id
         * @returns 是否删除成功
         */
        removeItem: (id: string): boolean => {
            // 得到当前的 schema，确保存在
            const { schema } = get();
            if (!schema) return false;

            // 不能删除根节点
            if (id === schema.id) return false;

            let success = false;
            set((state) => {
                if (!state.schema) return;
                // 通过通用工具函数删除指定节点
                success = removeNodeById(id, state.schema);
                // 如果删除的是当前选中节点，清空选中状态
                if (success && state.selectedId === id) {
                    state.selectedId = null;
                    state.selectedNode = null;
                }
            });

            return success;
        },

        /**
         * 更新指定ID的节点
         * @param id 要更新的节点id
         * @param updates 要更新的属性
         * @returns 是否更新成功
         */
        updateItem: (id: string, updates: Partial<ComponentNode>): boolean => {
            // 得到当前的 schema，确保存在
            const { schema } = get();
            if (!schema) return false;
            let success = false;
            set((state) => {
                if (!state.schema) return;
                const currentNode = findNodeById(id, state.schema) as ComponentNode | null;
                const safeUpdates = updates.style && currentNode
                    ? {
                        ...updates,
                        style: clampStyleToCanvas(
                            {
                                top: 0,
                                left: 0,
                                width: 200,
                                height: 50,
                                zIndex: 1,
                                ...currentNode.style,
                                ...updates.style,
                            },
                            state.schema.settings,
                        ),
                    } as Partial<ComponentNode>
                    : updates;
                // 通过通用工具函数更新指定节点
                success = updateNodeById(id, state.schema!, safeUpdates);
                // 如果更新的是当前选中节点，同步 selectedNode
                if (success && state.selectedId === id) {
                    const node = findNodeById(id, state.schema!);
                    state.selectedNode = node ? (node as ComponentNode) : null;
                }
            });

            return success;
        },
    })),
);
