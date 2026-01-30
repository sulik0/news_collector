# News Collector

一个支持“意图解析 → 多源新闻检索 → 大模型总结 → 生成新闻早报”的本地演示项目。后端使用 GLM（智谱）模型，可扩展为其他 LLM 接口；新闻数据源支持多 API 并行聚合。

## 功能一览

- 用户输入描述，LLM 解析意图与关键词
- 多新闻源聚合搜索（NewsAPI / GNews / Bing News）
- LLM 生成新闻早报（纯文本 + 引用链接）
- 前后端分离，本地可直接运行

## 技术栈

- 前端：React 18 + TypeScript + Vite + Tailwind CSS
- 后端：Node.js + Express
- LLM：GLM（可拓展）

## 目录结构

```
news_collector/
├─ server/               # 后端服务
│  ├─ providers/         # 新闻数据源
│  ├─ utils/             # 工具函数（LLM / 归一化）
│  ├─ prompts.js         # LLM 提示词
│  └─ index.js           # 服务入口
├─ src/                  # 前端
├─ .env.example
└─ package.json
```

## 本地运行

1) 安装依赖

```
npm install
```

2) 安装后端依赖

```
cd server
npm install
```

3) 配置环境变量

复制 `.env.example` 为 `.env`，填入 API Key：

```
LLM_API_KEY=your_glm_api_key
NEWSAPI_KEY=
GNEWS_KEY=
BING_NEWS_KEY=
```

4) 启动（推荐）

```
cd ..
npm run dev:all
```

5) 访问前端

```
http://localhost:5173
```

## API 说明

- `POST /api/briefing`
  - 入参：`{ "query": "用户描述" }`
  - 返回：`{ intent, news, briefing, searchedAt }`

## 扩展点

- 新增数据源：在 `server/providers/` 添加搜索函数并在 `server/index.js` 中聚合
- 更换 LLM：设置 `LLM_BASE_URL` 与 `LLM_MODEL` 即可兼容其它 OpenAI-style API
- 上线部署：后续可迁移到 Vercel / Render / Railway / Cloudflare Workers

## 注意事项

- 前端不直接调用 LLM 与新闻 API，避免密钥泄露
- 若未配置新闻 API，将返回占位提示

