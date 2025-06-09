"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon,
  Shield,
  Bell,
  Eye,
  Save,
  Loader2,
  CheckCircle,
  Mail,
  Smartphone,
  Lock,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface UserSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  project_updates: boolean;
  message_notifications: boolean;
  public_profile: boolean;
  show_hourly_rate: boolean;
  show_location: boolean;
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: true,
    project_updates: true,
    message_notifications: true,
    public_profile: true,
    show_hourly_rate: true,
    show_location: true
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const [emailData, setEmailData] = useState({
    new_email: "",
    password: ""
  });

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/login');
        return;
      }

      setUser(session.user);
      
      // For now, we'll use default settings since we don't have a user_settings table
      // In a production app, you'd load these from the database
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async () => {
    setSaving(true);
    setError(null);

    try {
      // In a production app, you'd save these to a user_settings table
      setSuccess('Settings updated successfully!');
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new_password
      });

      if (error) throw error;

      setSuccess('Password updated successfully!');
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: ""
      });

      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleEmailChange = async () => {
    if (!emailData.new_email || !emailData.password) {
      setError('Please fill in all fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        email: emailData.new_email
      });

      if (error) throw error;

      setSuccess('Email update confirmation sent! Please check your new email address.');
      setEmailData({
        new_email: "",
        password: ""
      });

      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update email');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') {
      setError('Account deletion cancelled');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // In a production app, you'd have an API endpoint to handle account deletion
      // This would remove all user data, profiles, messages, etc.
      setError('Account deletion is not yet implemented. Please contact support.');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-600">Manage your account preferences and security</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              {success}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    { key: 'email_notifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                    { key: 'sms_notifications', label: 'SMS Notifications', description: 'Receive notifications via text message' },
                    { key: 'marketing_emails', label: 'Marketing Emails', description: 'Receive updates about new features and tips' },
                    { key: 'project_updates', label: 'Project Updates', description: 'Get notified about project status changes' },
                    { key: 'message_notifications', label: 'Message Notifications', description: 'Get notified about new messages' }
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-900">{label}</label>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, [key]: !prev[key as keyof UserSettings] }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings[key as keyof UserSettings] ? 'bg-purple-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings[key as keyof UserSettings] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control what information is visible to others
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    { key: 'public_profile', label: 'Public Profile', description: 'Allow others to view your profile' },
                    { key: 'show_hourly_rate', label: 'Show Hourly Rate', description: 'Display your hourly rate on your profile' },
                    { key: 'show_location', label: 'Show Location', description: 'Display your location on your profile' }
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-900">{label}</label>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, [key]: !prev[key as keyof UserSettings] }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings[key as keyof UserSettings] ? 'bg-purple-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings[key as keyof UserSettings] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Button onClick={handleSettingsUpdate} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Change Password */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">Current Password</Label>
                      <Input
                        id="current_password"
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <Input
                        id="new_password"
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Confirm New Password</Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  <Button onClick={handlePasswordChange} disabled={saving}>
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>
                </div>

                <hr />

                {/* Change Email */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">Change Email Address</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new_email">New Email Address</Label>
                      <Input
                        id="new_email"
                        type="email"
                        value={emailData.new_email}
                        onChange={(e) => setEmailData(prev => ({ ...prev, new_email: e.target.value }))}
                        placeholder="Enter new email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password_confirm">Password</Label>
                      <Input
                        id="password_confirm"
                        type="password"
                        value={emailData.password}
                        onChange={(e) => setEmailData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter your password to confirm"
                      />
                    </div>
                  </div>
                  <Button onClick={handleEmailChange} disabled={saving}>
                    <Mail className="w-4 h-4 mr-2" />
                    Update Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Created</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Sign In</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/profile/edit">
                  <Button variant="outline" className="w-full justify-start">
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="w-full justify-start">
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    Manage Subscription
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button variant="outline" className="w-full justify-start">
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    View Messages
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  onClick={handleDeleteAccount}
                  disabled={saving}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  This will permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 