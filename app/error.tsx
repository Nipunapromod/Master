"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("A/L Mastermind route error", error); }, [error]);
  return <main className="grid min-h-screen place-items-center px-5"><section className="panel w-full max-w-md rounded-2xl p-6 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-amber-300/10 text-amber-200"><AlertTriangle size={22}/></span><h1 className="mt-4 text-xl font-semibold">That page hit a snag</h1><p className="mt-2 text-sm leading-6 muted">Your saved browser demo data should still be there. Try the page again, or return to the dashboard.</p><button onClick={reset} className="btn-primary mt-5"><RotateCcw size={14}/> Try again</button></section></main>;
}