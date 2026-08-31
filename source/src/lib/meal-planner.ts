import type { TasteVector } from "@/types";

export type MealGoal = "balanced" | "lighter" | "protein";
export type Portion = 0.5 | 1 | 1.5;

export type MealPart = {
  name: string;
  portion: string;
  kcal: [number, number];
  role: string;
  optional?: boolean;
};

export type MealPreset = {
  id: string;
  name: string;
  emoji: string;
  image: string;
  base: MealPart;
  sides: MealPart[];
  note: string;
  swaps: string[];
  saltNotice?: string;
};

export type PlannedMeal = MealPreset & {
  parts: MealPart[];
  total: [number, number];
  confidence: "中" | "较高";
  goalLabel: string;
};

export type PlanMealSlot = {
  slot: "早餐" | "午餐" | "晚餐" | "加餐";
  title: string;
  detail: string;
  kcal: [number, number];
  jianfengProductId?: string;
  jianfengProduct?: string;
  productServingCost?: number;
};

export type PlanDay = {
  day: number;
  theme: string;
  meals: PlanMealSlot[];
  reminder: string;
};

export type SmartPlan = {
  days: PlanDay[];
  cart: { id: string; name: string; price: number; unit: string; usedServings: number; packServings: number }[];
  pantry: string[];
  packCost: number;
  consumedProductValue: number;
  pantryBudget: [number, number];
  totalBudget: [number, number];
  dailyBudget: [number, number];
  personalizedReason: string;
  combinationCount: number;
};

const JIANFENG_PLAN_PRODUCTS = {
  "angus-beef-pie": { name: "安格斯牛肉馅饼", price: 49.9, unit: "7袋装", servings: 7 },
  "tomato-pasta": { name: "番茄肉酱意大利面", price: 49.9, unit: "4盒装", servings: 4 },
  "rye-nut-bread": { name: "黑麦坚果棒面包", price: 42.9, unit: "2盒装", servings: 6 },
  "fresh-milk-cake": { name: "鲜奶蛋糕", price: 38.9, unit: "16枚装", servings: 8 },
  "pork-sausage": { name: "黑猪鲜肉肠", price: 69.9, unit: "2盒装", servings: 8 },
  "thick-yogurt": { name: "4.0 厚酸奶", price: 79, unit: "18杯装", servings: 18 },
} as const;

