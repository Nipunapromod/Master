import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center px-5"><section className="panel w-full max-w-md rounded-2xl p-7 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-violet-300/10 text-violet-200"><SearchX size={22}/></span><p className="mt-4 text-[10px] font-bold uppercase tracking-[.2em] text-violet-300">404 · Lost in the syllabus?</p><h1 className="mt-2 text-2xl font-semibold">Page not found</h1><p className="mt-2 text-sm leading-6 muted">This page doesn’t exist in the current version. Nothing has been erased; the route just isn’t here.</p><Link href="/dashboard" className="btn-primary mt-5"><ArrowLeft size={14}/> Back to workspace</Link></section></main>;
}