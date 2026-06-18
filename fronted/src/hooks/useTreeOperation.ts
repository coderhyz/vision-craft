import type { PageDSL } from "@/core/schema/page";
import type { ComponentNode } from "@/core/schema/basic";
// 定义树节点类型，包含组件节点和页面根节点
type TreeNode = ComponentNode | PageDSL;
// 定义具有子节点的树节点类型
type TreeNodeWithChildren = TreeNode & { children: ComponentNode[] };
// 定义可变的树节点类型，用于支持修改操作
type MutableTreeNode = TreeNode & { children?: ComponentNode[] };

/**
 * useTreeOperation
 * @description 组件树结构增删改查操作
 * @returns
 */
export const createTreeOperations = () => {
  /**
   * 判断节点是否具备 children 属性的类型守卫
   * 使用类型守卫可以让 TS 正确收窄类型，在后续逻辑中安全访问 children
   * @param node 当前遍历到的节点
   * @returns 是否包含 children 数组
   */
  // 判断节点是否具备 children 属性的类型守卫，避免在联合类型上直接访问 children
  const hasChildren = (node: TreeNode): node is TreeNodeWithChildren => {
    return Array.isArray((node as { children?: unknown }).children);
  };

  /**
   * 在组件树中根据 id 查找节点
   * 采用深度优先遍历（DFS），一旦找到目标节点立即返回
   * @param id 要查找的节点 id
   * @param node 当前遍历到的根节点
   * @returns 找到的节点，找不到则为 null
   */
  // 通用树操作工具函数，避免在增删改查中重复实现递归逻辑
  const findNodeById = (
    id: string,
    node: ComponentNode | PageDSL | null,
  ): ComponentNode | PageDSL | null => {
    if (!node) return null;
    if (node.id === id) return node;

    // 只要节点存在 children 就继续向下查找，不再依赖 type 字段
    // 这里使用 DFS 遍历所有子节点
    if (hasChildren(node)) {
      for (const child of node.children) {
        const found = findNodeById(id, child);
        if (found) return found;
      }
    }
    return null;
  };

  /**
   * 在指定父节点下插入子节点
   * 会在整棵树中查找 parentId 对应的节点并插入 newNode
   * @param parentId 父节点 id
   * @param root 遍历的根节点（通常为 schema 根）
   * @param newNode 要插入的组件节点
   * @returns 是否插入成功
   */
  const addNodeToParent = (
    parentId: string,
    root: ComponentNode | PageDSL,
    newNode: ComponentNode,
  ): boolean => {
    if (root.id === parentId) {
      // 命中父节点，按需初始化 children 并追加
      const parent = root as MutableTreeNode;
      parent.children ??= [];
      parent.children.push(newNode);
      return true;
    }

    // 未命中则向子节点递归查找
    if (hasChildren(root)) {
      for (const child of root.children) {
        if (addNodeToParent(parentId, child, newNode)) {
          return true;
        }
      }
    }

    return false;
  };

  /**
   * 根据 id 从树中删除节点
   * 仅修改 children 数组，不会删除根节点自身
   * @param id 要删除的节点 id
   * @param root 遍历的根节点
   * @returns 是否删除成功
   */
  const removeNodeById = (
    id: string,
    root: ComponentNode | PageDSL,
  ): boolean => {
    if (!hasChildren(root)) return false;

    // 先在当前层级查找需要删除的节点
    const index = root.children.findIndex((child) => child.id === id);
    if (index !== -1) {
      root.children.splice(index, 1);
      return true;
    }

    // 当前层级没找到则递归到子节点继续查找
    for (const child of root.children) {
      if (removeNodeById(id, child)) {
        return true;
      }
    }

    return false;
  };

  /**
   * 根据 id 更新树中的节点属性
   * 会对命中的节点执行浅层 Object.assign
   * @param id 要更新的节点 id
   * @param root 遍历的根节点
   * @param updates 要合并到节点上的属性
   * @returns 是否更新成功
   */
  const updateNodeById = (
    id: string,
    root: ComponentNode | PageDSL,
    updates: Partial<ComponentNode>,
  ): boolean => {
    if (root.id === id) {
      // 命中目标节点，直接合并属性
      Object.assign(root, updates);
      return true;
    }
    if (hasChildren(root)) {
      // 未命中则递归子节点
      for (const child of root.children) {
        if (updateNodeById(id, child, updates)) {
          return true;
        }
      }
    }

    return false;
  };

  return {
    findNodeById,
    addNodeToParent,
    removeNodeById,
    updateNodeById,
  };
};
