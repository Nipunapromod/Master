import { GraduationCap } from "lucide-react";

export default function Loading() {
  return <main className="grid min-h-screen place-items-center px-5"><div className="text-center"><div className="mx-auto grid h-14 w-14 animate-pulse place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500"><GraduationCap size={27}/></div><p className="mt-4 text-sm font-semibold">Opening your workspace</p><p className="mt-1 text-xs text-slate-500">Getting the study space ready…</p></div></main>;
}