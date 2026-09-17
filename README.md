# Vision-Craft 前端

一个基于 React + TypeScript 的可视化大屏搭建平台，支持拖拽编辑、AI 辅助生成和实时预览。

## 技术栈

| 分类 | 技术 | 说明 |
|------|------|------|
| 框架 | React 18 | 主要前端框架 |
| 语言 | TypeScript 5.9 | 类型安全 |
| 构建 | Vite 7.2 | 快速构建工具 |
| UI | Ant Design 6 | 企业级组件库 |
| 样式 | TailwindCSS 3.4 | 原子化 CSS |
| 状态管理 | Zustand + Immer | 轻量级状态管理 |
| 路由 | React Router 7 | SPA 路由 |
| 图表 | ECharts 6 | 可视化图表 |
| 拖拽 | @dnd-kit + react-rnd | 拖拽缩放 |

## 项目结构

```
src/
├── api/                    # API 接口层
│   ├── request.ts          # HTTP 客户端配置
│   ├── login.ts            # 登录/注册接口
│   ├── page.ts             # 页面 CRUD 接口
│   └── ai.ts               # AI 生成接口
├── components/             # React 组件
│   ├── editor/             # 编辑器核心
│   │   ├── Index.tsx       # 编辑器主页面
│   │   ├── Toolbar.tsx     # 工具栏
│   │   ├── AIChatPanel.tsx # AI 生成面板
│   │   └── ruler/          # 标尺组件
│   ├── index/              # 首页
│   ├── login/              # 登录模块
│   ├── materials/          # 物料组件库
│   │   ├── basic/          # 基础组件
│   │   ├── chart/          # 图表组件
│   │   └── registry.ts     # 组件注册表
│   ├── panels/             # 面板组件
│   │   ├── component-panel/# 组件面板
│   │   └── property-panel/ # 属性面板
│   ├── preview/            # 预览模块
│   └── projects/           # 项目管理
├── config/                 # 组件配置
│   ├── basic-config/       # 基础组件默认配置
│   ├── basic-meta/         # 基础组件表单元数据
│   ├── chart-config/       # 图表组件默认配置
│   └── chart-meta/         # 图表组件表单元数据
├── core/                   # 核心模块
│   ├── dnd/                # 拖拽系统
│   ├── renderer/           # 组件渲染器
│   ├── schema/             # Schema 类型定义
│   └── utils/              # 工具函数
├── hooks/                  # 自定义 Hooks
├── router/                 # 路由配置
├── store/                  # 状态管理
├── utils/                  # 工具函数
└── types/                  # 类型声明
```

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
pnpm build
```

### 代码检查

```bash
pnpm lint
```

## 物料组件

### 基础组件

| 组件 | 说明 |
|------|------|
| Text | 文本组件 |
| Image | 图片组件 |
| Button | 按钮组件 |
| Clock | 时钟组件 |
| StatisticCard | KPI 统计卡片 |
| ProgressBar | 进度条组件 |
| Countdown | 倒计时组件 |
| Container | 容器组件 |

### 图表组件

| 组件 | 说明 |
|------|------|
| BarChart | 柱状图 |
| HorizontalBarChart | 横向柱状图 |
| MultiBarChart | 多系列柱状图 |
| LineChart | 折线图 |
| MultiLineChart | 多系列折线图 |
| AreaChart | 面积图 |
| PieChart | 饼图 |
| RosePieChart | 南丁格尔玫瑰图 |
| ScatterChart | 散点图 |
| BubbleChart | 气泡图 |

## 路由

| 路径 | 说明 | 权限 |
|------|------|------|
| `/` | 首页 | 公开 |
| `/auth` | 登录/注册 | 公开 |
| `/projects` | 项目列表 | 需登录 |
| `/editor/:id` | 编辑器 | 需登录 |
| `/preview/:id` | 预览页面 | 需登录 |

## 核心概念

### Schema 驱动

整个大屏通过 JSON Schema 描述，便于存储、传输和 AI 生成：

```typescript
interface PageDSL {
  id: string;
  name: string;
  type: "RootContainer";
  props: {
    title: string;
    description: string;
  };
  settings: {
    width: number | string;
    height: number | string;
    backgroundColor?: string;
    backgroundImage?: string;
  };
  children?: ComponentNode[];
}
```

### 组件注册表

使用 Map 结构管理组件，支持动态扩展：

```typescript
import { componentRegistryManager } from '@/components/materials/registry';

// 获取组件
const Component = componentRegistryManager.get('BarChart');

// 注册新组件
componentRegistryManager.register('CustomChart', CustomChartComponent);
```

### 状态管理

使用 Zustand 管理页面 Schema 状态：

```typescript
import { useSchemaStore } from '@/store/schema-store';

// 获取状态
const { schema, selectedId } = useSchemaStore();

// 更新组件
useSchemaStore.getState().updateItem(id, { props: newProps });
```

## AI 功能

支持通过 AI 辅助生成大屏 Schema，使用 SSE 流式返回实时预览效果：

```typescript
// 流式生成
const sse = new EventSource(
  `http://localhost:3000/api/ai/schema/generate?prompt=${prompt}&mode=step`
);

sse.addEventListener('ai_chunk', (event) => {
  // 处理增量数据
});
```

## 配置说明

### 路径别名

项目配置了 `@` 路径别名指向 `src` 目录：

```typescript
import { Button } from '@/components/materials/basic/Button';
```

### 主题配置

深色科技风主题，主色调为 Indigo (#6366f1)：

- 品牌主色: `#6366f1`
- 背景色: `#0b1220`
- 文字色: `#e5e7eb`

## 开发指南

### 添加新组件

1. 在 `src/components/materials/` 下创建组件文件
2. 在 `src/config/` 下添加默认配置和表单元数据
3. 在 `src/components/materials/registry.ts` 中注册组件
4. 在 `src/core/schema/` 中添加类型定义

### 组件开发规范

- 组件必须接收 `props` 和 `style` 参数
- 使用 ECharts 开发图表组件时需处理 resize
- 组件需要导出默认配置用于初始化

## License

MIT
