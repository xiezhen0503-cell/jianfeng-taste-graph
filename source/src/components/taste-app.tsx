"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CalendarDays,
  ChefHat,
  Check,
  ChevronRight,
  CircleUserRound,
  Compass,
  Copy,
  Download,
  Flame,
  Heart,
  Home,
  Info,
  Leaf,
  RotateCcw,
  Scale,
  Settings,
  Share2,
  ShoppingBag,
  Sparkles,
  TicketPercent,
  ThumbsDown,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { assetUrl } from "@/lib/asset-url";
import { trackTasteEvent } from "@/lib/taste-analytics";
import { TasteFeed } from "@/components/taste-feed";
import { CookingGame } from "@/components/cooking-game";
import { DEMO_FRIEND_VECTOR, PRODUCTS, QUESTIONS } from "@/lib/data";
import { MEAL_PRESETS, buildSmartPlan, planMeal, type MealGoal, type Portion } from "@/lib/meal-planner";
import {
  INITIAL_TASTE,
  TASTE_KEYS,
  TASTE_LABELS,
  applyTasteTestAnswers,
  calculateTasteCompatibility,
  calculateTasteConfidence,
  generateTasteType,
  recommendProducts,
  scoreTasteTest,
  updateTasteFromAction,
} from "@/lib/taste-engine";
import type { AppView, NavView, Product, TasteKey, TasteVector } from "@/types";

const STORAGE_KEY = "jianfeng-taste-prototype";
const MEAL_STORAGE_KEY = "jianfeng-meal-logs-v1";

type StoredTaste = {
  vector: TasteVector;
  answerCount: number;
  swipeCount: number;
  testConfidence?: number;
  couponClaimed?: boolean;
  rewardType?: "coupon" | "sample" | "points";
  repurchaseRewardClaimed?: boolean;
  visitDays?: string[];
  gameCouponClaimed?: boolean;
};

const DEFAULT_STORED: StoredTaste = { vector: INITIAL_TASTE, answerCount: 0, swipeCount: 0, couponClaimed: false };

