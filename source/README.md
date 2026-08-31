# 尖锋 Taste Graph 源码

这是当前线上版本的完整可编辑源码，供有赞龙虾学习、复刻和部署。

## 技术栈

- Next.js 15
- React 19
- TypeScript
- 纯 CSS
- Vitest
- 静态导出，无数据库、无 API Key、无 Node.js 常驻服务

## 本地运行

建议 Node.js 20+、pnpm 9+：

```bash
pnpm install --frozen-lockfile
pnpm dev
```

## 测试与构建

```bash
pnpm test
pnpm build
```

构建产物位于 `out/`，可直接作为静态网站发布。

如果部署在 GitHub Pages 仓库子路径：

```bash
GITHUB_PAGES=true pnpm build
```

Windows PowerShell：

```powershell
$env:GITHUB_PAGES='true'
pnpm build
```

## 主要目录

- `src/components/taste-app.tsx`：主应用、测试、结果、首页与导航
- `src/components/cooking-game.tsx`：厨房挑战小游戏
- `src/components/meal-planner.tsx`：动态饮食搭配与 3–7 天计划
- `src/lib/taste-engine.ts`：15 题口味计算与称号生成
- `src/lib/meal-planner.ts`：口味驱动的动态搭配逻辑
- `src/lib/data.ts`：题目、商品与推荐数据
- `public/`：商品图、测试插画、人物图和短视频素材

## 产品边界

- 当前用户状态保存在浏览器 `localStorage`。
- 优惠券、购买、排行榜和点赞尚未接入有赞订单或后端接口。
- 商品推荐优先使用尖锋产品，再由普通食材补齐餐食结构。
- 营养和热量是一般成人参考信息，不替代医生或注册营养师建议。

## 线上参考

- 应用：https://xiezhen0503-cell.github.io/jianfeng-taste-graph/
- 游戏直达：https://xiezhen0503-cell.github.io/jianfeng-taste-graph/?game=challenge

