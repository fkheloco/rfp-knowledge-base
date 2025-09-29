'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, Company, Person, Project } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Copy, Edit, Trash2, Building2, Users, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'

type RecordType = 'companies' | 'people' | 'projects'

export default function RecordDetailPage() {
  const params = useParams()
  const router = useRouter()
  const type = params.type as RecordType
  const id = params.id as string

  const [record, setRecord] = useState<Company | Person | Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id) {
      fetchRecord()
    }
  }, [id, type])

  const fetchRecord = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()

      if (!userData) return

      let query = supabase
        .from(type)
        .select('*')
        .eq('id', id)
        .eq('org_id', userData.org_id)
        .single()

      const { data, error } = await query

      if (error) {
        console.error('Error fetching record:', error)
        toast.error('Record not found')
        router.push('/records')
        return
      }

      setRecord(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load record')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!record) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from(type)
        .update(record)
        .eq('id', id)

      if (error) {
        throw error
      }

      toast.success('Record updated successfully')
      setEditing(false)
    } catch (error) {
      console.error('Error saving record:', error)
      toast.error('Failed to save record')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this record?')) return

    try {
      const { error } = await supabase
        .from(type)
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      toast.success('Record deleted successfully')
      router.push('/records')
    } catch (error) {
      console.error('Error deleting record:', error)
      toast.error('Failed to delete record')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const getIcon = () => {
    switch (type) {
      case 'companies': return <Building2 className="h-5 w-5" />
      case 'people': return <Users className="h-5 w-5" />
      case 'projects': return <FolderOpen className="h-5 w-5" />
    }
  }

  const getTitle = () => {
    if (!record) return 'Record'
    switch (type) {
      case 'companies': return (record as Company).name || 'Unnamed Company'
      case 'people': return (record as Person).name || 'Unnamed Person'
      case 'projects': return (record as Project).name || 'Unnamed Project'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Record not found</h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-slate-600">The requested record could not be found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {getIcon()}
            <h1 className="text-2xl font-bold text-slate-900">{getTitle()}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {type === 'companies' && (
              <>
                <div>
                  <Label htmlFor="name">Company Name</Label>
                  {editing ? (
                    <Input
                      id="name"
                      value={(record as Company).name || ''}
                      onChange={(e) => setRecord({ ...record, name: e.target.value } as Company)}
                    />
                  ) : (
                    <p className="text-slate-900">{(record as Company).name || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  {editing ? (
                    <Input
                      id="location"
                      value={(record as Company).location || ''}
                      onChange={(e) => setRecord({ ...record, location: e.target.value } as Company)}
                    />
                  ) : (
                    <p className="text-slate-900">{(record as Company).location || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="dbe">DBE Status</Label>
                  {editing ? (
                    <Select
                      value={(record as Company).dbe ? 'true' : 'false'}
                      onValueChange={(value) => setRecord({ ...record, dbe: value === 'true' } as Company)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-slate-900">{(record as Company).dbe ? 'Yes' : 'No'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="mbe">MBE Status</Label>
                  {editing ? (
                    <Select
                      value={(record as Company).mbe ? 'true' : 'false'}
                      onValueChange={(value) => setRecord({ ...record, mbe: value === 'true' } as Company)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-slate-900">{(record as Company).mbe ? 'Yes' : 'No'}</p>
                  )}
                </div>
              </>
            )}

            {type === 'people' && (
              <>
                <div>
                  <Label htmlFor="name">Name</Label>
                  {editing ? (
                    <Input
                      id="name"
                      value={(record as Person).name || ''}
                      onChange={(e) => setRecord({ ...record, name: e.target.value } as Person)}
                    />
                  ) : (
                    <p className="text-slate-900">{(record as Person).name || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  {editing ? (
                    <Input
                      id="title"
                      value={(record as Person).title || ''}
                      onChange={(e) => setRecord({ ...record, title: e.target.value } as Person)}
                    />
                  ) : (
                    <p className="text-slate-900">{(record as Person).title || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="years">Years of Experience</Label>
                  {editing ? (
                    <Input
                      id="years"
                      type="number"
                      value={(record as Person).years || ''}
                      onChange={(e) => setRecord({ ...record, years: parseInt(e.target.value) || null } as Person)}
                    />
                  ) : (
                    <p className="text-slate-900">{(record as Person).years || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="education">Education</Label>
                  {editing ? (
                    <Input
                      id="education"
                      value={(record as Person).education || ''}
                      onChange={(e) => setRecord({ ...record, education: e.target.value } as Person)}
                    />
                  ) : (
                    <p className="text-slate-900">{(record as Person).education || 'Not specified'}</p>
                  )}
                </div>
              </>
            )}

            {type === 'projects' && (
              <>
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  {editing ? (
                    <Input
                      id="name"
                      value={(record as Project).name || ''}
                      onChange={(e) => setRecord({ ...record, name: e.target.value } as Project)}
                    />
                  ) : (
                    <p className="text-slate-900">{(record as Project).name || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="client">Client</Label>
                  {editing ? (
                    <Input
                      id="client"
                      value={(record as Project).client || ''}
                      onChange={(e) => setRecord({ ...record, client: e.target.value } as Project)}
                    />
                  ) : (
                    <p className="text-slate-900">{(record as Project).client || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  {editing ? (
                    <Input
                      id="location"
                      value={(record as Project).location || ''}
                      onChange={(e) => setRecord({ ...record, location: e.target.value } as Project)}
                    />
                  ) : (
                    <p className="text-slate-900">{(record as Project).location || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="value">Project Value</Label>
                  {editing ? (
                    <Input
                      id="value"
                      type="number"
                      value={(record as Project).value || ''}
                      onChange={(e) => setRecord({ ...record, value: parseInt(e.target.value) || null } as Project)}
                    />
                  ) : (
                    <p className="text-slate-900">
                      {(record as Project).value ? `$${(record as Project).value!.toLocaleString()}` : 'Not specified'}
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <Label htmlFor="status">Status</Label>
              {editing ? (
                <Select
                  value={record.status || 'Draft'}
                  onValueChange={(value) => setRecord({ ...record, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="AI-Generated">AI Generated</SelectItem>
                    <SelectItem value="Purely Verified">Purely Verified</SelectItem>
                    <SelectItem value="Client Verified">Client Verified</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-slate-900">{record.status || 'Draft'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {type === 'companies' && (
              <div>
                <Label htmlFor="profile">Company Profile</Label>
                {editing ? (
                  <Textarea
                    id="profile"
                    value={(record as Company).profile || ''}
                    onChange={(e) => setRecord({ ...record, profile: e.target.value } as Company)}
                    rows={6}
                  />
                ) : (
                  <div className="space-y-2">
                    <p className="text-slate-900 whitespace-pre-wrap">
                      {(record as Company).profile || 'No profile available'}
                    </p>
                    {(record as Company).profile && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard((record as Company).profile!)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {type === 'people' && (
              <>
                <div>
                  <Label htmlFor="bio_short">Short Bio</Label>
                  {editing ? (
                    <Textarea
                      id="bio_short"
                      value={(record as Person).bio_short || ''}
                      onChange={(e) => setRecord({ ...record, bio_short: e.target.value } as Person)}
                      rows={3}
                    />
                  ) : (
                    <div className="space-y-2">
                      <p className="text-slate-900 whitespace-pre-wrap">
                        {(record as Person).bio_short || 'No short bio available'}
                      </p>
                      {(record as Person).bio_short && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard((record as Person).bio_short!)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="bio_medium">Medium Bio</Label>
                  {editing ? (
                    <Textarea
                      id="bio_medium"
                      value={(record as Person).bio_medium || ''}
                      onChange={(e) => setRecord({ ...record, bio_medium: e.target.value } as Person)}
                      rows={4}
                    />
                  ) : (
                    <div className="space-y-2">
                      <p className="text-slate-900 whitespace-pre-wrap">
                        {(record as Person).bio_medium || 'No medium bio available'}
                      </p>
                      {(record as Person).bio_medium && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard((record as Person).bio_medium!)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="bio_long">Long Bio</Label>
                  {editing ? (
                    <Textarea
                      id="bio_long"
                      value={(record as Person).bio_long || ''}
                      onChange={(e) => setRecord({ ...record, bio_long: e.target.value } as Person)}
                      rows={6}
                    />
                  ) : (
                    <div className="space-y-2">
                      <p className="text-slate-900 whitespace-pre-wrap">
                        {(record as Person).bio_long || 'No long bio available'}
                      </p>
                      {(record as Person).bio_long && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard((record as Person).bio_long!)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {type === 'projects' && (
              <div>
                <Label htmlFor="description">Project Description</Label>
                {editing ? (
                  <Textarea
                    id="description"
                    value={(record as Project).description || ''}
                    onChange={(e) => setRecord({ ...record, description: e.target.value } as Project)}
                    rows={6}
                  />
                ) : (
                  <div className="space-y-2">
                    <p className="text-slate-900 whitespace-pre-wrap">
                      {(record as Project).description || 'No description available'}
                    </p>
                    {(record as Project).description && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard((record as Project).description!)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
