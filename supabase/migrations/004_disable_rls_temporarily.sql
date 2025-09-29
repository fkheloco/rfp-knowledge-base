-- Temporarily disable RLS for organizations and users tables during signup
-- This allows the signup process to work, then we'll re-enable with proper policies

-- Disable RLS temporarily
alter table organizations disable row level security;
alter table users disable row level security;

-- Re-enable RLS
alter table organizations enable row level security;
alter table users enable row level security;

-- Drop all existing policies
drop policy if exists "Allow organization creation" on organizations;
drop policy if exists "Users can view their own organization" on organizations;
drop policy if exists "Allow user creation" on users;
drop policy if exists "Users can manage their own user record" on users;

-- Create new policies that work properly
-- Organizations: allow anyone to create, but only view their own
create policy "Anyone can create organizations" on organizations
  for insert with check (true);

create policy "Users can view their own organization" on organizations
  for select using (id in (
    select org_id from users where id = auth.uid()
  ));

-- Users: allow anyone to create, but only manage their own
create policy "Anyone can create users" on users
  for insert with check (true);

create policy "Users can manage their own record" on users
  for all using (id = auth.uid());
