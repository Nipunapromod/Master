const localDate = (date: Date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;

export type SubjectName = "Combined Mathematics" | "Physics" | "Chemistry";
export type StudentTask = {
  id: string;
  title: string;
  subject: SubjectName;
  dueDate: string;
  dueTime: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
};
export type MarkEntry = {
  id: string;
  title: string;
  subject: SubjectName;
  date: string;
  score: number;
  total: number;
};
export type StudySession = {
  id: string;
  subject: SubjectName;
  minutes: number;
  date: string;
};

export const subjectInfo: Array<{ name: SubjectName; short: string; color: string; progress: number; chapters: number; completed: number; focus: string }> = [
  { name: "Combined Mathematics", short: "CM", color: "#a78bfa", progress: 42, chapters: 18, completed: 8, focus: "Differentiation" },
  { name: "Physics", short: "PH", color: "#22d3ee", progress: 36, chapters: 16, completed: 6, focus: "Work, Energy & Power" },
  { name: "Chemistry", short: "CH", color: "#fbbf24", progress: 51, chapters: 17, completed: 9, focus: "Chemical Equilibrium" }
];

export const initialTasks: StudentTask[] = [
  { id: "t1", title: "Revise differentiation examples", subject: "Combined Mathematics", dueDate: localDate(), dueTime: "18:30", priority: "High", completed: false },
  { id: "t2", title: "Finish Work, Energy & Power notes", subject: "Physics", dueDate: new Date().toISOString().slice(0, 10), dueTime: "20:00", priority: "Medium", completed: false },
  { id: "t3", title: "Practice equilibrium MCQs", subject: "Chemistry", dueDate: localDate(new Date(Date.now() + 86400000)), dueTime: "17:00", priority: "Medium", completed: false }
];

export const initialMarks: MarkEntry[] = [
  { id: "m1", title: "Unit Test 04", subject: "Physics", date: "2026-10-05", score: 72, total: 100 },
  { id: "m2", title: "Revision Paper", subject: "Chemistry", date: "2026-10-10", score: 68, total: 100 },
  { id: "m3", title: "Class Test 07", subject: "Combined Mathematics", date: "2026-10-13", score: 81, total: 100 },
  { id: "m4", title: "MCQ Practice", subject: "Physics", date: "2026-10-17", score: 78, total: 100 },
  { id: "m5", title: "Structured Questions", subject: "Chemistry", date: "2026-10-21", score: 76, total: 100 }
];

export const quizQuestions = [
  { id: "q1", subject: "Physics", topic: "Work and Energy", prompt: "The work done by a constant force F acting through displacement s at angle θ is:", options: ["Fs sin θ", "Fs cos θ", "F/s", "Fs tan θ"], answer: 1, explanation: "Work is the dot product of force and displacement: W = F s cos θ." },
  { id: "q2", subject: "Chemistry", topic: "Atomic Structure", prompt: "Which quantum number determines the main energy level of an electron?", options: ["Azimuthal quantum number", "Magnetic quantum number", "Principal quantum number", "Spin quantum number"], answer: 2, explanation: "The principal quantum number n identifies the main shell and its approximate energy." },
  { id: "q3", subject: "Combined Mathematics", topic: "Differentiation", prompt: "If y = x³, then dy/dx equals:", options: ["x²", "2x", "3x²", "3x"], answer: 2, explanation: "Using the power rule, d(xⁿ)/dx = n xⁿ⁻¹, so dy/dx = 3x²." }
];

export const lessonSamples = [
  { title: "Work, Energy and Power", subject: "Physics", type: "Video lesson", language: "English", length: "42 min", chapter: "Mechanics", link: "https://www.youtube.com/results?search_query=Sri+Lanka+A+Level+Physics+work+energy+power" },
  { title: "Chemical Equilibrium: Core Notes", subject: "Chemistry", type: "Short notes", language: "Sinhala", length: "12 pages", chapter: "Equilibrium", link: "https://www.youtube.com/results?search_query=Sri+Lanka+A+Level+Chemistry+equilibrium" },
  { title: "Differentiation: Worked Examples", subject: "Combined Mathematics", type: "Practice set", language: "English", length: "18 questions", chapter: "Calculus", link: "https://www.youtube.com/results?search_query=Sri+Lanka+A+Level+Combined+Mathematics+differentiation" },
  { title: "Atomic Structure Formula Review", subject: "Chemistry", type: "Formula sheet", language: "English", length: "4 pages", chapter: "Atomic Structure", link: "https://www.youtube.com/results?search_query=Sri+Lanka+A+Level+Chemistry+atomic+structure" }
];