import { useEffect, useState } from "react";
import { partnersService } from "@/services/partners.service";
import type { Partner } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Globe, Pencil, Copy, Check } from "lucide-react";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied.`);
    } catch { toast.error("Failed to copy."); }
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export function IntegrationsTab() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDomain, setEditingDomain] = useState<string | null>(null);

  useEffect(() => {
    partnersService.getPartners().then((p) => {
      setPartners(p);
      setLoading(false);
    });
  }, []);

  const handleDomainUpdated = (updated: Partner) => {
    setPartners((prev) => prev.map((p) => p.id === updated.id ? updated : p));
    setEditingDomain(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Embed Widget */}
      <div className="rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-foreground">Embed Widget</h2>
        <p className="mt-1 text-sm text-muted-foreground">Domains authorized to load your embed widget.</p>
        <div className="mt-4 space-y-3">
          {partners.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.domain || "No domain set"}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingDomain(editingDomain === p.id ? null : p.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {partners.length === 0 && (
            <p className="text-xs text-muted-foreground">No connected partners yet. Visit the <a href="/integrations" className="underline">Integrations</a> page to get started.</p>
          )}
        </div>
        {editingDomain && (() => {
          const partner = partners.find(p => p.id === editingDomain);
          if (!partner) return null;
          return <DomainEditor partner={partner} onUpdated={handleDomainUpdated} />;
        })()}
      </div>
    </div>
  );
}

function DomainEditor({ partner, onUpdated }: { partner: Partner; onUpdated: (p: Partner) => void }) {
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
      toast.success("Domain updated.");
      onUpdated(updated);
    } else {
      toast.error("Failed to update domain.");
    }
  };

  return (
    <div className="mt-3 flex items-end gap-2">
      <div className="flex-1 space-y-1">
        <Label className="text-xs">Domain for {partner.name}</Label>
        <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" className="h-8 text-xs" />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Update"}
      </Button>
    </div>
  );
}