function getTasteCharacter(vector: TasteVector) {
  const tasteType = generateTasteType(vector);
  const dominantFlavor = [
    { label: "辣香", icon: "🌶", value: vector.spicy },
    { label: "甜润", icon: "🍰", value: vector.sweet },
    { label: "咸鲜", icon: "🥢", value: vector.savory },
    { label: "肉香", icon: "🥩", value: vector.meat },
    { label: "清鲜", icon: "🥬", value: vector.healthy },
  ].sort((a, b) => b.value - a.value)[0];
  const typeOrder = [
    "BEQS", "BEQI", "BERS", "BERI",
    "BCQS", "BCQI", "BCRS", "BCRI",
    "LEQS", "LEQI", "LERS", "LERI",
    "LCQS", "LCQI", "LCRS", "LCRI",
  ];
  const typeIndex = Math.max(0, typeOrder.indexOf(tasteType.code));
  return {
    image: `/images/taste-characters/${tasteType.code.toLowerCase()}-v3.webp`,
    role: `16 型口味人格 · 第 ${typeIndex + 1} 型`,
    primary: dominantFlavor.label,
    icon: dominantFlavor.icon,
    traits: tasteType.axes.slice(1).map((axis) => axis.label.split(" ")[0]),
  };
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`} aria-label="尖锋 Taste">
      <img className="brand__logo" src={assetUrl("/images/brand/jianfeng-shike-logo.jpg")} alt="" />
      <span>尖锋食客 <b>Taste</b></span>
    </div>
  );
}

function TasteOrbit({ vector = INITIAL_TASTE, small = false }: { vector?: TasteVector; small?: boolean }) {
  const dots: { key: TasteKey; label: string; emoji: string; angle: number }[] = [
    { key: "spicy", label: "辣", emoji: "🌶", angle: -78 },
    { key: "sweet", label: "甜", emoji: "🍰", angle: -20 },
    { key: "savory", label: "鲜", emoji: "🍜", angle: 38 },
    { key: "healthy", label: "轻", emoji: "🥬", angle: 92 },
    { key: "meat", label: "肉", emoji: "🥩", angle: 152 },
    { key: "adventurous", label: "新", emoji: "✨", angle: 210 },
  ];
  return (
    <div className={`taste-orbit ${small ? "taste-orbit--small" : ""}`} aria-hidden="true">
      <div className="taste-orbit__ring taste-orbit__ring--outer" />
      <div className="taste-orbit__ring taste-orbit__ring--inner" />
      <div className="taste-orbit__core"><span>你的</span><strong>味觉</strong></div>
      {dots.map((dot) => {
        const radius = (small ? 94 : 132) * (0.74 + vector[dot.key] / 380);
        const x = Math.cos((dot.angle * Math.PI) / 180) * radius;
        const y = Math.sin((dot.angle * Math.PI) / 180) * radius;
        return (
          <div className="taste-orbit__dot" key={dot.key} style={{ transform: `translate(${x}px, ${y}px)` }}>
            <span>{dot.emoji}</span><small>{dot.label}</small>
          </div>
        );
      })}
    </div>
  );
}

function RadarChart({ vector, compact = false }: { vector: TasteVector; compact?: boolean }) {
  const keys = TASTE_KEYS.slice(0, 8);
  const size = compact ? 220 : 278;
  const center = size / 2;
  const radius = compact ? 74 : 92;
  const pointAt = (value: number, index: number, maxRadius = radius) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / keys.length;
    const r = maxRadius * (value / 100);
    return [center + Math.cos(angle) * r, center + Math.sin(angle) * r];
  };
  const polygon = keys.map((key, index) => pointAt(vector[key], index).join(",")).join(" ");
  return (
    <svg className="radar" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Taste 口味雷达图">
      {[0.33, 0.66, 1].map((level) => (
        <polygon key={level} points={keys.map((_, i) => pointAt(100, i, radius * level).join(",")).join(" ")} className="radar__grid" />
      ))}
      {keys.map((_, index) => {
        const [x, y] = pointAt(100, index);
        return <line key={index} x1={center} y1={center} x2={x} y2={y} className="radar__line" />;
      })}
      <polygon points={polygon} className="radar__shape" />
      {keys.map((key, index) => {
        const [x, y] = pointAt(100, index, radius + (compact ? 25 : 34));
        return <text key={key} x={x} y={y} className="radar__label">{TASTE_LABELS[key]}</text>;
      })}
    </svg>
  );
}

function MatchRing({ value, size = 68 }: { value: number; size?: number }) {
  return (
    <div className="match-ring" style={{ "--match": `${value * 3.6}deg`, "--ring-size": `${size}px` } as React.CSSProperties}>
      <div><strong>{value}</strong><span>%</span></div>
    </div>
  );
}

function TopBar({ onBack, action }: { onBack?: () => void; action?: React.ReactNode }) {
  return (
    <header className="topbar">
      {onBack ? <button className="icon-button" onClick={onBack} aria-label="返回"><ArrowLeft size={20} /></button> : <Logo compact />}
      <div className="topbar__spacer" />
      {action}
    </header>
  );
}

function BottomNav({ active, onChange }: { active: NavView; onChange: (view: NavView) => void }) {
  const items: { id: NavView; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "首页", icon: <Home size={21} /> },
    { id: "discover", label: "发现", icon: <Compass size={22} /> },
    { id: "meal", label: "搭配", icon: <Utensils size={21} /> },
    { id: "game", label: "挑战", icon: <ChefHat size={21} /> },
    { id: "taste", label: "Taste", icon: <Sparkles size={21} /> },
    { id: "profile", label: "我的", icon: <CircleUserRound size={21} /> },
  ];
  return (
    <nav className="bottom-nav" aria-label="主导航">
      {items.map((item) => (
        <button key={item.id} className={active === item.id ? "is-active" : ""} onClick={() => onChange(item.id)}>
          <span>{item.icon}</span><small>{item.label}</small>
        </button>
      ))}
    </nav>
  );
}

function ProductMiniCard({ product, match, reasons, onClick }: { product: Product; match: number; reasons: string[]; onClick: () => void }) {
  return (
    <button className="product-mini" onClick={onClick}>
      <div className="product-mini__image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={assetUrl(product.image)} alt={product.name} />
        <span>{match}% 合口味</span>
      </div>
      <div className="product-mini__copy">
        <strong>{product.name}</strong>
        <p>{reasons.join(" · ")}</p>
        <div><b>{product.price == null ? "价格待同步" : `¥${product.price}`}</b><ChevronRight size={17} /></div>
      </div>
    </button>
  );
}

function WelcomeView({ onStart, onExplain }: { onStart: () => void; onExplain: () => void }) {
  return (
    <main className="view welcome-view">
      <TopBar action={<button className="text-button" onClick={onExplain}>它怎么懂我？</button>} />
      <section className="welcome-hero">
        <div className="welcome-hero__copy">
          <span className="eyebrow">15 道选择 · 生成专属称号</span>
          <h1>测出你的<br /><em>口味称号</em></h1>
          <p>有人是“浓味尝鲜气氛王”。你会是哪一种食客？</p>
        </div>
        <div className="welcome-reveal">
          <TasteOrbit />
          <div className="title-card-peek"><small>你的称号待揭晓</small><strong>？？？？？？？</strong><span>每选一口，线索就多一点</span></div>
        </div>
      </section>
      <section className="welcome-actions">
        <button className="primary-button" onClick={onStart}>开始测我的口味称号 <ArrowRight size={20} /></button>
        <div className="welcome-gift"><TicketPercent size={15} /><span><b>完成测试，专属口味礼三选一</b><small>立减券、随单小样、Taste 积分任选一种</small></span></div>
        <div className="welcome-proof">
          <span><Check size={14} /> 约 45 秒</span>
          <span><Check size={14} /> 无需登录</span>
          <span><Check size={14} /> 15 道情境题</span>
        </div>
        <small className="privacy-promise">🔒 不收集姓名和手机号，测试结果仅保存在你的设备中</small>
        <p>用真实选择，找到更合口味的那一款</p>
      </section>
    </main>
  );
}

function FirstTasteInvite({ onStart, onBrowse }: { onStart: () => void; onBrowse: () => void }) {
  return (
    <div className="sheet-backdrop taste-invite-backdrop" role="dialog" aria-modal="true" aria-labelledby="taste-invite-title">
      <article className="first-taste-invite">
        <div className="first-taste-invite__visual" aria-hidden="true">
          <img src={assetUrl("/images/taste-test/cartoon-v2/option-02.webp")} alt="" />
          <span>15 道选择</span>
        </div>
        <span className="eyebrow">先认识你的口味</span>
        <h2 id="taste-invite-title">你是哪一种食客？</h2>
        <p>用大约 45 秒生成口味称号，之后的商品、搭配和厨艺挑战都会更合你胃口。</p>
        <div className="first-taste-invite__benefits">
          <span><Check size={14} /> 不用登录</span>
          <span><TicketPercent size={14} /> 完成可领口味礼</span>
        </div>
        <button className="primary-button" onClick={onStart}>开始测试 <ArrowRight size={18} /></button>
        <button className="first-taste-invite__skip" onClick={onBrowse}>先逛逛</button>
      </article>
    </div>
  );
}

function MethodSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <article className="method-sheet" onClick={(event) => event.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} aria-label="关闭"><X size={20} /></button>
        <span className="eyebrow">推荐为什么更懂你</span>
        <h2>不是贴标签，<br />是在收集味觉证据。</h2>
        <p>15 道情境题会从味道、口感、尝鲜和分享习惯等方面了解你，再从尖锋产品中找到更合拍的选择。</p>
        <div className="method-steps">
          <div><i>01</i><span><strong>换个场景再问一次</strong><small>既看第一反应，也看日常会怎么选。</small></span></div>
          <div><i>02</i><span><strong>允许口味有点矛盾</strong><small>偶尔想尝鲜，不代表你每天都爱重口。</small></span></div>
          <div><i>03</i><span><strong>只说有依据的理由</strong><small>产品信息不够时，不勉强给出高匹配。</small></span></div>
          <div><i>04</i><span><strong>推荐不挤在同一类</strong><small>在合口味的前提下，也给你一些新选择。</small></span></div>
        </div>
        <div className="method-proof"><span>10</span> 种口味信号 <em>·</em> <span>15</span> 道情境选择 <em>·</em> 越用越贴近你</div>
        <button className="primary-button" onClick={onClose}>明白了，开始测试 <ArrowRight size={18} /></button>
      </article>
    </div>
  );
}

function TasteTestView({ questionIndex, selected, vector, onSelect, onBack }: {
  questionIndex: number;
  selected: number | null;
  vector: TasteVector;
  onSelect: (option: number) => void;
  onBack: () => void;
}) {
  const question = QUESTIONS[questionIndex];
  return (
    <main className="view test-view">
      <TopBar onBack={onBack} action={<span className="step-count"><b>{questionIndex + 1}</b> / {QUESTIONS.length}</span>} />
      <div className="progress-track"><span style={{ width: `${((questionIndex + 1) / QUESTIONS.length) * 100}%` }} /></div>
      <section className="question-head">
        <span className="eyebrow">{question.kicker}</span>
        <h2>{question.question}</h2>
        <p>跟着第一反应选，没有标准答案。</p>
      </section>
      <section className="option-stack">
        {question.options.map((option, index) => (
          <button
            key={option.label}
            className={`taste-option ${selected === index ? "is-selected" : ""}`}
            onClick={() => onSelect(index)}
          >
            {option.image ? <span className="taste-option__photo"><img src={assetUrl(option.image)} alt={option.label} /><i /></span> : <span className="taste-option__emoji">{option.emoji}</span>}
            <span className="taste-option__copy"><strong>{option.label}</strong><small>{option.caption}</small></span>
            <span className="taste-option__check"><Check size={18} /></span>
          </button>
        ))}
      </section>
      <div className="test-live">
        <TasteOrbit vector={vector} small />
        <div><span>尖锋正在认识你</span><strong>{questionIndex < 2 ? "轮廓刚刚出现" : questionIndex < 6 ? "偏好越来越清楚" : "Taste ID 即将生成"}</strong></div>
      </div>
    </main>
  );
}

function ResultView({ vector, confidence, onContinue, onShare, onRetest, onFeedback }: { vector: TasteVector; confidence: number; onContinue: () => void; onShare: () => void; onRetest: () => void; onFeedback: (value: "accurate" | "partial" | "wrong") => void }) {
  const tasteType = generateTasteType(vector);
  const character = getTasteCharacter(vector);
  const topKeys = [...TASTE_KEYS].sort((a, b) => vector[b] - vector[a]).slice(0, 3);
  const [feedback, setFeedback] = useState<"accurate" | "partial" | "wrong" | null>(null);
  return (
    <main className="view result-view">
      <TopBar action={<button className="icon-button" onClick={onShare} aria-label="分享"><Share2 size={20} /></button>} />
      <section className="result-intro">
        <span className="eyebrow">你的专属口味称号</span>
        <div className="taste-character-stage"><img src={assetUrl(character.image)} alt={`${tasteType.title}人格角色`} loading="eager" decoding="async" /><div className="persona-seal"><strong>{character.icon} {character.primary}</strong><small>{character.traits.join(" · ")}</small></div></div>
        <h1>{tasteType.title}</h1>
        <p>{tasteType.summary}</p>
        <div className="persona-recognition" aria-label="你的三个显著口味特征">
          {topKeys.map((key) => <b key={key}>{TASTE_LABELS[key]} {vector[key]}</b>)}
        </div>
      </section>
      <section className="result-actions result-actions--celebrate">
        <div className="guaranteed-gift"><TicketPercent size={17} /><span><b>测试完成，专属口味礼已解锁</b><small>先保存称号，再去看看最适合你的商品</small></span></div>
        <button className="primary-button" onClick={onShare}><Share2 size={18} /> 保存我的称号卡</button>
        <button className="secondary-button" onClick={onContinue}>查看我的专属推荐 <ArrowRight size={18} /></button>
      </section>
      <details className="result-details">
        <summary><span><Sparkles size={16} /> 查看完整口味报告</span><ChevronRight size={18} /></summary>
        <section className="type-axis-grid" aria-label="四项口味类型维度">
          {tasteType.axes.map((axis) => <div key={axis.letter}><span><strong>{axis.label.split(" ")[0]}</strong><small>{axis.description}</small></span><em>{axis.score}</em></div>)}
        </section>
        <section className="taste-card">
          <div className="taste-card__stamp">JF / {String(Math.round(vector.meat * 73 + vector.savory * 19)).slice(0, 4)}</div>
          <RadarChart vector={vector} compact />
          <div className="taste-card__top">
            {topKeys.map((key) => <div key={key}><span>{TASTE_LABELS[key]}</span><strong>{vector[key]}</strong></div>)}
          </div>
          <div className="taste-card__rare"><Sparkles size={15} /> 来自 <b>15 道情境选择</b>，之后会随你的选择继续更新</div>
        </section>
        <section className="type-evidence"><span>称号依据</span><h2>为什么是“{tasteType.title}”？</h2>{tasteType.evidence.slice(0, 3).map((item, index) => <p key={item}><i>0{index + 1}</i>{item}</p>)}</section>
      </details>
      <section className="result-feedback">
        <span>这个结果像你吗？</span>
        {feedback ? <p><Check size={15} /> 收到了，之后的推荐会参考这次反馈。</p> : <div>{([['accurate','很像我'],['partial','有一点像'],['wrong','不太像']] as const).map(([value,label]) => <button key={value} onClick={() => { setFeedback(value); onFeedback(value); }}>{label}</button>)}</div>}
      </section>
      <div className="confidence-note confidence-note--result"><span>初始理解度 {confidence}% · 真实选择会继续校准</span><div><i style={{ width: `${confidence}%` }} /></div></div>
      <button className="result-retest" onClick={onRetest}><RotateCcw size={14} /> 结果不像我？重新测一次</button>
    </main>
  );
}

const FOOD_REVIEWS = [
  { id: 1, category: "口味", name: "阿柚", profile: "浓香肉食探索家", bought: "尖锋试吃记录", quote: "不是只有咸，肉香后面有一点回甜。空口吃也不会齁，追剧时一包很快就没了。", signals: ["咸香 4/5", "回甜 2/5", "追剧 适合"], productId: "pork-sausage" },
  { id: 2, category: "口感", name: "小满", profile: "酥脆口感收藏家", bought: "尖锋试吃记录", quote: "第一口是脆，嚼开以后不干柴。碎渣比想象中少，办公室吃不会弄得到处都是。", signals: ["酥脆 5/5", "干硬 1/5", "掉渣 少"], productId: "rye-nut-bread" },
  { id: 3, category: "辣度", name: "周周", profile: "无辣不欢派", bought: "尖锋试吃记录", quote: "入口是香辣，不是一下把嘴麻住。大概中辣，后劲慢慢上来，配冰饮刚好。", signals: ["辣度 3/5", "麻度 2/5", "后劲 有"], productId: "pepper-chicken-feet" },
  { id: 4, category: "甜度", name: "Nana", profile: "柔软口感收藏家", bought: "尖锋试吃记录", quote: "甜味比较克制，吃完嘴里不会发腻。下午三四点配茶，分量刚好。", signals: ["甜度 2/5", "腻感 1/5", "配茶 适合"], productId: "fresh-milk-cake" },
  { id: 5, category: "分量", name: "老陈", profile: "聪明囤货掌柜", bought: "尖锋试吃记录", quote: "独立包装很好控制量，一次两袋正合适。全家一起吃建议直接选组合装，更划算。", signals: ["独立包装", "分享 适合", "囤货 推荐"], productId: "angus-beef-pie" },
  { id: 6, category: "做法", name: "一颗葱", profile: "效率美味主义者", bought: "尖锋试吃记录", quote: "直接吃方便，空气炸锅加热三分钟以后香气更明显。切碎拌面也很好用。", signals: ["快手 正餐", "加热 方便", "一人食"], productId: "tomato-pasta" },
];

function FoodReviewRail({ recommendations, onProduct }: { recommendations: ReturnType<typeof recommendProducts>; onProduct: (p: Product) => void }) {
  const [category, setCategory] = useState("口味");
  const categories = FOOD_REVIEWS.map((review) => review.category);
  const ordered = [...FOOD_REVIEWS].sort((a, b) => Number(b.category === category) - Number(a.category === category));
  return (
    <section className="food-reviews">
      <div className="food-reviews__heading"><div><span>尖锋试吃笔记</span><h2>这一口，吃起来怎么样</h2></div><small>来自尖锋试吃记录</small></div>
      <div className="food-reviews__layout">
        <nav aria-label="评价维度">{categories.map((item) => <button key={item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</nav>
        <div className="food-reviews__rail">
          {ordered.map((review) => {
            const product = PRODUCTS.find((item) => item.id === review.productId);
            return <article className="food-review-card" key={review.id}>
              {product && <button className="food-review-card__visual" onClick={() => onProduct(product)} aria-label={`查看${product.name}`}><img src={assetUrl(product.image)} alt={product.name} /><span><b>{product.name}</b><small>试吃实物</small></span></button>}
              <header><i>{review.name.slice(0, 1)}</i><span><b>{review.name}</b><small>{review.profile} · {review.bought}</small></span><em>试吃</em></header>
              <blockquote>“{review.quote}”</blockquote>
              <div className="food-review-card__signals">{review.signals.map((signal) => <span key={signal}>{signal}</span>)}</div>
              {product && <button onClick={() => onProduct(product)}><img src={assetUrl(product.image)} alt="" /><span><small>这位食客吃的是</small><b>{product.name}</b></span><ArrowRight size={16} /></button>}
            </article>;
          })}
        </div>
      </div>
      <p className="food-reviews__hint">左右滑动看更多吃感笔记</p>
    </section>
  );
}

function HomeView({ vector, confidence, recommendations, onProduct, onDiscover, onTaste, onMeal, onGame, onFirstGift, onReturnReward, onBundleOffer, mealCount, latestMeal, couponClaimed, repurchaseRewardClaimed, hasMealFeedback, visitDays, swipeCount }: {
  vector: TasteVector;
  confidence: number;
  recommendations: ReturnType<typeof recommendProducts>;
  onProduct: (p: Product) => void;
  onDiscover: () => void;
  onTaste: () => void;
  onMeal: () => void;
  onGame: () => void;
  onFirstGift: () => void;
  onReturnReward: () => void;
  onBundleOffer: () => void;
  mealCount: number;
  latestMeal?: { dishName: string; kcal: [number, number] };
  couponClaimed?: boolean;
  repurchaseRewardClaimed?: boolean;
  hasMealFeedback: boolean;
  visitDays: number;
  swipeCount: number;
}) {
  const tasteType = generateTasteType(vector);
  const character = getTasteCharacter(vector);
  const first = recommendations[0];
  const strongestSignal = [...TASTE_KEYS].sort((a, b) => vector[b] - vector[a])[0];
  return (
    <main className="view app-view home-view">
      <TopBar action={<button className="avatar-button" aria-label="个人资料">J</button>} />
      <section className="home-greeting">
        <span>下午好，John</span>
        <h1>今天想吃点<br />什么感觉？</h1>
      </section>
      <section className={`return-reward ${repurchaseRewardClaimed ? "is-complete" : ""}`}>
        <div className="return-reward__title"><TicketPercent size={18} /><span><small>首购、加购、复购都有专属权益</small><strong>{!couponClaimed ? "先领专属口味礼" : repurchaseRewardClaimed ? "首购与复购权益已收入囊中" : hasMealFeedback ? "复购礼已解锁，回来得正好" : "吃完回来评一评，再领复购礼"}</strong></span></div>
        <div className="return-reward__steps"><span className={couponClaimed ? "is-done" : ""}><i>1</i>测口味领首购礼</span><em /><span className={hasMealFeedback ? "is-done" : ""}><i>2</i>记录真实吃感</span><em /><span className={repurchaseRewardClaimed ? "is-done" : ""}><i>3</i>解锁复购礼</span></div>
        {!repurchaseRewardClaimed && <button onClick={!couponClaimed ? onFirstGift : hasMealFeedback ? onReturnReward : onMeal}>{!couponClaimed ? "领取首购口味礼" : hasMealFeedback ? "领取复购口味礼" : "去记录这次吃感"}<ArrowRight size={15} /></button>}
        {repurchaseRewardClaimed && <p><Check size={14} /> 下次购买前回来看看，推荐和可用权益会一起更新。</p>}
      </section>
      <section className="offer-center">
        <header><span><TicketPercent size={17} /><b>我的专属优惠</b></span><em>按你的口味准备</em></header>
        <div className="offer-center__grid">
          <button className={couponClaimed ? "is-owned" : "is-ready"} onClick={couponClaimed ? undefined : onFirstGift}>
            <i>首购</i><strong>{couponClaimed ? "口味礼已领取" : "新客口味礼"}</strong><small>{couponClaimed ? "可在推荐商品中使用" : "完成测试即可领取"}</small><em>{couponClaimed ? "已领取" : "立即领取"}</em>
          </button>
          <button className="is-bundle" onClick={onBundleOffer}>
            <i>加购</i><strong>组合购更省</strong><small>按口味搭配多件商品</small><em>去选组合</em>
          </button>
          <button className={repurchaseRewardClaimed ? "is-owned" : hasMealFeedback ? "is-ready" : "is-locked"} onClick={repurchaseRewardClaimed ? undefined : hasMealFeedback ? onReturnReward : onMeal}>
            <i>复购</i><strong>{repurchaseRewardClaimed ? "复购礼已领取" : hasMealFeedback ? "复购礼可领取" : "吃后回访礼"}</strong><small>{hasMealFeedback ? "你的吃感已记录" : "记录真实吃感解锁"}</small><em>{repurchaseRewardClaimed ? "已领取" : hasMealFeedback ? "立即领取" : "待解锁"}</em>
          </button>
        </div>
        <p><Info size={12} /> 优惠范围与金额以尖锋商城活动及结算页为准</p>
      </section>
      <button className="game-entry-card" onClick={onGame}>
        <span className="game-entry-card__icon"><ChefHat size={26}/><i>85+</i></span><span><small>今日趣味挑战 · 60秒</small><strong>做盘意面，赢高分厨艺礼</strong><em>选食材 · 控火候 · 调味 · 装盘</em></span><b>开始挑战 <ArrowRight size={14}/></b>
      </button>
      <button className="daily-meal-card daily-meal-card--primary" onClick={onMeal}>
        <span className="daily-meal-card__date"><CalendarDays size={16} /><b>每日饮食搭配师</b><small>{mealCount ? `近 7 天已记 ${mealCount} 餐` : "选一道菜，马上配成一餐"}</small></span>
        <span className="daily-meal-card__plate"><i>🐟</i><i>🥬</i><i>🍚</i></span>
        <span className="daily-meal-card__copy"><strong>{latestMeal ? `今天吃过：${latestMeal.dishName}` : "酸菜鱼该配什么？现在问我"}</strong><small>{latestMeal ? `${latestMeal.kcal[0]}–${latestMeal.kcal[1]} kcal · 下一餐换个搭配` : "搭配建议 · 热量区间 · 饭后记录"}</small></span>
        <ChevronRight size={20} />
      </button>
      <button className="identity-strip" onClick={onTaste}>
        <span className="identity-strip__emoji identity-strip__character"><img src={assetUrl(character.image)} alt="" /><b>{character.primary}</b></span>
        <span><small>我的口味称号</small><strong>{tasteType.title}</strong><em>理解度 {confidence}%</em></span>
        <ChevronRight size={20} />
      </button>
      <section className="taste-mission">
        <div className="taste-mission__head"><span><Sparkles size={16} /><b>本周口味探索 · 已回来 {visitDays} 天</b></span><em>{Math.min(5, swipeCount)}/5</em></div>
        <div className="taste-mission__bar"><i style={{ width: `${Math.min(100, swipeCount * 20)}%` }} /></div>
        <p>{swipeCount >= 5 ? "本轮画像已校准，推荐会更贴近真实选择。" : `再判断 ${5 - Math.min(5, swipeCount)} 个商品，让理解度继续提升。`}</p>
        <small className="taste-mission__insight">{swipeCount ? `今日发现：你的「${TASTE_LABELS[strongestSignal]}」偏好正在变清晰` : "今日任务：判断 3 个想吃 / 不想吃，刷新明天推荐"}</small>
        <button onClick={onDiscover}>{swipeCount >= 5 ? "看看更新后的推荐" : "继续喂养 Taste ID"}<ArrowRight size={15} /></button>
      </section>
      {first && (
        <section className="hero-rec" onClick={() => onProduct(first.product)} role="button" tabIndex={0}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assetUrl(first.product.image)} alt={first.product.name} />
          <div className="hero-rec__veil" />
          <div className="hero-rec__match"><Zap size={15} fill="currentColor" /> {first.tasteMatch}% 合口味</div>
          {first.product.badge && <div className="hero-rec__badge">{first.product.badge}</div>}
          <div className="hero-rec__copy">
            <span>今天最懂你的 1 号选手</span>
            <h2>{first.product.name}</h2>
            <p>因为你喜欢：{first.reasons.join(" · ")}</p>
            <div><b>{first.product.price == null ? "价格待同步" : `¥${first.product.price}`}</b><button>看懂你的理由 <ArrowRight size={16} /></button></div>
          </div>
        </section>
      )}
      <section className="section-heading">
        <div><span>FOR YOU</span><h2>再给你 4 个准答案</h2></div>
        <button onClick={onDiscover}>继续刷 <ArrowRight size={15} /></button>
      </section>
      <div className="product-row">
        {recommendations.slice(1, 5).map((item) => (
          <ProductMiniCard key={item.product.id} product={item.product} match={item.tasteMatch} reasons={item.reasons} onClick={() => onProduct(item.product)} />
        ))}
      </div>
      <FoodReviewRail recommendations={recommendations} onProduct={onProduct} />
      <section className="learn-more-card">
        <div><Sparkles size={20} /><span><strong>再刷 5 个，推荐会更准</strong><small>每一次想吃 / 不想吃，都在更新你的 Taste Graph。</small></span></div>
        <button onClick={onDiscover}>现在去刷</button>
      </section>
    </main>
  );
}

type MealRating = "again" | "sometimes" | "pause";
type MealLog = { id: string; date: string; dishId: string; dishName: string; kcal: [number, number]; goal: MealGoal; portion?: Portion; rating?: MealRating };

function MealPlannerView({ vector, onBack, onLog, onRate, loggedToday, weeklyLogs, lastDishId, pausedDishIds }: { vector: TasteVector; onBack: () => void; onLog: (meal: MealLog) => void; onRate: (id: string, rating: MealRating) => void; loggedToday: MealLog[]; weeklyLogs: MealLog[]; lastDishId?: string; pausedDishIds: string[] }) {
  const firstSuggestion = MEAL_PRESETS.find((item) => item.id !== lastDishId && !pausedDishIds.includes(item.id)) ?? MEAL_PRESETS.find((item) => item.id !== lastDishId) ?? MEAL_PRESETS[0];
  const [dishId, setDishId] = useState(firstSuggestion.id);
  const [portion, setPortion] = useState<Portion>(1);
  const [goal, setGoal] = useState<MealGoal>("balanced");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [rated, setRated] = useState(false);
  const [planLength, setPlanLength] = useState<1 | 3 | 7>(1);
  const [comboRound, setComboRound] = useState(0);
  const preset = MEAL_PRESETS.find((item) => item.id === dishId) ?? MEAL_PRESETS[0];
  const meal = planMeal(preset, portion, goal);
  const logMeal = () => {
    const id = `${Date.now()}_${meal.id}`;
    onLog({ id, date: new Date().toISOString().slice(0, 10), dishId: meal.id, dishName: meal.name, kcal: meal.total, goal, portion });
    setSavedId(id);
  };
  const weeklyAverage = weeklyLogs.length ? Math.round(weeklyLogs.reduce((sum, item) => sum + (item.kcal[0] + item.kcal[1]) / 2, 0) / weeklyLogs.length) : 0;
  const weeklyVariety = new Set(weeklyLogs.map((item) => item.dishId)).size;
  const smartPlan = planLength === 1 ? null : buildSmartPlan(planLength, vector, comboRound);
  return (
    <main className={`view meal-planner-view ${planLength > 1 ? "is-multi" : ""}`}>
      <TopBar onBack={onBack} action={<span className="meal-today-count">今天 {loggedToday.length} 餐</span>} />
      <section className="meal-planner-head">
        <span className="eyebrow">DAILY FOOD PLAN</span>
        <h1>把想吃的，<br />配成更舒服的一餐。</h1>
        <p>先选主菜。热量会随份量和搭配一起变化。</p>
      </section>
      <nav className="meal-plan-tabs" aria-label="选择搭配周期">
        {([[1,"这一餐"],[3,"3天省心吃"],[7,"7天完整计划"]] as const).map(([value,label]) => <button key={value} className={planLength === value ? "is-active" : ""} onClick={() => setPlanLength(value)}>{label}</button>)}
      </nav>
      {smartPlan && <section className="smart-plan">
        <div className="smart-plan__summary">
          <span><CalendarDays size={17} /> {planLength}天饮食计划</span>
          <h2>先用尖锋好物，<br />再买刚好够用的新鲜食材</h2>
          <div className="smart-plan__reason"><Sparkles size={14} /><span><b>按你的口味动态组合</b>{smartPlan.personalizedReason}</span><button onClick={() => setComboRound((value) => value + 1)}><RotateCcw size={13} />换一组</button></div>
          <div className="smart-plan__money">
            <div><small>预计日均</small><strong>¥{smartPlan.dailyBudget[0]}–{smartPlan.dailyBudget[1]}</strong></div>
            <div><small>{planLength}天吃掉的食材</small><strong>¥{smartPlan.totalBudget[0]}–{smartPlan.totalBudget[1]}</strong></div>
          </div>
          <p>当前可生成约 {smartPlan.combinationCount} 种基础组合，再按你的口味、便利和性价比偏好排序。尖锋商品按实际吃掉的份数计入餐费；整包装购买约 ¥{smartPlan.packCost}。</p>
        </div>
        <div className="smart-plan__cart">
          <header><span><ShoppingBag size={16} /> 尖锋优先购物清单</span><em>按当前商品价</em></header>
          {smartPlan.cart.map((item) => <div key={item.id}><span><b>{item.name}</b><small>{item.unit} · 计划用 {item.usedServings}/{item.packServings} 份</small></span><strong>¥{item.price}</strong></div>)}
          <p><b>普通食材补齐</b>{smartPlan.pantry.join("、")}</p>
        </div>
        <div className="smart-plan__days">
          {smartPlan.days.map((day) => <article key={day.day}>
            <header><i>DAY {day.day}</i><span><b>{day.theme}</b><small>{day.reminder}</small></span></header>
            {day.meals.map((item) => <div key={`${day.day}-${item.slot}`}><em>{item.slot}</em><span><b>{item.title}</b><small>{item.detail}</small>{item.jianfengProduct && <i>尖锋 · {item.jianfengProduct}</i>}</span><strong>{item.kcal[0]}–{item.kcal[1]}<small> kcal</small></strong></div>)}
          </article>)}
        </div>
        <div className="meal-data-note"><Info size={14} /><span>适合一般健康成年人参考。过敏、孕期、慢性病或特殊营养需求，请先咨询医生或注册营养师；价格以尖锋商城结算页为准。</span></div>
      </section>}
      <section className="meal-dish-picker" aria-label="选择主菜">
        {MEAL_PRESETS.map((item) => <button key={item.id} className={dishId === item.id ? "is-active" : ""} onClick={() => { setDishId(item.id); setSavedId(null); setRated(false); }}>
          <img src={assetUrl(item.image)} alt="" /><span><b>{item.name}</b><small>{item.base.role}</small></span>
        </button>)}
      </section>
      <section className="meal-controls">
        <div><span><Scale size={15} /> 我大概吃</span><div>{([0.5, 1, 1.5] as Portion[]).map((value) => <button key={value} className={portion === value ? "is-active" : ""} onClick={() => { setPortion(value); setSavedId(null); setRated(false); }}>{value === .5 ? "半份" : value === 1 ? "一份" : "一份半"}</button>)}</div></div>
        <div><span><Leaf size={15} /> 这餐想要</span><div>{([['balanced','正常搭配'],['lighter','清爽一点'],['protein','蛋白质多一点']] as const).map(([value, label]) => <button key={value} className={goal === value ? "is-active" : ""} onClick={() => { setGoal(value); setSavedId(null); setRated(false); }}>{label}</button>)}</div></div>
      </section>
      <section className="meal-result-card">
        <div className="meal-result-card__hero"><img src={assetUrl(meal.image)} alt={meal.name} /><div><span>这一餐估算</span><strong>{meal.total[0]}–{meal.total[1]}<small> kcal</small></strong><em>可信度 {meal.confidence} · {meal.goalLabel}</em></div></div>
        <div className="meal-plate-list">{meal.parts.map((part, index) => <div key={`${part.name}-${index}`}><i>{index === 0 ? meal.emoji : index === 1 ? "🍚" : index === 2 ? "🥬" : "🥛"}</i><span><b>{part.name}</b><small>{part.portion} · {part.role}</small></span><em>{part.kcal[0]}–{part.kcal[1]}</em></div>)}</div>
        <p className="meal-coach-note"><Leaf size={16} /> {meal.note}</p>
        {meal.saltNotice && <p className="meal-salt-note"><Info size={15} /> {meal.saltNotice}</p>}
      </section>
      <section className="meal-swaps"><span>家里没有？这样换</span>{meal.swaps.map((swap) => <p key={swap}><Check size={14} /> {swap}</p>)}</section>
      {loggedToday.length > 0 && <section className="today-meals"><span>今天已经记了</span>{loggedToday.map((item) => <div key={item.id}><i>{MEAL_PRESETS.find((presetItem) => presetItem.id === item.dishId)?.emoji ?? "🍽️"}</i><b>{item.dishName}</b><small>{item.kcal[0]}–{item.kcal[1]} kcal</small></div>)}</section>}
      {weeklyLogs.length > 0 && <section className="meal-weekly-mini"><div><span>近 7 天</span><strong>{weeklyLogs.length}<small> 餐</small></strong></div><div><span>吃过主菜</span><strong>{weeklyVariety}<small> 种</small></strong></div><div><span>单餐估算均值</span><strong>{weeklyAverage}<small> kcal</small></strong></div><p>{weeklyVariety < 3 ? "这周主菜有点重复，下一餐优先给你换一种。" : "这周主菜变化不错，下一步可以继续补蔬菜和全谷物。"}</p></section>}
      <div className="meal-data-note"><Info size={14} /><span>餐馆菜的用油、份量和汤底会有差别，热量以区间显示。包装食品请优先参考包装上的营养成分表。</span></div>
      <button className={`primary-button meal-log-button ${savedId ? "is-saved" : ""}`} disabled={Boolean(savedId)} onClick={logMeal}>{savedId ? <><Check size={18} /> 已记入今天</> : <><Flame size={18} /> 吃完按这份记入</>}</button>
      {savedId && !rated && <section className="meal-rating"><span>这顿下次还想吃吗？</span><div>{([['again','还想吃'],['sometimes','偶尔可以'],['pause','先别推荐']] as const).map(([value,label]) => <button key={value} onClick={() => { onRate(savedId, value); setRated(true); }}>{label}</button>)}</div></section>}
    </main>
  );
}

function DiscoverView({ item, index, total, dragX, onDragStart, onDragMove, onDragEnd, onAction, onProduct }: {
  item: ReturnType<typeof recommendProducts>[number];
  index: number;
  total: number;
  dragX: number;
  onDragStart: (e: React.PointerEvent) => void;
  onDragMove: (e: React.PointerEvent) => void;
  onDragEnd: (e: React.PointerEvent) => void;
  onAction: (weight: number) => void;
  onProduct: (p: Product) => void;
}) {
  const rotation = dragX / 24;
  return (
    <main className="view app-view discover-view">
      <TopBar action={<span className="step-count"><b>{index + 1}</b> / {total}</span>} />
      <section className="discover-heading">
        <div><span className="eyebrow">TASTE FEED</span><h1>这一口，想不想？</h1></div>
        <button className="icon-button" aria-label="重置"><RotateCcw size={18} /></button>
      </section>
      <section className="swipe-stage">
        <div className="swipe-card swipe-card--behind" />
        <article
          className="swipe-card"
          style={{ transform: `translateX(${dragX}px) rotate(${rotation}deg)` }}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assetUrl(item.product.image)} alt={item.product.name} draggable={false} />
          <div className="swipe-card__shade" />
          {dragX > 35 && <div className="swipe-stamp swipe-stamp--yes">想吃</div>}
          {dragX < -35 && <div className="swipe-stamp swipe-stamp--no">略过</div>}
          <div className="swipe-card__copy">
            <span><Zap size={14} fill="currentColor" /> {item.tasteMatch}% 合口味</span>
            <h2>{item.product.name}</h2>
            <p>{item.product.subtitle}</p>
            <div>{item.reasons.map((reason) => <i key={reason}>{reason}</i>)}</div>
            <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onProduct(item.product)}>看看为什么懂我 <ChevronRight size={16} /></button>
          </div>
        </article>
      </section>
      <section className="swipe-actions">
        <button className="swipe-action swipe-action--no" onClick={() => onAction(-1)}><ThumbsDown size={23} /><span>不太喜欢</span></button>
        <button className="swipe-action swipe-action--super" onClick={() => onAction(2)}><Sparkles size={26} fill="currentColor" /><span>超想吃</span></button>
        <button className="swipe-action swipe-action--yes" onClick={() => onAction(1)}><Heart size={25} fill="currentColor" /><span>想吃</span></button>
      </section>
      <p className="swipe-hint"><ArrowLeft size={14} /> 也可以直接左右滑 <ArrowRight size={14} /></p>
    </main>
  );
}

function TasteProfileView({ vector, confidence, swipeCount, onShare, onFriend, onRetest }: {
  vector: TasteVector;
  confidence: number;
  swipeCount: number;
  onShare: () => void;
  onFriend: () => void;
  onRetest: () => void;
}) {
  const tasteType = generateTasteType(vector);
  const character = getTasteCharacter(vector);
  return (
    <main className="view app-view taste-profile-view">
      <TopBar action={<button className="icon-button" onClick={onShare} aria-label="分享"><Share2 size={20} /></button>} />
      <section className="profile-title">
        <span className="eyebrow">我的口味称号</span>
        <div className="profile-character"><div className="profile-character__visual"><img src={assetUrl(character.image)} alt="" /><b>{character.primary}</b></div><span><small>{character.icon} {character.primary} · {character.traits.join(" · ")}</small><h1>{tasteType.title}</h1></span></div>
        <p>{tasteType.summary}</p>
      </section>
      <section className="profile-type-axes">{tasteType.axes.map((axis) => <span key={axis.letter}>{axis.label.split(" ")[0]}</span>)}</section>
      <button className="retest-prompt" onClick={onRetest}><RotateCcw size={17} /><span><strong>口味变了？重新测一次</strong><small>用新的答案更新 Taste ID</small></span><ChevronRight size={18} /></button>
      <section className="graph-card">
        <div className="graph-card__head"><span>味觉图谱</span><em>已更新 {swipeCount} 次</em></div>
        <RadarChart vector={vector} />
        <div className="graph-card__confidence">
          <div><span>尖锋对你的理解度</span><b>{confidence}%</b></div>
          <div className="meter"><i style={{ width: `${confidence}%` }} /></div>
          <p>{confidence < 55 ? "再刷几口，你的味觉轮廓会更清楚。" : "已经很懂你，再来几次购买会更准确。"}</p>
        </div>
      </section>
      <section className="taste-bars">
        <div className="section-heading"><div><span>口味画像</span><h2>你的十种味觉信号</h2></div></div>
        {TASTE_KEYS.map((key) => (
          <div className="taste-bar" key={key}>
            <span>{TASTE_LABELS[key]}</span><div><i style={{ width: `${vector[key]}%` }} /></div><b>{vector[key]}</b>
          </div>
        ))}
      </section>
      <button className="friend-card" onClick={onFriend}>
        <span className="friend-card__faces"><i>J</i><i>?</i></span>
        <span><small>好友合拍测试</small><strong>测测我们能不能吃到一起</strong><em>邀请好友，看看共同喜欢的菜单</em></span>
        <ChevronRight size={20} />
      </button>
    </main>
  );
}

function ProfileView({ swipeCount, onReset, onFeedback }: { swipeCount: number; onReset: () => void; onFeedback: (message: string) => void }) {
  return (
    <main className="view app-view profile-view">
      <TopBar action={<button className="icon-button" aria-label="设置"><Settings size={20} /></button>} />
      <section className="user-card">
        <div className="user-avatar">J</div>
        <div><span>匿名食客 · 0821</span><h1>John 的味觉档案</h1><p>数据只保存在这台设备</p></div>
      </section>
      <section className="stats-row">
        <div><strong>{swipeCount}</strong><span>刷过的味道</span></div>
        <div><strong>4</strong><span>想吃清单</span></div>
        <div><strong>1</strong><span>好友匹配</span></div>
      </section>
      <section className="settings-list">
        <Link href="/my/wishlist"><span><Bookmark size={19} /> 我的想吃清单</span><ChevronRight size={18} /></Link>
        <button onClick={() => onFeedback("最近看过：藤椒无骨凤爪、厚汁米线")}><span><ShoppingBag size={19} /> 最近看过</span><ChevronRight size={18} /></button>
        <button onClick={() => onFeedback("可在 Taste 页面生成和保存分享卡")}><span><Share2 size={19} /> 我的 Taste 分享</span><ChevronRight size={18} /></button>
        <button onClick={() => onFeedback("每次选择都会轻微更新十维 Taste Graph")}><span><Info size={19} /> Taste 如何工作</span><ChevronRight size={18} /></button>
      </section>
      <button className="reset-button" onClick={onReset}><RotateCcw size={17} /> 重新测试 Taste ID</button>
      <p className="prototype-note">尖锋 Taste · 越吃，越懂你</p>
    </main>
  );
}

function ProductSheet({ product, vector, couponClaimed, onClose, onBuy }: { product: Product; vector: TasteVector; couponClaimed?: boolean; onClose: () => void; onBuy: () => void }) {
  const recommendation = recommendProducts([product], vector)[0];
  const topDna = TASTE_KEYS.map((key) => ({ key, value: product.vector[key] })).sort((a, b) => b.value - a.value).slice(0, 4);
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <article className="product-sheet" onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} aria-label="关闭"><X size={20} /></button>
        <div className="product-sheet__image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assetUrl(product.image)} alt={product.name} />
          <div className="product-sheet__ring"><MatchRing value={recommendation.tasteMatch} /></div>
        </div>
        <div className="product-sheet__body">
          <span className="eyebrow">{product.badge ?? "尖锋为你找到"}</span>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <div className="price-row"><strong>{product.price == null ? "价格待同步" : `¥${product.price}`}</strong><span>{product.unit}</span></div>
          <div className="price-source">渠道参考价 · {product.priceSource}</div>
          {couponClaimed && <div className="product-coupon"><TicketPercent size={16} /><span><b>下单可用 ¥10 Taste 券</b><small>满 69 元可用，以商品页实际结算为准</small></span></div>}
          <div className="why-box">
            <span>为什么适合你</span>
            <div>{recommendation.reasons.map((reason) => <i key={reason}><Check size={13} /> {reason}偏好相合</i>)}</div>
          </div>
          <div className="dna-mini">
            <span>这款的口味特点</span>
            {topDna.map(({ key, value }) => <div key={key}><small>{TASTE_LABELS[key]}</small><b><i style={{ width: `${value}%` }} /></b><em>{value}</em></div>)}
          </div>
          <button className="primary-button" onClick={onBuy}>{couponClaimed ? "带券去尖锋购买" : "去尖锋购买"} <ShoppingBag size={19} /></button>
          <small className="external-note">价格与优惠以尖锋商城结算页为准</small>
        </div>
      </article>
    </div>
  );
}

function CouponSheet({ onClaim, onSkip }: { onClaim: (reward: NonNullable<StoredTaste["rewardType"]>) => void; onSkip: () => void }) {
  const [choice, setChoice] = useState<NonNullable<StoredTaste["rewardType"]>>("coupon");
  const rewards = [
    { id: "coupon" as const, icon: "¥", title: "立减10元", note: "满69元可用" },
    { id: "sample" as const, icon: "尝", title: "口味小样", note: "推荐商品随单赠" },
    { id: "points" as const, icon: "JF", title: "300积分", note: "兑换指定权益" },
  ];
  return (
    <div className="sheet-backdrop coupon-backdrop">
      <article className="coupon-sheet">
        <span className="eyebrow">TASTE TEST · 完成礼</span>
        <div className="coupon-confetti" aria-hidden="true"><i>●</i><i>✦</i><i>●</i><i>✦</i></div>
        <h2>口味找到了，<br />专属礼由你来选。</h2>
        <p>每位完成测试的食客都能获得一份。选择最适合你的权益，领取后7天内有效。</p>
        <div className="reward-options">
          {rewards.map((reward) => <button key={reward.id} className={choice === reward.id ? "is-selected" : ""} onClick={() => setChoice(reward.id)}><i>{reward.icon}</i><span><b>{reward.title}</b><small>{reward.note}</small></span><Check size={15} /></button>)}
        </div>
        <button className="primary-button" onClick={() => onClaim(choice)}>确认领取专属口味礼 <TicketPercent size={19} /></button>
        <button className="coupon-skip" onClick={onSkip}>先看看我的推荐</button>
        <small className="coupon-rule">每位食客限领 1 份 · 使用范围与有效期以领取页面为准</small>
      </article>
    </div>
  );
}

function RetestSheet({ couponClaimed, onConfirm, onClose }: { couponClaimed?: boolean; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <article className="retest-sheet" onClick={(event) => event.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} aria-label="关闭"><X size={20} /></button>
        <div className="retest-sheet__icon"><RotateCcw size={25} /></div>
        <span className="eyebrow">UPDATE MY TASTE</span>
        <h2>重新认识一次<br />现在的你？</h2>
        <p>重新完成 15 道情境题后，新的口味结果会替换当前结果，推荐也会随之更新。</p>
        <div className="retest-impact">
          <span><i><Check size={13} /></i> 测试完成前不会覆盖当前结果</span>
          <span><i><Check size={13} /></i> 完成后生成全新的口味图谱</span>
          {couponClaimed && <span><i><Check size={13} /></i> 已领取的 ¥10 Taste 券不会丢失</span>}
        </div>
        <button className="primary-button" onClick={onConfirm}>重新开始 15 道测试 <ArrowRight size={18} /></button>
        <button className="retest-cancel" onClick={onClose}>保留现在的 Taste ID</button>
      </article>
    </div>
  );
}

function ShareCardSheet({ vector, onClose, onCopy, onSave }: { vector: TasteVector; onClose: () => void; onCopy: () => void; onSave: () => void }) {
  const tasteType = generateTasteType(vector);
  const character = getTasteCharacter(vector);
  const topKeys = [...TASTE_KEYS].sort((a, b) => vector[b] - vector[a]).slice(0, 3);
  return (
    <div className="sheet-backdrop share-backdrop" onClick={onClose}>
      <article className="share-sheet" onClick={(event) => event.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} aria-label="关闭"><X size={20} /></button>
        <div className="share-sheet__head"><span className="eyebrow">MY TASTE CARD</span><small>可保存 · 可分享 · 可匹配</small></div>
        <section className="share-poster">
          <div className="share-poster__brand"><Logo compact /><span>JF / 0821</span></div>
          <div className="share-poster__persona"><img src={assetUrl(character.image)} alt="" /><b className="share-persona-flavor">{character.icon} {character.primary}</b><small>我的专属口味称号</small><h2>{tasteType.title}</h2><p>{tasteType.summary}</p></div>
          <RadarChart vector={vector} compact />
          <div className="share-poster__signals">{topKeys.map((key) => <div key={key}><span>{TASTE_LABELS[key]}</span><strong>{vector[key]}</strong></div>)}</div>
          <div className="share-poster__foot"><span><Sparkles size={14} /> {tasteType.axes.map((axis) => axis.label.split(" ")[0]).join(" · ")}</span><i aria-hidden="true">▦</i></div>
        </section>
        <div className="share-actions">
          <button className="primary-button" onClick={onSave}><Download size={18} /> 保存 Taste Card</button>
          <button className="secondary-button" onClick={onCopy}><Copy size={17} /> 复制邀请链接</button>
        </div>
        <p>把卡片发给朋友，测测你们能不能吃到一起。</p>
      </article>
    </div>
  );
}

async function saveTasteCardPng(vector: TasteVector) {
  const tasteType = generateTasteType(vector);
  const character = getTasteCharacter(vector);
  const characterImage = new Image();
  characterImage.src = assetUrl(character.image);
  await characterImage.decode().catch(() => undefined);
  const topKeys = [...TASTE_KEYS].sort((a, b) => vector[b] - vector[a]).slice(0, 5);
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1440;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.fillStyle = "#1e2923";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#b7d94b";
  context.beginPath();
  context.arc(930, 110, 180, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#f25f32";
  context.beginPath();
  context.arc(70, 1330, 210, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#fffdf8";
  context.font = "700 34px 'Microsoft YaHei', sans-serif";
  context.fillText("尖锋 Taste", 80, 95);
  if (characterImage.complete && characterImage.naturalWidth) {
    context.save();
    context.beginPath();
    context.roundRect(742, 150, 258, 258, 42);
    context.clip();
    context.drawImage(characterImage, 742, 150, 258, 258);
    context.restore();
  }
  context.fillStyle = "#f25f32";
  context.font = "800 24px Arial, sans-serif";
  context.fillText("我的专属口味称号", 80, 190);
  context.fillStyle = "#fffdf8";
  context.font = "800 68px 'Microsoft YaHei', sans-serif";
  context.fillText(tasteType.title, 80, 280);
  context.fillStyle = "#bfc6c0";
  context.font = "400 26px 'Microsoft YaHei', sans-serif";
  const note = tasteType.summary.length > 28 ? `${tasteType.summary.slice(0, 28)}…` : tasteType.summary;
  context.fillText(note, 80, 335);
  context.fillStyle = "#fffdf8";
  context.beginPath();
  context.roundRect(80, 405, 920, 730, 46);
  context.fill();
  context.fillStyle = "#1e2923";
  context.font = "800 28px 'Microsoft YaHei', sans-serif";
  context.fillText("我的味觉信号", 135, 480);
  topKeys.forEach((key, index) => {
    const y = 575 + index * 108;
    context.fillStyle = "#6e756f";
    context.font = "600 25px 'Microsoft YaHei', sans-serif";
    context.fillText(TASTE_LABELS[key], 135, y);
    context.fillStyle = "#e5e5de";
    context.beginPath();
    context.roundRect(270, y - 24, 570, 24, 12);
    context.fill();
    context.fillStyle = index % 2 ? "#b7d94b" : "#f25f32";
    context.beginPath();
    context.roundRect(270, y - 24, 570 * vector[key] / 100, 24, 12);
    context.fill();
    context.fillStyle = "#1e2923";
    context.font = "800 26px Arial, sans-serif";
    context.fillText(String(vector[key]), 875, y);
  });
  context.fillStyle = "#6e756f";
  context.font = "500 24px 'Microsoft YaHei', sans-serif";
  context.fillText("只有 8.7% 的食客和我一样", 135, 1060);
  context.fillStyle = "#fffdf8";
  context.font = "800 34px 'Microsoft YaHei', sans-serif";
  context.fillText("越吃，越懂你。", 80, 1245);
  context.fillStyle = "#bfc6c0";
  context.font = "500 22px Arial, sans-serif";
  context.fillText("JIANFENG TASTE GRAPH", 80, 1290);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `jianfeng-taste-${Date.now()}.png`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

function FriendMatchSheet({ vector, onClose, recommendations }: { vector: TasteVector; onClose: () => void; recommendations: ReturnType<typeof recommendProducts> }) {
  const score = calculateTasteCompatibility(vector, DEMO_FRIEND_VECTOR);
  const common = TASTE_KEYS.map((key) => ({ key, score: Math.min(vector[key], DEMO_FRIEND_VECTOR[key]) })).sort((a, b) => b.score - a.score).slice(0, 3);
  const different = [...TASTE_KEYS].sort((a, b) => Math.abs(vector[b] - DEMO_FRIEND_VECTOR[b]) - Math.abs(vector[a] - DEMO_FRIEND_VECTOR[a]))[0];
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <article className="friend-sheet" onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} aria-label="关闭"><X size={20} /></button>
        <span className="eyebrow">好友口味合拍测试</span>
        <div className="friend-sheet__faces"><i>J</i><span><Heart size={19} fill="currentColor" /></span><i>M</i></div>
        <h2>你们很会吃到一起</h2>
        <div className="big-match"><strong>{score}</strong><span>%</span><small>口味匹配度</small></div>
        <p>适合一起认真吃顿饭，也很可能为最后一块烤肉打起来。</p>
        <div className="common-taste">
          <span>共同喜欢</span>
          {common.map(({ key, score: value }) => <div key={key}><b>{TASTE_LABELS[key]}</b><i><em style={{ width: `${value}%` }} /></i><strong>{value}</strong></div>)}
        </div>
        <div className="difference"><span>最大分歧</span><strong>{TASTE_LABELS[different]}</strong><small>你 {vector[different]} · TA {DEMO_FRIEND_VECTOR[different]}</small></div>
        <div className="together-menu">
          <span>一起吃最合适</span>
          <div>{recommendations.slice(0, 3).map((item) => (
            <div key={item.product.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={assetUrl(item.product.image)} alt="" /><small>{item.product.name}</small>
            </div>
          ))}</div>
        </div>
        <button className="primary-button" onClick={onClose}>生成邀请链接 <Share2 size={18} /></button>
      </article>
    </div>
  );
}

export function TasteApp() {
  const [view, setView] = useState<AppView>("welcome");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [stored, setStored] = useState<StoredTaste>(DEFAULT_STORED);
  const [hydrated, setHydrated] = useState(false);
  const [feedIndex, setFeedIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [detail, setDetail] = useState<Product | null>(null);
  const [friendOpen, setFriendOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [retestOpen, setRetestOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [methodOpen, setMethodOpen] = useState(false);
  const [testInviteOpen, setTestInviteOpen] = useState(false);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [toast, setToast] = useState("");
  const dragStart = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as StoredTaste;
        const visitDay = new Date().toISOString().slice(0, 10);
        const visitDays = [...new Set([...(parsed.visitDays ?? []), visitDay])].slice(-14);
        setStored({ ...parsed, visitDays });
        if (parsed.answerCount >= QUESTIONS.length) setView("home");
      } catch { /* keep the clean prototype state */ }
    } else setStored((current) => ({ ...current, visitDays: [new Date().toISOString().slice(0, 10)] }));
    const directGame = new URLSearchParams(window.location.search).get("game") === "challenge";
    if (directGame) setView("game");
    else if (!saved || (() => { try { return (JSON.parse(saved) as StoredTaste).answerCount < QUESTIONS.length; } catch { return true; } })()) setTestInviteOpen(true);
    try { setMealLogs(JSON.parse(localStorage.getItem(MEAL_STORAGE_KEY) || "[]") as MealLog[]); } catch { /* start with an empty meal diary */ }
    setHydrated(true);
    trackTasteEvent("session_start");
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }, [stored, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(MEAL_STORAGE_KEY, JSON.stringify(mealLogs.slice(-60)));
  }, [mealLogs, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (view === "result") trackTasteEvent("result_view", { type: generateTasteType(stored.vector).title });
    if (view === "home") trackTasteEvent("recommendation_view");
  }, [view, hydrated, stored.vector]);

  useEffect(() => {
    if (!hydrated) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [view, hydrated]);

  const overlayOpen = Boolean(detail || friendOpen || couponOpen || retestOpen || shareOpen || methodOpen || testInviteOpen);
  useEffect(() => {
    if (!hydrated) return;
    const previous = document.body.style.overflow;
    if (overlayOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [overlayOpen, hydrated]);

  const liveDeltas = answers.map((answer, index) => QUESTIONS[index].options[answer].delta);
  const liveVector = useMemo(() => applyTasteTestAnswers(liveDeltas), [answers]);
  const recommendations = useMemo(() => recommendProducts(PRODUCTS, stored.vector), [stored.vector]);
  const confidence = calculateTasteConfidence(stored.answerCount, stored.swipeCount, stored.testConfidence);
  const today = new Date().toISOString().slice(0, 10);
  const todayMeals = mealLogs.filter((meal) => meal.date === today);
  const weeklyMeals = mealLogs.filter((meal) => Date.now() - new Date(`${meal.date}T00:00:00`).getTime() < 7 * 86400000);
  const recentMealCount = weeklyMeals.length;
  const latestMeal = mealLogs[mealLogs.length - 1];
  const currentFeed = recommendations[feedIndex % recommendations.length];

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const startTest = () => {
    setTestInviteOpen(false);
    trackTasteEvent("test_start", { retest: stored.answerCount >= QUESTIONS.length });
    setQuestionIndex(0);
    setAnswers([]);
    setSelected(null);
    setView("test");
  };

  const chooseAnswer = (optionIndex: number) => {
    if (selected !== null) return;
    setSelected(optionIndex);
    const nextAnswers = [...answers, optionIndex];
    window.setTimeout(() => {
      setAnswers(nextAnswers);
      setSelected(null);
      if (questionIndex === QUESTIONS.length - 1) {
        const score = scoreTasteTest(nextAnswers.map((answer, index) => QUESTIONS[index].options[answer].delta));
        trackTasteEvent("test_complete", { confidence: score.confidence, type: generateTasteType(score.vector).title });
        setStored({ vector: score.vector, answerCount: QUESTIONS.length, swipeCount: 0, testConfidence: score.confidence, couponClaimed: stored.couponClaimed });
        setView("result");
      } else {
        setQuestionIndex((value) => value + 1);
      }
    }, 360);
  };

  const swipeAction = (weight: number) => {
    const signal = currentFeed.reasons.slice(0, 2).join("、");
    const label = weight < 0 ? `已略过，${signal}推荐会减少` : weight > 1 ? `已记住：${signal}信号增强` : `已加入想吃，正在学习${signal}`;
    setStored((current) => ({
      ...current,
      vector: updateTasteFromAction(current.vector, currentFeed.product.vector, weight),
      swipeCount: current.swipeCount + 1,
    }));
    setDragX(weight < 0 ? -520 : 520);
    window.setTimeout(() => {
      setFeedIndex((value) => (value + 1) % recommendations.length);
      setDragX(0);
      showToast(label);
    }, 240);
  };

  const onDragStart = (event: React.PointerEvent) => {
    dragStart.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onDragMove = (event: React.PointerEvent) => {
    if (dragStart.current !== null) setDragX(event.clientX - dragStart.current);
  };
  const onDragEnd = (event: React.PointerEvent) => {
    if (dragStart.current === null) return;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* already released */ }
    dragStart.current = null;
    if (Math.abs(dragX) > 85) swipeAction(dragX > 0 ? 1 : -1);
    else setDragX(0);
  };

  const changeNav = (next: NavView) => {
    if (next === "game") trackTasteEvent("game_start", { source: "bottom_nav" });
    setView(next);
  };
  const openProduct = (product: Product) => {
    trackTasteEvent("product_view", { productId: product.id, product: product.name });
    setDetail(product);
  };
  const copyShare = async () => {
    trackTasteEvent("share", { method: "copy" });
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/?taste=JF0821`);
      showToast("Taste 链接已复制，发给那个懂吃的人吧");
    } catch {
      showToast("Taste Card 已准备好");
    }
  };
  const buy = () => {
    if (detail) trackTasteEvent("outbound_click", { productId: detail.id, product: detail.name, coupon: Boolean(stored.couponClaimed) });
    if (detail) window.open(detail.externalUrl, "_blank", "noopener,noreferrer");
    showToast("正在前往尖锋有赞商品页");
  };
  const logMeal = (meal: MealLog) => {
    setMealLogs((current) => [...current, meal]);
    trackTasteEvent("meal_log", { dishId: meal.dishId, dish: meal.dishName, kcalLow: meal.kcal[0], kcalHigh: meal.kcal[1] });
    showToast("这餐记好了，明天推荐会避开重复");
  };
  const rateMeal = (id: string, rating: MealRating) => {
    setMealLogs((current) => current.map((meal) => meal.id === id ? { ...meal, rating } : meal));
    trackTasteEvent("meal_plan_create", { rating });
    showToast(rating === "again" ? "记住了，下周还会推荐" : rating === "pause" ? "近期先不推荐这道" : "记住了，偶尔再吃");
  };
  if (!hydrated) return <div className="app-shell"><div className="loading-mark"><Logo /><span /></div></div>;

  const activeNav = (["home", "discover", "meal", "game", "taste", "profile"].includes(view) ? view : "home") as NavView;

  return (
    <div className="app-shell">
      <aside className="desktop-note">
        <span className="desktop-note__kicker">INTERACTIVE ENTRY · 2026</span>
        <strong>越吃，<br />越懂你。</strong>
        <p>把食品推荐从“猜你喜欢”，变成一张会随每次选择生长的个人 Taste Graph。</p>
        <div className="desktop-note__facts"><span><b>10</b> 维味觉信号</span><span><b>8</b> 个真实尖锋 SKU</span><span><b>0</b> 登录门槛</span></div>
        <div className="desktop-note__flow"><i>测</i><em /><i>懂</i><em /><i>吃</i><em /><i>更懂</i></div>
        <small>请在右侧手机中完成测试，看看推荐、饮食搭配与好友合拍结果。</small>
      </aside>
      <div className="phone-canvas">
        {view === "welcome" && <WelcomeView onStart={startTest} onExplain={() => setMethodOpen(true)} />}
        {view === "test" && <TasteTestView questionIndex={questionIndex} selected={selected} vector={liveVector} onSelect={chooseAnswer} onBack={() => questionIndex === 0 ? setView("welcome") : (setQuestionIndex((v) => v - 1), setAnswers((v) => v.slice(0, -1)))} />}
        {view === "result" && <ResultView vector={stored.vector} confidence={confidence} onContinue={() => stored.couponClaimed ? setView("home") : setCouponOpen(true)} onShare={() => setShareOpen(true)} onRetest={() => setRetestOpen(true)} onFeedback={(value) => trackTasteEvent("result_feedback", { value, type: generateTasteType(stored.vector).title })} />}
        {view === "home" && <HomeView vector={stored.vector} confidence={confidence} recommendations={recommendations} onProduct={openProduct} onDiscover={() => setView("discover")} onTaste={() => setView("taste")} onMeal={() => { trackTasteEvent("meal_plan_view"); setView("meal"); }} onGame={() => { trackTasteEvent("game_start"); setView("game"); }} onFirstGift={() => setCouponOpen(true)} onReturnReward={() => { trackTasteEvent("reward_claim", { rewardType: "repurchase" }); setStored((current) => ({ ...current, repurchaseRewardClaimed: true })); showToast("复购口味礼已放进“我的”"); }} onBundleOffer={() => { trackTasteEvent("recommendation_view", { source: "bundle_offer" }); setView("home"); if (recommendations[0]) openProduct(recommendations[0].product); }} mealCount={recentMealCount} latestMeal={todayMeals[todayMeals.length - 1]} couponClaimed={stored.couponClaimed} repurchaseRewardClaimed={stored.repurchaseRewardClaimed} hasMealFeedback={mealLogs.some((meal) => Boolean(meal.rating))} visitDays={(stored.visitDays ?? []).filter((day) => Date.now() - new Date(`${day}T00:00:00`).getTime() < 7 * 86400000).length} swipeCount={stored.swipeCount} />}
        {view === "game" && <CookingGame taste={stored.vector} couponClaimed={stored.gameCouponClaimed} onBack={() => setView("home")} onCoupon={() => { trackTasteEvent("reward_claim", { rewardType: "game_score" }); setStored((current) => ({ ...current, gameCouponClaimed: true })); showToast("高分厨艺礼已放进“我的”"); }} onToast={showToast}/>} 
        {view === "meal" && <MealPlannerView vector={stored.vector} onBack={() => setView("home")} onLog={logMeal} onRate={rateMeal} loggedToday={todayMeals} weeklyLogs={weeklyMeals} lastDishId={latestMeal?.dishId} pausedDishIds={mealLogs.filter((meal) => meal.rating === "pause").map((meal) => meal.dishId)} />}
        {view === "discover" && <TasteFeed taste={stored.vector} onTasteChange={(vector) => setStored((current) => ({ ...current, vector, swipeCount: current.swipeCount + 1 }))} onProduct={openProduct} onToast={showToast} />}
        {view === "taste" && <TasteProfileView vector={stored.vector} confidence={confidence} swipeCount={stored.swipeCount} onShare={() => setShareOpen(true)} onFriend={() => setFriendOpen(true)} onRetest={() => setRetestOpen(true)} />}
        {view === "profile" && <ProfileView swipeCount={stored.swipeCount} onReset={() => setRetestOpen(true)} onFeedback={showToast} />}
        {(["home", "discover", "meal", "game", "taste", "profile"] as AppView[]).includes(view) && <BottomNav active={activeNav} onChange={changeNav} />}
      </div>
      {detail && createPortal(<ProductSheet product={detail} vector={stored.vector} couponClaimed={stored.couponClaimed} onClose={() => setDetail(null)} onBuy={buy} />, document.body)}
      {friendOpen && createPortal(<FriendMatchSheet vector={stored.vector} onClose={() => setFriendOpen(false)} recommendations={recommendProducts(PRODUCTS, Object.fromEntries(TASTE_KEYS.map((key) => [key, (stored.vector[key] + DEMO_FRIEND_VECTOR[key]) / 2])) as TasteVector)} />, document.body)}
      {couponOpen && createPortal(<CouponSheet onClaim={(rewardType) => { trackTasteEvent("reward_claim", { rewardType }); setStored((current) => ({ ...current, couponClaimed: true, rewardType })); setCouponOpen(false); setView("home"); showToast("专属口味礼已放进“我的”"); }} onSkip={() => { setCouponOpen(false); setView("home"); }} />, document.body)}
      {retestOpen && createPortal(<RetestSheet couponClaimed={stored.couponClaimed} onClose={() => setRetestOpen(false)} onConfirm={() => { setRetestOpen(false); startTest(); }} />, document.body)}
      {testInviteOpen && createPortal(<FirstTasteInvite onStart={startTest} onBrowse={() => setTestInviteOpen(false)} />, document.body)}
      {shareOpen && createPortal(<ShareCardSheet vector={stored.vector} onClose={() => setShareOpen(false)} onCopy={copyShare} onSave={() => { trackTasteEvent("share", { method: "download" }); saveTasteCardPng(stored.vector); showToast("Taste Card 已生成并开始下载"); }} />, document.body)}
      {methodOpen && createPortal(<MethodSheet onClose={() => setMethodOpen(false)} />, document.body)}
      {toast && createPortal(<div className="toast"><Check size={16} /> {toast}</div>, document.body)}
    </div>
  );
}
