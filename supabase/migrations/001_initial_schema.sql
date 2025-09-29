-- Create organizations table
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp default now()
);

-- Create users table
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  org_id uuid references organizations(id),
  role text default 'member',
  created_at timestamp default now()
);

-- Create companies table
create table companies (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  name text,
  location text,
  services text[],
  dbe boolean,
  mbe boolean,
  certifications text[],
  profile text,
  status text,
  updated_at timestamp default now()
);

-- Create people table
create table people (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  company_id uuid references companies(id),
  name text,
  title text,
  years int,
  education text,
  licenses text[],
  specialties text[],
  resume text,
  bio_short text,
  bio_medium text,
  bio_long text,
  status text,
  updated_at timestamp default now()
);

-- Create projects table
create table projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  name text,
  client text,
  location text,
  start_date date,
  end_date date,
  value bigint,
  funding text,
  type text,
  services text[],
  description text,
  outcome text,
  status text,
  updated_at timestamp default now()
);

-- Enable Row Level Security
alter table organizations enable row level security;
alter table users enable row level security;
alter table companies enable row level security;
alter table people enable row level security;
alter table projects enable row level security;

-- Create RLS policies
-- Organizations: users can only see their own org
create policy "Users can view their own organization" on organizations
  for select using (id in (
    select org_id from users where id = auth.uid()
  ));

-- Users: users can only see users in their org
create policy "Users can view users in their organization" on users
  for select using (org_id in (
    select org_id from users where id = auth.uid()
  ));

-- Companies: users can only see companies in their org
create policy "Users can view companies in their organization" on companies
  for all using (org_id in (
    select org_id from users where id = auth.uid()
  ));

-- People: users can only see people in their org
create policy "Users can view people in their organization" on people
  for all using (org_id in (
    select org_id from users where id = auth.uid()
  ));

-- Projects: users can only see projects in their org
create policy "Users can view projects in their organization" on projects
  for all using (org_id in (
    select org_id from users where id = auth.uid()
  ));

-- Create indexes for better performance
create index idx_users_org_id on users(org_id);
create index idx_companies_org_id on companies(org_id);
create index idx_people_org_id on people(org_id);
create index idx_people_company_id on people(company_id);
create index idx_projects_org_id on projects(org_id);
