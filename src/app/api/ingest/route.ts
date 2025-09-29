import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { filePath, fileName } = await request.json()

    if (!filePath || !fileName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the file from Supabase Storage using admin client
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('documents')
      .download(filePath)

    if (downloadError) {
      throw downloadError
    }

    // Convert file to text (simplified - in production you'd use proper PDF/DOC parsers)
    const text = await fileData.text()

    // Mock AI processing - in production you'd call OpenAI API here
    const mockResult = {
      type: 'person', // Could be 'company' or 'project' based on content analysis
      data: {
        name: extractName(text),
        title: extractTitle(text),
        bio_short: generateShortBio(text),
        bio_medium: generateMediumBio(text),
        bio_long: generateLongBio(text),
        specialties: extractSpecialties(text),
        education: extractEducation(text),
        status: 'AI-Generated'
      }
    }

    // Get user's organization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Save the processed data to the appropriate table using admin client
    let result
    if (mockResult.type === 'person') {
      const { data, error } = await supabaseAdmin
        .from('people')
        .insert([{
          org_id: userData.org_id,
          ...mockResult.data
        }])
        .select()
        .single()

      if (error) throw error
      result = data
    } else if (mockResult.type === 'company') {
      const { data, error } = await supabaseAdmin
        .from('companies')
        .insert([{
          org_id: userData.org_id,
          ...mockResult.data
        }])
        .select()
        .single()

      if (error) throw error
      result = data
    } else if (mockResult.type === 'project') {
      const { data, error } = await supabaseAdmin
        .from('projects')
        .insert([{
          org_id: userData.org_id,
          ...mockResult.data
        }])
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Error processing file:', error)
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    )
  }
}

// Mock extraction functions - in production these would use OpenAI API
function extractName(text: string): string {
  // Simple regex to find potential names
  const nameMatch = text.match(/(?:Name|Full Name):\s*([^\n\r]+)/i)
  if (nameMatch) return nameMatch[1].trim()
  
  // Fallback: first line that looks like a name
  const lines = text.split('\n').filter(line => line.trim().length > 0)
  const firstLine = lines[0]?.trim()
  if (firstLine && firstLine.length < 50 && !firstLine.includes('@')) {
    return firstLine
  }
  
  return 'Unknown Name'
}

function extractTitle(text: string): string {
  const titleMatch = text.match(/(?:Title|Position|Job):\s*([^\n\r]+)/i)
  if (titleMatch) return titleMatch[1].trim()
  
  const lines = text.split('\n')
  for (const line of lines) {
    if (line.toLowerCase().includes('engineer') || 
        line.toLowerCase().includes('manager') ||
        line.toLowerCase().includes('director') ||
        line.toLowerCase().includes('specialist')) {
      return line.trim()
    }
  }
  
  return 'Professional'
}

function generateShortBio(text: string): string {
  // Extract first paragraph or first few sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)
  if (sentences.length > 0) {
    return sentences[0].trim().substring(0, 200) + '...'
  }
  return 'Professional with extensive experience in their field.'
}

function generateMediumBio(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)
  if (sentences.length >= 2) {
    return sentences.slice(0, 2).join('. ').trim().substring(0, 500) + '...'
  }
  return generateShortBio(text)
}

function generateLongBio(text: string): string {
  // Use more of the text for long bio
  const cleanText = text.replace(/\s+/g, ' ').trim()
  return cleanText.substring(0, 1000) + (cleanText.length > 1000 ? '...' : '')
}

function extractSpecialties(text: string): string[] {
  const specialties: string[] = []
  
  // Look for common technical terms
  const techTerms = [
    'JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
    'Machine Learning', 'Data Science', 'Frontend', 'Backend', 'Full Stack',
    'DevOps', 'Cloud Computing', 'Database Design', 'API Development'
  ]
  
  for (const term of techTerms) {
    if (text.toLowerCase().includes(term.toLowerCase())) {
      specialties.push(term)
    }
  }
  
  return specialties.slice(0, 5) // Limit to 5 specialties
}

function extractEducation(text: string): string {
  const educationMatch = text.match(/(?:Education|Degree|University):\s*([^\n\r]+)/i)
  if (educationMatch) return educationMatch[1].trim()
  
  // Look for common degree patterns
  const degreeMatch = text.match(/(Bachelor|Master|PhD|Associate|Certificate)[^.]*/i)
  if (degreeMatch) return degreeMatch[0].trim()
  
  return 'Education details not specified'
}
