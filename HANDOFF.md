# 尖锋 Taste｜有赞龙虾部署交接

## 最省算力的部署方式（首选）

请不要重新安装依赖或运行 Next.js 构建。压缩包内的 `out/` 已经是构建完成的纯静态网站：

1. 将 `out/` 内全部文件上传到云端静态站点根目录。
2. 默认首页为 `index.html`，管理页为 `/admin/`。
3. 开启 HTTPS；为带哈希的 JS/CSS/图片设置长期缓存，为 HTML 设置 `no-cache`。
4. 如果使用 Nginx，可直接参考 `deploy/nginx.conf`。
5. 部署后检查 `/`、`/admin/`、真实商品图片、12 题测试、Taste Card 下载。

这一模式不需要 Node.js 常驻进程、数据库、API Key、Supabase 或服务端渲染，运行成本接近普通静态 H5。

## 如果平台只接受 Docker

项目已提供 `deploy/Dockerfile.static`。在项目根目录构建：

```bash
docker build -f deploy/Dockerfile.static -t jianfeng-taste:static .
docker run -p 80:80 jianfeng-taste:static
```

镜像只使用 Nginx 提供预构建静态文件，不运行 Node.js。

## 只有修改源码时才需要重新构建

环境建议：Node.js 20+、pnpm 9+。

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm build
```

构建成功后会重新生成 `out/`。部署时仍然只上传 `out/`。

## 项目边界

- 技术栈：Next.js 15、React 19、TypeScript、纯 CSS。
- 当前为前端比赛原型；测试结果、优惠券领取和 Swipe 学习状态保存在浏览器 `localStorage`。
- 没有登录、数据库、支付回调或服务端 API。
- 商品购买按钮会打开尖锋有赞店铺链接。
- 商品价格是资料中的渠道参考价，不是实时结算接口。
- 刷新不会丢失同一浏览器的数据；换设备或清理浏览器数据会重置。

## 部署后验收清单

- [ ] `/` 返回 200，手机宽度没有横向滚动。
- [ ] `/admin/` 返回 200。
- [ ] 首页点击“它怎么懂我？”能打开算法说明。
- [ ] 12 道题能完成并生成 Taste ID。
- [ ] 完成测试后可以领取优惠券。
- [ ] Taste 页面可以重新测试、生成并下载 PNG Taste Card。
- [ ] 发现页 Swipe 后推荐卡切换并显示学习反馈。
- [ ] 商品图片全部加载，商品详情能打开有赞链接。
- [ ] 浏览器控制台无 404 和运行时报错。

## 文件选择

- `尖锋-Taste-静态部署包.zip`：优先给运维或云平台，只包含部署所需静态文件和说明，最省算力。
- `尖锋-Taste-完整源码包.zip`：给开发智能体，包含源码、测试、设计审计和预构建 `out/`，不包含 `node_modules`、`.next`、日志或本机缓存。
