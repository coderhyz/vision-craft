import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 拼接绝对路径，__dirname 是当前文件所在目录的绝对路径
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
