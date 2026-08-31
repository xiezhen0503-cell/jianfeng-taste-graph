import type { FeedVideo } from "./feed-engine";
import { PRODUCTS } from "./data";

const productId = (pattern: RegExp, fallback: string) => PRODUCTS.find((product) => pattern.test(product.name))?.id ?? fallback;

export const FEED_VIDEOS: FeedVideo[] = [
  {
    id: "real-milk-01", productId: productId(/4\.0\s*纯牛奶/, "001-4-0纯牛奶"),
    videoUrl: "/videos/feed/real-milk.mp4", posterUrl: "/videos/feed/real-milk.jpg",
    creator: "赵俊洋", title: "4.0 纯牛奶", description: "真实开喝，先看奶香和入口的醇厚度。",
    tags: ["乳品饮料", "真人试喝", "尖锋实拍"], likes: 286, comments: 31, engagementScore: 86, freshnessScore: 100, explorationScore: 68,
  },
  {
    id: "real-beef-sauce-01", productId: productId(/牛肉酱/, "075-牛肉酱"),
    videoUrl: "/videos/feed/real-beef-sauce.mp4", posterUrl: "/videos/feed/real-beef-sauce.jpg",
    creator: "赵俊洋", title: "牛肉酱", description: "把肉粒、油润度和拌饭效果一次拍清楚。",
    tags: ["佐餐酱料", "产品实拍", "下饭"], likes: 342, comments: 46, engagementScore: 88, freshnessScore: 99, explorationScore: 72,
  },
  {
    id: "real-milk-cake-01", productId: productId(/鲜奶蛋糕/, "101-鲜奶蛋糕"),
    videoUrl: "/videos/feed/real-milk-cake.mp4", posterUrl: "/videos/feed/real-milk-cake.jpg",
    creator: "赵俊洋", title: "鲜奶蛋糕", description: "掰开看松软度，第一口更能感受真实奶香。",
    tags: ["烘焙糕点", "爆款开头", "真人试吃"], likes: 519, comments: 62, engagementScore: 94, freshnessScore: 98, explorationScore: 76,
  },
  {
    id: "real-butter-beer-01", productId: productId(/黄油精酿啤酒/, "056-黄油精酿啤酒"),
    videoUrl: "/videos/feed/real-butter-beer.mp4", posterUrl: "/videos/feed/real-butter-beer.jpg",
    creator: "xc", title: "黄油精酿啤酒", description: "黄油风味和泡沫高光，适合喜欢新口味的人。",
    tags: ["精酿啤酒", "高光实拍", "尝鲜"], likes: 407, comments: 53, engagementScore: 91, freshnessScore: 97, explorationScore: 94,
  },
  {
    id: "real-birch-sap-01", productId: "feed-white-birch-sap",
    videoUrl: "/videos/feed/real-birch-sap.mp4", posterUrl: "/videos/feed/real-birch-sap.jpg",
    creator: "王剑秋", title: "白桦树汁", description: "清冽植物饮真实试喝，看看味道到底像什么。",
    tags: ["植物饮品", "真人试喝", "清爽"], likes: 298, comments: 38, engagementScore: 84, freshnessScore: 96, explorationScore: 92,
  },
  {
    id: "real-craft-beer-01", productId: "feed-craft-beer",
    videoUrl: "/videos/feed/real-craft-beer.mp4", posterUrl: "/videos/feed/real-craft-beer.jpg",
    creator: "王剑秋", title: "精酿啤酒", description: "从泡沫、颜色到第一口麦芽香，真实呈现。",
    tags: ["酒水饮品", "真人试喝", "麦芽香"], likes: 364, comments: 49, engagementScore: 87, freshnessScore: 95, explorationScore: 82,
  },
  {
    id: "real-luosifen-01", productId: "feed-luosifen",
    videoUrl: "/videos/feed/real-luosifen.mp4", posterUrl: "/videos/feed/real-luosifen.jpg",
    creator: "王剑秋", title: "螺蛳粉", description: "酸、辣、浓香都摆到镜头前，一口看出食欲。",
    tags: ["方便主食", "真人试吃", "酸辣"], likes: 603, comments: 81, engagementScore: 96, freshnessScore: 94, explorationScore: 90,
  },
];
