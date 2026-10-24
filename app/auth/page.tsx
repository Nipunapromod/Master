"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, GraduationCap, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setBusy(false);
      setError("Supabase is not configured yet. This demo dashboard works without signing in. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable real accounts.");
      return;
    }
    try {
      if (mode === "signup") {
        if (password.length < 8) throw new Error("Use a password with at least 8 characters.");
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: window.location.origin + "/auth/callback?next=/dashboard"
          }
        });
        if (error) throw error;
        if (data.session) router.push("/dashboard");
        else setMessage("Account request received. Check your email to verify the account, then sign in.");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin + "/auth/reset-password"
        });
        if (error) throw error;
        setMessage("If an account exists for that email, a password-reset link has been sent.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        router.push(search.get("next") === "/dashboard" ? "/dashboard" : "/dashboard");
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function googleSignIn() {
    setBusy(true); setError(""); setMessage("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setBusy(false);
      setError("Supabase is not configured yet. Add the public Supabase project URL and anon/publishable key to enable Google OAuth.");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/auth/callback?next=/dashboard" }
    });
    if (error) { setError(error.message); setBusy(false); }
  }

  return <main className="min-h-screen px-4 py-8 sm:py-12">
    <div className="mx-auto max-w-5xl"><Link href="/" className="inline-flex items-center gap-2 text-xs muted hover:text-white"><ArrowLeft size={14}/> Back to landing page</Link>
      <div className="mt-8 grid overflow-hidden rounded-3xl border border-white/[.08] bg-[#0c1123] shadow-2xl lg:grid-cols-[1fr_.9fr]">
        <section className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-600/20 via-[#0c1123] to-cyan-500/10 p-10 lg:flex">
          <div><Link href="/" className="inline-flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500"><GraduationCap size={23}/></span><span className="text-sm font-bold">A/L <span className="text-violet-300">MASTERMIND</span></span></Link>
            <p className="mt-12 text-xs font-bold uppercase tracking-[.2em] text-violet-300">Your study workspace</p><h1 className="mt-3 text-4xl font-semibold leading-tight">Make the next<br/>study session count.</h1><p className="mt-4 max-w-sm text-sm leading-6 muted">Keep your subjects, marks and study tasks organized in one calm space, built around your A/L journey.</p>
          </div>
          <div className="space-y-3 text-xs text-slate-300"><p className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-300"/> Your progress stays yours</p><p className="flex items-center gap-2"><ShieldCheck size={15} className="text-cyan-300"/> Secure account provider</p><p className="flex items-center gap-2"><Mail size={15} className="text-violet-300"/> Email verification supported</p></div>
        </section>
        <section className="p-6 sm:p-9 lg:p-10">
          <div className="mb-8 flex items-center gap-3 lg:hidden"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500"><GraduationCap size={22}/></span><span className="text-xs font-bold">A/L <span className="text-violet-300">MASTERMIND</span></span></div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-violet-300">{mode === "login" ? "Welcome back" : mode === "signup" ? "Start your journey" : "Account recovery"}</p>
          <h2 className="mt-2 text-2xl font-semibold">{mode === "login" ? "Sign in" : mode === "signup" ? "Create your account" : "Reset password"}</h2>
          <p className="mt-2 text-sm leading-6 muted">{mode === "login" ? "Pick up where you left off." : mode === "signup" ? "Create an account to prepare your study workspace." : "We’ll send a secure recovery link if the account exists."}</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && <label className="block"><span className="mb-1.5 block text-xs muted">Full name</span><input className="input" autoComplete="name" required maxLength={90} value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name"/></label>}
            <label className="block"><span className="mb-1.5 block text-xs muted">Email address</span><input className="input" autoComplete="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="student@example.com"/></label>
            {mode !== "reset" && <label className="block"><span className="mb-1.5 block text-xs muted">Password</span><input className="input" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={mode === "signup" ? 8 : 1} value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}/></label>}
            {mode === "login" && <div className="text-right"><button type="button" onClick={()=>{setMode("reset");setError("");setMessage("");}} className="text-xs font-semibold text-violet-300 hover:text-violet-200">Forgot password?</button></div>}
            {error && <p role="alert" className="rounded-xl border border-rose-300/20 bg-rose-300/[.06] p-3 text-xs leading-5 text-rose-200">{error}</p>}
            {message && <p role="status" className="rounded-xl border border-emerald-300/20 bg-emerald-300/[.06] p-3 text-xs leading-5 text-emerald-200">{message}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-50">{busy && <LoaderCircle size={15} className="animate-spin"/>}{mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}</button>
          </form>
          {mode !== "reset" && <><div className="my-5 flex items-center gap-3"><span className="h-px flex-1 bg-white/[.08]"/><span className="text-[10px] muted">OR</span><span className="h-px flex-1 bg-white/[.08]"/></div><button type="button" disabled={busy} onClick={googleSignIn} className="btn-secondary w-full disabled:opacity-50">Continue with Google</button></>}
          <div className="mt-6 text-center text-xs muted">{mode === "login" ? <>New here? <button onClick={()=>{setMode("signup");setError("");setMessage("");}} className="font-semibold text-violet-300">Create an account</button></> : mode === "signup" ? <>Already registered? <button onClick={()=>{setMode("login");setError("");setMessage("");}} className="font-semibold text-violet-300">Sign in</button></> : <>Remembered it? <button onClick={()=>{setMode("login");setError("");setMessage("");}} className="font-semibold text-violet-300">Back to sign in</button></>}</div>
          <div className="mt-7 rounded-xl border border-white/[.06] bg-white/[.02] p-3 text-[10px] leading-5 muted">No Supabase credentials? You can still open the demo dashboard. Authentication is real only when the Supabase project and redirect URLs are configured.</div>
          <Link href="/dashboard" className="mt-4 block text-center text-xs text-slate-300 hover:text-white">Continue in demo mode →</Link>
        </section>
      </div>
    </div>
  </main>;
}