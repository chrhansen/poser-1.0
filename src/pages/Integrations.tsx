import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { partnersService, type CreatePartnerInput } from "@/services/partners.service";
import type { Partner } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, Check, Code, AlertTriangle, ExternalLink, Plus, Globe, Pencil, MonitorSmartphone, Zap, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import embedPreview from "@/assets/embed-preview.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── Copy Button ────────────────────────────────────────────────────────────
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied to clipboard.`);
    } catch {
      toast.error("Failed to copy. Try again.");
    }
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

// ─── Integration Snippets ───────────────────────────────────────────────────
function IntegrationSnippets({ partner }: { partner: Partner }) {
  if (!partner.integrationSnippets) return null;
  const { html, react, next } = partner.integrationSnippets;
  return (
    <div className="mt-4 rounded-lg border border-border bg-surface-sunken p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Code className="h-4 w-4" />
        Integration snippets
      </div>
      <Tabs defaultValue="html" className="mt-3">
        <TabsList className="h-8">
          <TabsTrigger value="html" className="text-xs">HTML</TabsTrigger>
          <TabsTrigger value="react" className="text-xs">React</TabsTrigger>
          <TabsTrigger value="next" className="text-xs">Next.js</TabsTrigger>
        </TabsList>
        {(["html", "react", "next"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-3">
            <pre className="overflow-x-auto rounded-md bg-secondary p-3 text-xs text-muted-foreground">
              {{ html, react, next }[tab]}
            </pre>
            <div className="mt-2">
              <CopyButton text={{ html, react, next }[tab]} label={`${tab.charAt(0).toUpperCase() + tab.slice(1)} snippet`} />
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-4 rounded-lg border border-border p-3">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <AlertTriangle className="h-3 w-3" /> Troubleshooting
        </div>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li>• Make sure your domain ({partner.domain}) is whitelisted in your partner settings.</li>
          <li>• The embed iframe requires HTTPS on production domains.</li>
          <li>• If the widget doesn't load, check your browser's Content Security Policy headers.</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Update Domain Dialog (inline) ──────────────────────────────────────────
function UpdateDomainForm({ partner, onUpdated }: { partner: Partner; onUpdated: (p: Partner) => void }) {
  const [domain, setDomain] = useState(partner.domain ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})*$/.test(domain)) {
      setError("Enter a valid domain (e.g. example.com).");
      return;
    }
    setSaving(true);
    setError("");
    const updated = await partnersService.updateDomain(partner.id, domain);
    setSaving(false);
    if (updated) {
      toast.success("Domain updated. Snippets regenerated.");
      onUpdated(updated);
    } else {
      toast.error("Failed to update domain.");
    }
  };

  return (
    <div className="mt-3 flex items-end gap-2">
      <div className="flex-1 space-y-1">
        <Label className="text-xs">Domain</Label>
        <Input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          className="h-8 text-xs"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Update"}
      </Button>
    </div>
  );
}

// ─── Create Partner Form ────────────────────────────────────────────────────
function CreatePartnerForm({ onCreated }: { onCreated: (p: Partner) => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreatePartnerInput>({
    name: "", slug: "", domain: "", description: "", url: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreatePartnerInput, string>>>({});

  const update = (field: keyof CreatePartnerInput, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    update("name", name);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    update("slug", slug);
  };

  const handleSubmit = async () => {
    const validation = partnersService.validatePartnerInput(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setSaving(true);
    try {
      const partner = await partnersService.createPartner(form);
      toast.success(`Partner "${partner.name}" created.`);
      onCreated(partner);
      setOpen(false);
      setForm({ name: "", slug: "", domain: "", description: "", url: "" });
    } catch {
      toast.error("Failed to create partner.");
    }
    setSaving(false);
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-3 w-3" /> Add partner
      </Button>
    );
  }

  const fields: { key: keyof CreatePartnerInput; label: string; placeholder: string }[] = [
    { key: "name", label: "Organization name", placeholder: "Alpine Academy" },
    { key: "slug", label: "Slug (lowercase, dashes)", placeholder: "alpine-academy" },
    { key: "domain", label: "Domain", placeholder: "example.com" },
    { key: "url", label: "Website URL", placeholder: "https://example.com" },
    { key: "description", label: "Description", placeholder: "Brief description…" },
  ];

  return (
    <div className="rounded-xl border border-border p-6">
      <h3 className="text-sm font-semibold text-foreground">New Partner</h3>
      <div className="mt-4 space-y-3">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1">
            <Label className="text-xs">{f.label}</Label>
            <Input
              value={form[f.key]}
              onChange={(e) => f.key === "name" ? handleNameChange(e.target.value) : update(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="h-8 text-sm"
            />
            {errors[f.key] && <p className="text-xs text-destructive">{errors[f.key]}</p>}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
        <Button size="sm" onClick={handleSubmit} disabled={saving}>
          {saving ? "Creating…" : "Create partner"}
        </Button>
      </div>
    </div>
  );
}

// ─── Embed Widget Promo ─────────────────────────────────────────────────────
function EmbedWidgetPromo() {
  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 md:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <MonitorSmartphone className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Embed Widget</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Let your students analyze their ski technique without leaving your website. Drop Poser's lightweight embed widget into any page — users upload a video, get AI-powered feedback, and see results in seconds.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Zap,
            title: "Instant setup",
            desc: "One snippet of HTML or a React component — no backend required.",
          },
          {
            icon: Palette,
            title: "Your brand",
            desc: "The widget inherits your domain and partner slug for a seamless experience.",
          },
          {
            icon: MonitorSmartphone,
            title: "Works everywhere",
            desc: "Responsive from mobile to desktop. HTTPS-ready for production.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-border bg-background p-4">
            <item.icon className="h-4 w-4 text-primary" />
            <h3 className="mt-2 text-sm font-medium text-foreground">{item.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-border bg-secondary/50 p-4">
        <p className="text-xs font-medium text-foreground">Quick start</p>
        <pre className="mt-2 overflow-x-auto text-xs text-muted-foreground">
{`<div id="poser-embed"></div>

<script src="https://js.poser.pro/poser.js"></script>

<script>
  window.addEventListener("load", () => {
    window.PoserEmbed.mount("#poser-embed", { partnerId: "YOUR-PARTNER-ID" })
  })
</script>`}
        </pre>
      </div>
    </div>
  );
}

// ─── Integrations Page ──────────────────────────────────────────────────────
export default function IntegrationsPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingDomain, setEditingDomain] = useState<string | null>(null);

  useEffect(() => {
    partnersService.getPartners().then((p) => {
      setPartners(p);
      setLoading(false);
    });
  }, []);

  const handlePartnerUpdated = (updated: Partner) => {
    setPartners((prev) => prev.map((p) => p.id === updated.id ? updated : p));
    setEditingDomain(null);
  };

  if (loading) return <Layout><PageLoader /></Layout>;

  return (
    <Layout>
      <Section>
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Integrations</h1>
              <p className="mt-2 text-muted-foreground">Embed Poser into your website or platform.</p>
            </div>
          </div>

          {/* Embed preview screenshot */}
          <div className="mt-8 flex justify-center">
            <img
              src={embedPreview}
              alt="Poser embed widget preview showing video upload interface"
              className="rounded-xl border border-border shadow-sm max-w-sm w-full"
            />
          </div>

          {/* Embed widget promo */}
          <div className="mt-8">
            <EmbedWidgetPromo />
          </div>

        </div>
      </Section>
    </Layout>
  );
}
