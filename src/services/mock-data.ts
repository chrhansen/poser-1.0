import type {
  User,
  AnalysisResult,
  PricingPlan,
  PricingFAQ,
  Release,
  Partner,
  MetricsData,
  BillingInfo,
  SettingsProfile,
} from "@/lib/types";
import { generateMockMetrics } from "./mock-metrics";

export const serviceConfig = {
  useMockData: true,
  apiBaseUrl: "/api",
} as const;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
export { delay };

// ─── Users ──────────────────────────────────────────────────────────────────
export const mockUser: User = {
  id: "usr_1",
  email: "alex@example.com",
  name: "Alex Chen",
  avatarUrl: undefined,
  plan: "pro",
  createdAt: "2025-11-01T00:00:00Z",
  emailConfirmed: true,
};

// ─── Analysis Results ───────────────────────────────────────────────────────
// Frame counts derived from duration * 30fps
export const mockResults: AnalysisResult[] = [
  {
    id: "res_1",
    userId: "usr_1",
    videoUrl: "",
    thumbnailUrl: "",
    status: "complete",
    createdAt: "2026-02-28T10:00:00Z",
    duration: 14,
    clipLength: 26,
    metrics: generateMockMetrics(14 * 30, 42),
    skiRank: 80,
    biggestLimiter: "edging",
    embedToken: "tok_abc123",
  },
  {
    id: "res_2",
    userId: "usr_1",
    videoUrl: "",
    thumbnailUrl: "",
    status: "processing",
    createdAt: "2026-03-01T14:30:00Z",
    duration: 22,
    clipLength: 34,
    progress: 42,
  },
  {
    id: "res_3",
    userId: "usr_1",
    videoUrl: "",
    thumbnailUrl: "",
    status: "error",
    createdAt: "2026-02-25T09:15:00Z",
    duration: 8,
    clipLength: 15,
    failedReason: "Video quality too low for reliable analysis. Please upload a higher resolution clip.",
  },
  {
    id: "res_4",
    userId: "usr_1",
    videoUrl: "",
    thumbnailUrl: "",
    status: "pending",
    createdAt: "2026-03-02T08:00:00Z",
    clipLength: 20,
  },
  {
    id: "res_5",
    userId: "usr_1",
    videoUrl: "",
    thumbnailUrl: "",
    status: "complete",
    createdAt: "2026-02-20T16:45:00Z",
    duration: 18,
    clipLength: 30,
    metrics: generateMockMetrics(18 * 30, 99),
    skiRank: 65,
    biggestLimiter: "balance",
    embedToken: "tok_def456",
  },
];

// ─── Pricing ────────────────────────────────────────────────────────────────
export const mockPricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "one-time",
    features: ["3 free analyses", "Ski Rank score", "Edge Similarity", "Turn Cadence"],
    ctaLabel: "Get started",
  },
  {
    id: "pro",
    name: "Trip Pack",
    price: 19,
    interval: "one-time",
    features: ["5 analyses", "Ski Rank score", "Edge Similarity", "Turn Cadence"],
    ctaLabel: "Get started",
  },
  {
    id: "max",
    name: "Season Pass",
    price: 79,
    interval: "one-time",
    features: ["25 analyses", "Everything in Trip Pack"],
    highlighted: true,
    ctaLabel: "Get started",
  },
];

export const mockPricingFAQs: PricingFAQ[] = [
  { id: "faq1", question: "What kind of ski clip works best?", answer: "The skier should be as clear as possible with a steady camera. If you can see all parts of the skier clearly, so can Poser." },
  { id: "faq2", question: "How long does analysis take?", answer: "1–2 minutes." },
  { id: "faq3", question: "Do I need sensors or special hardware?", answer: "No, we just need a video clip." },
  { id: "faq4", question: "Can I upload from my phone?", answer: "Yes." },
  { id: "faq5", question: "What happens if multiple skiers are in frame?", answer: "No worries, just tap the right skier and Poser will track the correct skier through the clip." },
  { id: "faq6", question: "Can I try a demo first?", answer: "YES_DEMO_LINK" },
  { id: "faq7", question: "Can I upgrade from Trip Pack to Season Pass later?", answer: "Yes! You can upgrade at any time. When you upgrade, your remaining unused analyses from the Trip Pack will carry over to your Season Pass." },
];

