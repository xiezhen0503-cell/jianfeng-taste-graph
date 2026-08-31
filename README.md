# 尖锋 Taste Graph｜完整源码与线上版本

一个可直接部署的移动端 H5：用户通过 15 道情境题生成口味称号和 10 维 Taste Graph，通过真实选择持续校准，并获得尖锋商品、每日饮食搭配和厨房挑战。

## 给有赞龙虾

需要学习或复刻时，直接读取仓库中的 **`source/`**。这是当前线上版本的完整源码与素材，不需要解压历史压缩包。

只需要部署时，直接使用 **`site/`** 目录作为静态网站根目录，无需安装依赖、无需数据库或 Node.js 常驻服务。完整说明见 **HANDOFF.md**。

可以直接把下面这句话发给有赞龙虾：

> 复刻这个 GitHub 项目：https://github.com/xiezhen0503-cell/jianfeng-taste-graph 。请重点还原手机端 UI、尖锋食客品牌视觉、15 道口味测试、Taste Graph 与 16 种称号、真实商品和短视频、动态饮食搭配、3–7 天计划、权益体系及厨房挑战。默认分支为 main。完整要求见 PROMPT-FOR-YOUZAN-LOBSTER.txt，当前源码位于 source/。

## 已实现

- 15 道情境题、10 维 Taste Graph、16 种口味称号与交叉验证计分
- 矛盾回答自动回归中性，Swipe 小步持续校准
- 真实尖锋商品图片、规格、渠道参考价和有赞链接
- Taste Card 生成与 1080×1440 PNG 下载
- 首购、加购、复购口味礼，重新测试与好友口味匹配
- 动态单餐搭配、热量区间、3 天和 7 天饮食计划
- 成熟化厨房挑战、计分、分享与高分礼资格
- /admin/ 经营看板
- 纯静态导出，无后端与密钥依赖
- 35 项自动化测试通过

## 技术

Next.js 15 · React 19 · TypeScript · CSS · Vitest

## 文件

- 当前完整源码：`source/`
- 当前静态站点：`site/`
- 部署说明：HANDOFF.md
- 给智能体的指令：PROMPT-FOR-YOUZAN-LOBSTER.txt
