import type { Product, TasteKey, TasteVector } from "@/types";

export const TASTE_KEYS: TasteKey[] = [
  "meat",
  "spicy",
  "sweet",
  "savory",
  "healthy",
  "adventurous",
  "convenience",
  "value",
  "stockup",
  "social",
];

export const TASTE_LABELS: Record<TasteKey, string> = {
  meat: "肉食",
  spicy: "辣味",
  sweet: "甜口",
  savory: "咸香",
  healthy: "轻盈",
  adventurous: "尝鲜",
  convenience: "方便",
  value: "划算",
  stockup: "囤货",
  social: "分享",
};

export const INITIAL_TASTE: TasteVector = {
  meat: 45,
  spicy: 45,
  sweet: 45,
  savory: 45,
  healthy: 45,
  adventurous: 45,
  convenience: 45,
  value: 45,
  stockup: 45,
  social: 45,
};

export const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export type TasteTestScore = {
  vector: TasteVector;
  confidence: number;
  coverage: number;
  consistency: number;
};

/**
 * Evidence-normalized scoring. A dimension only becomes extreme when it receives
 * repeated, consistent evidence; contradictory answers naturally pull it back
 * toward 50 instead of producing an arbitrary accumulated score.
 */
export function scoreTasteTest(deltas: Partial<TasteVector>[]): TasteTestScore {
  const net = Object.fromEntries(TASTE_KEYS.map((key) => [key, 0])) as TasteVector;
  const evidence = Object.fromEntries(TASTE_KEYS.map((key) => [key, 0])) as TasteVector;
  const directions = Object.fromEntries(TASTE_KEYS.map((key) => [key, [] as number[]])) as Record<TasteKey, number[]>;

  for (const delta of deltas) {
    for (const key of TASTE_KEYS) {
      const value = delta[key] ?? 0;
      net[key] += value;
      evidence[key] += Math.abs(value);
      if (Math.abs(value) >= 5) directions[key].push(Math.sign(value));
    }
  }

  const vector = Object.fromEntries(TASTE_KEYS.map((key) => {
    const normalized = net[key] / Math.max(18, evidence[key] + 12);
    return [key, clamp(50 + normalized * 48)];
  })) as TasteVector;

  const measured = TASTE_KEYS.filter((key) => evidence[key] >= 16);
  const coverage = Math.round(measured.length / TASTE_KEYS.length * 100);
  const repeatable = TASTE_KEYS.filter((key) => directions[key].length >= 2);
  const consistency = repeatable.length
    ? Math.round(repeatable.reduce((sum, key) => {
        const direction = directions[key];
        const agreement = Math.abs(direction.reduce((total, value) => total + value, 0)) / direction.length;
        return sum + agreement;
      }, 0) / repeatable.length * 100)
    : 70;
  const completion = Math.min(1, deltas.length / 12);
  const confidence = clamp(18 + completion * 47 + coverage * 0.2 + consistency * 0.15);
  return { vector, confidence, coverage, consistency };
}

export function applyTasteTestAnswers(deltas: Partial<TasteVector>[]): TasteVector {
  return scoreTasteTest(deltas).vector;
}

export function calculateTasteSimilarity(a: TasteVector, b: TasteVector): number {
  const centeredA = Object.fromEntries(TASTE_KEYS.map((key) => [key, a[key] - 50])) as TasteVector;
  const centeredB = Object.fromEntries(TASTE_KEYS.map((key) => [key, b[key] - 50])) as TasteVector;
  const dot = TASTE_KEYS.reduce((sum, key) => sum + centeredA[key] * centeredB[key], 0);
  const normA = Math.sqrt(TASTE_KEYS.reduce((sum, key) => sum + centeredA[key] ** 2, 0));
  const normB = Math.sqrt(TASTE_KEYS.reduce((sum, key) => sum + centeredB[key] ** 2, 0));
  const distance = Math.sqrt(
    TASTE_KEYS.reduce((sum, key) => sum + (a[key] - b[key]) ** 2, 0) / TASTE_KEYS.length,
  );
  const proximity = Math.max(0, 100 - distance * 1.45);
  if (!normA || !normB) return clamp(proximity);
  const direction = ((dot / (normA * normB)) + 1) * 50;
  return clamp(direction * 0.62 + proximity * 0.38);
}

export function calculateTasteCompatibility(a: TasteVector, b: TasteVector): number {
  return calculateTasteSimilarity(a, b);
}

export function updateTasteFromAction(
  current: TasteVector,
  product: TasteVector,
  weight: number,
): TasteVector {
  const alpha = Math.min(0.09, Math.abs(weight) * 0.018);
  return Object.fromEntries(
    TASTE_KEYS.map((key) => {
      const target = weight >= 0 ? product[key] : 100 - product[key];
      return [key, clamp(current[key] + alpha * (target - current[key]))];
    }),
  ) as TasteVector;
}

