-- ============================================================================
-- TopoNix SMKN 1 Bojonegoro — Supabase PostgreSQL Schema & Seed Data
-- Jalankan script ini di Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. Tabel Profil Pengguna (Siswa, Guru, Admin)
create table if not exists public.profiles (
  id text primary key,
  username text unique not null,
  password text not null default '123',
  name text not null,
  role text not null check (role in ('siswa', 'guru', 'admin')),
  kelas text not null default 'X TKJ 1',
  xp integer not null default 0,
  hide_on_leaderboard boolean not null default false,
  read_materials jsonb not null default '[]'::jsonb,
  simulated_materials jsonb not null default '[]'::jsonb,
  validated_topologies jsonb not null default '[]'::jsonb,
  tested_fault_sim boolean not null default false,
  unlocked_badges jsonb not null default '[]'::jsonb,
  xp_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- 2. Tabel Materi Topologi Jaringan
create table if not exists public.topologies (
  id text primary key,
  name text not null,
  tagline text not null,
  cable_type text not null,
  pengertian text not null,
  cara_kerja text not null,
  kelebihan jsonb not null default '[]'::jsonb,
  kekurangan jsonb not null default '[]'::jsonb,
  contoh_penerapan text not null,
  preset_graph jsonb not null default '{"nodes":[],"links":[]}'::jsonb
);

-- 3. Tabel Bank Soal Kuis (Mudah, Sedang, Sulit)
create table if not exists public.quiz_questions (
  id text primary key,
  topic text not null,
  difficulty text not null check (difficulty in ('mudah', 'sedang', 'sulit')),
  question text not null,
  options jsonb not null,
  answer_index integer not null,
  explanation text not null,
  created_at timestamptz not null default now()
);

-- 4. Tabel Misi Proyek Gamified Project Learning (GPL)
create table if not exists public.gpl_projects (
  id text primary key,
  stage integer not null,
  title text not null,
  scenario text not null,
  target_topology text not null,
  min_devices jsonb not null default '{}'::jsonb,
  xp_reward integer not null default 120,
  badge_unlock text,
  deliverables jsonb not null default '[]'::jsonb
);

-- 5. Tabel Riwayat Nilai Kuis Siswa
create table if not exists public.quiz_results (
  id text primary key,
  user_id text not null references public.profiles(id) on delete cascade,
  topic text not null,
  difficulty text not null,
  score integer not null,
  correct integer not null,
  total integer not null,
  passed boolean not null,
  date text not null,
  created_at timestamptz not null default now()
);

-- 6. Tabel Pengumpulan Proyek GPL Siswa
create table if not exists public.gpl_submissions (
  id text primary key,
  project_id text not null references public.gpl_projects(id) on delete cascade,
  user_id text not null references public.profiles(id) on delete cascade,
  submitted_at text not null,
  notes text not null,
  graph jsonb not null,
  validation_summary text not null,
  status text not null default 'submitted' check (status in ('submitted', 'reviewed')),
  teacher_score integer,
  teacher_comment text not null default '',
  created_at timestamptz not null default now()
);

-- 7. Tabel Umpan Balik & Notifikasi Guru
create table if not exists public.feedbacks (
  id text primary key,
  from_name text not null,
  target_type text not null check (target_type in ('all', 'class', 'student')),
  target_value text not null,
  title text not null,
  message text not null,
  date text not null,
  read_by jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- 8. Tabel Pengaturan Sistem (KKM, Aturan XP, Level)
create table if not exists public.system_settings (
  id text primary key default 'default',
  school_name text not null default 'SMKN 1 Bojonegoro',
  subject_name text not null default 'Informatika — Kelas X',
  kkm integer not null default 75,
  xp_rules jsonb not null,
  levels jsonb not null,
  updated_at timestamptz not null default now()
);

-- Aktifkan RLS (Row Level Security) & kebijakan akses untuk demo aplikasi pembelajaran
alter table public.profiles enable row level security;
alter table public.topologies enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.gpl_projects enable row level security;
alter table public.quiz_results enable row level security;
alter table public.gpl_submissions enable row level security;
alter table public.feedbacks enable row level security;
alter table public.system_settings enable row level security;

-- Kebijakan akses publik (Anon Key) agar siswa, guru, dan admin dapat berinteraksi langsung
-- Catatan Produksi: Untuk skala produksi ketat, integrasikan Supabase Auth JWT per peran.
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'profiles', 'topologies', 'quiz_questions', 'gpl_projects',
    'quiz_results', 'gpl_submissions', 'feedbacks', 'system_settings'
  ] loop
    execute format('drop policy if exists "TopoNix public access" on public.%I;', tbl);
    execute format('create policy "TopoNix public access" on public.%I for all using (true) with check (true);', tbl);
  end loop;
end $$;
