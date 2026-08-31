import type { TasteVector } from "@/types";

export type PlatingChoice = "balanced" | "heaped" | "minimal";
export type SauceControl = { acid: number; salt: number; spice: number };
export type CookingScoreInput = { ingredients: string[]; sequence: string[]; heat: number; sauce: SauceControl; plating: PlatingChoice; taste: TasteVector };
export type CookingScore = { total: number; ingredients: number; sequence: number; heat: number; seasoning: number; plating: number; title: string; couponEligible: boolean };

const CORE_INGREDIENTS = ["pasta", "tomato", "beef", "broccoli"];
const CORRECT_SEQUENCE = ["boil", "sear", "sauce", "toss"];
const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export function sauceTarget(taste: TasteVector): SauceControl {
  return { acid: clamp(48 + (taste.adventurous - 50) * .22), salt: clamp(42 + (taste.savory - 50) * .35), spice: clamp(25 + (taste.spicy - 50) * .65) };
}

export function scoreCookingGame(input: CookingScoreInput): CookingScore {
  const correct = CORE_INGREDIENTS.filter((item) => input.ingredients.includes(item)).length;
  const wrong = input.ingredients.filter((item) => !CORE_INGREDIENTS.includes(item)).length;
  const ingredients = clamp(correct * 5 - wrong * 4, 0, 20);
  const sequence = input.sequence.reduce((sum, step, index) => sum + (CORRECT_SEQUENCE[index] === step ? 5 : 0), 0);
  const heatDistance = input.heat < 68 ? 68 - input.heat : input.heat > 78 ? input.heat - 78 : 0;
  const heat = clamp(Math.round(25 - heatDistance * 1.35), 0, 25);
  const target = sauceTarget(input.taste);
  const sauceDistance = Math.abs(input.sauce.acid-target.acid) + Math.abs(input.sauce.salt-target.salt) + Math.abs(input.sauce.spice-target.spice);
  const seasoning = clamp(Math.round(20 - sauceDistance * .16), 0, 20);
  const plating = input.plating === "balanced" ? 15 : input.plating === "minimal" && input.taste.healthy >= 68 ? 12 : 7;
  const total = clamp(Math.round(ingredients + sequence + heat + seasoning + plating));
  return { total, ingredients: Math.round(ingredients), sequence, heat, seasoning, plating, title: total >= 92 ? "主厨席位候选" : total >= 85 ? "黄金火候掌勺人" : total >= 70 ? "稳定出餐厨手" : "厨房实习生", couponEligible: total >= 85 };
}
