'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

// Temporarily simplified component during authentication system improvements
export function EnhancedProfileEditor() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-blue-500" />
          Enhanced Profile Editor - Temporarily Unavailable
        </CardTitle>
        <CardDescription>
          This feature is temporarily disabled while we improve authentication reliability
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          The enhanced profile editor will be restored once we complete the authentication system improvements.
          You can still edit basic profile information from your main profile page.
        </p>
      </CardContent>
    </Card>
  );
}