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
    metrics: generateMockMetrics(14 * 30, 42),
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
    failedReason: "Video quality too low for reliable analysis. Please upload a higher resolution clip.",
  },
  {
    id: "res_4",
    userId: "usr_1",
    videoUrl: "",
    thumbnailUrl: "",
    status: "pending",
    createdAt: "2026-03-02T08:00:00Z",
  },
  {
    id: "res_5",
    userId: "usr_1",
    videoUrl: "",
    thumbnailUrl: "",
    status: "complete",
    createdAt: "2026-02-20T16:45:00Z",
    duration: 18,
    metrics: generateMockMetrics(18 * 30, 99),
    embedToken: "tok_def456",
  },
];

// ─── Pricing ────────────────────────────────────────────────────────────────
export const mockPricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    features: ["2 analyses per month", "Ski Rank score", "Edge Similarity", "Turn Cadence"],
    ctaLabel: "Get started",
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    interval: "month",
    features: ["15 analyses per month", "Ski Rank score", "Edge Similarity", "Turn Cadence"],
    highlighted: true,
    ctaLabel: "Get started",
  },
  {
    id: "max",
    name: "Max",
    price: 100,
    interval: "month",
    features: ["100 analyses per month", "Everything in Pro"],
    ctaLabel: "Get started",
  },
];

export const mockPricingFAQs: PricingFAQ[] = [
  { id: "faq1", question: "Can I cancel anytime?", answer: "Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period." },
  { id: "faq2", question: "What video formats are supported?", answer: "We support MP4, MOV, and WebM files up to 100MB. For best results, film in landscape orientation at 720p or higher." },
  { id: "faq3", question: "How long does analysis take?", answer: "Most analyses complete within 1–2 minutes. Pro and Team plans get priority processing." },
  { id: "faq4", question: "Is there a free trial?", answer: "Pro plans include a 7-day free trial. No credit card required to start." },
  { id: "faq5", question: "Can I share my results?", answer: "Yes! Team plan users can create embeddable result widgets. All plans can share results via link." },
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
