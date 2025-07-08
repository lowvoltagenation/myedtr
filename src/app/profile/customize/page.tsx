'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  User, 
  Settings, 
  Wrench
} from 'lucide-react';

export default function ProfileCustomizePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Profile Customization</h1>
            <p className="text-gray-600">
              Profile customization is being simplified for better performance
            </p>
          </div>
        </div>
      </div>

      {/* Temporary Notice */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-500" />
            System Update in Progress
          </CardTitle>
          <CardDescription>
            We're improving the authentication system and temporarily simplified profile customization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              The following features are temporarily unavailable while we improve system reliability:
            </p>
            <ul className="text-sm text-gray-600 space-y-2 ml-4">
              <li>• Custom profile themes</li>
              <li>• Enhanced profile editor</li>
              <li>• Spotlight configuration</li>
            </ul>
            <p className="text-sm text-gray-600">
              Basic dark/light mode switching is still available in the header. 
              We'll restore advanced customization features soon with better performance.
            </p>
            <Button variant="outline" className="mt-4">
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Basic Settings That Still Work */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Available Settings
          </CardTitle>
          <CardDescription>
            Basic profile settings you can still manage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Dark/Light Mode</h4>
                <p className="text-sm text-gray-600">Use the theme toggle in the header</p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200">
                Available
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Basic Profile Editing</h4>
                <p className="text-sm text-gray-600">Edit your profile from the main profile page</p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200">
                Available
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}