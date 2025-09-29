import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Organization {
  id: string
  name: string
  created_at: string
}

export interface User {
  id: string
  email: string
  org_id: string
  role: string
}

export interface Company {
  id: string
  org_id: string
  name: string | null
  location: string | null
  services: string[] | null
  dbe: boolean | null
  mbe: boolean | null
  certifications: string[] | null
  profile: string | null
  status: string | null
  updated_at: string
}

export interface Person {
  id: string
  org_id: string
  company_id: string | null
  name: string | null
  title: string | null
  years: number | null
  education: string | null
  licenses: string[] | null
  specialties: string[] | null
  resume: string | null
  bio_short: string | null
  bio_medium: string | null
  bio_long: string | null
  status: string | null
  updated_at: string
}

export interface Project {
  id: string
  org_id: string
  name: string | null
  client: string | null
  location: string | null
  start_date: string | null
  end_date: string | null
  value: number | null
  funding: string | null
  type: string | null
  services: string[] | null
  description: string | null
  outcome: string | null
  status: string | null
  updated_at: string
}
