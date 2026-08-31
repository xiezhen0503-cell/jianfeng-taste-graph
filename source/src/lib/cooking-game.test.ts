import { describe, expect, it } from "vitest";
import { sauceTarget, scoreCookingGame } from "./cooking-game";

const taste = { meat: 65, spicy: 45, sweet: 35, savory: 65, healthy: 60, adventurous: 55, convenience: 60, value: 55, stockup: 45, social: 50 } as const;
describe("cooking game", () => {
  it("rewards a complete professional cooking flow", () => {
    const score = scoreCookingGame({ ingredients:["pasta","tomato","beef","broccoli"], sequence:["boil","sear","sauce","toss"], heat:73, sauce:sauceTarget(taste), plating:"balanced", taste });
    expect(score.total).toBe(100); expect(score.couponEligible).toBe(true);
  });
  it("penalizes waste, wrong order, burned heat, and poor seasoning", () => {
    const score = scoreCookingGame({ ingredients:["cream","soda"], sequence:["toss","sauce","sear","boil"], heat:98, sauce:{acid:100,salt:100,spice:100}, plating:"heaped", taste });
    expect(score.total).toBeLessThan(40); expect(score.couponEligible).toBe(false);
  });
  it("changes the ideal sauce with the taste profile", () => {
    expect(sauceTarget({...taste,spicy:95}).spice).toBeGreaterThan(sauceTarget({...taste,spicy:10}).spice);
  });
});
