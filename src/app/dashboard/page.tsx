'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, FolderOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface DashboardStats {
  companies: number
  people: number
  projects: number
  aiGenerated: number
  purelyVerified: number
  clientVerified: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    companies: 0,
    people: 0,
    projects: 0,
    aiGenerated: 0,
    purelyVerified: 0,
    clientVerified: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get user's organization
        const { data: userData } = await supabase
          .from('users')
          .select('org_id')
          .eq('id', user.id)
          .single()

        if (!userData) return

        // Fetch counts for each table
        const [companiesRes, peopleRes, projectsRes] = await Promise.all([
          supabase
            .from('companies')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', userData.org_id),
          supabase
            .from('people')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', userData.org_id),
          supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', userData.org_id)
        ])

        // Fetch status counts
        const [aiGeneratedRes] = await Promise.all([
          supabase
            .from('companies')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', userData.org_id)
            .eq('status', 'AI-Generated'),
          supabase
            .from('people')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', userData.org_id)
            .eq('status', 'AI-Generated'),
          supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', userData.org_id)
            .eq('status', 'AI-Generated')
        ])

        const [purelyVerifiedCompanies, purelyVerifiedPeople, purelyVerifiedProjects] = await Promise.all([
          supabase
            .from('companies')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', userData.org_id)
            .eq('status', 'Purely Verified'),
          supabase
            .from('people')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', userData.org_id)
            .eq('status', 'Purely Verified'),
          supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', userData.org_id)
            .eq('status', 'Purely Verified')
        ])

        const [clientVerifiedCompanies, clientVerifiedPeople, clientVerifiedProjects] = await Promise.all([
          supabase
            .from('companies')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', userData.org_id)
            .eq('status', 'Client Verified'),
          supabase
            .from('people')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', userData.org_id)
            .eq('status', 'Client Verified'),
          supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', userData.org_id)
            .eq('status', 'Client Verified')
        ])

        setStats({
          companies: companiesRes.count || 0,
          people: peopleRes.count || 0,
          projects: projectsRes.count || 0,
          aiGenerated: (aiGeneratedRes.count || 0) + (aiGeneratedRes.count || 0) + (aiGeneratedRes.count || 0),
          purelyVerified: (purelyVerifiedCompanies.count || 0) + (purelyVerifiedPeople.count || 0) + (purelyVerifiedProjects.count || 0),
          clientVerified: (clientVerifiedCompanies.count || 0) + (clientVerifiedPeople.count || 0) + (clientVerifiedProjects.count || 0)
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Loading your RFP knowledge base...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-slate-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">Overview of your RFP knowledge base</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.companies}</div>
            <p className="text-xs text-slate-600">Total companies in database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">People</CardTitle>
            <Users className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.people}</div>
            <p className="text-xs text-slate-600">Total people in database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projects}</div>
            <p className="text-xs text-slate-600">Total projects in database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Generated</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.aiGenerated}</div>
            <p className="text-xs text-slate-600">Records generated by AI</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purely Verified</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.purelyVerified}</div>
            <p className="text-xs text-slate-600">Records verified by Purely</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.clientVerified}</div>
            <p className="text-xs text-slate-600">Records verified by client</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/upload"
              className="flex items-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-900">Upload Documents</p>
                <p className="text-xs text-slate-600">Add new records via file upload</p>
              </div>
            </a>
            <Link
              href="/records"
              className="flex items-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-900">View Records</p>
                <p className="text-xs text-slate-600">Browse and edit your database</p>
              </div>
            </Link>
            <a
              href="/chat"
              className="flex items-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-900">AI Chat</p>
                <p className="text-xs text-slate-600">Generate content with AI assistance</p>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates to your knowledge base</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-slate-600 text-center py-4">
                No recent activity to display
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
