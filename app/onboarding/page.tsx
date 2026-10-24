"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, GraduationCap, Languages, MapPin, School, Sparkles, Target, Timer } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SubjectName } from "@/lib/data";

const subjects: SubjectName[] = ["Combined Mathematics", "Physics", "Chemistry"];
const districts = ["Ampara","Anuradhapura","Badulla","Batticaloa","Colombo","Galle","Gampaha","Hambantota","Jaffna","Kalutara","Kandy","Kegalle","Kilinochchi","Kurunegala","Mannar","Matale","Matara","Monaragala","Mullaitivu","Nuwara Eliya","Polonnaruwa","Puttalam","Ratnapura","Trincomalee","Vavuniya"];

function OptionButton({ selected, children, onClick }: { selected:boolean; children:ReactNode; onClick:()=>void }) {
  return <button type="button" onClick={onClick} className={"flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition "+(selected?"border-violet-300/35 bg-violet-300/[.08] text-white":"border-white/[.08] bg-white/[.02] text-slate-300 hover:border-white/20")}><span className={"grid h-5 w-5 place-items-center rounded-md border "+(selected?"border-violet-300 bg-violet-300 text-slate-950":"border-slate-600")}>{selected&&<Check size={12}/>}</span><span className="flex-1">{children}</span></button>;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step,setStep] = useState(0);
  const [name,setName] = useState("");
  const [district,setDistrict] = useState("Ratnapura");
  const [school,setSchool] = useState("");
  const [stream,setStream] = useState("Physical Science");
  const [selectedSubjects,setSelectedSubjects] = useState<SubjectName[]>(subjects);
  const [language,setLanguage] = useState("English");
  const [examYear,setExamYear] = useState("2027");
  const [grades,setGrades] = useState<Record<SubjectName,string>>({"Combined Mathematics":"A","Physics":"A","Chemistry":"A"});
  const [minutes,setMinutes] = useState(120);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const steps = [
    {title:"What should we call you?",subtitle:"Let’s make this workspace yours.",icon:GraduationCap},
    {title:"Where are you studying?",subtitle:"A little context helps personalize your profile.",icon:MapPin},
    {title:"Choose your A/L stream",subtitle:"The subjects here start with the Physical Science pathway.",icon:School},
    {title:"Pick your subjects",subtitle:"You can adjust your subjects later.",icon:Target},
    {title:"Choose your language",subtitle:"Your preference is saved; translated interface content is still being expanded.",icon:Languages},
    {title:"Set your exam year",subtitle:"The countdown is a planning aid, not an official exam date notice.",icon:Target},
    {title:"Set target grades",subtitle:"Choose a target to guide planning, not to pressure yourself.",icon:Sparkles},
    {title:"How much time is realistic?",subtitle:"Choose a daily study target you can keep up over time.",icon:Timer}
  ];
  const current=steps[step];
  const StepIcon=current.icon;

  function toggleSubject(subject:SubjectName) {
    setSelectedSubjects(old=>old.includes(subject)?old.filter(x=>x!==subject):[...old,subject]);
  }
  function next() {
    setError("");
    if(step===0&&!name.trim()){setError("Add your name to continue.");return;}
    if(step===3&&!selectedSubjects.length){setError("Choose at least one subject.");return;}
    setStep(s=>Math.min(steps.length-1,s+1));
  }
  async function finish(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);setError("");
    try {
      const profile = {full_name:name.trim()||"Student",school:school.trim()||null,district,stream,subjects:selectedSubjects,preferred_language:language,target_exam_year:Number(examYear),target_grades:grades,daily_study_minutes:minutes};
      localStorage.setItem("alm2-name",profile.full_name);
      localStorage.setItem("alm2-language",language);
      localStorage.setItem("alm2-profile",JSON.stringify(profile));
      const supabase=getSupabaseBrowserClient();
      if(supabase) {
        const {data}=await supabase.auth.getUser();
        if(data.user) {
          const {error:dbError}=await supabase.from("profiles").upsert({id:data.user.id,...profile});
          if(dbError) throw new Error("Your setup was saved on this device, but cloud sync failed: "+dbError.message);
        }
      }
      router.push("/dashboard");
      router.refresh();
    } catch(e) {
      setError(e instanceof Error?e.message:"Could not save the profile. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="min-h-screen px-4 py-8 sm:py-12"><div className="mx-auto max-w-3xl"><div className="mb-7 flex items-center justify-between"><Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500"><GraduationCap size={22}/></span><span className="text-xs font-bold">A/L <span className="text-violet-300">MASTERMIND</span></span></Link><Link href="/dashboard" className="text-xs muted hover:text-white">Skip setup →</Link></div>
    <section className="panel overflow-hidden rounded-3xl"><div className="border-b border-white/[.07] p-5 sm:p-8"><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-violet-300">Personalize your workspace</p><p className="text-xs muted">Step {step+1} of {steps.length}</p></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-400 transition-all" style={{width:((step+1)/steps.length*100)+"%"}}/></div><div className="mt-7 flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-300/10 text-violet-200"><StepIcon size={23}/></span><div><h1 className="text-2xl font-semibold sm:text-3xl">{current.title}</h1><p className="mt-2 text-sm leading-6 muted">{current.subtitle}</p></div></div></div>
      <form onSubmit={finish} className="p-5 sm:p-8">
        {step===0&&<div className="space-y-4"><label className="block"><span className="mb-2 block text-xs muted">Full name</span><input className="input" autoComplete="name" autoFocus maxLength={90} required value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name"/></label><label className="block"><span className="mb-2 block text-xs muted">School (optional)</span><input className="input" maxLength={140} value={school} onChange={e=>setSchool(e.target.value)} placeholder="School name"/></label></div>}
        {step===1&&<div className="space-y-4"><label className="block"><span className="mb-2 block text-xs muted">District</span><select className="input" value={district} onChange={e=>setDistrict(e.target.value)}>{districts.map(d=><option key={d}>{d}</option>)}</select></label><label className="block"><span className="mb-2 block text-xs muted">School (optional)</span><input className="input" maxLength={140} value={school} onChange={e=>setSchool(e.target.value)} placeholder="School name"/></label></div>}
        {step===2&&<div className="grid gap-3 sm:grid-cols-2">{["Physical Science","Biological Science","Commerce","Arts","Technology","Other"].map(option=><OptionButton key={option} selected={stream===option} onClick={()=>setStream(option)}>{option}</OptionButton>)}</div>}
        {step===3&&<div className="space-y-3">{subjects.map(subject=><OptionButton key={subject} selected={selectedSubjects.includes(subject)} onClick={()=>toggleSubject(subject)}>{subject}</OptionButton>)}<p className="text-[10px] muted">These three are the initial supported subjects. Additional streams and subjects can be added when the curriculum catalog is extended.</p></div>}
        {step===4&&<div className="grid gap-3 sm:grid-cols-3">{["Sinhala","English","Tamil"].map(option=><OptionButton key={option} selected={language===option} onClick={()=>setLanguage(option)}>{option}</OptionButton>)}</div>}
        {step===5&&<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{["2026","2027","2028","2029","2030"].map(y=><OptionButton key={y} selected={examYear===y} onClick={()=>setExamYear(y)}>{y} A/L</OptionButton>)}</div>}
        {step===6&&<div className="space-y-4">{selectedSubjects.map(subject=><label className="flex items-center justify-between gap-3 rounded-xl border border-white/[.08] bg-white/[.02] p-3" key={subject}><span className="text-sm">{subject}</span><select className="input !w-24" value={grades[subject]} onChange={e=>setGrades(g=>({...g,[subject]:e.target.value}))}><option>A</option><option>B</option><option>C</option><option>S</option><option>Target not set</option></select></label>)}<p className="text-[10px] muted">Targets are for planning only. They are not predictions or guarantees of results.</p></div>}
        {step===7&&<div><div className="grid gap-3 sm:grid-cols-2">{[{value:60,label:"1 hour",desc:"A small daily commitment"},{value:120,label:"2 hours",desc:"A steady study routine"},{value:180,label:"3 hours",desc:"A longer focused day"},{value:240,label:"4 hours",desc:"A high-commitment day"}].map(v=><OptionButton key={v.value} selected={minutes===v.value} onClick={()=>setMinutes(v.value)}><span className="block font-semibold">{v.label}</span><span className="mt-1 block text-[10px] muted">{v.desc}</span></OptionButton>)}</div><p className="mt-4 text-xs leading-6 muted">Choose a target you can realistically repeat alongside class, homework and rest. You can revise it any time.</p></div>}
        {error&&<p role="alert" className="mt-5 rounded-xl border border-rose-300/20 bg-rose-300/[.06] p-3 text-xs leading-5 text-rose-200">{error}</p>}
        <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-white/[.07] pt-5">{step>0?<button type="button" onClick={()=>setStep(s=>s-1)} className="btn-secondary"><ArrowLeft size={14}/> Back</button>:<Link href="/auth" className="btn-secondary">Sign in instead</Link>}{step<steps.length-1?<button type="button" onClick={next} className="btn-primary">Continue <ArrowRight size={14}/></button>:<button type="submit" disabled={busy} className="btn-primary disabled:opacity-50">{busy?"Saving…":"Finish setup"} <Check size={15}/></button>}</div>
      </form>
    </section><p className="mt-4 text-center text-[10px] muted">Your preferences are saved in this browser. Sign in and configure Supabase to sync them across devices.</p></div></main>;
}