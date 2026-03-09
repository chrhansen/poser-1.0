import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function LoginDialog({ open, onOpenChange, onSuccess }: LoginDialogProps) {
  const { signIn, signUp } = useAuth();
  const [step, setStep] = useState<"initial" | "password">("initial");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);

  const reset = () => {
    setStep("initial");
    setMode("signin");
    setEmail("");
    setPassword("");
    setError("");
    setConfirmationSent(false);
    setLoading(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError("");
    setStep("password");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signin") {
        await signIn(email, password);
        handleOpenChange(false);
        onSuccess?.();
      } else {
        const result = await signUp(email, password);
        if (result.needsConfirmation) {
          setConfirmationSent(true);
        } else {
          handleOpenChange(false);
          onSuccess?.();
        }
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // TODO_BACKEND_HOOKUP: Implement Google OAuth sign-in
    console.log("Google sign-in not yet implemented");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {confirmationSent ? (
          <div className="py-6 text-center">
            <DialogHeader>
              <DialogTitle>Check your email</DialogTitle>
              <DialogDescription>
                We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
              </DialogDescription>
            </DialogHeader>
            <Button variant="outline" className="mt-6" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : step === "initial" ? (
          <>
            <DialogHeader className="text-center sm:text-center">
              <DialogTitle className="text-xl">Log in or sign up</DialogTitle>
              <DialogDescription>
                Sign in to upload clips, track progress, and more.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 space-y-4">
              <Button
                variant="outline"
                className="w-full justify-center gap-3 h-11"
                onClick={handleGoogleSignIn}
              >
                <GoogleIcon className="h-5 w-5" />
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <form onSubmit={handleEmailContinue} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full h-11" variant="secondary">
                  Continue
                </Button>
              </form>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{mode === "signin" ? "Enter your password" : "Create your account"}</DialogTitle>
              <DialogDescription>
                {email}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handlePasswordSubmit} className="mt-2 space-y-4">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoFocus
                className="h-11"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  className="underline hover:text-foreground"
                  onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
                >
                  {mode === "signin" ? "Sign up" : "Sign in"}
                </button>
              </p>
              <button
                type="button"
                className="block w-full text-center text-xs text-muted-foreground underline hover:text-foreground"
                onClick={() => { setStep("initial"); setPassword(""); setError(""); }}
              >
                ← Back
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
