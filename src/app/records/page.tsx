'use client'

import { useState, useEffect } from 'react'
import { supabase, Company, Person, Project } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Users, FolderOpen, Search, Plus, Edit, Trash2 } from 'lucide-react'

type RecordType = 'companies' | 'people' | 'projects'

export default function RecordsPage() {
  const [activeTab, setActiveTab] = useState<RecordType>('companies')
  const [companies, setCompanies] = useState<Company[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

      if (!userData) return

      const [companiesRes, peopleRes, projectsRes] = await Promise.all([
        supabase
          .from('companies')
          .select('*')
          .eq('org_id', userData.org_id)
          .order('updated_at', { ascending: false }),
        supabase
          .from('people')
          .select('*')
          .eq('org_id', userData.org_id)
          .order('updated_at', { ascending: false }),
        supabase
          .from('projects')
          .select('*')
          .eq('org_id', userData.org_id)
          .order('updated_at', { ascending: false })
      ])

      setCompanies(companiesRes.data || [])
      setPeople(peopleRes.data || [])
      setProjects(projectsRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.location?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredPeople = people.filter(person => {
    const matchesSearch = person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || person.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'AI-Generated': return 'bg-amber-100 text-amber-800'
      case 'Purely Verified': return 'bg-blue-100 text-blue-800'
      case 'Client Verified': return 'bg-green-100 text-green-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Records</h1>
          <p className="text-slate-600">Loading your records...</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Records</h1>
          <p className="text-slate-600">Manage your companies, people, and projects</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="AI-Generated">AI Generated</SelectItem>
            <SelectItem value="Purely Verified">Purely Verified</SelectItem>
            <SelectItem value="Client Verified">Client Verified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as RecordType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Companies ({filteredCompanies.length})
          </TabsTrigger>
          <TabsTrigger value="people" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            People ({filteredPeople.length})
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Projects ({filteredProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
          {filteredCompanies.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No companies found</h3>
                <p className="text-slate-600 text-center">Get started by uploading documents or adding companies manually.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredCompanies.map((company) => (
                <Card 
                  key={company.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/records/companies/${company.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{company.name || 'Unnamed Company'}</h3>
                        <p className="text-sm text-slate-600">{company.location}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {company.services?.map((service, index) => (
                            <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded ${getStatusColor(company.status)}`}>
                          {company.status || 'Draft'}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.location.href = `/records/companies/${company.id}`
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle delete
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="people" className="space-y-4">
          {filteredPeople.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No people found</h3>
                <p className="text-slate-600 text-center">Get started by uploading resumes or adding people manually.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredPeople.map((person) => (
                <Card 
                  key={person.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/records/people/${person.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{person.name || 'Unnamed Person'}</h3>
                        <p className="text-sm text-slate-600">{person.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {person.specialties?.map((specialty, index) => (
                            <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded ${getStatusColor(person.status)}`}>
                          {person.status || 'Draft'}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.location.href = `/records/people/${person.id}`
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle delete
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          {filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderOpen className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No projects found</h3>
                <p className="text-slate-600 text-center">Get started by adding projects manually.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredProjects.map((project) => (
                <Card 
                  key={project.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/records/projects/${project.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{project.name || 'Unnamed Project'}</h3>
                        <p className="text-sm text-slate-600">{project.client}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {project.services?.map((service, index) => (
                            <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                              {service}
                            </span>
                          ))}
                          {project.value && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                              ${project.value.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded ${getStatusColor(project.status)}`}>
                          {project.status || 'Draft'}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.location.href = `/records/projects/${project.id}`
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle delete
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
