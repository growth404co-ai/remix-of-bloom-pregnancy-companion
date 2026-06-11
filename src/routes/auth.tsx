import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Link, useNavigate } from "@tanstack/react-router";
import { Flower2, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — Bloom" },
      { name: "description", content: "Sign in to Bloom pregnancy tracker" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        navigate({ to: "/onboarding" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error instanceof Error ? result.error.message : "Google sign-in failed");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--rose)] text-white">
            <Flower2 className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-[var(--ink)]">Bloom</h1>
          <p className="mt-1 text-sm text-[var(--bloom-muted)]">Your pregnancy companion</p>
        </div>

        <div className="mb-4 flex rounded-xl bg-white p-1 shadow-sm border border-[var(--bloom-border)]">
          <button
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === "signin" ? "bg-[var(--rose)] text-white" : "text-[var(--bloom-muted)]"
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === "signup" ? "bg-[var(--rose)] text-white" : "text-[var(--bloom-muted)]"
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bloom-muted)]" />
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[var(--bloom-border)] bg-white py-3 pl-10 pr-4 text-sm text-[var(--ink)] outline-none focus:border-[var(--rose)] focus:ring-1 focus:ring-[var(--rose)]"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bloom-muted)]" />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[var(--bloom-border)] bg-white py-3 pl-10 pr-4 text-sm text-[var(--ink)] outline-none focus:border-[var(--rose)] focus:ring-1 focus:ring-[var(--rose)]"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--rose)] py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--rose-dark)] disabled:opacity-50"
          >
            {loading ? "Loading..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--bloom-border)]" />
          <span className="text-xs text-[var(--bloom-muted)]">or</span>
          <div className="h-px flex-1 bg-[var(--bloom-border)]" />
        </div>

        <button
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--bloom-border)] bg-white py-3 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--rose-light)]"
        >
          <Chrome className="h-4 w-4" />
          Continue with Google
        </button>

        <p className="mt-6 text-center text-xs text-[var(--bloom-muted)]">
          By signing in, you agree to our{" "}
          <Link to="/" className="text-[var(--rose)] underline">
            Terms
          </Link>
        </p>
      </div>
    </div>
  );
}