const PLAN_DAYS: PlanDay[] = [
  { day: 1, theme: "先把工作日吃稳", reminder: "午餐主食和蔬菜都吃够，晚餐不用再靠零食补。", meals: [
    { slot: "早餐", title: "牛肉馅饼蔬菜早餐", detail: "安格斯牛肉馅饼1个 + 番茄生菜200g + 无糖饮品", kcal: [390, 520], jianfengProductId: "angus-beef-pie", jianfengProduct: "安格斯牛肉馅饼", productServingCost: 7.13 },
    { slot: "午餐", title: "杂粮饭配清蒸鱼", detail: "杂粮饭1小碗 + 清蒸鱼150g + 两种时蔬250g", kcal: [520, 680] },
    { slot: "晚餐", title: "番茄肉酱意面蔬菜盘", detail: "番茄肉酱意面1盒 + 烤西兰花和彩椒200g", kcal: [560, 760], jianfengProductId: "tomato-pasta", jianfengProduct: "番茄肉酱意大利面", productServingCost: 12.48 },
    { slot: "加餐", title: "厚酸奶水果杯", detail: "厚酸奶1杯 + 当季水果100g", kcal: [130, 210], jianfengProductId: "thick-yogurt", jianfengProduct: "4.0 厚酸奶", productServingCost: 4.39 },
  ]},
  { day: 2, theme: "同一批食材换种吃法", reminder: "优先用完昨天打开的蔬菜和水果，减少浪费。", meals: [
    { slot: "早餐", title: "黑麦面包鸡蛋组合", detail: "黑麦坚果棒面包1份 + 水煮蛋1个 + 牛奶200ml", kcal: [380, 500], jianfengProductId: "rye-nut-bread", jianfengProduct: "黑麦坚果棒面包", productServingCost: 7.15 },
    { slot: "午餐", title: "鸡胸肉杂粮蔬菜碗", detail: "鸡胸肉120g + 杂粮饭100g + 时蔬250g", kcal: [480, 620] },
    { slot: "晚餐", title: "鲜肉肠菌菇小炒", detail: "黑猪鲜肉肠1份 + 菌菇青菜250g + 小份玉米", kcal: [500, 680], jianfengProductId: "pork-sausage", jianfengProduct: "黑猪鲜肉肠", productServingCost: 8.74 },
    { slot: "加餐", title: "一份完整水果", detail: "苹果、橙或梨1个，不用果汁替代", kcal: [60, 100] },
  ]},
  { day: 3, theme: "清爽一天，给重口留余地", reminder: "加工肉类和重口汤底当天不叠加，饮品选无糖。", meals: [
    { slot: "早餐", title: "厚酸奶黑麦水果碗", detail: "厚酸奶1杯 + 黑麦面包半份 + 水果100g", kcal: [300, 420], jianfengProductId: "thick-yogurt", jianfengProduct: "4.0 厚酸奶", productServingCost: 4.39 },
    { slot: "午餐", title: "酸菜鱼平衡餐", detail: "鱼肉约180g、少喝汤 + 杂粮饭100g + 深色蔬菜200g", kcal: [610, 890] },
    { slot: "晚餐", title: "豆腐菌菇青菜汤", detail: "北豆腐150g + 菌菇青菜250g + 小份红薯", kcal: [380, 520] },
    { slot: "加餐", title: "鲜奶蛋糕分享份", detail: "鲜奶蛋糕2枚，配无糖茶；当天不再加甜饮", kcal: [180, 280], jianfengProductId: "fresh-milk-cake", jianfengProduct: "鲜奶蛋糕", productServingCost: 4.86 },
  ]},
  { day: 4, theme: "快手，但不将就蔬菜", reminder: "方便食品负责省时间，新鲜蔬菜负责补齐这一餐。", meals: [
    { slot: "早餐", title: "牛肉馅饼酸奶早餐", detail: "牛肉馅饼1个 + 厚酸奶1杯 + 小番茄150g", kcal: [450, 590], jianfengProductId: "angus-beef-pie", jianfengProduct: "安格斯牛肉馅饼", productServingCost: 7.13 },
    { slot: "午餐", title: "番茄肉酱意面加倍蔬菜", detail: "意面1盒 + 西兰花、蘑菇和彩椒250g", kcal: [580, 780], jianfengProductId: "tomato-pasta", jianfengProduct: "番茄肉酱意大利面", productServingCost: 12.48 },
    { slot: "晚餐", title: "虾仁豆腐蔬菜汤", detail: "虾仁100g + 豆腐100g + 绿叶菜250g + 小份杂粮饭", kcal: [430, 580] },
  ]},
  { day: 5, theme: "把一周剩余食材收好尾", reminder: "先检查冰箱再买菜，叶菜、菌菇和开封水果优先吃。", meals: [
    { slot: "早餐", title: "黑麦面包鲜肉肠开放三明治", detail: "黑麦面包1份 + 鲜肉肠半份 + 生菜番茄", kcal: [420, 560], jianfengProductId: "rye-nut-bread", jianfengProduct: "黑麦坚果棒面包", productServingCost: 7.15 },
    { slot: "午餐", title: "家常鸡蛋豆腐饭", detail: "米饭100g + 鸡蛋1个 + 豆腐100g + 时蔬250g", kcal: [480, 620] },
    { slot: "晚餐", title: "菌菇鲜肉肠烩蔬菜", detail: "鲜肉肠1份 + 剩余菌菇与蔬菜250g，不额外加重口酱", kcal: [450, 620], jianfengProductId: "pork-sausage", jianfengProduct: "黑猪鲜肉肠", productServingCost: 8.74 },
    { slot: "加餐", title: "厚酸奶", detail: "厚酸奶1杯，饿时再吃", kcal: [90, 140], jianfengProductId: "thick-yogurt", jianfengProduct: "4.0 厚酸奶", productServingCost: 4.39 },
  ]},
  { day: 6, theme: "周末认真做一顿", reminder: "在家做饭时少油少盐，多做一份蔬菜留给下一餐。", meals: [
    { slot: "早餐", title: "鸡蛋黑麦早餐盘", detail: "鸡蛋1个 + 黑麦面包1份 + 牛奶200ml + 水果", kcal: [420, 550], jianfengProductId: "rye-nut-bread", jianfengProduct: "黑麦坚果棒面包", productServingCost: 7.15 },
    { slot: "午餐", title: "清蒸鱼双蔬菜", detail: "鱼150g + 两种时蔬300g + 杂粮饭100g", kcal: [500, 660] },
    { slot: "晚餐", title: "牛肉馅饼蔬菜汤", detail: "牛肉馅饼1个 + 番茄菌菇蔬菜汤1大碗", kcal: [400, 560], jianfengProductId: "angus-beef-pie", jianfengProduct: "安格斯牛肉馅饼", productServingCost: 7.13 },
  ]},
  { day: 7, theme: "留一点喜欢，也留一点节制", reminder: "甜点放在正餐后或加餐，不用它替代正餐。", meals: [
    { slot: "早餐", title: "厚酸奶水果坚果杯", detail: "厚酸奶1杯 + 水果150g + 原味坚果10g", kcal: [230, 330], jianfengProductId: "thick-yogurt", jianfengProduct: "4.0 厚酸奶", productServingCost: 4.39 },
    { slot: "午餐", title: "番茄肉酱意面家庭盘", detail: "意面1盒 + 时蔬250g，和家人分享再配一份蛋白质", kcal: [580, 780], jianfengProductId: "tomato-pasta", jianfengProduct: "番茄肉酱意大利面", productServingCost: 12.48 },
    { slot: "晚餐", title: "杂粮粥豆腐青菜", detail: "杂粮粥1碗 + 豆腐150g + 绿叶菜250g", kcal: [360, 500] },
    { slot: "加餐", title: "鲜奶蛋糕小份", detail: "鲜奶蛋糕2枚 + 无糖茶", kcal: [180, 280], jianfengProductId: "fresh-milk-cake", jianfengProduct: "鲜奶蛋糕", productServingCost: 4.86 },
  ]},
  { day: 8, theme: "清爽植物蛋白日", reminder: "用豆制品和蛋类换换口味，肉类不是每餐都必须出现。", meals: [
    { slot: "早餐", title: "厚酸奶水果燕麦杯", detail: "厚酸奶1杯 + 燕麦30g + 水果100g", kcal: [300, 410], jianfengProductId: "thick-yogurt", jianfengProduct: "4.0 厚酸奶", productServingCost: 4.39 },
    { slot: "午餐", title: "香菇豆腐杂粮饭", detail: "豆腐180g + 香菇青菜250g + 杂粮饭100g", kcal: [460, 610] },
    { slot: "晚餐", title: "番茄鸡蛋蔬菜汤面", detail: "鸡蛋1个 + 番茄青菜250g + 小份全麦面", kcal: [400, 540] },
    { slot: "加餐", title: "黑麦坚果棒面包", detail: "半份配无糖茶，饿时再吃", kcal: [120, 180], jianfengProductId: "rye-nut-bread", jianfengProduct: "黑麦坚果棒面包", productServingCost: 7.15 },
  ]},
  { day: 9, theme: "温和熟悉的家常日", reminder: "味道不用很重，也能靠蒸、炖和天然鲜味吃得满足。", meals: [
    { slot: "早餐", title: "鲜奶蛋糕鸡蛋早餐", detail: "鲜奶蛋糕2枚 + 鸡蛋1个 + 无糖牛奶200ml", kcal: [350, 470], jianfengProductId: "fresh-milk-cake", jianfengProduct: "鲜奶蛋糕", productServingCost: 4.86 },
    { slot: "午餐", title: "冬瓜虾仁豆腐饭", detail: "虾仁100g + 豆腐100g + 冬瓜200g + 米饭100g", kcal: [470, 610] },
    { slot: "晚餐", title: "牛肉馅饼双蔬菜", detail: "牛肉馅饼1个 + 焯青菜和番茄200g", kcal: [390, 530], jianfengProductId: "angus-beef-pie", jianfengProduct: "安格斯牛肉馅饼", productServingCost: 7.13 },
  ]},
];

