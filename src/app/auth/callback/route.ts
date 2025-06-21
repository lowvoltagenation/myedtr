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
      // Get user info from our users table (created by trigger)
      const { data: userData } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', data.user.id)
        .single()

      const actualUserType = userData?.user_type || userType

      // If user type is editor, ensure editor profile exists
      if (actualUserType === 'editor') {
        // Check if editor profile exists
        const { data: editorProfile } = await supabase
          .from('editor_profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .single();
          
        if (!editorProfile) {
          // Create editor profile
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
          
          return NextResponse.redirect(`${origin}/dashboard/editor/create-profile`);
        } else {
          return NextResponse.redirect(`${origin}/dashboard/editor`);
        }
      } else {
        return NextResponse.redirect(`${origin}/dashboard/client`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
} 