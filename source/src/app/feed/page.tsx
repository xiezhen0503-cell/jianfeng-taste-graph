"use client";
import { useEffect, useState } from "react";
import { TasteFeed } from "@/components/taste-feed";
import { INITIAL_TASTE } from "@/lib/taste-engine";
import type { TasteVector } from "@/types";

export default function FeedPage() {
  const [taste,setTaste]=useState<TasteVector>(INITIAL_TASTE);
  const [toast,setToast]=useState("");
  useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem("jianfeng-taste-prototype")||"{}");if(saved.vector)setTaste(saved.vector)}catch{}},[]);
  const update=(vector:TasteVector)=>{setTaste(vector);try{const saved=JSON.parse(localStorage.getItem("jianfeng-taste-prototype")||"{}");localStorage.setItem("jianfeng-taste-prototype",JSON.stringify({...saved,vector,swipeCount:(saved.swipeCount||0)+1}))}catch{}};
  return <div className="phone-canvas"><TasteFeed taste={taste} onTasteChange={update} onProduct={(p)=>window.open(p.externalUrl,"_blank","noopener,noreferrer")} onToast={(m)=>{setToast(m);setTimeout(()=>setToast(""),2200)}}/>{toast&&<div className="toast">{toast}</div>}</div>;
}
