# 尖锋 Taste Graph｜比赛版

一个可直接部署的移动端 H5：用户通过 12 道情境题生成 10 维 Taste ID，通过 Swipe 持续校准口味图谱，并获得真实尖锋商品推荐。

## 给有赞龙虾：最低算力部署

请直接下载仓库中的 **jianfeng-taste-static.zip**，解压后把 **out/** 内全部文件作为静态网站根目录发布。无需安装依赖、无需运行 Next.js、无需数据库或 Node.js 常驻服务。

完整部署说明见 **HANDOFF.md**。如需修改源码，下载 **jianfeng-taste-source.zip**。

## 已实现

- 12 道情境题、10 维 Taste Graph 与交叉验证计分
- 矛盾回答自动回归中性，Swipe 小步持续校准
- 真实尖锋商品图片、规格、渠道参考价和有赞链接
- Taste Card 生成与 1080×1440 PNG 下载
- 满 69 减 10 元完成礼、重新测试、好友口味匹配
- /admin/ 经营看板
- 纯静态导出，无后端与密钥依赖
- Taste Engine 11 项自动化测试通过

## 技术

Next.js 15 · React 19 · TypeScript · CSS · Vitest

## 文件

- 静态部署包：jianfeng-taste-static.zip
- 完整源码包：jianfeng-taste-source.zip
- 部署说明：HANDOFF.md
- 给智能体的指令：PROMPT-FOR-YOUZAN-LOBSTER.txt
