import { createClient } from "@/lib/supabase/server";
import { BrowseEditorsClient } from "@/components/browse/browse-editors-client";

export default async function BrowsePage() {
  const supabase = await createClient();
  
  // Get all available editors
  const { data: editors, error } = await supabase
    .from('editor_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching editors:', error);
  }

  // Get unique specialties for filter options
  const specialties = editors
    ? Array.from(new Set(editors.flatMap(editor => editor.specialties || [])))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">Browse Video Editors</h1>
          <p className="text-xl text-gray-600 dark:text-muted-foreground">
            Find the perfect editor for your next project
          </p>
        </div>

        <BrowseEditorsClient 
          initialEditors={editors || []} 
          availableSpecialties={specialties}
        />
      </div>
    </div>
  );
} 