export type TasteTypeAxis = {
  letter: string;
  label: string;
  score: number;
  description: string;
};

export type TasteType = {
  code: string;
  title: string;
  emoji: string;
  summary: string;
  axes: TasteTypeAxis[];
  evidence: string[];
  flavorSignature: string[];
};

const TASTE_TYPE_TITLES: Record<string, [string, string]> = {
  BEQS: ["浓味尝鲜气氛王", "🔥"], BEQI: ["浓味尝鲜行动派", "⚡"],
  BERS: ["浓味探索宴席家", "🥘"], BERI: ["浓味探索鉴赏家", "🧭"],
  BCQS: ["经典热味召集人", "🍢"], BCQI: ["熟味快享实干派", "🥢"],
  BCRS: ["经典大菜主理人", "🍲"], BCRI: ["浓香经典守味人", "🏮"],
  LEQS: ["清鲜新品分享家", "🌱"], LEQI: ["轻盈尝鲜观察员", "🔎"],
  LERS: ["清鲜风味策展人", "🍃"], LERI: ["清鲜慢享鉴赏家", "🍵"],
  LCQS: ["清爽快享协调者", "🥗"], LCQI: ["清爽效率生活家", "⏱️"],
  LCRS: ["温和聚餐协调者", "🍽️"], LCRI: ["清鲜经典生活家", "🌿"],
};

export function generateTasteType(vector: TasteVector): TasteType {
  const flavorValues = [vector.spicy, vector.sweet, vector.savory, vector.meat];
  const intensity = Math.round(Math.max(...flavorValues) * 0.55 + (flavorValues.reduce((a, b) => a + b, 0) / 4) * 0.3 + (100 - vector.healthy) * 0.15);
  const speed = Math.round(vector.convenience * 0.65 + vector.value * 0.2 + vector.stockup * 0.15);
  const definitions = [
    intensity >= 56
      ? { letter: "B", label: "浓烈 Bold", score: intensity, description: "偏爱香气饱满、刺激明确的满足感" }
      : { letter: "L", label: "清鲜 Light", score: 100 - intensity, description: "偏爱轻盈、清爽和食材本味" },
    vector.adventurous >= 55
      ? { letter: "E", label: "探索 Explore", score: vector.adventurous, description: "看到陌生口味，更容易先试一口" }
      : { letter: "C", label: "经典 Classic", score: 100 - vector.adventurous, description: "更信任熟悉、稳定且经得起复购的味道" },
    speed >= 58
      ? { letter: "Q", label: "快享 Quick", score: speed, description: "方便、省时和随手可吃会明显加分" }
      : { letter: "R", label: "仪式 Ritual", score: 100 - speed, description: "愿意为一顿值得的食物留出时间" },
    vector.social >= 55
      ? { letter: "S", label: "共享 Social", score: vector.social, description: "好吃会想分享，也在意一桌人的气氛" }
      : { letter: "I", label: "独享 Individual", score: 100 - vector.social, description: "更忠于自己的节奏和当下胃口" },
  ];
  const code = definitions.map((axis) => axis.letter).join("");
  const [title, emoji] = TASTE_TYPE_TITLES[code] ?? ["平衡味觉策展人", "🍽️"];
  const flavorSignature = [
    ["辣香", vector.spicy], ["甜润", vector.sweet], ["咸鲜", vector.savory],
    ["肉香", vector.meat], ["清爽", vector.healthy],
  ].sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 2).map(([label]) => String(label));
  return {
    code, title, emoji,
    summary: `你是${title}：以${flavorSignature.join("与")}为味觉主线，${definitions[1].description}，${definitions[3].description}。`,
    axes: definitions,
    evidence: definitions.map((axis) => axis.description),
    flavorSignature,
  };
}