// ─── Releases ───────────────────────────────────────────────────────────────
export const mockReleases: Release[] = [
  {
    id: "rel_1", version: "2.4.0", date: "2026-02-25", title: "Improved Edge Detection",
    description: "Major improvements to ski edge angle detection accuracy.",
    tags: ["ai", "analysis"],
    changes: [
      { type: "feature", text: "New edge angle measurement algorithm" },
      { type: "improvement", text: "30% faster video processing" },
      { type: "fix", text: "Fixed score display rounding on results page" },
    ],
  },
  {
    id: "rel_2", version: "2.3.0", date: "2026-02-10", title: "Team Features",
    description: "Collaboration tools for coaches and teams.",
    tags: ["teams", "collaboration"],
    changes: [
      { type: "feature", text: "Team workspaces with shared analyses" },
      { type: "feature", text: "Coach annotation tools" },
      { type: "improvement", text: "Updated results sharing UI" },
    ],
  },
  {
    id: "rel_3", version: "2.2.0", date: "2026-01-20", title: "Embed Widget",
    description: "Embeddable results for partner integrations.",
    tags: ["partners", "embed"],
    changes: [
      { type: "feature", text: "Embeddable result widget for websites" },
      { type: "feature", text: "Partner API keys" },
      { type: "fix", text: "Fixed video playback on Safari" },
    ],
  },
  {
    id: "rel_4", version: "2.1.0", date: "2026-01-05", title: "Progress Tracking",
    description: "Track your improvement over time.",
    tags: ["analysis"],
    changes: [
      { type: "feature", text: "Score history graph" },
      { type: "improvement", text: "Redesigned dashboard layout" },
    ],
  },
];

// ─── Partners ───────────────────────────────────────────────────────────────
export const mockPartners: Partner[] = [
  {
    id: "p1", name: "Alpine Academy", logoUrl: "", description: "Professional ski instruction across the Alps.", url: "https://alpineacademy.example.com",
    slug: "alpine-academy", domain: "alpineacademy.example.com",
    integrationSnippets: {
      html: `<iframe src="https://poser.app/embed/results/TOKEN" width="400" height="600" frameborder="0"></iframe>`,
      react: `import { PoserEmbed } from '@poser/react';\n\nexport default function Results() {\n  return <PoserEmbed token="TOKEN" />;\n}`,
      next: `import { PoserEmbed } from '@poser/react';\n\nexport default function ResultsPage() {\n  return (\n    <main>\n      <PoserEmbed token="TOKEN" />\n    </main>\n  );\n}`,
    },
  },
];

// ─── Metrics ────────────────────────────────────────────────────────────────
export const mockMetrics: MetricsData = {
  totalUsers: 12847,
  totalAnalyses: 48293,
  avgScore: 72.4,
  conversionRate: 0.084,
  dailyActiveUsers: [320, 345, 310, 380, 420, 390, 410],
  analysesPerDay: [180, 210, 195, 240, 280, 260, 275],
};

// ─── Billing ────────────────────────────────────────────────────────────────
export const mockBilling: BillingInfo = {
  plan: mockPricingPlans[1],
  nextBillingDate: "2026-04-01",
  paymentMethod: { type: "visa", last4: "4242" },
  invoices: [
    { id: "inv_1", date: "2026-03-01", amount: 19, status: "paid" },
    { id: "inv_2", date: "2026-02-01", amount: 19, status: "paid" },
    { id: "inv_3", date: "2026-01-01", amount: 19, status: "paid" },
  ],
  usageCredits: 12,
  usageLimit: 50,
  cancelAtPeriodEnd: false,
  currency: "usd",
};

// ─── Settings ───────────────────────────────────────────────────────────────
export const mockProfile: SettingsProfile = {
  name: "Alex Chen",
  username: "alexchen",
  email: "alex@example.com",
  bio: "",
  avatarUrl: undefined,
  emailConfirmed: true,
  notifications: {
    analysisComplete: true,
    weeklyTips: false,
  },
};
