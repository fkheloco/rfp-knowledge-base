-- Drop existing policies
drop policy if exists "Users can view their own organization" on organizations;
drop policy if exists "Users can view their own user record" on users;

-- Create policies that allow inserts during signup
-- Organizations: allow inserts for new organizations, and selects for existing users
create policy "Allow organization creation" on organizations
  for insert with check (true);

create policy "Users can view their own organization" on organizations
  for select using (id in (
    select org_id from users where id = auth.uid()
  ));

-- Users: allow inserts for new users, and all operations for existing users
create policy "Allow user creation" on users
  for insert with check (true);

create policy "Users can manage their own user record" on users
  for all using (id = auth.uid());
