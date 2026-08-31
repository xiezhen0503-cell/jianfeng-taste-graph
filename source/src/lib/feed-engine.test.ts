import { describe, expect, it } from "vitest";
import { PRODUCTS } from "./data";
import { FEED_VIDEOS } from "./feed-data";
import { applyFeedAction, rankFeed, rewardFor } from "./feed-engine";
import { INITIAL_TASTE } from "./taste-engine";

describe("Taste Feed engine", () => {
  it("ranks all configured videos with products", () => {
    const ranked = rankFeed(FEED_VIDEOS, PRODUCTS, INITIAL_TASTE);
    expect(ranked).toHaveLength(FEED_VIDEOS.length);
    expect(ranked[0].feedScore).toBeGreaterThan(0);
  });
  it("penalizes recently seen videos", () => {
    const first = rankFeed(FEED_VIDEOS, PRODUCTS, INITIAL_TASTE)[0];
    const reranked = rankFeed(FEED_VIDEOS, PRODUCTS, INITIAL_TASTE, [first.video.id]);
    expect(reranked.find((x) => x.video.id === first.video.id)!.feedScore).toBeLessThan(first.feedScore);
  });
  it("like and dislike update Taste Graph in opposite directions", () => {
    const product = PRODUCTS[0];
    const liked = applyFeedAction(INITIAL_TASTE, product, "video_like");
    const disliked = applyFeedAction(INITIAL_TASTE, product, "rating_dislike");
    expect(liked.meat).not.toBe(disliked.meat);
  });
  it("does not reward the same like twice", () => {
    const first = rewardFor("video_like", new Set(), "v1");
    const second = rewardFor("video_like", new Set([first.key]), "v1");
    expect(first.points).toBe(1);
    expect(second.points).toBe(0);
  });
  it("keeps impression behavior neutral", () => {
    expect(applyFeedAction(INITIAL_TASTE, PRODUCTS[0], "video_impression")).toEqual(INITIAL_TASTE);
  });
});
