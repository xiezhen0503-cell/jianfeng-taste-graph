export type TasteKey =
  | "meat"
  | "spicy"
  | "sweet"
  | "savory"
  | "healthy"
  | "adventurous"
  | "convenience"
  | "value"
  | "stockup"
  | "social";

export type TasteVector = Record<TasteKey, number>;

export type TasteOption = {
  label: string;
  emoji: string;
  image?: string;
  caption: string;
  delta: Partial<TasteVector>;
};

export type TasteQuestion = {
  id: number;
  kicker: string;
  question: string;
  options: TasteOption[];
};

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number | null;
  unit: string;
  priceSource: string;
  image: string;
  badge?: string;
  externalUrl: string;
  vector: TasteVector;
  category?: string;
  availability?: "active" | "unknown" | "inactive";
  dnaConfidence?: number;
  evidence?: string[];
};

export type NavView = "home" | "discover" | "meal" | "game" | "taste" | "profile";
export type AppView = "welcome" | "test" | "result" | NavView;
