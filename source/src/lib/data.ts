import type { Product, TasteQuestion, TasteVector } from "@/types";
import generatedProducts from "./products.generated.json";

const v = (overrides: Partial<TasteVector>): TasteVector => ({
  meat: 35,
  spicy: 25,
  sweet: 25,
  savory: 50,
  healthy: 50,
  adventurous: 50,
  convenience: 60,
  value: 60,
  stockup: 45,
  social: 55,
  ...overrides,
});

export const QUESTIONS: TasteQuestion[] = [
  {
    id: 1,
    kicker: "直觉题 · 别想太久",
    question: "今晚这一口，你更想选？",
    options: [
      { label: "沸腾火锅", emoji: "🍲", image: "/images/taste-test/cartoon-v2/option-01.webp", caption: "麻、辣、热气腾腾", delta: { spicy: 22, meat: -8, adventurous: 6, social: 6 } },
      { label: "炭火烧烤", emoji: "🍖", image: "/images/taste-test/cartoon-v2/option-02.webp", caption: "焦香、肉汁、孜然", delta: { spicy: -12, meat: 22, adventurous: -4, social: 4 } },
    ],
  },
  {
    id: 2,
    kicker: "只能留一个",
    question: "追剧到一半，手会伸向？",
    options: [
      { label: "鲜奶小蛋糕", emoji: "🍰", image: "/images/taste-test/cartoon-v2/option-03.webp", caption: "软绵绵的甜", delta: { sweet: 22, savory: -16, meat: -10 } },
      { label: "黑椒烤肠", emoji: "🌭", image: "/images/taste-test/cartoon-v2/option-04.webp", caption: "一口爆汁咸香", delta: { sweet: -18, savory: 20, meat: 14 } },
    ],
  },
  {
    id: 3,
    kicker: "新品雷达测试",
    question: "菜单上出现没吃过的口味…",
    options: [
      { label: "就点熟悉的", emoji: "🫶", image: "/images/taste-test/cartoon-v2/option-05.webp", caption: "经典款不会出错", delta: { adventurous: -22, value: 8 } },
      { label: "必须试一下", emoji: "✨", image: "/images/taste-test/cartoon-v2/option-06.webp", caption: "未知才有意思", delta: { adventurous: 22, value: -6 } },
    ],
  },
  {
    id: 4,
    kicker: "真实消费选择",
    question: "同类食品相差 20 元，你更在意？",
    options: [
      { label: "真的更好吃", emoji: "👅", image: "/images/taste-test/cartoon-v2/option-07.webp", caption: "为味道多花一点", delta: { value: -22, adventurous: 7, stockup: -5 } },
      { label: "买得更划算", emoji: "🧮", image: "/images/taste-test/cartoon-v2/option-08.webp", caption: "性价比也很香", delta: { value: 22, adventurous: -5, stockup: 7 } },
    ],
  },
  {
    id: 5,
    kicker: "你家的冰箱知道",
    question: "遇到真爱食品，你通常会？",
    options: [
      { label: "吃完再买", emoji: "🧊", image: "/images/taste-test/cartoon-v2/option-09.webp", caption: "保持新鲜，也不占地", delta: { stockup: -22, value: -5, healthy: 6 } },
      { label: "一次囤够", emoji: "📦", image: "/images/taste-test/cartoon-v2/option-10.webp", caption: "安全感装满一整格", delta: { stockup: 22, value: 8, healthy: -4 } },
    ],
  },
  {
    id: 6,
    kicker: "工作日晚餐",
    question: "累了一天，你更需要哪种满足？",
    options: [
      { label: "十分钟开吃", emoji: "⚡", image: "/images/taste-test/cartoon-v2/option-11.webp", caption: "快一点，但别将就", delta: { convenience: 22, healthy: -6 } },
      { label: "认真做一顿", emoji: "🍳", image: "/images/taste-test/cartoon-v2/option-12.webp", caption: "慢慢来才有仪式感", delta: { convenience: -22, healthy: 8 } },
    ],
  },
  {
    id: 7,
    kicker: "身体的偏好",
    question: "连续大餐后，下一顿更想吃？",
    options: [
      { label: "清爽蔬食碗", emoji: "🥗", image: "/images/taste-test/cartoon-v2/option-13.webp", caption: "脆、鲜、轻负担", delta: { healthy: 22, meat: -18, savory: -8 } },
      { label: "再来顿硬菜", emoji: "🥩", image: "/images/taste-test/cartoon-v2/option-14.webp", caption: "快乐就要接着来", delta: { healthy: -20, meat: 22, savory: 10 } },
    ],
  },
  {
    id: 8,
    kicker: "最后一题 · 聚餐时刻",
    question: "最好吃的一顿饭，通常是？",
    options: [
      { label: "一个人慢慢吃", emoji: "🎧", image: "/images/taste-test/cartoon-v2/option-21.webp", caption: "安静享受自己的时间", delta: { social: -22, convenience: 5 } },
      { label: "一桌人抢着吃", emoji: "🥂", image: "/images/taste-test/cartoon-v2/option-22.webp", caption: "热闹才是隐藏配料", delta: { social: 22, convenience: -4 } },
    ],
  },
  {
    id: 9,
    kicker: "换个场景 · 交叉验证",
    question: "夜宵只能二选一，你会留下？",
    options: [
      { label: "藤椒凤爪", emoji: "🌶️", image: "/images/taste-test/cartoon-v2/option-15.webp", caption: "清麻脆弹，越吃越醒", delta: { spicy: 18, savory: 14, sweet: -14, adventurous: 5 } },
      { label: "厚乳酸奶", emoji: "🥛", image: "/images/taste-test/cartoon-v2/option-16.webp", caption: "奶香绵密，温柔收尾", delta: { spicy: -16, savory: -10, sweet: 18, adventurous: -4 } },
    ],
  },
  {
    id: 10,
    kicker: "没有标准答案",
    question: "周末空出两小时，你更愿意？",
    options: [
      { label: "研究一道新菜", emoji: "🧑‍🍳", image: "/images/taste-test/cartoon-v2/option-17.webp", caption: "过程本身就很有趣", delta: { convenience: -18, adventurous: 16, healthy: 6 } },
      { label: "把时间留给自己", emoji: "🛋️", image: "/images/taste-test/cartoon-v2/option-18.webp", caption: "好吃的快速解决", delta: { convenience: 20, adventurous: -8, healthy: -4 } },
    ],
  },
  {
    id: 11,
    kicker: "购物车不会说谎",
    question: "发现一款稳定好吃的食品，你会？",
    options: [
      { label: "先买一份", emoji: "🛍️", image: "/images/taste-test/cartoon-v2/option-19.webp", caption: "吃完再决定复购", delta: { stockup: -16, value: -8, adventurous: 8 } },
      { label: "凑活动多买", emoji: "📦", image: "/images/taste-test/cartoon-v2/option-20.webp", caption: "常吃的就备在家里", delta: { stockup: 18, value: 16, adventurous: -5 } },
    ],
  },
  {
    id: 12,
    kicker: "真实记忆 · 交叉验证",
    question: "回想最近最满足的一餐，它更像？",
    options: [
      { label: "独享一份刚好的", emoji: "🍜", image: "/images/taste-test/cartoon-v2/option-23.webp", caption: "合胃口比排场重要", delta: { social: -18, convenience: 8, savory: 8 } },
      { label: "和喜欢的人分着吃", emoji: "🥢", image: "/images/taste-test/cartoon-v2/option-24.webp", caption: "边聊边抢才有味道", delta: { social: 18, convenience: -5, savory: 6 } },
    ],
  },
  {
    id: 13,
    kicker: "味觉强度 · 再确认一次",
    question: "今天更想被哪种味道接住？",
    options: [
      { label: "温柔清淡", emoji: "🍲", image: "/images/taste-test/cartoon-v2/option-25.webp", caption: "鲜味够了，不必太重", delta: { savory: -18, spicy: -12, sweet: 8, healthy: 10 } },
      { label: "浓烈过瘾", emoji: "🌶️", image: "/images/taste-test/cartoon-v2/option-26.webp", caption: "一口就要有存在感", delta: { savory: 18, spicy: 14, sweet: -8, healthy: -6 } },
    ],
  },
  {
    id: 14,
    kicker: "口感偏好 · 第一反应",
    question: "咬下去，你更期待哪种感觉？",
    options: [
      { label: "咔嚓酥脆", emoji: "🥨", image: "/images/taste-test/cartoon-v2/option-27.webp", caption: "越嚼越香，声音也满足", delta: { adventurous: 7, convenience: 10, healthy: -5 } },
      { label: "绵软顺滑", emoji: "🍮", image: "/images/taste-test/cartoon-v2/option-28.webp", caption: "柔软细腻，慢慢化开", delta: { convenience: -5, healthy: 4 } },
    ],
  },
  {
    id: 15,
    kicker: "最后一题 · 口味归属",
    question: "哪一桌更容易让你记很久？",
    options: [
      { label: "熟悉的家常味", emoji: "🏠", image: "/images/taste-test/cartoon-v2/option-29.webp", caption: "吃一口就知道自己在哪", delta: { adventurous: -20, value: 8, social: 6 } },
      { label: "没见过的新组合", emoji: "🌍", image: "/images/taste-test/cartoon-v2/option-30.webp", caption: "味觉也值得去旅行", delta: { adventurous: 20, value: -6, social: 3 } },
    ],
  },
];

