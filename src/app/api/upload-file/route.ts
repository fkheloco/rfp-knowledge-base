import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileContent, fileType } = await request.json()

    if (!fileName || !fileContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create a file object from the content
    const file = new File([fileContent], fileName, { type: fileType })
    
    // Generate unique filename
    const fileExt = fileName.split('.').pop()
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
    
    // Upload file to Supabase Storage using admin client
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(uniqueFileName, file)

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      filePath: uploadData.path 
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
