import React, { useState } from "react";
import { User } from "../types";
import { api } from "../api";
import { LogIn, UserPlus, ShieldAlert, Sparkles } from "lucide-react";

interface AuthModalProps {
  onAuthSuccess: (user: User) => void;
  onClose?: () => void;
}

export default function AuthModal({ onAuthSuccess, onClose }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email address is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        if (!name) {
          setError("Full Name is required for registration.");
          setLoading(false);
          return;
        }
        const response = await api.register(name, email, role);
        localStorage.setItem("store_auth_token", response.token);
        onAuthSuccess(response.user);
      } else {
        const response = await api.login(email);
        localStorage.setItem("store_auth_token", response.token);
        onAuthSuccess(response.user);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Make sure the email exists!");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSignIn = async (quickEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.login(quickEmail);
      localStorage.setItem("store_auth_token", response.token);
      onAuthSuccess(response.user);
    } catch (err: any) {
      setError(err.message || "Quick Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl transition-all duration-300">
        <div className="bg-slate-900 px-6 py-6 text-white text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
            {isRegister ? <UserPlus className="h-6 w-6" /> : <LogIn className="h-6 w-6" />}
          </div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            {isRegister ? "Create E-Commerce Account" : "Access Your Account"}
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            {isRegister
              ? "Join us to manage shopping lists and buy premium goods"
              : "Explore the catalog, track orders, or edit products"}
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-600">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-xs outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. customer@store.com"
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-xs outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Account Role
                </label>
                <div className="mt-1.5 flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer text-slate-700">
                    <input
                      type="radio"
                      name="role"
                      checked={role === "user"}
                      onChange={() => setRole("user")}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    Customer Account
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer text-slate-700">
                    <input
                      type="radio"
                      name="role"
                      checked={role === "admin"}
                      onChange={() => setRole("admin")}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    Store Administrator
                  </label>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full cursor-pointer rounded-lg bg-indigo-600 py-2.5 text-center text-sm font-medium text-white shadow-md hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : isRegister ? (
                "Create Account"
              ) : (
                "Sign In Securely"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="cursor-pointer text-xs font-medium text-indigo-600 hover:underline"
            >
              {isRegister ? "Already member? Sign In instead" : "Need account? Register here"}
            </button>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2.5 text-slate-400 font-semibold text-[10px] tracking-wider">
                Developer Sandboxed Keys
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-center text-[11px] font-medium text-slate-500">
              Quickly switch between pre-seeded role models:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickSignIn("admin@store.com")}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 p-2 text-center text-xs font-medium text-slate-700 hover:border-indigo-200 hover:bg-slate-50 transition-all"
              >
                <div className="font-semibold text-indigo-700 flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" /> Admin Mode
                </div>
                <div className="text-[10px] text-slate-400">admin@store.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickSignIn("customer@store.com")}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 p-2 text-center text-xs font-medium text-slate-700 hover:border-indigo-200 hover:bg-slate-50 transition-all"
              >
                <div className="font-semibold text-emerald-700 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Customer Mode
                </div>
                <div className="text-[10px] text-slate-400">customer@store.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