const LEGACY_PRODUCTS: Product[] = [
  {
    id: "pork-sausage",
    name: "黑猪鲜肉肠",
    subtitle: "煎到表皮微焦，肉香更扎实",
    description: "尖锋食客黑猪鲜肉肠，适合早餐、夜宵或聚餐加菜。煎、烤、空气炸锅都方便。",
    price: 69.9,
    unit: "400g/盒 × 2盒",
    priceSource: "短视频挂车价 · 资料更新 2026-07-07",
    image: "/images/real-products/pork-sausage.png",
    badge: "尖锋经典",
    externalUrl: "https://shop180987765.youzan.com/v2/showcase/homepage?alias=9KajkhtOeV",
    vector: v({ meat: 95, spicy: 18, savory: 88, healthy: 42, adventurous: 54, convenience: 92, value: 72, stockup: 78, social: 78 }),
  },
  {
    id: "angus-beef-pie",
    name: "安格斯牛肉馅饼",
    subtitle: "外皮煎得酥，里面是一整口肉香",
    description: "独立包装的安格斯牛肉馅饼，平底锅加热即可。适合早餐、加餐或忙碌工作日。",
    price: 49.9,
    unit: "100g/袋 × 7袋",
    priceSource: "短视频挂车价 · 资料更新 2026-07-07",
    image: "/images/real-products/angus-pie.jpg",
    badge: "早餐推荐",
    externalUrl: "https://shop180987765.youzan.com/v2/showcase/homepage?alias=9KajkhtOeV",
    vector: v({ meat: 88, spicy: 10, sweet: 18, savory: 86, healthy: 44, adventurous: 52, convenience: 92, value: 78, stockup: 82, social: 56 }),
  },
  {
    id: "fresh-milk-cake",
    name: "鲜奶蛋糕",
    subtitle: "松软奶香，下午四点刚刚好",
    description: "小份独立装鲜奶蛋糕，口感松软，适合早餐搭配牛奶，也适合办公室分享。",
    price: 38.9,
    unit: "16枚装",
    priceSource: "短视频挂车价 · 资料更新 2026-07-07",
    image: "/images/real-products/milk-cake.jpg",
    badge: "分享装",
    externalUrl: "https://shop180987765.youzan.com/v2/showcase/homepage?alias=9KajkhtOeV",
    vector: v({ meat: 0, spicy: 0, sweet: 90, savory: 15, healthy: 40, adventurous: 38, convenience: 92, value: 82, stockup: 76, social: 74 }),
  },
  {
    id: "thick-rice-noodle",
    name: "厚汁米线",
    subtitle: "料足汤浓，十分钟拯救一顿饭",
    description: "浓汤米线搭配多种配料，适合想吃一口热乎重口味、又不想复杂准备的时候。",
    price: 59.9,
    unit: "3 袋装",
    priceSource: "短视频挂车价 · 资料更新 2026-07-07",
    image: "/images/real-products/rice-noodle.png",
    badge: "深夜食堂",
    externalUrl: "https://shop180987765.youzan.com/v2/showcase/homepage?alias=9KajkhtOeV",
    vector: v({ meat: 48, spicy: 72, sweet: 8, savory: 94, healthy: 30, adventurous: 70, convenience: 90, value: 74, stockup: 72, social: 52 }),
  },
  {
    id: "rye-nut-bread",
    name: "黑麦坚果棒面包",
    subtitle: "越嚼越香，通勤包里放两根",
    description: "黑麦与坚果带来扎实口感，适合早餐、运动后加餐或工作间隙随手补一口。",
    price: 42.9,
    unit: "390g/盒 × 2盒",
    priceSource: "短视频挂车价 · 资料更新 2026-07-07",
    image: "/images/real-products/rye-bread.jpg",
    badge: "轻负担加餐",
    externalUrl: "https://shop180987765.youzan.com/v2/showcase/homepage?alias=9KajkhtOeV",
    vector: v({ meat: 0, spicy: 0, sweet: 30, savory: 38, healthy: 82, adventurous: 46, convenience: 94, value: 76, stockup: 82, social: 46 }),
  },
  {
    id: "pepper-chicken-feet",
    name: "藤椒无骨凤爪",
    subtitle: "藤椒清麻，追剧时一盒很快见底",
    description: "去骨凤爪搭配藤椒风味，口感脆弹，适合冷藏后直接吃，也适合朋友聚会分享。",
    price: 69.9,
    unit: "2 盒装",
    priceSource: "短视频挂车价 · 资料更新 2026-07-07",
    image: "/images/real-products/pepper-chicken-feet.png",
    badge: "追剧搭子",
    externalUrl: "https://shop180987765.youzan.com/v2/showcase/homepage?alias=9KajkhtOeV",
    vector: v({ meat: 68, spicy: 82, sweet: 10, savory: 90, healthy: 38, adventurous: 72, convenience: 94, value: 66, stockup: 62, social: 88 }),
  },
  {
    id: "thick-yogurt",
    name: "4.0 厚酸奶",
    subtitle: "稠厚奶香，早餐和下午都能接住",
    description: "尖锋食客风味发酵乳，质地稠厚。单杯装方便冷藏，适合搭配水果或谷物。",
    price: 79,
    unit: "6杯/盒 × 3盒",
    priceSource: "短视频挂车价 · 资料更新 2026-07-07",
    image: "/images/real-products/thick-yogurt.jpg",
    badge: "早餐搭配",
    externalUrl: "https://shop180987765.youzan.com/v2/showcase/homepage?alias=9KajkhtOeV",
    vector: v({ meat: 0, spicy: 0, sweet: 52, savory: 22, healthy: 78, adventurous: 38, convenience: 90, value: 66, stockup: 76, social: 64 }),
  },
  {
    id: "tomato-pasta",
    name: "番茄肉酱意大利面",
    subtitle: "肉酱裹住面条，十分钟端上桌",
    description: "番茄肉酱与意大利面组合装，酸甜咸香平衡，适合一个人的快速正餐。",
    price: 49.9,
    unit: "4 盒装",
    priceSource: "短视频挂车价 · 资料更新 2026-07-07",
    image: "/images/real-products/tomato-pasta.jpg",
    badge: "工作日晚餐",
    externalUrl: "https://shop180987765.youzan.com/v2/showcase/homepage?alias=9KajkhtOeV",
    vector: v({ meat: 62, spicy: 18, sweet: 34, savory: 82, healthy: 48, adventurous: 52, convenience: 92, value: 78, stockup: 70, social: 52 }),
  },
];

