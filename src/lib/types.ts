// Types for the Poser application

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  plan: "free" | "pro" | "team";
  createdAt: string;
  emailConfirmed?: boolean;
}

// ─── Per-frame metric types ─────────────────────────────────────────────────

export interface ShinParallelFrame {
  frame: number;
  shinAngle: number;       // degrees between left/right shin
  parallelismScore: number; // 0–100
}

export interface COMFrame {
  frame: number;
  x: number;
  y: number;
  z: number;
}

export interface AngulationFrame {
  frame: number;
  absolute: number; // degrees
  signed: number;   // degrees (positive = one direction)
}

export interface CounterFrame {
  frame: number;
  absolute: number; // degrees
  signed: number;   // degrees
}

export interface AngulationVsInclinationFrame {
  frame: number;
  lowerBodyLean: number;  // degrees
  upperBodyLean: number;  // degrees
  difference: number;     // degrees
  ratio: number;
}

// ─── Segment / aggregate metric types ───────────────────────────────────────

export interface TurnSegment {
  id: string;
  direction: "left" | "right";
  startFrame: number;
  endFrame: number;
  apexFrame: number;
  durationMs: number;
}

export interface EdgeSimilarityData {
  overall: number;  // 0–100
  left: number;     // 0–100
  right: number;    // 0–100
  perTurn: { turnId: string; score: number }[];
}

export interface TurnCadenceData {
  tpmMedian: number;       // turns per minute median
  tpmPeak6: number;        // peak 6-turn tempo
  turnDurationCv: number;  // coefficient of variation (0–1)
}

// ─── Analysis metrics container ─────────────────────────────────────────────

export interface AnalysisMetrics {
  shinParallel: ShinParallelFrame[];
  com: COMFrame[];
  angulation: AngulationFrame[];
  counter: CounterFrame[];
  angulationVsInclination: AngulationVsInclinationFrame[];
  turnSegments: TurnSegment[];
  edgeSimilarity: EdgeSimilarityData;
  turnCadence: TurnCadenceData;
}

// ─── Analysis Result ────────────────────────────────────────────────────────

export type SkiLimiter = "balance" | "pressure" | "edging" | "steering";

// ─── Theme / Submetric types for Results page ───────────────────────────────

export type ThemeKey = "balance" | "pressure" | "edging" | "steering";

export interface SubmetricScore {
  id: string;
  name: string;
  score: number;
  interpretation: string;
  whatItIs: string;
  whyItMatters: string;
  whatYoursLookedLike: string;
  whatToTry: string;
}

export interface ThemeScore {
  key: ThemeKey;
  name: string;
  score: number;
  summary: string;
  nextFocus: string;
  submetrics: SubmetricScore[];
}

export interface KeyMoment {
  id: string;
  type: "weakest" | "best" | "representative";
  label: string;
  description: string;
  turnId?: string;
  frame?: number;
}

export interface ThemeScores {
  balance: ThemeScore;
  pressure: ThemeScore;
  edging: ThemeScore;
  steering: ThemeScore;
  whyNotHigher: string;
  nextFocus: string;
  nextFocusDetail?: string;
  keyMoments: KeyMoment[];
}

export interface AnalysisResult {
  id: string;
  userId: string;
  videoUrl: string;
  thumbnailUrl: string;
  status: "pending" | "processing" | "complete" | "error";
  createdAt: string;
  duration?: number; // seconds
  clipLength?: number; // seconds — length of original clip
  progress?: number; // 0-100 for processing
  failedReason?: string;
  modelUrl?: string; // optional 3D model
  metrics?: AnalysisMetrics;
  skiRank?: number; // 0-100 overall score
  biggestLimiter?: SkiLimiter;
  themeScores?: ThemeScores;
  embedToken?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year" | "one-time";
  features: string[];
  highlighted?: boolean;
  ctaLabel: string;
}

export interface PricingFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Release {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  changes: { type: "feature" | "fix" | "improvement"; text: string }[];
  tags?: string[];
}

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  url: string;
  slug?: string;
  domain?: string;
  integrationSnippets?: {
    html: string;
    react: string;
    next: string;
  };
}

export interface MetricsData {
  totalUsers: number;
  totalAnalyses: number;
  avgScore: number;
  dailyActiveUsers: number[];
  analysesPerDay: number[];
  conversionRate: number;
}

export interface BillingInfo {
  plan: PricingPlan;
  nextBillingDate: string;
  paymentMethod?: {
    type: string;
    last4: string;
  };
  invoices: {
    id: string;
    date: string;
    amount: number;
    status: "paid" | "pending" | "failed";
  }[];
  usageCredits: number;
  usageLimit: number;
  cancelAtPeriodEnd?: boolean;
  currency: "usd" | "eur" | "gbp";
}

export interface SettingsProfile {
  name: string;
  username: string;
  email: string;
  bio: string;
  avatarUrl?: string;
  emailConfirmed: boolean;
  notifications: {
    analysisComplete: boolean;
    weeklyTips: boolean;
  };
}
