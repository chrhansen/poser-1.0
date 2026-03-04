import { useEffect, useState } from "react";
import { partnersService, type CreatePartnerInput } from "@/services/partners.service";
import type { Partner } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Globe, Pencil, Plus, Trash2 } from "lucide-react";

export function IntegrationsTab() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  // Track email notification state per partner (mock, keyed by id)
  const [emailNotifs, setEmailNotifs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    partnersService.getPartners().then((p) => {
      setPartners(p);
      // Default all existing partners to email notifications on
      const notifs: Record<string, boolean> = {};
      p.forEach((partner) => { notifs[partner.id] = true; });
      setEmailNotifs(notifs);
      setLoading(false);
    });
  }, []);

  const handleDomainUpdated = (updated: Partner) => {
    setPartners((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingId(null);
  };

  const handleCreated = (newPartner: Partner) => {
    setPartners((prev) => [...prev, newPartner]);
    setEmailNotifs((prev) => ({ ...prev, [newPartner.id]: true }));
    setShowAddForm(false);
    toast.success("Embed widget created.");
  };

  const toggleEmailNotif = (partnerId: string) => {
    setEmailNotifs((prev) => {
      const next = { ...prev, [partnerId]: !prev[partnerId] };
      toast.success(next[partnerId] ? "Email notifications enabled." : "Email notifications disabled.");
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Embed Widgets</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage domains authorized to load your embed widget.
          </p>
        </div>
        {!showAddForm && (
          <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add widget
          </Button>
        )}
      </div>

      {showAddForm && (
        <AddWidgetForm
          onCreated={handleCreated}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="space-y-3">
        {partners.map((p) => (
          <div key={p.id} className="rounded-xl border border-border px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.domain || "No domain set"} · <span className="font-mono">{p.slug}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`notif-${p.id}`} className="text-xs text-muted-foreground">
                    Email alerts
                  </Label>
                  <Switch
                    id={`notif-${p.id}`}
                    checked={emailNotifs[p.id] ?? false}
                    onCheckedChange={() => toggleEmailNotif(p.id)}
                  />
                </div>
                <button
                  onClick={() => setEditingId(editingId === p.id ? null : p.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {editingId === p.id && (
              <DomainEditor partner={p} onUpdated={handleDomainUpdated} />
            )}
          </div>
        ))}
        {partners.length === 0 && !showAddForm && (
          <p className="text-xs text-muted-foreground">
            No embed widgets yet. Click "Add widget" to get started.
          </p>
        )}
      </div>
    </div>
  );
}

function AddWidgetForm({
  onCreated,
  onCancel,
}: {
  onCreated: (p: Partner) => void;
  onCancel: () => void;
}) {
  const [slug, setSlug] = useState("");
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const input: CreatePartnerInput = {
      name: slug, // derive name from slug for now
      slug,
      domain,
      description: "",
      url: `https://${domain}`,
    };
    const validation = partnersService.validatePartnerInput(input);
    if (!validation.valid) {
      setErrors(validation.errors as Record<string, string>);
      return;
    }
    setSaving(true);
    setErrors({});
    const created = await partnersService.createPartner(input);
    setSaving(false);
    onCreated(created);
  };

  return (
    <div className="mt-4 rounded-lg border border-border p-4 space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Slug</Label>
        <Input
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          placeholder="my-widget"
          className="h-8 text-xs font-mono"
        />
        {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Domain</Label>
        <Input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          className="h-8 text-xs"
        />
        {errors.domain && <p className="text-xs text-destructive">{errors.domain}</p>}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={saving}>
          {saving ? "Creating…" : "Create"}
        </Button>
      </div>
    </div>
  );
}

function DomainEditor({
  partner,
  onUpdated,
}: {
  partner: Partner;
  onUpdated: (p: Partner) => void;
}) {
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
