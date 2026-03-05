/**
 * Embed Widget API service — mock implementation.
 * TODO_BACKEND_HOOKUP: Replace all methods with real API calls.
 */

import { delay } from "./mock-data";

/* ─── Types ─── */

export interface EmbedPartnerConfig {
  partner_slug: string;
  partner_name: string;
  max_upload_size_mb: number;
  max_trim_seconds: number;
  branding_logo_url?: string;
}

export interface SkierBbox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface SkierDetection {
  object_id: number;
  bbox: SkierBbox;
  label: string;
}

export interface SubmitPayload {
  email: string;
  filename: string;
  content_type: string;
  trim_start_seconds?: number;
  trim_end_seconds?: number;
  bbox_x1: number;
  bbox_y1: number;
  bbox_x2: number;
  bbox_y2: number;
  click_normalized_time: number;
  click_object_id: number;
}

export interface SubmitResponse {
  analysis_id: string;
  upload_url: string;
  upload_fields: Record<string, string>;
}

export type AnalysisStatus =
  | "awaiting_confirmation"
  | "awaiting_upload"
  | "pending"
  | "processing"
  | "complete"
  | "failed";

export interface StatusResponse {
  analysis_id: string;
  status: AnalysisStatus;
  progress?: { overall_percentage: number };
  error?: string;
}

export interface FeedbackResponse {
  analysis_id: string;
  status: "complete";
  video_url: string;
  edge_similarity_overall: number;
  turns_analyzed: number;
  results_url: string;
}

/* ─── Mock state ─── */

let mockProgress = 0;
let mockConfirmed = false;
let mockCallCount = 0;

/* ─── Service ─── */

export const embedApiService = {
  /** GET /api/embed/:partner/config */
  getPartnerConfig: async (partnerSlug: string): Promise<EmbedPartnerConfig> => {
    await delay(300);
    return {
      partner_slug: partnerSlug,
      partner_name: partnerSlug.charAt(0).toUpperCase() + partnerSlug.slice(1),
      max_upload_size_mb: 250,
      max_trim_seconds: 20,
    };
  },

  /** Detect skiers on a video frame (MediaPipe mock) */
  detectSkiers: async (_videoElement: HTMLVideoElement): Promise<SkierDetection[]> => {
    await delay(800);
    // Mock: return 1-2 detected skiers
    return [
      { object_id: 1, bbox: { x1: 0.3, y1: 0.2, x2: 0.5, y2: 0.8 }, label: "Skier 1" },
    ];
  },

  /** POST /api/embed/submit */
  submit: async (payload: SubmitPayload): Promise<SubmitResponse> => {
    await delay(600);
    mockProgress = 0;
    mockConfirmed = false;
    mockCallCount = 0;
    console.log("[EmbedAPI] Submit payload:", payload);
    return {
      analysis_id: "emb_" + Date.now(),
      upload_url: "https://storage.example.com/upload",
      upload_fields: { key: "uploads/mock" },
    };
  },

  /** Direct upload to presigned URL */
  uploadToStorage: async (
    _uploadUrl: string,
    _uploadFields: Record<string, string>,
    _file: File,
    onProgress?: (pct: number) => void
  ): Promise<void> => {
    for (let i = 0; i <= 100; i += 10) {
      await delay(150);
      onProgress?.(i);
    }
  },

  /** POST /api/embed/upload-complete */
  uploadComplete: async (_analysisId: string): Promise<void> => {
    await delay(200);
  },

  /** GET /api/embed/status/:analysis_id */
  getStatus: async (analysisId: string): Promise<StatusResponse> => {
    await delay(400);
    mockCallCount++;

    // Simulate: first few polls = awaiting_confirmation, then processing, then complete
    if (!mockConfirmed && mockCallCount < 4) {
      return { analysis_id: analysisId, status: "awaiting_confirmation" };
    }

    mockConfirmed = true;

    if (mockProgress < 100) {
      mockProgress = Math.min(mockProgress + 15 + Math.floor(Math.random() * 10), 100);
      if (mockProgress >= 100) {
        return { analysis_id: analysisId, status: "complete" };
      }
      return {
        analysis_id: analysisId,
        status: "processing",
        progress: { overall_percentage: mockProgress },
      };
    }

    return { analysis_id: analysisId, status: "complete" };
  },

  /** GET /api/embed/feedback/:analysis_id */
  getFeedback: async (analysisId: string): Promise<FeedbackResponse> => {
    await delay(400);
    return {
      analysis_id: analysisId,
      status: "complete",
      video_url: "",
      edge_similarity_overall: 77,
      turns_analyzed: 9,
      results_url: `/embed/results/${analysisId}`,
    };
  },

  /** Validate file type */
  validateFileType: (file: File): { valid: boolean; error?: string } => {
    const allowed = ["video/mp4", "video/quicktime", "video/webm"];
    if (!allowed.includes(file.type)) {
      return { valid: false, error: "Please upload an MP4, MOV, or WebM file." };
    }
    return { valid: true };
  },
};
