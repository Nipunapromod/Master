"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, LoaderCircle } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router=useRouter();
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [done,setDone]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setError("");
    if(password.length<8){setError("Use at least 8 characters for your password.");return;}
    if(password!==confirm){setError("The two passwords do not match.");return;}
    const supabase=getSupabaseBrowserClient();
    if(!supabase){setError("Password reset is not available because Supabase is not configured.");return;}
    setBusy(true);
    try{const {error}=await supabase.auth.updateUser({password});if(error)throw error;setDone(true);window.setTimeout(()=>router.push("/dashboard"),1700);}
    catch(e){setError(e instanceof Error?e.message:"Could not update password. Open a fresh reset link and try again.");}
    finally{setBusy(false);}
  }
  return <main className="grid min-h-screen place-items-center px-4 py-10"><section className="panel w-full max-w-md rounded-3xl p-6 sm:p-9"><Link href="/auth" className="inline-flex items-center gap-2 text-xs muted"><ArrowLeft size={14}/> Back to sign in</Link><p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-violet-300">Account recovery</p><h1 className="mt-2 text-2xl font-semibold">Choose a new password</h1><p className="mt-2 text-sm leading-6 muted">Use the secure link sent to your email, then set a new password.</p>{done?<div role="status" className="mt-6 rounded-xl border border-emerald-300/20 bg-emerald-300/[.06] p-4 text-sm text-emerald-200"><CheckCircle2 className="mr-2 inline" size={18}/>Password updated. Opening your workspace…</div>:<form onSubmit={submit} className="mt-6 space-y-4"><label className="block"><span className="mb-1.5 block text-xs muted">New password</span><input required minLength={8} type="password" autoComplete="new-password" className="input" value={password} onChange={e=>setPassword(e.target.value)}/></label><label className="block"><span className="mb-1.5 block text-xs muted">Confirm password</span><input required minLength={8} type="password" autoComplete="new-password" className="input" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>{error&&<p role="alert" className="text-xs leading-5 text-rose-200">{error}</p>}<button className="btn-primary w-full disabled:opacity-50" disabled={busy} type="submit">{busy&&<LoaderCircle size={15} className="animate-spin"/>}Update password</button></form>}</section></main>;
}