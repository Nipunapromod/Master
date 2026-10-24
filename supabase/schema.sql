create extension if not exists pgcrypto;

create type public.al_subject as enum ('Combined Mathematics', 'Physics', 'Chemistry');
create type public.progress_state as enum ('not_started', 'in_progress', 'completed');
create type public.task_priority as enum ('Low', 'Medium', 'High');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  school text,
  district text,
  stream text not null default 'Physical Science',
  subjects public.al_subject[] not null default array['Combined Mathematics','Physics','Chemistry']::public.al_subject[],
  preferred_language text not null default 'English' check (preferred_language in ('Sinhala','English','Tamil')),
  target_exam_year integer,
  target_grades jsonb not null default '{}'::jsonb,
  daily_study_minutes integer not null default 120 check (daily_study_minutes between 0 and 1440),
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  description text not null default '',
  color text not null default '#8b5cf6',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  syllabus_reference text,
  unique(subject_id, title)
);
create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  syllabus_reference text,
  unique(unit_id, title)
);
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  unique(chapter_id, title)
);
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  title text not null,
  summary text not null default '',
  language text not null default 'English' check (language in ('Sinhala','English','Tamil')),
  estimated_minutes integer not null default 20 check (estimated_minutes > 0),
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete set null,
  title text not null,
  youtube_url text not null,
  teacher_channel text,
  subject_id uuid references public.subjects(id) on delete set null,
  chapter_id uuid references public.chapters(id) on delete set null,
  language text not null default 'English',
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  sort_order integer not null default 0,
  is_published boolean not null default false
);
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete set null,
  subject_id uuid references public.subjects(id) on delete set null,
  chapter_id uuid references public.chapters(id) on delete set null,
  title text not null,
  content_markdown text not null default '',
  asset_url text,
  language text not null default 'English',
  kind text not null default 'chapter',
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.past_papers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject_id uuid references public.subjects(id) on delete set null,
  exam_year integer,
  paper_number integer,
  language text not null default 'English',
  category text not null default 'G.C.E. A/L Past Paper',
  document_url text,
  answers_url text,
  marking_scheme_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.topics(id) on delete set null,
  subject_id uuid references public.subjects(id) on delete set null,
  question_type text not null check (question_type in ('mcq','structured')),
  prompt text not null,
  explanation text not null default '',
  difficulty text not null default 'medium' check (difficulty in ('easy','medium','hard')),
  marks numeric(7,2) not null default 1 check (marks >= 0),
  language text not null default 'English',
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  option_text text not null,
  sort_order integer not null default 0,
  is_correct boolean not null default false
);
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  score numeric(7,2),
  max_score numeric(7,2),
  accuracy numeric(5,2) check (accuracy is null or accuracy between 0 and 100)
);
create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_option_id uuid references public.question_options(id) on delete set null,
  answer_text text,
  awarded_marks numeric(7,2) not null default 0,
  is_correct boolean,
  unique(attempt_id, question_id)
);
create table if not exists public.marks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  subject public.al_subject not null,
  paper_number text,
  date date not null default current_date,
  score numeric(7,2) not null check (score >= 0),
  total numeric(7,2) not null check (total > 0 and score <= total),
  created_at timestamptz not null default now()
);
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 240),
  subject public.al_subject,
  chapter_id uuid references public.chapters(id) on delete set null,
  due_at timestamptz,
  priority public.task_priority not null default 'Medium',
  completed boolean not null default false,
  repeat_rule text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject public.al_subject,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  session_kind text not null default 'focus'
);
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  resource_type text not null check (resource_type in ('lesson','video','note','past_paper','question')),
  resource_id uuid not null,
  created_at timestamptz not null default now(),
  unique(user_id, resource_type, resource_id)
);
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  state public.progress_state not null default 'not_started',
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);
create table if not exists public.topic_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  state public.progress_state not null default 'not_started',
  updated_at timestamptz not null default now(),
  unique(user_id, topic_id)
);
create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null default '',
  kind text not null default 'study',
  read_at timestamptz,
  scheduled_for timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_units_subject on public.units(subject_id, sort_order);
