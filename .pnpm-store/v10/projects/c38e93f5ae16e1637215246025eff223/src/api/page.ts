import type { PageDSL } from "@/core/schema/page";
import { http } from "./request";

// 保存页面 schema：后端返回 { code, message, data }
export interface SavePagePayload {
  // 当存在 pageId 时走更新，否则视为创建
  pageId?: string;
  schema: PageDSL;
  meta?: {
    title?: string;
    description?: string;
  };
  // 生成的项目缩略图（base64 PNG）
  thumbnail?: string;
  // 归属用户 id（创建时必传）
  userId?: string;
}
// 根据
export interface SavePageResponse {
  code: number;
  message: string;
  data: {
    pageId: string;
    name: string;
    title: string;
    description: string;
    schema: PageDSL;
    thumbnailUrl?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

// 页面基础信息：用于项目列表卡片
export interface PageSummary {
  pageId: string; //项目的id mongoDB ObjectId
  name: string; //项目的名称
  title: string; //大屏的标题
  description: string; //大屏的描述
  thumbnailUrl?: string; //大屏的缩略图url
  createdAt?: string; //创建时间
  updatedAt?: string; //更新时间
}

export interface ListPagesResponse {
  code: number;
  message: string;
  data: PageSummary[];
}

export interface DeletePageResponse {
  code: number;
  message: string;
  data?: {
    pageId: string;
  };
}
// 保存当前页面
export const savePage = (payload: SavePagePayload,
): Promise<SavePageResponse> => {
  return http.post("/pages/save", payload);
};

// 根据页面 id 获取 schema
export const getPageById = (id: string): Promise<SavePageResponse> => {
  return http.get(`/pages/${id}`);
};

// 获取当前用户的全部页面列表
export const listPages = (userId: string): Promise<ListPagesResponse> => {
  return http.get("/pages", { params: { userId } });
};

// 删除指定页面
export const deletePage = (id: string): Promise<DeletePageResponse> => {
  return http.delete(`/pages/${id}`);
};