const DEFAULT_PROFILE: TasteVector = { meat: 50, spicy: 50, sweet: 50, savory: 50, healthy: 50, adventurous: 50, convenience: 50, value: 50, stockup: 50, social: 50 };

function dayFit(day: PlanDay, taste: TasteVector, variation = 0) {
  const text = `${day.theme} ${day.meals.map((meal) => `${meal.title} ${meal.detail}`).join(" ")}`;
  let score = day.day * 0.013;
  if (/牛肉|鲜肉|鸡胸|鱼|虾/.test(text)) score += taste.meat * 0.7;
  if (/酸菜|香辣|重口/.test(text)) score += taste.spicy * 0.55 + taste.savory * 0.4;
  if (/蛋糕|水果|酸奶/.test(text)) score += taste.sweet * 0.38;
  if (/豆腐|蔬菜|清蒸|清爽|杂粮/.test(text)) score += taste.healthy * 0.62;
  if (/快手|馅饼|意面|面包/.test(text)) score += taste.convenience * 0.5;
  if (/复用|剩余|收好尾|家常/.test(text)) score += taste.value * 0.42 + taste.stockup * 0.28;
  if (/新|认真做|换种/.test(text)) score += taste.adventurous * 0.32;
  const rotation = variation ? (((day.day * 37 + variation * 53) % 17) - 8) * 2.4 : 0;
  return score + rotation;
}

