import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2, ArrowLeft } from "lucide-react";
import { authService } from "@/services/auth.service";

// ─── Context-specific copy ──────────────────────────────────────────────────

export type AuthContext = "signin" | "upload" | "signup";

interface ContextCopy {
  title: string;
  body: string;
  helper: string;
}

const COPY: Record<AuthContext, ContextCopy> = {
  signin: {
    title: "Sign in to Poser",
    body: "Access your clips, analyses, and progress.",
    helper: "New here? We'll create your account automatically.",
  },
  upload: {
    title: "Create your account to upload clips",
    body: "Use Google or your email to upload clips, save analyses, and track progress.",
    helper: "Already have an account? Use the same method to sign in.",
  },
  signup: {
    title: "Create your Poser account",
    body: "Use Google or your email to upload clips, save analyses, and track progress.",
    helper: "Already have an account? Use the same method to sign in.",
  },
};

// ─── Google icon ────────────────────────────────────────────────────────────

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

// ─── Component ──────────────────────────────────────────────────────────────

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context?: AuthContext;
  onSuccess?: () => void;
}

export function AuthDialog({
  open,
  onOpenChange,
  context = "signin",
  onSuccess,
}: AuthDialogProps) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const copy = COPY[context];

  // Reset state when dialog opens/closes or context changes
  useEffect(() => {
    if (open) {
      setStep("email");
      setEmail("");
      setOtpValue("");
      setError("");
      setLoading(false);
      setGoogleLoading(false);
    }
  }, [open, context]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid) return;
    setError("");
    setLoading(true);
    try {
      await authService.sendOtp(email);
      setStep("otp");
    } catch (err: any) {
      setError(err?.message ?? "Could not send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== 6) return;
    setError("");
    setLoading(true);
    try {
      await authService.verifyOtp(email, otpValue);
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message ?? "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await authService.signInWithGoogle();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message ?? "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const goBack = () => {
    setStep("email");
    setOtpValue("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {step === "email" ? (
          <>
            <DialogHeader className="text-center sm:text-center">
              <DialogTitle className="text-xl">{copy.title}</DialogTitle>
              <DialogDescription>{copy.body}</DialogDescription>
            </DialogHeader>

            <div className="mt-2 space-y-4">
              <Button
                variant="outline"
                className="w-full justify-center gap-3 h-11"
                onClick={handleGoogle}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon className="h-5 w-5" />
                )}
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

              <form onSubmit={handleSendCode} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                  autoFocus
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  type="submit"
                  className="w-full h-11"
                  variant="secondary"
                  disabled={!isEmailValid || loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send code
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground">
                {copy.helper}
              </p>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Enter your 6-digit code</DialogTitle>
              <DialogDescription>
                We sent a code to <strong>{email}</strong>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleVerify} className="mt-4 space-y-5">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpValue}
                  onChange={(val) => setOtpValue(val)}
                  autoFocus
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {error && <p className="text-center text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                className="w-full h-11"
                disabled={otpValue.length !== 6 || loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify and continue
              </Button>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={goBack}
              >
                <ArrowLeft className="h-3 w-3" />
                Back
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