export function generateTastePersona(vector: TasteVector) {
  if (vector.spicy >= 78) return { name: "无辣不欢派", emoji: "🌶️", note: "你追的是热烈，不是刺激。香、辣、脆一到位，筷子就停不下来。" };
  if (vector.sweet >= 76) return { name: "甜品快乐星人", emoji: "🍰", note: "你很会给日常加一点甜。奶香、绵密和刚好的糖，是你的情绪开关。" };
  if (vector.healthy >= 75) return { name: "清爽本味观察员", emoji: "🥬", note: "你不吃寡淡，只喜欢食材本身够好。清爽、均衡，也得有滋有味。" };
  if (vector.value >= 72 && vector.stockup >= 68) return { name: "聪明囤货掌柜", emoji: "🧺", note: "你买得认真，也吃得明白。好吃是底线，耐放和划算同样重要。" };
  if (vector.adventurous >= 77) return { name: "新品雷达猎手", emoji: "🛰️", note: "别人收藏攻略，你收藏新口味。菜单上越陌生的名字，越容易被你点中。" };
  if (vector.social >= 78) return { name: "聚餐气氛担当", emoji: "🥂", note: "食物对你不只是一顿饭，更是把人聚在一起的理由。" };
  if (vector.convenience >= 76 && vector.savory >= 60) return { name: "深夜速食玩家", emoji: "🍜", note: "你要的是快，但从不愿意将就。十分钟内，也能吃出一顿像样的夜宵。" };
  if (vector.meat >= 72 && vector.savory >= 65) return { name: "咸香肉食探索家", emoji: "🥩", note: "炙烤焦边、丰润肉汁、咸香回味——这是你最熟悉的快乐路径。" };
  if (vector.sweet > vector.savory) return { name: "柔软口感收藏家", emoji: "🥐", note: "你偏爱温柔、细腻、带一点奶香的食物，吃东西也讲究情绪氛围。" };
  if (vector.adventurous < 42) return { name: "经典味道守门员", emoji: "🍚", note: "你相信经得起时间的味道。熟悉不等于无聊，稳定好吃才是真本事。" };
  if (vector.convenience >= 65) return { name: "效率美味主义者", emoji: "⏱️", note: "你的时间很贵，但胃口不能敷衍。方便与好吃，你坚持两个都要。" };
  return { name: "平衡味觉策展人", emoji: "🍽️", note: "浓淡、荤素、新旧，你总能找到舒服的中间点，也最擅长替大家点菜。" };
}

export function calculateTasteConfidence(answerCount: number, swipeCount: number, testConfidence?: number): number {
  const testBase = testConfidence ?? Math.min(82, 18 + answerCount * 5.3);
  const behavioralLift = Math.min(15, Math.log2(swipeCount + 1) * 3.8);
  return clamp(Math.min(97, testBase + behavioralLift));
}

function reasonLabel(key: TasteKey, userValue: number, productValue: number) {
  if (userValue >= 45 || productValue >= 45) return TASTE_LABELS[key];
  const lowLabels: Partial<Record<TasteKey, string>> = {
    spicy: "不嗜辣", sweet: "低甜", savory: "清淡", meat: "少肉",
    healthy: "浓郁", adventurous: "经典", convenience: "慢享",
    value: "品质优先", stockup: "少量尝鲜", social: "独享",
  };
  return lowLabels[key] ?? TASTE_LABELS[key];
}

export function recommendProducts(products: Product[], vector: TasteVector) {
  const ranked = products
    .map((product) => {
      // Product DNA with weaker evidence is shrunk toward neutral, preventing
      // keyword-only catalog entries from receiving overconfident matches.
      const dnaReliability = Math.max(0.45, Math.min(1, (product.dnaConfidence ?? 72) / 100));
      const calibratedVector = Object.fromEntries(TASTE_KEYS.map((key) => [
        key,
        50 + (product.vector[key] - 50) * dnaReliability,
      ])) as TasteVector;
      const tasteMatch = calculateTasteSimilarity(vector, calibratedVector);
      const evidenceQuality = (product.dnaConfidence ?? 72);
      const availabilityScore = product.availability === "active" ? 100 : product.availability === "inactive" ? 28 : 62;
      const priceCompleteness = product.price == null ? 45 : 100;
      const score = tasteMatch * 0.76 + evidenceQuality * 0.12 + availabilityScore * 0.08 + priceCompleteness * 0.04;
      const reasons = TASTE_KEYS
        .map((key) => ({
          key,
          sameDirection: (vector[key] - 50) * (product.vector[key] - 50) >= 0,
          affinity: (100 - Math.abs(vector[key] - product.vector[key]))
            * Math.min(Math.abs(vector[key] - 50), Math.abs(product.vector[key] - 50)),
        }))
        .filter(({ sameDirection }) => sameDirection)
        .sort((a, b) => b.affinity - a.affinity)
        .slice(0, 3)
        .map(({ key }) => reasonLabel(key, vector[key], product.vector[key]));
      const matchConfidence = clamp(36 + evidenceQuality * 0.42 + (product.evidence?.length ?? 1) * 4);
      return { product, tasteMatch, score, reasons, matchConfidence };
    })
    .sort((a, b) => b.score - a.score);

  // Lightweight diversity reranking: avoid a top shelf filled by near-identical
  // SKUs while preserving the strongest result in every product category.
  const categoryCount = new Map<string, number>();
  return ranked
    .map((item) => {
      const category = item.product.category ?? "其他";
      const seen = categoryCount.get(category) ?? 0;
      categoryCount.set(category, seen + 1);
      return { ...item, score: item.score - Math.min(10, seen * 2.5) };
    })
    .sort((a, b) => b.score - a.score);
}