function personalizeDay(day: PlanDay, taste: TasteVector, dayNumber: number): PlanDay {
  const preference = taste.spicy >= 64 ? "爱香辣" : taste.healthy >= 64 ? "偏清爽" : taste.meat >= 64 ? "喜欢肉香" : taste.sweet >= 64 ? "偏爱柔和甜香" : "讲究均衡";
  return {
    ...day,
    day: dayNumber,
    reminder: `${preference}也要吃得有变化。${day.reminder}`,
    meals: day.meals.map((meal) => ({
      ...meal,
      detail: `${meal.detail}${taste.healthy >= 65 && meal.slot !== "加餐" ? "；蔬菜可再加50g" : ""}${taste.spicy >= 68 && !/酸菜|汤/.test(meal.title) ? "；想要辣味可用鲜椒或辣椒粉提味" : ""}`,
    })),
  };
}

export function buildSmartPlan(dayCount: 3 | 7, profile: TasteVector = DEFAULT_PROFILE, variation = 0): SmartPlan {
  const scored = [...PLAN_DAYS].sort((a, b) => dayFit(b, profile, variation) - dayFit(a, profile, variation));
  const offset = variation > 0 ? variation % Math.min(4, scored.length) : 0;
  const ranked = offset ? [...scored.slice(offset), ...scored.slice(0, offset)] : scored;
  const chosen: PlanDay[] = [];
  const usedProducts = new Map<string, number>();
  for (const day of ranked) {
    const productIds = day.meals.map((meal) => meal.jianfengProductId).filter(Boolean) as string[];
    const repeatedTooMuch = productIds.some((id) => (usedProducts.get(id) ?? 0) >= 2);
    if (repeatedTooMuch && chosen.length < ranked.length - 2) continue;
    chosen.push(day);
    productIds.forEach((id) => usedProducts.set(id, (usedProducts.get(id) ?? 0) + 1));
    if (chosen.length === dayCount) break;
  }
  for (const day of ranked) if (chosen.length < dayCount && !chosen.includes(day)) chosen.push(day);
  const days = chosen.slice(0, dayCount).map((day, index) => personalizeDay(day, profile, index + 1));
  const usage = new Map<string, number>();
  days.flatMap((day) => day.meals).forEach((meal) => {
    if (meal.jianfengProductId) usage.set(meal.jianfengProductId, (usage.get(meal.jianfengProductId) ?? 0) + 1);
  });
  const cart = [...usage.entries()].map(([id, usedServings]) => {
    const product = JIANFENG_PLAN_PRODUCTS[id as keyof typeof JIANFENG_PLAN_PRODUCTS];
    return { id, ...product, usedServings, packServings: product.servings };
  });
  const packCost = Math.round(cart.reduce((sum, item) => sum + item.price, 0) * 10) / 10;
  const consumedProductValue = Math.round(days.flatMap((day) => day.meals).reduce((sum, meal) => sum + (meal.productServingCost ?? 0), 0) * 10) / 10;
  const pantryBudget: [number, number] = dayCount === 3 ? [105, 145] : [225, 310];
  const totalBudget: [number, number] = [Math.round((consumedProductValue + pantryBudget[0]) * 10) / 10, Math.round((consumedProductValue + pantryBudget[1]) * 10) / 10];
  return {
    days,
    cart,
    pantry: ["杂粮米、玉米或红薯", "鸡蛋、豆腐、鱼虾或鸡胸肉", "2–3种深浅色蔬菜", "当季水果", "牛奶或无糖豆浆"],
    packCost,
    consumedProductValue,
    pantryBudget,
    totalBudget,
    dailyBudget: [Math.round(totalBudget[0] / dayCount), Math.round(totalBudget[1] / dayCount)],
    personalizedReason: profile.healthy >= 64 ? "你偏爱清爽，计划提高了蔬菜、豆制品和清蒸类的优先级。" : profile.meat >= 64 ? "你喜欢肉香，计划优先安排尖锋肉类主食，同时穿插鱼、豆腐和足量蔬菜。" : profile.convenience >= 64 ? "你看重省时间，计划优先用尖锋快手食品做主角，再用即食或少步骤食材补齐。" : profile.value >= 64 ? "你很会算性价比，计划优先复用同一批蔬菜、杂粮和整包装商品，减少开封浪费。" : "计划兼顾熟悉口味和食物多样性，不让同一种主菜连续出现。",
    combinationCount: PLAN_DAYS.length * 36,
  };
}

