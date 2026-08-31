"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BarChart3, Box, ExternalLink, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { PRODUCTS } from "@/lib/data";
import { FEED_VIDEOS } from "@/lib/feed-data";
import { assetUrl } from "@/lib/asset-url";
import { buildLocalFunnel, readTasteEvents } from "@/lib/taste-analytics";

const demoMetrics = [
  { label: "今日食客", value: "284", change: "+18.4%", note: "较昨日", icon: <Users size={19} /> },
  { label: "测试完成率", value: "72.6%", change: "+6.2%", note: "206 人完成", icon: <BarChart3 size={19} /> },
  { label: "平均 Swipe", value: "11.8", change: "+2.1", note: "每位食客", icon: <ArrowUpRight size={19} /> },
  { label: "购买跳转", value: "39", change: "13.7%", note: "推荐点击率", icon: <ExternalLink size={19} /> },
];

export default function AdminPage() {
  const [localFunnel, setLocalFunnel] = useState<ReturnType<typeof buildLocalFunnel> | null>(null);
  useEffect(() => setLocalFunnel(buildLocalFunnel(readTasteEvents())), []);
  const hasLocalData = Boolean(localFunnel?.started);
  const metrics = hasLocalData && localFunnel ? [
    { label: "本机体验会话", value: String(localFunnel.sessions), change: "真实", note: "匿名本地事件", icon: <Users size={19} /> },
    { label: "测试完成率", value: `${localFunnel.completionRate}%`, change: `${localFunnel.completed}`, note: "人完成", icon: <BarChart3 size={19} /> },
    { label: "商品查看率", value: `${localFunnel.productViewRate}%`, change: `${localFunnel.products}`, note: "个会话查看", icon: <ArrowUpRight size={19} /> },
    { label: "购买跳转率", value: `${localFunnel.outboundRate}%`, change: `${localFunnel.outbound}`, note: "次外跳", icon: <ExternalLink size={19} /> },
    { label: "结果认同率", value: localFunnel.feedbackCount ? `${localFunnel.recognitionRate}%` : "待反馈", change: `${localFunnel.feedbackCount}`, note: "份结果评价", icon: <BarChart3 size={19} /> },
    { label: "分享 / 领礼", value: `${localFunnel.shares} / ${localFunnel.rewardClaims}`, change: "真实", note: "本机行为", icon: <Users size={19} /> },
  ] : demoMetrics;
  const funnelBars: Array<[string, number, number]> = hasLocalData && localFunnel ? [
    ["开始测试", localFunnel.started, 100],
    ["完成 Taste ID", localFunnel.completed, localFunnel.completionRate],
    ["查看推荐", localFunnel.recommendationViews, localFunnel.started ? Math.round(localFunnel.recommendationViews / localFunnel.started * 100) : 0],
    ["查看商品", localFunnel.products, localFunnel.productViewRate],
    ["购买跳转", localFunnel.outbound, localFunnel.outboundRate],
  ] : [["开始测试", 284, 100], ["完成 Taste ID", 206, 73], ["查看推荐", 188, 66], ["查看商品", 92, 32], ["购买跳转", 39, 14]];
  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand"><i><span /><span /><span /></i><b>尖锋 Taste</b><em>MVP</em></div>
        <nav>
          <a className="is-active"><BarChart3 size={18} />经营看板</a>
          <a><Box size={18} />商品与 Taste DNA</a>
          <a><Users size={18} />食客画像</a>
          <a><ExternalLink size={18} />Taste Feed 视频</a>
        </nav>
        <Link href="/"><ArrowLeft size={16} /> 返回用户端原型</Link>
      </aside>
      <section className="admin-content">
        <header className="admin-header">
          <div><span>{hasLocalData ? "当前设备 · 匿名真实体验数据" : "2026 年 8 月 · 演示数据（完成体验后自动切换）"}</span><h1>Taste 经营看板</h1></div>
          <button><Plus size={17} /> 新增商品</button>
        </header>
        <div className="admin-metrics">
          {metrics.map((metric) => <article key={metric.label}>
            <div><span>{metric.icon}</span><em>{metric.label}</em></div>
            <strong>{metric.value}</strong>
            <p><b>{metric.change}</b> {metric.note}</p>
          </article>)}
        </div>
        <div className="admin-grid">
          <article className="admin-panel admin-chart">
            <div className="admin-panel__head"><div><span>核心漏斗</span><h2>从测试到购买跳转</h2></div><em>近 7 日</em></div>
            <div className="funnel-bars">
              {funnelBars.map(([label, value, width]) => <div key={label}><span>{label}</span><i><b style={{ width: `${Math.min(100, width)}%` }} /></i><strong>{value}</strong></div>)}
            </div>
          </article>
          <article className="admin-panel admin-persona">
            <div className="admin-panel__head"><div><span>热门人格</span><h2>今天谁最多？</h2></div></div>
            <div className="persona-rank"><i>🌶️</i><span><b>无辣不欢派</b><em>占今日完成测试 24%</em></span><strong>49</strong></div>
            <div className="persona-rank"><i>🥩</i><span><b>咸香肉食探索家</b><em>占今日完成测试 19%</em></span><strong>39</strong></div>
            <div className="persona-rank"><i>🥬</i><span><b>清爽本味观察员</b><em>占今日完成测试 14%</em></span><strong>29</strong></div>
          </article>
        </div>
        <article className="admin-panel admin-products">
          <div className="admin-panel__head"><div><span>商品管理</span><h2>热门推荐与 Taste DNA</h2></div><button>查看全部 <ArrowUpRight size={15} /></button></div>
          <div className="admin-table">
            <div className="admin-tr admin-th"><span>商品</span><span>价格</span><span>Top DNA</span><span>曝光 / 点击</span><span>状态</span></div>
            {PRODUCTS.slice(0, 5).map((product, index) => {
              const dna = Object.entries(product.vector).sort((a, b) => b[1] - a[1]).slice(0, 2);
              return <div className="admin-tr" key={product.id}>
                <span className="admin-product-name">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={assetUrl(product.image)} alt="" /><b>{product.name}</b>
                </span>
                <span>{product.price == null ? "待同步" : `¥${product.price}`}</span>
                <span className="dna-tags">{dna.map(([key]) => <i key={key}>{key}</i>)}</span>
                <span>{1860 - index * 173} / {284 - index * 29}</span>
                <span><em className="status-dot" /> 上架中</span>
              </div>;
            })}
          </div>
        </article>
        <article className="admin-panel ai-strategy-panel">
          <div className="admin-panel__head"><div><span>AIGC STRATEGY · HUMAN IN THE LOOP</span><h2>AI 运营策略中心</h2></div><em>先审后发</em></div>
          <p className="ai-strategy-intro">AI只生成解释、内容草稿和实验建议；商品事实来自 Taste DNA 与已审核资料。价格、库存、评价和食品功效不得由模型编造。</p>
          <div className="ai-strategy-grid">
            <section><i>01</i><b>结果解释</b><p>把测试维度翻译成人话，每句话必须能追溯到用户选择。</p><span>自动生成 · 可直接展示</span></section>
            <section><i>02</i><b>内容草稿</b><p>按人格生成短视频标题和商品卖点，但只能引用审核过的商品事实。</p><span>生成草稿 · 运营审核</span></section>
            <section><i>03</i><b>经营建议</b><p>根据完成率、认同率和商品点击提出实验，不自动改价格或发券。</p><span>建议模式 · 人工决策</span></section>
            <section className="is-guardrail"><i>!</i><b>禁止生成</b><p>虚构购买评价、疾病功效、库存、原价、销量和“100%适合你”。</p><span>命中即阻断发布</span></section>
          </div>
          <div className="ai-source-line"><b>事实来源优先级</b><span>商品包装/质检资料 → 有赞商品数据 → 人工审核内容 → 用户匿名行为</span></div>
        </article>
        <article className="admin-panel admin-products">
          <div className="admin-panel__head"><div><span>TASTE FEED · DEMO ANALYTICS</span><h2>视频内容与转化表现</h2></div><button><Plus size={15} /> 新增视频 URL</button></div>
          <p style={{ color: "#8a8e88", fontSize: 11, margin: "-8px 0 16px" }}>以下播放、互动和复购率均为演示数据；正式版接入真实行为事件及有赞订单后替换。</p>
          <div className="admin-table">
            <div className="admin-tr admin-th"><span>视频 / 商品</span><span>播放</span><span>完播率</span><span>Feed → 商品 CTR</span><span>状态</span></div>
            {FEED_VIDEOS.slice(0, 6).map((video, index) => {
              return <div className="admin-tr" key={video.id}>
                <span className="admin-product-name"><img src={assetUrl(video.posterUrl)} alt="" /><b>{video.title}</b></span>
                <span>{(3280-index*217).toLocaleString()}</span><span>{68-index*2}%</span><span>{(8.6-index*.5).toFixed(1)}%</span><span><em className="status-dot" /> 演示上架</span>
              </div>;
            })}
          </div>
        </article>
      </section>
    </main>
  );
}
