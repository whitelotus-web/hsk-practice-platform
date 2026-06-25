-- Initial PostgreSQL schema draft for the HSK Practice Platform.
-- Content must be original or licensed; do not import protected third-party exams.

create extension if not exists pgcrypto;

create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text,
  display_name text not null,
  avatar_url text,
  locale text not null default 'vi',
  role text not null default 'learner',
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
  external_id text unique,
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
  examples jsonb not null default '[]'::jsonb,
  unique (level_id, hanzi, pinyin)
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

create index idx_users_email_lower on users (lower(email));
create index idx_users_role on users (role);
create index idx_questions_external_id on questions (external_id);
create index idx_questions_status on questions (status);
create index idx_attempts_user_started on attempts (user_id, started_at desc);
create index idx_repository_user_due on learner_repository_items (user_id, due_at);
create index idx_vocab_reviews_user_due on vocab_reviews (user_id, due_at);

insert into locales (code, name, enabled) values
  ('vi', 'Tiếng Việt', true),
  ('en', 'English', true),
  ('zh', '简体中文', true)
on conflict (code) do nothing;

insert into skills (key, sort_order) values
  ('listening', 1),
  ('reading', 2),
  ('writing', 3),
  ('translation', 4),
  ('speaking', 5)
on conflict (key) do nothing;

insert into hsk_levels (level_no, framework, band, target_words, sort_order) values
  (1, 'HSK 2.0', 'standard', 150, 1),
  (2, 'HSK 2.0', 'standard', 300, 2),
  (3, 'HSK 2.0', 'standard', 600, 3),
  (4, 'HSK 2.0', 'standard', 1200, 4),
  (5, 'HSK 2.0', 'standard', 2500, 5),
  (6, 'HSK 2.0', 'standard', 5000, 6),
  (7, 'HSK 3.0', 'advanced', 5636, 7),
  (8, 'HSK 3.0', 'advanced', 11092, 8),
  (9, 'HSK 3.0', 'advanced', 11092, 9)
on conflict (framework, level_no) do nothing;

insert into subscription_plans (key, name, price_cents, interval, features) values
  ('free', 'Free', 0, null, '["starter-practice", "starter-vocab"]'::jsonb),
  ('vip', 'VIP', null, 'month', '["full-practice", "mock-tests", "srs"]'::jsonb),
  ('max', 'MAX', null, 'month', '["ai-feedback", "teacher-review", "advanced-hsk-789"]'::jsonb),
  ('organization', 'Organization', null, 'month', '["class-dashboard", "teacher-tools", "bulk-licenses"]'::jsonb)
on conflict (key) do nothing;
