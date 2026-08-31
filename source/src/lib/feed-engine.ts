import { calculateTasteSimilarity, updateTasteFromAction } from "./taste-engine";
import type { Product, TasteVector } from "@/types";

export type FeedActionType =
  | "video_impression" | "video_view_3s" | "video_view_50_percent" | "video_view_90_percent"
  | "video_completed" | "video_replayed" | "video_skipped" | "video_like" | "video_unlike"
  | "video_comment" | "rating_love" | "rating_like" | "rating_neutral" | "rating_dislike"
  | "product_saved" | "product_unsaved" | "product_buy_intent" | "external_shop_opened";

export type FeedVideo = {
  id: string;
  productId: string;
  videoUrl: string;
  posterUrl: string;
  creator: string;
  title: string;
  description: string;
  tags: string[];
  likes: number;
  comments: number;
  demoRepurchaseRate?: number;
  engagementScore: number;
  freshnessScore: number;
  explorationScore: number;
};

export type FeedEvent = { videoId: string; productId: string; actionType: FeedActionType; at: number; watchSeconds?: number; watchPercentage?: number };

const ACTION_WEIGHT: Partial<Record<FeedActionType, number>> = {
  video_completed: 0.7, video_replayed: 1, video_skipped: -0.3,
  video_like: 1, video_unlike: -1, rating_love: 3, rating_like: 1,
  rating_neutral: 0, rating_dislike: -3, product_saved: 2,
  product_unsaved: -1, product_buy_intent: 3,
};

export function applyFeedAction(vector: TasteVector, product: Product, action: FeedActionType) {
  const weight = ACTION_WEIGHT[action] ?? 0;
  return weight === 0 ? vector : updateTasteFromAction(vector, product.vector, weight);
}

export function rankFeed(videos: FeedVideo[], products: Product[], taste: TasteVector, recentlySeen: string[] = []) {
  const byId = new Map(products.map((product) => [product.id, product]));
  return videos.map((video) => {
    const product = byId.get(video.productId);
    const tasteMatch = product ? calculateTasteSimilarity(taste, product.vector) : 50;
    const repeatPenalty = recentlySeen.slice(-50).includes(video.id) ? 24 : 0;
    const feedScore = tasteMatch * .6 + video.engagementScore * .2 + video.freshnessScore * .1 + video.explorationScore * .1 - repeatPenalty;
    return { video, product, tasteMatch, feedScore };
  }).filter((item): item is typeof item & { product: Product } => Boolean(item.product)).sort((a,b) => b.feedScore-a.feedScore);
}

export function rewardFor(action: FeedActionType, alreadyRewarded: Set<string>, referenceId: string) {
  const key = `${action}:${referenceId}`;
  if (alreadyRewarded.has(key)) return { points: 0, key };
  const points = action === "video_like" ? 1 : action === "product_saved" ? 1 : action.startsWith("rating_") ? 3 : 0;
  return { points, key };
}
