import { Card, CardContent, CardHeader } from "./card";

// General loading skeleton for auth loading states
export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 dark:bg-muted rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-muted rounded w-96"></div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 dark:bg-muted rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-muted rounded"></div>
            <div className="h-48 bg-gray-200 dark:bg-muted rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard-specific loading skeleton
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="h-8 bg-gray-200 dark:bg-muted rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-muted rounded w-96"></div>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="h-10 bg-gray-200 dark:bg-muted rounded w-32"></div>
                <div className="h-10 bg-gray-200 dark:bg-muted rounded w-40"></div>
              </div>
            </div>
          </div>

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-muted rounded"></div>
                    <div className="ml-4 flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-muted rounded w-24 mb-2"></div>
                      <div className="h-6 bg-gray-200 dark:bg-muted rounded w-16"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-muted rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-muted rounded w-64"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="border rounded-lg p-4">
                        <div className="h-5 bg-gray-200 dark:bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-muted rounded w-full mb-3"></div>
                        <div className="flex justify-between items-center">
                          <div className="h-4 bg-gray-200 dark:bg-muted rounded w-24"></div>
                          <div className="h-4 bg-gray-200 dark:bg-muted rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Editor dashboard specific skeleton
export function EditorDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="h-8 bg-gray-200 dark:bg-muted rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-muted rounded w-80"></div>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="h-10 bg-gray-200 dark:bg-muted rounded w-28"></div>
                <div className="h-10 bg-gray-200 dark:bg-muted rounded w-36"></div>
                <div className="h-10 bg-gray-200 dark:bg-muted rounded w-40"></div>
              </div>
            </div>
          </div>

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-muted rounded"></div>
                    <div className="ml-4 flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-muted rounded w-28 mb-2"></div>
                      <div className="h-6 bg-gray-200 dark:bg-muted rounded w-12"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main content skeleton - 3 column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile card skeleton */}
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-muted rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-muted rounded w-48"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-5 bg-gray-200 dark:bg-muted rounded w-3/4"></div>
                  <div className="h-16 bg-gray-200 dark:bg-muted rounded w-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-muted rounded w-20"></div>
                    <div className="flex gap-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-6 bg-gray-200 dark:bg-muted rounded w-16"></div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <div className="h-4 bg-gray-200 dark:bg-muted rounded w-16"></div>
                    <div className="h-4 bg-gray-200 dark:bg-muted rounded w-20"></div>
                  </div>
                  <div className="space-y-2 pt-4">
                    <div className="h-10 bg-gray-200 dark:bg-muted rounded w-full"></div>
                    <div className="h-10 bg-gray-200 dark:bg-muted rounded w-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available projects skeleton - spans 2 columns */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-6 bg-gray-200 dark:bg-muted rounded w-40 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-muted rounded w-56"></div>
                  </div>
                  <div className="h-8 bg-gray-200 dark:bg-muted rounded w-20"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="h-5 bg-gray-200 dark:bg-muted rounded w-1/2"></div>
                        <div className="flex gap-2">
                          <div className="h-6 bg-gray-200 dark:bg-muted rounded w-16"></div>
                          <div className="h-6 bg-gray-200 dark:bg-muted rounded w-20"></div>
                        </div>
                      </div>
                      <div className="h-10 bg-gray-200 dark:bg-muted rounded w-full mb-3"></div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                          <div className="h-4 bg-gray-200 dark:bg-muted rounded w-16"></div>
                          <div className="h-4 bg-gray-200 dark:bg-muted rounded w-20"></div>
                        </div>
                        <div className="h-8 bg-gray-200 dark:bg-muted rounded w-24"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small auth loading skeleton for components
export function AuthLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-pulse">
        <div className="h-8 w-8 bg-gray-200 dark:bg-muted rounded-full"></div>
      </div>
    </div>
  );
}