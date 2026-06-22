-- Initial PostgreSQL schema draft for the HSK Practice Platform.
-- Content must be original or licensed; do not import protected third-party exams.

create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text,
  display_name text not null,
  avatar_url text,
  locale text not null default 'vi',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table learner_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  nationality text,
  current_location text,
  gender text,
  age int,
  test_goal text,
  target_level int,
  target_exam_date date,
  membership_expires_at timestamptz
);

create table locales (
  code text primary key,
  name text not null,
  enabled boolean not null default true
);

create table content_translations (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  locale text not null references locales(code),
  field text not null,
  value text not null,
  unique (entity_type, entity_id, locale, field)
);

create table hsk_levels (
  id uuid primary key default gen_random_uuid(),
  level_no int not null,
  framework text not null default 'HSK 2.0',
  band text not null default 'standard',
  target_words int not null,
  sort_order int not null,
  unique (framework, level_no)
);

create table skills (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  sort_order int not null
);

create table sections (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references hsk_levels(id) on delete cascade,
  skill_id uuid not null references skills(id),
  title text not null,
  question_type text not null,
  sort_order int not null,
  is_premium boolean not null default false
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references sections(id) on delete cascade,
  source_type text not null default 'original',
  difficulty int not null default 1,
  prompt text not null,
  answer_key jsonb not null,
  explanation text,
  rubric jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  label text not null,
  value text not null,
  sort_order int not null
);

create table question_assets (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  asset_type text not null,
  url text not null,
  transcript text,
  alt_text text,
  sort_order int not null default 0
);

create table user_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  asset_type text not null,
  url text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table practice_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  level_id uuid references hsk_levels(id),
  skill_id uuid references skills(id),
  mode text not null,
  created_at timestamptz not null default now()
);

create table mock_exams (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references hsk_levels(id),
  title text not null,
  question_count int not null,
  duration_seconds int not null,
  result_model text,
  is_premium boolean not null default false,
  status text not null default 'draft'
);

create table attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  practice_set_id uuid references practice_sets(id),
  mock_exam_id uuid references mock_exams(id),
  status text not null default 'in_progress',
  score numeric(6,2),
  started_at timestamptz not null default now(),
  submitted_at timestamptz
);

create table answer_attempts (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references attempts(id) on delete cascade,
  question_id uuid not null references questions(id),
  answer jsonb not null,
  is_correct boolean,
  confidence int,
  duration_seconds int,
  created_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create table learner_repository_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  item_type text not null,
  note text,
  wrong_count int not null default 0,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, question_id, item_type)
);

create table vocab_items (
  id uuid primary key default gen_random_uuid(),
  level_id uuid references hsk_levels(id),
  hanzi text not null,
  pinyin text not null,
  meaning jsonb not null,
  examples jsonb not null default '[]'::jsonb
);

create table vocab_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  vocab_item_id uuid not null references vocab_items(id) on delete cascade,
  mastery int not null default 0,
  due_at timestamptz not null default now(),
  last_grade text,
  unique (user_id, vocab_item_id)
);

create table essay_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  question_id uuid references questions(id),
  title text,
  content text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table translation_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  question_id uuid references questions(id),
  direction text not null,
  source_text text not null,
  translated_text text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table speaking_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  question_id uuid references questions(id),
  audio_asset_id uuid references user_assets(id),
  transcript text,
  duration_seconds int,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table teacher_reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references users(id),
  target_type text not null,
  target_id uuid not null,
  rubric jsonb not null,
  score numeric(6,2),
  feedback text not null,
  created_at timestamptz not null default now()
);

create table content_workflow_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users(id),
  target_type text not null,
  target_id uuid not null,
  from_status text,
  to_status text not null,
  note text,
  created_at timestamptz not null default now()
);

create table ai_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  provider text not null,
  rubric jsonb not null,
  feedback text not null,
  created_at timestamptz not null default now()
);

create table subscription_plans (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  price_cents int,
  interval text,
  features jsonb not null default '[]'::jsonb
);

create table user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  plan_id uuid not null references subscription_plans(id),
  status text not null,
  started_at timestamptz not null default now(),
  expires_at timestamptz
);

create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  plan_id uuid references subscription_plans(id),
  credit_amount int,
  max_redemptions int,
  redeemed_count int not null default 0,
  expires_at timestamptz
);

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'organization',
  created_at timestamptz not null default now()
);

create table organization_members (
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text not null,
  primary key (organization_id, user_id)
);
