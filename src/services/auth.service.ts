import type { User } from "@/lib/types";
import { mockUser } from "./mock-data";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const STORAGE_KEY = "poser_mock_auth";

// In-memory auth state for mock mode — hydrated from sessionStorage
let _currentUser: User | null = null;
let _authListeners: Array<(user: User | null) => void> = [];

// Hydrate from sessionStorage on module load
try {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) _currentUser = JSON.parse(stored);
} catch { /* ignore */ }

function persist(user: User | null) {
  try {
    if (user) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

function notifyListeners() {
  _authListeners.forEach((fn) => fn(_currentUser));
}

// TODO_BACKEND_HOOKUP: Replace all methods with real backend calls
export const authService = {
  getCurrentUser: async (): Promise<User | null> => {
    await delay(200);
    return _currentUser;
  },

  /** Send a 6-digit OTP code to the given email. Backend creates account if new. */
  sendOtp: async (email: string): Promise<void> => {
    // TODO_BACKEND_HOOKUP: POST /auth/send-otp { email }
    await delay(800);
    // Mock: always succeeds
  },

  /** Verify the 6-digit OTP. Returns the signed-in user. */
  verifyOtp: async (email: string, code: string): Promise<User> => {
    // TODO_BACKEND_HOOKUP: POST /auth/verify-otp { email, code }
    await delay(800);
    // Mock: accept any 6-digit code
    if (code.length !== 6) throw new Error("Invalid code. Please try again.");
    _currentUser = { ...mockUser, email };
    persist(_currentUser);
    notifyListeners();
    return _currentUser;
  },

  /** Sign in with Google OAuth */
  signInWithGoogle: async (): Promise<void> => {
    // TODO_BACKEND_HOOKUP: Redirect to Google OAuth flow
    await delay(600);
    _currentUser = { ...mockUser };
    persist(_currentUser);
    notifyListeners();
  },

  // Keep legacy methods for backward compat during migration
  signInWithEmail: async (email: string, _password: string): Promise<User> => {
    await delay(600);
    _currentUser = { ...mockUser, email };
    persist(_currentUser);
    notifyListeners();
    return _currentUser;
  },

  signUpWithEmail: async (email: string, _password: string): Promise<{ needsConfirmation: boolean }> => {
    await delay(600);
    return { needsConfirmation: true };
  },

  signOut: async (): Promise<void> => {
    await delay(200);
    _currentUser = null;
    persist(null);
    notifyListeners();
  },

  confirmEmail: async (_token: string): Promise<boolean> => {
    await delay(500);
    _currentUser = { ...mockUser };
    persist(_currentUser);
    notifyListeners();
    return true;
  },

  onAuthStateChange: (listener: (user: User | null) => void) => {
    _authListeners.push(listener);
    return () => {
      _authListeners = _authListeners.filter((fn) => fn !== listener);
    };
  },

  /** Mock helper: instantly set signed-in state for dev */
  _mockSignIn: () => {
    _currentUser = { ...mockUser };
    persist(_currentUser);
    notifyListeners();
  },
};
