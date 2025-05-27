import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const userType = searchParams.get('type') ?? 'client'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if user exists in our users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', data.user.id)
        .single()

      // If user doesn't exist, create them with the specified type
      if (!existingUser) {
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            user_type: userType as 'client' | 'editor'
          })

        if (userError) {
          console.error('Error creating user:', userError);
        }

        // If user type is editor, create editor profile
        if (userType === 'editor') {
          const { error: profileError } = await supabase
            .from('editor_profiles')
            .insert({
              user_id: data.user.id,
              name: data.user.email?.split('@')[0] || 'Editor',
              bio: '',
              tier_level: 'free',
              availability_status: 'available'
            });

          if (profileError) {
            console.error('Error creating editor profile:', profileError);
          }
        }
      }

      // Redirect based on user type
      const redirectPath = existingUser?.user_type === 'editor' || userType === 'editor' 
        ? '/dashboard/editor' 
        : '/dashboard/client'
      
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
} 