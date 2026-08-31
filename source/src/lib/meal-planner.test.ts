import { describe, expect, it } from "vitest";
import { MEAL_PRESETS, buildSmartPlan, planMeal } from "./meal-planner";

describe("meal planner", () => {
  const fish = MEAL_PRESETS.find((item) => item.id === "pickled-fish")!;

  it("builds a complete pickled-fish meal and sums its calorie range", () => {
    const meal = planMeal(fish, 1, "balanced");
    expect(meal.parts.length).toBeGreaterThanOrEqual(3);
    expect(meal.total[0]).toBe(meal.parts.reduce((sum, part) => sum + part.kcal[0], 0));
    expect(meal.total[1]).toBe(meal.parts.reduce((sum, part) => sum + part.kcal[1], 0));
    expect(meal.saltNotice).toContain("少喝汤");
  });

  it("changes energy when the user changes portion size", () => {
    const half = planMeal(fish, 0.5, "balanced");
    const large = planMeal(fish, 1.5, "balanced");
    expect(large.total[0]).toBeGreaterThan(half.total[0]);
    expect(large.total[1]).toBeGreaterThan(half.total[1]);
  });

  it("keeps calorie estimates as ranges", () => {
    for (const preset of MEAL_PRESETS) {
      const meal = planMeal(preset, 1, "balanced");
      expect(meal.total[1]).toBeGreaterThan(meal.total[0]);
    }
  });

  it("builds complete 3-day and 7-day plans with Jianfeng products first", () => {
    const threeDays = buildSmartPlan(3);
    const sevenDays = buildSmartPlan(7);
    expect(threeDays.days).toHaveLength(3);
    expect(sevenDays.days).toHaveLength(7);
    expect(threeDays.days.every((day) => day.meals.length >= 3)).toBe(true);
    expect(threeDays.cart.length).toBeGreaterThanOrEqual(4);
    expect(threeDays.days.flatMap((day) => day.meals).some((meal) => meal.jianfengProductId)).toBe(true);
  });

  it("separates pack checkout cost from the value actually eaten", () => {
    const plan = buildSmartPlan(7);
    expect(plan.packCost).toBeGreaterThan(plan.consumedProductValue);
    expect(plan.totalBudget[0]).toBeLessThan(plan.totalBudget[1]);
    expect(plan.dailyBudget[0]).toBeLessThan(plan.dailyBudget[1]);
  });

  it("changes the multi-day menu when the taste profile changes", () => {
    const healthy = buildSmartPlan(3, { meat: 20, spicy: 25, sweet: 35, savory: 40, healthy: 95, adventurous: 45, convenience: 30, value: 55, stockup: 50, social: 40 });
    const meaty = buildSmartPlan(3, { meat: 95, spicy: 75, sweet: 25, savory: 85, healthy: 30, adventurous: 60, convenience: 75, value: 40, stockup: 45, social: 65 });
    expect(healthy.days.map((day) => day.theme)).not.toEqual(meaty.days.map((day) => day.theme));
    expect(healthy.personalizedReason).toContain("清爽");
    expect(meaty.personalizedReason).toContain("肉香");
  });

  it("can refresh a plan without abandoning the same taste profile", () => {
    const first = buildSmartPlan(3, undefined, 0);
    const refreshed = buildSmartPlan(3, undefined, 2);
    expect(first.days.map((day) => day.theme)).not.toEqual(refreshed.days.map((day) => day.theme));
    expect(refreshed.days.every((day) => day.meals.length >= 3)).toBe(true);
  });
});
