import { describe, expect, it } from "vitest";
import { PRODUCTS, QUESTIONS } from "./data";
import {
  INITIAL_TASTE,
  TASTE_KEYS,
  applyTasteTestAnswers,
  calculateTasteConfidence,
  calculateTasteSimilarity,
  generateTastePersona,
  generateTasteType,
  recommendProducts,
  scoreTasteTest,
  updateTasteFromAction,
} from "./taste-engine";

describe("Taste Engine", () => {
  it("keeps all taste values within 0–100", () => {
    const extreme = applyTasteTestAnswers(Array(20).fill({ spicy: 100, sweet: -100 }));
    for (const key of TASTE_KEYS) expect(extreme[key]).toBeGreaterThanOrEqual(0);
    for (const key of TASTE_KEYS) expect(extreme[key]).toBeLessThanOrEqual(100);
  });

  it("produces distinct profiles from distinct answer paths", () => {
    const left = applyTasteTestAnswers(QUESTIONS.map((question) => question.options[0].delta));
    const right = applyTasteTestAnswers(QUESTIONS.map((question) => question.options[1].delta));
    expect(left.sweet).toBeGreaterThan(right.sweet);
    expect(right.meat).toBeGreaterThan(left.meat);
    expect(right.social).toBeGreaterThan(left.social);
  });

  it("returns 100 for identical vectors", () => {
    expect(calculateTasteSimilarity(PRODUCTS[0].vector, PRODUCTS[0].vector)).toBe(100);
  });

  it("updates gradually after a positive action", () => {
    const next = updateTasteFromAction(INITIAL_TASTE, PRODUCTS[0].vector, 2);
    expect(next.meat).toBeGreaterThan(INITIAL_TASTE.meat);
    expect(next.meat - INITIAL_TASTE.meat).toBeLessThan(10);
  });

  it("returns a human-readable persona", () => {
    const profile = { ...INITIAL_TASTE, spicy: 92 };
    expect(generateTastePersona(profile).name).toBe("无辣不欢派");
  });

  it("generates a stable four-axis Taste Type", () => {
    const boldExplorer = generateTasteType({
      ...INITIAL_TASTE, spicy: 90, savory: 80, meat: 78, healthy: 25,
      adventurous: 88, convenience: 84, value: 72, stockup: 68, social: 82,
    });
    expect(boldExplorer.code).toBe("BEQS");
    expect(boldExplorer.title).toBe("浓味尝鲜气氛王");
    expect(boldExplorer.axes).toHaveLength(4);
  });

  it("explains the type with evidence and flavor signatures", () => {
    const type = generateTasteType({
      ...INITIAL_TASTE, spicy: 20, sweet: 25, savory: 38, meat: 22, healthy: 90,
      adventurous: 20, convenience: 20, value: 45, stockup: 35, social: 20,
    });
    expect(type.code).toBe("LCRI");
    expect(type.evidence).toHaveLength(4);
    expect(type.flavorSignature).toHaveLength(2);
  });

  it("requires repeated evidence before producing an extreme score", () => {
    const single = scoreTasteTest([{ spicy: 22 }]).vector.spicy;
    const repeated = scoreTasteTest([{ spicy: 22 }, { spicy: 18 }]).vector.spicy;
    expect(single).toBeGreaterThan(50);
    expect(repeated).toBeGreaterThan(single);
    expect(single).toBeLessThan(85);
  });

  it("pulls contradictory answers back toward neutral", () => {
    const consistent = scoreTasteTest([{ sweet: 20 }, { sweet: 18 }]);
    const conflicted = scoreTasteTest([{ sweet: 20 }, { sweet: -18 }]);
    expect(Math.abs(conflicted.vector.sweet - 50)).toBeLessThan(Math.abs(consistent.vector.sweet - 50));
    expect(conflicted.consistency).toBeLessThan(consistent.consistency);
  });

  it("measures all ten dimensions across the full test", () => {
    const result = scoreTasteTest(QUESTIONS.map((question) => question.options[0].delta));
    expect(result.coverage).toBe(100);
    expect(result.confidence).toBeGreaterThanOrEqual(75);
  });

  it("lets behavior improve confidence without claiming certainty", () => {
    expect(calculateTasteConfidence(12, 8, 82)).toBeGreaterThan(82);
    expect(calculateTasteConfidence(12, 100, 82)).toBeLessThanOrEqual(97);
  });
});

describe("Recommendation Engine", () => {
  it("sorts products and provides reasons", () => {
    const results = recommendProducts(PRODUCTS, PRODUCTS[0].vector);
    expect(results).toHaveLength(PRODUCTS.length);
    expect(results[0].product.id).toBe(PRODUCTS[0].id);
    expect(results[0].reasons).toHaveLength(3);
  });

  it("handles an empty catalog", () => {
    expect(recommendProducts([], INITIAL_TASTE)).toEqual([]);
  });
});