create index if not exists idx_chapters_unit on public.chapters(unit_id, sort_order);
create index if not exists idx_topics_chapter on public.topics(chapter_id, sort_order);
create index if not exists idx_tasks_user_due on public.tasks(user_id, due_at);
create index if not exists idx_marks_user_date on public.marks(user_id, date desc);
create index if not exists idx_sessions_user_started on public.study_sessions(user_id, started_at desc);
create index if not exists idx_quiz_attempts_user on public.quiz_attempts(user_id, started_at desc);
create index if not exists idx_ai_messages_user on public.ai_messages(user_id, created_at);

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.units enable row level security;
alter table public.chapters enable row level security;
alter table public.topics enable row level security;
alter table public.lessons enable row level security;
alter table public.videos enable row level security;
alter table public.notes enable row level security;
alter table public.past_papers enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.marks enable row level security;
alter table public.tasks enable row level security;
alter table public.study_sessions enable row level security;
alter table public.bookmarks enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.topic_progress enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_logs enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

create policy "Users read own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "Users insert own profile" on public.profiles for insert with check (id = auth.uid());
create policy "Users update own profile" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

create policy "Published subjects readable" on public.subjects for select using (is_published or public.is_admin());
create policy "Admins manage subjects" on public.subjects for all using (public.is_admin()) with check (public.is_admin());
create policy "Published units readable" on public.units for select using (exists (select 1 from public.subjects s where s.id = subject_id and s.is_published) or public.is_admin());
create policy "Admins manage units" on public.units for all using (public.is_admin()) with check (public.is_admin());
create policy "Published chapters readable" on public.chapters for select using (exists (select 1 from public.units u join public.subjects s on s.id = u.subject_id where u.id = unit_id and s.is_published) or public.is_admin());
create policy "Admins manage chapters" on public.chapters for all using (public.is_admin()) with check (public.is_admin());
create policy "Published topics readable" on public.topics for select using (exists (select 1 from public.chapters c join public.units u on u.id = c.unit_id join public.subjects s on s.id = u.subject_id where c.id = chapter_id and s.is_published) or public.is_admin());
create policy "Admins manage topics" on public.topics for all using (public.is_admin()) with check (public.is_admin());

create policy "Published lessons readable" on public.lessons for select using (is_published or public.is_admin());
create policy "Admins manage lessons" on public.lessons for all using (public.is_admin()) with check (public.is_admin());
create policy "Published videos readable" on public.videos for select using (is_published or public.is_admin());
create policy "Admins manage videos" on public.videos for all using (public.is_admin()) with check (public.is_admin());
create policy "Published notes readable" on public.notes for select using (is_published or public.is_admin());
create policy "Admins manage notes" on public.notes for all using (public.is_admin()) with check (public.is_admin());
create policy "Published papers readable" on public.past_papers for select using (is_published or public.is_admin());
create policy "Admins manage papers" on public.past_papers for all using (public.is_admin()) with check (public.is_admin());
create policy "Published questions readable" on public.questions for select using (is_published or public.is_admin());
create policy "Admins manage questions" on public.questions for all using (public.is_admin()) with check (public.is_admin());
create policy "Question options readable" on public.question_options for select using (exists (select 1 from public.questions q where q.id = question_id and (q.is_published or public.is_admin())));
create policy "Admins manage question options" on public.question_options for all using (public.is_admin()) with check (public.is_admin());

create policy "Users own quiz attempts" on public.quiz_attempts for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "Users own quiz answers" on public.quiz_answers for all using (exists (select 1 from public.quiz_attempts a where a.id = attempt_id and (a.user_id = auth.uid() or public.is_admin()))) with check (exists (select 1 from public.quiz_attempts a where a.id = attempt_id and (a.user_id = auth.uid() or public.is_admin())));
create policy "Users own marks" on public.marks for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "Users own tasks" on public.tasks for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "Users own study sessions" on public.study_sessions for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "Users own bookmarks" on public.bookmarks for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "Users own lesson progress" on public.lesson_progress for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "Users own topic progress" on public.topic_progress for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "Users own AI conversations" on public.ai_conversations for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "Users own AI messages" on public.ai_messages for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "Users own notifications" on public.notifications for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "Admins read audit logs" on public.admin_logs for select using (admin_id = auth.uid() and public.is_admin());
create policy "Admins insert audit logs" on public.admin_logs for insert with check (admin_id = auth.uid() and public.is_admin());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();