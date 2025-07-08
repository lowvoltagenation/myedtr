import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, verify the application exists and get the project info
    const { data: application, error: appError } = await supabase
      .from('project_applications')
      .select(`
        *,
        projects!inner (
          client_id
        )
      `)
      .eq('id', id)
      .single();
    
    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Verify the user owns the project
    const project = application.projects as any;
    if (project.client_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to update this application' }, { status: 403 });
    }

    // Update the application status - RLS policy now allows project owners to update
    const { data: updatedApplication, error: updateError } = await supabase
      .from('project_applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update application:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update application',
        details: updateError.message
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      application: updatedApplication 
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}