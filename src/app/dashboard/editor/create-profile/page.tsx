import { CreateProfileForm } from "@/components/editor/create-profile-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CreateProfilePage() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/login");
  }

  // Check if user already has a profile
  const { data: existingProfile } = await supabase
    .from('editor_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (existingProfile) {
    redirect("/dashboard/editor");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold gradient-text mb-4">Create Your Editor Profile</h1>
          <p className="text-xl text-gray-600 dark:text-muted-foreground">
            Let clients discover your skills and hire you for amazing projects
          </p>
        </div>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-2xl dark:text-white">Profile Information</CardTitle>
            <CardDescription className="dark:text-muted-foreground">
              Complete your profile to start receiving project opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateProfileForm userId={user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 