export const MEAL_PRESETS: MealPreset[] = [
  {
    id: "pickled-fish",
    name: "酸菜鱼",
    emoji: "🐟",
    image: "/images/taste-test/cartoon-v2/option-26.webp",
    base: { name: "酸菜鱼", portion: "鱼肉约 180–220g，少喝汤", kcal: [430, 720], role: "主菜 · 鱼类蛋白" },
    sides: [
      { name: "杂粮饭", portion: "熟重 100g", kcal: [110, 140], role: "主食" },
      { name: "清炒深色蔬菜", portion: "150–200g，少盐", kcal: [70, 120], role: "补蔬菜" },
      { name: "白水或无糖茶", portion: "300ml", kcal: [0, 5], role: "饮品" },
    ],
    note: "鱼已经够做这一餐的蛋白质来源，不必再加一盘肉。蔬菜不额外淋重口酱汁。",
    swaps: ["杂粮饭可换小份玉米或红薯", "清炒蔬菜可换焯青菜", "想吃清爽一点可减少汤汁和用油"],
    saltNotice: "酸菜和汤底的钠可能较高，少喝汤，也别再配腌菜。",
  },
  {
    id: "beef-pie",
    name: "牛肉馅饼",
    emoji: "🥩",
    image: "/images/real-products/angus-pie.jpg",
    base: { name: "牛肉馅饼", portion: "1 个", kcal: [320, 430], role: "主食 + 肉类" },
    sides: [
      { name: "番茄生菜碗", portion: "200g，少酱", kcal: [50, 90], role: "补蔬菜" },
      { name: "无糖酸奶", portion: "100–150g", kcal: [65, 110], role: "奶类" },
    ],
    note: "馅饼已经同时提供主食和肉类，搭配重点放在蔬菜和奶类。",
    swaps: ["酸奶可换纯牛奶", "不方便做沙拉可换焯青菜", "吃两个馅饼时不再加其他主食"],
  },
  {
    id: "tomato-pasta",
    name: "番茄肉酱意面",
    emoji: "🍝",
    image: "/images/real-products/tomato-pasta.jpg",
    base: { name: "番茄肉酱意面", portion: "1 份", kcal: [480, 650], role: "主食 + 肉类" },
    sides: [
      { name: "烤时蔬", portion: "180g，少油", kcal: [80, 140], role: "补蔬菜" },
      { name: "清爽水果", portion: "100g", kcal: [40, 70], role: "餐后水果", optional: true },
    ],
    note: "意面本身已经是完整主食，别再搭面包。多放一份蔬菜会更均衡。",
    swaps: ["烤时蔬可换蔬菜汤", "水果可留到两餐之间", "酱汁偏多时减少额外奶酪"],
  },
  {
    id: "milk-cake",
    name: "鲜奶蛋糕轻食",
    emoji: "🍰",
    image: "/images/real-products/milk-cake.jpg",
    base: { name: "鲜奶蛋糕", portion: "1 小份", kcal: [220, 320], role: "加餐 · 甜点" },
    sides: [
      { name: "无糖牛奶", portion: "200ml", kcal: [100, 130], role: "补蛋白质" },
      { name: "当季水果", portion: "100g", kcal: [40, 70], role: "补水果" },
    ],
    note: "蛋糕更适合放在加餐，不建议拿它代替一顿正餐。",
    swaps: ["牛奶可换无糖豆浆", "如果蛋糕份量较大，水果留到下一餐", "搭配无糖饮品，不再加甜饮"],
  },
];

