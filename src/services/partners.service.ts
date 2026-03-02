import type { Partner } from "@/lib/types";
import { mockPartners, delay } from "./mock-data";

// In-memory store for mock mode
let _partners = [...mockPartners];
const _existingSlugs = new Set(_partners.map((p) => p.slug));

function generateSnippets(slug: string): Partner["integrationSnippets"] {
  return {
    html: `<iframe src="https://poser.app/embed/results/TOKEN" width="400" height="600" frameborder="0" data-partner="${slug}"></iframe>`,
    react: `import { PoserEmbed } from '@poser/react';\n\nexport default function Results() {\n  return <PoserEmbed token="TOKEN" partner="${slug}" />;\n}`,
    next: `import { PoserEmbed } from '@poser/react';\n\nexport default function ResultsPage() {\n  return (\n    <main>\n      <PoserEmbed token="TOKEN" partner="${slug}" />\n    </main>\n  );\n}`,
  };
}

export interface CreatePartnerInput {
  name: string;
  slug: string;
  domain: string;
  description: string;
  url: string;
}

export interface PartnerValidation {
  valid: boolean;
  errors: Partial<Record<keyof CreatePartnerInput, string>>;
}

// TODO_BACKEND_HOOKUP: Replace all methods with real API calls
export const partnersService = {
  getPartners: async (): Promise<Partner[]> => {
    await delay(300);
    return [..._partners];
  },

  validatePartnerInput: (input: CreatePartnerInput): PartnerValidation => {
    const errors: PartnerValidation["errors"] = {};
    if (!input.name.trim()) errors.name = "Name is required.";
    // slug: lowercase, numbers, dashes only
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(input.slug) && input.slug.length > 1) {
      errors.slug = "Slug must be lowercase letters, numbers, and dashes only.";
    } else if (input.slug.length < 2) {
      errors.slug = "Slug must be at least 2 characters.";
    }
    if (_existingSlugs.has(input.slug)) {
      errors.slug = "This slug is already taken.";
    }
    // domain format
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})*$/.test(input.domain)) {
      errors.domain = "Enter a valid domain (e.g. example.com).";
    }
    if (!input.url.trim()) errors.url = "URL is required.";
    return { valid: Object.keys(errors).length === 0, errors };
  },

  createPartner: async (input: CreatePartnerInput): Promise<Partner> => {
    // TODO_BACKEND_HOOKUP: Create partner in database
    await delay(600);
    const partner: Partner = {
      id: `p_${Date.now()}`,
      name: input.name,
      slug: input.slug,
      domain: input.domain,
      description: input.description,
      url: input.url,
      logoUrl: "",
      integrationSnippets: generateSnippets(input.slug),
    };
    _partners = [..._partners, partner];
    _existingSlugs.add(input.slug);
    return partner;
  },

  updateDomain: async (partnerId: string, newDomain: string): Promise<Partner | null> => {
    // TODO_BACKEND_HOOKUP: Update domain and regenerate snippets
    await delay(400);
    const idx = _partners.findIndex((p) => p.id === partnerId);
    if (idx === -1) return null;
    const updated = {
      ..._partners[idx],
      domain: newDomain,
      integrationSnippets: generateSnippets(_partners[idx].slug ?? ""),
    };
    _partners[idx] = updated;
    return updated;
  },

  checkSlugAvailable: async (slug: string): Promise<boolean> => {
    // TODO_BACKEND_HOOKUP: Check slug uniqueness in database
    await delay(200);
    return !_existingSlugs.has(slug);
  },
};
