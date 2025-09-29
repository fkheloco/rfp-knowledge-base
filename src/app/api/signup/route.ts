import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { email, password, orgName } = await request.json()

    if (!email || !password || !orgName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create user account with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 400 }
      )
    }

    // Check if email confirmation is required
    if (authData.user && !authData.session) {
      return NextResponse.json({
        success: true,
        requiresConfirmation: true,
        message: 'Please check your email and click the confirmation link to complete signup.'
      })
    }

    // Use admin client to create organization (bypasses RLS)
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert([{ name: orgName }])
      .select()
      .single()

    if (orgError) {
      return NextResponse.json(
        { error: orgError.message },
        { status: 400 }
      )
    }

    // Use admin client to create user record (bypasses RLS)
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        org_id: orgData.id,
        role: 'admin'
      }])

    if (userError) {
      return NextResponse.json(
        { error: userError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      user: authData.user,
      organization: orgData 
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
