"use client";

import { Bookmark, Check, Copy, Heart, MessageCircle, Share2, ShoppingBag, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FEED_VIDEOS } from "@/lib/feed-data";
import { applyFeedAction, rankFeed, rewardFor, type FeedActionType, type FeedEvent } from "@/lib/feed-engine";
import { PRODUCTS } from "@/lib/data";
import { TASTE_LABELS } from "@/lib/taste-engine";
import type { Product, TasteVector } from "@/types";
import { assetUrl } from "@/lib/asset-url";

type FeedStore = { liked: string[]; saved: string[]; seen: string[]; rewarded: string[]; points: number; events: FeedEvent[] };
const FEED_KEY = "jianfeng-taste-feed-v1";
const EMPTY: FeedStore = { liked: [], saved: [], seen: [], rewarded: [], points: 0, events: [] };

export function TasteFeed({ taste, onTasteChange, onProduct, onToast }: { taste: TasteVector; onTasteChange: (next: TasteVector) => void; onProduct: (product: Product) => void; onToast: (message: string) => void }) {
  const [store, setStore] = useState<FeedStore>(EMPTY);
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const [sheet, setSheet] = useState<"match"|"comments"|"share"|null>(null);
  const [intro, setIntro] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<string | null>(null);
  const refs = useRef<(HTMLVideoElement|null)[]>([]);
  const fired = useRef(new Set<string>());
  const enteredAt = useRef(Date.now());

  useEffect(() => {
    try { const saved = localStorage.getItem(FEED_KEY); if (saved) setStore({ ...EMPTY, ...JSON.parse(saved) }); } catch {}
    if (!localStorage.getItem("jianfeng-feed-intro")) { setIntro(true); localStorage.setItem("jianfeng-feed-intro", "1"); window.setTimeout(() => setIntro(false), 3200); }
  }, []);
  useEffect(() => { localStorage.setItem(FEED_KEY, JSON.stringify(store)); }, [store]);

  const ranked = useMemo(() => rankFeed(FEED_VIDEOS, PRODUCTS, taste, store.seen), [taste, store.seen]);
  const current = ranked[active] ?? ranked[0];

  const record = (actionType: FeedActionType, item = current, watch?: {seconds?:number; percentage?:number}) => {
    if (!item) return;
    const event = { videoId: item.video.id, productId: item.product.id, actionType, at: Date.now(), watchSeconds: watch?.seconds, watchPercentage: watch?.percentage };
    setStore((old) => ({ ...old, events: [...old.events.slice(-299), event] }));
  };
  const learn = (action: FeedActionType, item = current) => {
    if (!item) return;
    record(action, item);
    onTasteChange(applyFeedAction(taste, item.product, action));
    const rewarded = new Set(store.rewarded);
    const reward = rewardFor(action, rewarded, item.video.id);
    if (reward.points && store.points < 20) {
      setStore((old) => ({ ...old, points: Math.min(20, old.points + reward.points), rewarded: [...old.rewarded, reward.key] }));
      onToast(`+${reward.points} Taste · 更懂你一点了`);
    }
  };

  useEffect(() => {
    refs.current.forEach((video, index) => { if (!video) return; if (index === active) video.play().catch(() => {}); else video.pause(); });
    const item = ranked[active];
    if (item) {
      record("video_impression", item);
      setStore((old) => ({ ...old, seen: [...old.seen.filter((id) => id !== item.video.id), item.video.id].slice(-50) }));
      enteredAt.current = Date.now();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const toggleLike = () => {
    const id = current.video.id; const liked = store.liked.includes(id);
    setStore((old) => ({ ...old, liked: liked ? old.liked.filter((v) => v !== id) : [...old.liked, id] }));
    learn(liked ? "video_unlike" : "video_like");
  };
  const toggleSave = () => {
    const id = current.product.id; const saved = store.saved.includes(id);
    setStore((old) => ({ ...old, saved: saved ? old.saved.filter((v) => v !== id) : [...old.saved, id] }));
    learn(saved ? "product_unsaved" : "product_saved");
  };
  const onScroll = (event: React.UIEvent<HTMLElement>) => {
    const el = event.currentTarget; const next = Math.round(el.scrollTop / el.clientHeight);
    if (next !== active && next >= 0 && next < ranked.length) {
      if (Date.now() - enteredAt.current < 2000) learn("video_skipped", ranked[active]);
      setActive(next);
    }
  };
  const timeUpdate = (index: number, video: HTMLVideoElement) => {
    if (!video.duration) return; const pct = video.currentTime / video.duration; const id = ranked[index]?.video.id;
    [[3/video.duration,"video_view_3s"],[.5,"video_view_50_percent"],[.9,"video_view_90_percent"]].forEach(([threshold, action]) => {
      const key=`${id}:${action}`; if(pct >= Number(threshold) && !fired.current.has(key)){fired.current.add(key);record(action as FeedActionType,ranked[index],{seconds:video.currentTime,percentage:pct*100});}
    });
  };
  if (!ranked.length) return <main className="taste-feed taste-feed--empty"><h2>今天的好吃视频刷完啦</h2><p>去看看你的 Taste 推荐</p></main>;

  return <main className="taste-feed" onScroll={onScroll}>
    <header className="feed-top"><div><b>发现好味</b><span>越看越懂你 · {store.points} TASTE</span><div className="feed-progress" aria-label={`第 ${active + 1} 条，共 ${ranked.length} 条`}>{ranked.map((entry,index)=><i key={entry.video.id} className={index===active?"is-active":index<active?"is-seen":""}/>)}</div></div><button onClick={() => setMuted((v)=>!v)} aria-label={muted?"打开声音":"静音"}>{muted?<VolumeX/>:<Volume2/>}</button></header>
    {intro && <div className="feed-intro"><b>上滑发现更多好吃的</b><span>喜欢的内容会让 Taste ID 更懂你</span></div>}
    {ranked.map((item,index) => {
      const liked=store.liked.includes(item.video.id), saved=store.saved.includes(item.product.id);
      return <section className="feed-slide" key={item.video.id}>
        <video ref={(node)=>{refs.current[index]=node}} src={Math.abs(index-active)<=1?assetUrl(item.video.videoUrl):undefined} poster={assetUrl(item.video.posterUrl)} muted={muted} loop playsInline autoPlay={index===active} preload={Math.abs(index-active)<=1?"metadata":"none"} onCanPlay={(event)=>{if(index===active)event.currentTarget.play().catch(()=>{})}} onClick={()=>setMuted(v=>!v)} onTimeUpdate={(e)=>timeUpdate(index,e.currentTarget)} onEnded={()=>learn("video_completed",item)} />
        <div className="feed-shade" />
        <div className="feed-copy"><button className="feed-match" onClick={()=>setSheet("match")}>{item.tasteMatch}% 适合你</button><b>@{item.video.creator} · 尖锋食客</b><h2>{item.video.title}</h2><p>{item.video.description}</p><div className="feed-tags">{item.video.tags.slice(0,2).map(t=><span key={t}>#{t}</span>)}</div></div>
        <aside className="feed-actions"><span className="creator-dot">尖</span><button className={liked?"is-on":""} onClick={toggleLike}><Heart fill={liked?"currentColor":"none"}/><small>{liked?"喜欢":"点赞"}</small></button><button onClick={()=>setSheet("comments")}><MessageCircle/><small>吃感</small></button><button className={saved?"is-on":""} onClick={toggleSave}><Bookmark fill={saved?"currentColor":"none"}/><small>收藏</small></button><button onClick={()=>setSheet("share")}><Share2/><small>分享</small></button></aside>
        <div className="feed-buy"><img src={assetUrl(item.product.image)} alt="" /><div><span>{item.product.name}</span><strong>{item.product.price == null?"查看商品详情":`¥${item.product.price}`}</strong></div><button onClick={()=>{learn("product_buy_intent",item);onProduct(item.product)}}><ShoppingBag/> 我也想吃</button></div>
      </section>;
    })}
    {sheet && current && <div className="feed-sheet-backdrop" onClick={()=>setSheet(null)}><article className={`feed-sheet feed-sheet--${sheet}`} onClick={e=>e.stopPropagation()}><button className="feed-sheet-close" onClick={()=>setSheet(null)}><X/></button>
      {sheet==="match" && <><span className="eyebrow">推荐理由</span><h2>为什么推荐给你？</h2><div className="match-explain">{current.product.evidence?.map(e=><p key={e}><Check/> {e}</p>)}{Object.entries(current.product.vector).sort((a,b)=>Math.abs(b[1]-50)-Math.abs(a[1]-50)).slice(0,3).map(([k])=><p key={k}><Check/> 符合你对{TASTE_LABELS[k as keyof TasteVector]}的偏好</p>)}</div><b className="sheet-score">口味契合度 {current.tasteMatch}%</b></>}
      {sheet==="comments" && <><h2>尖锋试吃笔记</h2><p className="demo-note">来自内部试吃记录，不等同于购买评价</p><div className="quick-rating"><b>你吃过吗？留下真实感受</b>{[["😍","超好吃","rating_love"],["🙂","还不错","rating_like"],["😐","一般","rating_neutral"],["🙅","不会回购","rating_dislike"]].map(([e,l,a])=><button className={rating===a?"is-on":""} key={a} onClick={()=>{setRating(a);learn(a as FeedActionType)}}>{e}<small>{l}</small></button>)}</div><div className="demo-comments"><p><b>尖锋试吃笔记</b>煎到边缘微脆时香气更明显，适合趁热吃。</p><p><b>食用建议</b>工作日早餐搭配无糖饮品，口感更轻松。</p></div><form onSubmit={e=>{e.preventDefault();if(comment.trim()){record("video_comment");setComment("");onToast("吃感已保存");}}}><input value={comment} onChange={e=>setComment(e.target.value)} placeholder="说说你吃过后的感受..."/><button>保存</button></form></>}
      {sheet==="share" && <><h2>把这一口分享出去</h2><p>好友打开后，可直接进入 Taste Feed。</p><button className="share-copy" onClick={async()=>{await navigator.clipboard.writeText(`${location.origin}${location.pathname}#${current.video.id}`);onToast("视频链接已复制");setSheet(null)}}><Copy/>复制链接</button></>}
    </article></div>}
  </main>;
}
