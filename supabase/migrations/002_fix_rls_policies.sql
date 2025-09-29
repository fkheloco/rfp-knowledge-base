-- Drop the problematic policies
drop policy if exists "Users can view their own organization" on organizations;
drop policy if exists "Users can view users in their organization" on users;
drop policy if exists "Users can view companies in their organization" on companies;
drop policy if exists "Users can view people in their organization" on people;
drop policy if exists "Users can view projects in their organization" on projects;

-- Create corrected RLS policies
-- Organizations: users can only see their own org
create policy "Users can view their own organization" on organizations
  for select using (id in (
    select org_id from users where id = auth.uid()
  ));

-- Users: users can only see their own user record
create policy "Users can view their own user record" on users
  for all using (id = auth.uid());

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