const scalePart = (part: MealPart, scale: number): MealPart => ({
  ...part,
  kcal: [Math.round(part.kcal[0] * scale), Math.round(part.kcal[1] * scale)],
  portion: scale === 1 ? part.portion : `${part.portion} × ${scale}`,
});

export function planMeal(preset: MealPreset, portion: Portion, goal: MealGoal): PlannedMeal {
  const base = scalePart(preset.base, portion);
  let sides = preset.sides.map((part) => ({ ...part }));
  if (goal === "lighter") {
    sides = sides.map((part) => part.role === "主食" ? scalePart(part, 0.7) : part);
    base.kcal = [Math.round(base.kcal[0] * 0.88), Math.round(base.kcal[1] * 0.88)];
  }
  if (goal === "protein" && !preset.base.role.includes("蛋白")) {
    sides.push({ name: "水煮蛋或无糖豆浆", portion: "1 个 / 200ml", kcal: [70, 110], role: "补蛋白质" });
  }
  const parts = [base, ...sides];
  const total = parts.reduce<[number, number]>((sum, part) => [sum[0] + part.kcal[0], sum[1] + part.kcal[1]], [0, 0]);
  return {
    ...preset,
    parts,
    total,
    confidence: portion === 1 ? "中" : "中",
    goalLabel: goal === "lighter" ? "清爽一点" : goal === "protein" ? "蛋白质多一点" : "正常搭配",
  };
}