// Generated from the D-drive product knowledge base. The curated legacy set is
// retained above as editorial reference while the app recommends across the
// complete catalog.
const FEED_ONLY_PRODUCTS: Product[] = [
  {
    id: "feed-white-birch-sap", name: "白桦树汁", subtitle: "清冽植物饮，冷藏后更清爽",
    description: "来自尖锋真实短视频素材。商品规格与价格等待渠道资料同步。", price: null,
    unit: "规格待渠道同步", priceSource: "知识库暂未记录公开渠道价",
    image: "/videos/feed/real-birch-sap.jpg", badge: "真实试饮",
    externalUrl: "https://shop180987765.youzan.com/v2/showcase/homepage?alias=9KajkhtOeV",
    category: "植物饮品", availability: "unknown", dnaConfidence: 58, evidence: ["真实短视频素材", "商品名称语义"],
    vector: v({ meat: 0, spicy: 0, sweet: 28, savory: 12, healthy: 82, adventurous: 68, convenience: 78, value: 56, stockup: 58, social: 52 }),
  },
  {
    id: "feed-craft-beer", name: "精酿啤酒", subtitle: "麦芽香更明显，适合慢慢喝",
    description: "来自尖锋真实短视频素材。商品规格与价格等待渠道资料同步。", price: null,
    unit: "规格待渠道同步", priceSource: "知识库暂未记录公开渠道价",
    image: "/videos/feed/real-craft-beer.jpg", badge: "真实试饮",
    externalUrl: "https://shop180987765.youzan.com/v2/showcase/homepage?alias=9KajkhtOeV",
    category: "酒水饮品", availability: "unknown", dnaConfidence: 58, evidence: ["真实短视频素材", "商品名称语义"],
    vector: v({ meat: 18, spicy: 10, sweet: 22, savory: 44, healthy: 32, adventurous: 72, convenience: 62, value: 58, stockup: 54, social: 86 }),
  },
  {
    id: "feed-luosifen", name: "螺蛳粉", subtitle: "酸辣浓香，一碗把胃口叫醒",
    description: "来自尖锋真实短视频素材。商品规格与价格等待渠道资料同步。", price: null,
    unit: "规格待渠道同步", priceSource: "知识库暂未记录公开渠道价",
    image: "/videos/feed/real-luosifen.jpg", badge: "真实试吃",
    externalUrl: "https://shop180987765.youzan.com/v2/showcase/homepage?alias=9KajkhtOeV",
    category: "方便主食", availability: "unknown", dnaConfidence: 66, evidence: ["真实短视频素材", "商品名称语义"],
    vector: v({ meat: 25, spicy: 82, sweet: 8, savory: 88, healthy: 30, adventurous: 78, convenience: 82, value: 74, stockup: 68, social: 62 }),
  },
];

export const PRODUCTS: Product[] = [...(generatedProducts as Product[]), ...FEED_ONLY_PRODUCTS];

export const DEMO_FRIEND_VECTOR: TasteVector = v({
  meat: 86,
  spicy: 70,
  sweet: 34,
  savory: 84,
  healthy: 48,
  adventurous: 76,
  convenience: 68,
  value: 64,
  stockup: 58,
  social: 88,
});
