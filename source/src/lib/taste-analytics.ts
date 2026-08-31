export type TasteEventName =
  | "session_start"
  | "test_start"
  | "test_complete"
  | "result_view"
  | "result_feedback"
  | "recommendation_view"
  | "product_view"
  | "reward_claim"
  | "share"
  | "meal_plan_view"
  | "meal_plan_create"
  | "meal_log"
  | "game_start"
  | "outbound_click";

export type TasteEvent = {
  name: TasteEventName;
  at: number;
  sessionId: string;
  meta?: Record<string, string | number | boolean>;
};

const EVENT_KEY = "jianfeng-taste-events-v1";
const SESSION_KEY = "jianfeng-taste-session-v1";

function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `jf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function trackTasteEvent(name: TasteEventName, meta?: TasteEvent["meta"]) {
  if (typeof window === "undefined") return;
  try {
    const current = JSON.parse(localStorage.getItem(EVENT_KEY) || "[]") as TasteEvent[];
    current.push({ name, at: Date.now(), sessionId: getSessionId(), meta });
    localStorage.setItem(EVENT_KEY, JSON.stringify(current.slice(-500)));
  } catch { /* Analytics must never block the food experience. */ }
}

export function readTasteEvents(): TasteEvent[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(EVENT_KEY) || "[]") as TasteEvent[]; }
  catch { return []; }
}

export function buildLocalFunnel(events: TasteEvent[]) {
  const sessions = new Map<string, Set<TasteEventName>>();
  events.forEach((event) => {
    const names = sessions.get(event.sessionId) ?? new Set<TasteEventName>();
    names.add(event.name);
    sessions.set(event.sessionId, names);
  });
  const count = (name: TasteEventName) => [...sessions.values()].filter((names) => names.has(name)).length;
  const started = count("test_start");
  const completed = count("test_complete");
  const products = count("product_view");
  const outbound = count("outbound_click");
  const feedbackEvents = events.filter((event) => event.name === "result_feedback");
  const positiveFeedback = feedbackEvents.filter((event) => event.meta?.value === "accurate").length;
  const pct = (value: number, total = started) => total ? Math.round(value / total * 100) : 0;
  return {
    sessions: sessions.size,
    started,
    completed,
    completionRate: pct(completed),
    resultViews: count("result_view"),
    feedbackCount: feedbackEvents.length,
    recognitionRate: feedbackEvents.length ? Math.round(positiveFeedback / feedbackEvents.length * 100) : 0,
    recommendationViews: count("recommendation_view"),
    products,
    productViewRate: pct(products),
    rewardClaims: count("reward_claim"),
    shares: count("share"),
    outbound,
    outboundRate: pct(outbound),
  };
}
