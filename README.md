# News Collector

一个轻量的新闻资讯聚合与 AI 智能摘要前端示例项目。支持关键词搜索、AI 摘要展示、热门关键词推荐与今日要闻展示。

## 功能一览

- 关键词搜索：输入关键词后展示相关资讯
- AI 智能摘要：针对搜索结果生成要点摘要
- 今日要闻：默认展示最新资讯与头条
- 热门关键词：一键触发搜索
- 响应式布局：适配桌面端与移动端

## 技术栈

- React 18 + TypeScript
- Vite 5
- Tailwind CSS
- lucide-react 图标

## 目录结构

```
news_collector/
├─ src/
│  ├─ components/        # UI 组件
│  ├─ services/          # 数据服务（当前为模拟数据）
│  ├─ types/             # 类型定义
│  ├─ App.tsx            # 主页面
│  └─ main.tsx           # 入口
├─ index.html
├─ package.json
├─ tailwind.config.js
└─ vite.config.ts
```

## 快速开始

安装依赖：

```
npm install
```

启动开发服务器：

```
npm run dev
```

构建生产包：

```
npm run build
```

本地预览构建结果：

```
npm run preview
```

## 数据与可扩展点

- 模拟数据与 AI 摘要逻辑在 `src/services/newsService.ts`。
- 可将 `searchNews` 与 `getLatestNews` 替换为真实 API 请求。
- `getHotKeywords` 可接入趋势词或运营配置。

## 说明

- 当前内容为前端演示用途的模拟数据。
- 图片来源为 Unsplash 在线图片链接。

