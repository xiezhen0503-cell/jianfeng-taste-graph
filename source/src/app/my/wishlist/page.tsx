"use client";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { PRODUCTS } from "@/lib/data";
import type { Product } from "@/types";
import { assetUrl } from "@/lib/asset-url";

export default function WishlistPage(){
  const [items,setItems]=useState<Product[]>([]);
  useEffect(()=>{try{const feed=JSON.parse(localStorage.getItem("jianfeng-taste-feed-v1")||"{}");setItems(PRODUCTS.filter(p=>(feed.saved||[]).includes(p.id)))}catch{}},[]);
  return <main className="wishlist-page"><header><Link href="/"><ArrowLeft/>返回</Link><div><span>MY TASTE LIST</span><h1>想吃清单</h1></div></header>{items.length===0?<section className="wishlist-empty"><h2>还没有收藏这一口</h2><p>去 Taste Feed 点亮收藏，想吃的都会留在这里。</p><Link href="/feed">去发现好吃的</Link></section>:<section className="wishlist-grid">{items.map(p=><article key={p.id}><img src={assetUrl(p.image)} alt={p.name}/><div><b>{p.name}</b><span>{p.price==null?"价格待同步":`¥${p.price}`}</span><button onClick={()=>window.open(p.externalUrl,"_blank","noopener,noreferrer")}><ShoppingBag/>去购买</button></div></article>)}</section>}</main>
}
