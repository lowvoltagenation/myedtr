import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PostProjectForm } from "@/components/client/post-project-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function PostProjectPage() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/client" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold gradient-text mb-4">Post a New Project</h1>
          <p className="text-xl text-gray-600">
            Describe your video editing needs and connect with talented editors
          </p>
        </div>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-2xl">Project Details</CardTitle>
            <CardDescription>
              Provide clear information about your project to attract the right editors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PostProjectForm userId={user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 