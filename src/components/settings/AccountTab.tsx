import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { settingsService } from "@/services/settings.service";
import type { SettingsProfile } from "@/lib/types";
import { toast } from "sonner";
import { Loader2, Upload, AlertCircle } from "lucide-react";

export function AccountTab() {
  const [profile, setProfile] = useState<SettingsProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [emailChangePending, setEmailChangePending] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const originalRef = useRef<SettingsProfile | null>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [notifComplete, setNotifComplete] = useState(true);
  const [notifTips, setNotifTips] = useState(false);

  useEffect(() => {
    settingsService.getProfile().then((p) => {
      setProfile(p);
      originalRef.current = p;
      setName(p.name);
      setUsername(p.username);
      setEmail(p.email);
      setBio(p.bio);
      setNotifComplete(p.notifications.analysisComplete);
      setNotifTips(p.notifications.weeklyTips);
      setAvatarPreview(p.avatarUrl);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!originalRef.current) return;
    const o = originalRef.current;
    const isDirty = name !== o.name || username !== o.username || bio !== o.bio || notifComplete !== o.notifications.analysisComplete || notifTips !== o.notifications.weeklyTips;
    setDirty(isDirty);
  }, [name, username, bio, notifComplete, notifTips]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = settingsService.validateAvatar(file);
    if (!validation.valid) { toast.error(validation.error); return; }
    try {
      const { url } = await settingsService.uploadAvatar(file);
      setAvatarPreview(url);
      toast.success("Avatar updated.");
    } catch { toast.error("Failed to upload avatar."); }
  };

  const handleEmailChange = async () => {
    if (!profile || email === profile.email) return;
    try {
      const { needsConfirmation } = await settingsService.updateEmail(email);
      if (needsConfirmation) {
        setEmailChangePending(true);
        toast.info("Check your new email for a confirmation link.");
      }
    } catch { toast.error("Failed to update email."); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await settingsService.updateProfile({ name, username, bio, notifications: { analysisComplete: notifComplete, weeklyTips: notifTips } });
      originalRef.current = updated;
      setProfile(updated);
      setDirty(false);
      toast.success("Settings saved.");
      if (email !== updated.email) handleEmailChange();
    } catch { toast.error("Failed to save settings."); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      {emailChangePending && (
        <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-accent" />
          <span className="text-muted-foreground">Email change pending confirmation. Check your inbox.</span>
        </div>
      )}

      {profile && !profile.emailConfirmed && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          <span className="text-muted-foreground">Your email is not confirmed. Check your inbox or request a new link.</span>
        </div>
      )}

      {/* Avatar */}
      <div className="rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-foreground">Avatar</h2>
        <p className="mt-1 text-sm text-muted-foreground">JPG, PNG, WebP, or GIF. Max 5MB.</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-muted-foreground">{name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => avatarRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> Upload
          </Button>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
      </div>

      {/* Profile */}
      <div className="rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-foreground">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account details.</p>
        <div className="mt-4 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="settings-name">Full Name</Label>
            <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="settings-username">Username</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
              <Input id="settings-username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} className="pl-7" />
            </div>
            <p className="text-xs text-muted-foreground">This is your unique identifier on Poser</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="settings-email">Email Address</Label>
            <Input id="settings-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <p className="text-xs text-muted-foreground">We'll send analysis results and notifications to this email</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="settings-bio">Bio</Label>
            <Textarea id="settings-bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself" rows={3} />
            <p className="text-xs text-muted-foreground">A brief description that appears on your profile</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose what emails you receive.</p>
        <div className="mt-4 flex items-center justify-between">
          <Label htmlFor="notif-complete">Analysis complete</Label>
          <Switch id="notif-complete" checked={notifComplete} onCheckedChange={setNotifComplete} />
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between">
        {dirty && <p className="text-xs text-accent">You have unsaved changes.</p>}
        <Button onClick={handleSave} disabled={saving || !dirty} className="ml-auto">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}
