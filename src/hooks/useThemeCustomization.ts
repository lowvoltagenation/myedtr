import { useState, useEffect, useCallback } from 'react';
import { useSubscription } from './useSubscription';
import { themeSystem, CustomTheme, UserThemeSettings, ThemeColors, ThemeLayout } from '@/lib/themes/theme-system';
import { createClient } from '@/lib/supabase/client';
import { SubscriptionTier } from '@/types/subscription';

export interface ThemeCustomizationState {
  availableThemes: CustomTheme[];
  activeTheme: CustomTheme | null;
  userSettings: UserThemeSettings | null;
  isLoading: boolean;
  error: string | null;
}

export function useThemeCustomization() {
  const [userId, setUserId] = useState<string | null>(null);
  const { tier } = useSubscription(userId || undefined);
  const supabase = createClient();

  // Get user ID from auth
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, [supabase]);

  const [state, setState] = useState<ThemeCustomizationState>({
    availableThemes: [],
    activeTheme: null,
    userSettings: null,
    isLoading: true,
    error: null
  });

  // Load theme data on mount and user change
  useEffect(() => {
    const loadThemeData = async () => {
      if (!userId || !tier) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Get available themes for user's tier
        const availableThemes = themeSystem.getAvailableThemes(tier);

        // Get user's theme settings
        const { data: userSettings } = await supabase
          .from('user_theme_settings')
          .select('*')
          .eq('user_id', userId)
          .single();

        let activeTheme: CustomTheme | null = null;
        let settings: UserThemeSettings | null = null;

        if (userSettings) {
          // Find the active theme
          activeTheme = availableThemes.find(t => t.id === userSettings.active_theme_id) || null;
          
          // Create UserThemeSettings object
          settings = {
            userId: userSettings.user_id,
            activeThemeId: userSettings.active_theme_id,
            customizations: {
              colors: userSettings.custom_colors || {},
              layout: userSettings.custom_layout || {},
              customCSS: userSettings.custom_css || undefined
            },
            isCustomThemeEnabled: userSettings.is_custom_theme_enabled || false,
            bannerImage: userSettings.banner_image_url || undefined,
            logoImage: userSettings.logo_image_url || undefined
          };
        } else {
          // Use default theme if no settings exist
          activeTheme = themeSystem.getDefaultTheme(tier);
          settings = {
            userId: userId,
            activeThemeId: activeTheme.id,
            customizations: {},
            isCustomThemeEnabled: false
          };
        }

        setState({
          availableThemes,
          activeTheme,
          userSettings: settings,
          isLoading: false,
          error: null
        });

      } catch (error) {
        console.error('Error loading theme data:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load theme data'
        }));
      }
    };

    loadThemeData();
  }, [userId, tier]);

  // Switch to a different theme
  const switchTheme = useCallback(async (themeId: string) => {
    if (!userId || !tier) throw new Error('User not authenticated');
    
    if (!themeSystem.canAccessTheme(tier, themeId)) {
      throw new Error('Theme not available for your subscription tier');
    }

    try {
      const newTheme = state.availableThemes.find(t => t.id === themeId);
      if (!newTheme) throw new Error('Theme not found');

      const { error } = await supabase
        .from('user_theme_settings')
        .upsert({
          user_id: userId,
          active_theme_id: themeId,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        activeTheme: newTheme,
        userSettings: prev.userSettings ? {
          ...prev.userSettings,
          activeThemeId: themeId
        } : null
      }));

      return { success: true };
    } catch (error) {
      console.error('Error switching theme:', error);
      throw error;
    }
  }, [userId, tier, state.availableThemes, supabase]);

  // Update custom colors (Pro/Featured only)
  const updateCustomColors = useCallback(async (colors: Partial<ThemeColors>) => {
    if (!userId || !tier) throw new Error('User not authenticated');
    if (!themeSystem.canUseCustomCSS(tier)) {
      throw new Error('Custom colors not available for your subscription tier');
    }

    try {
      const { error } = await supabase
        .from('user_theme_settings')
        .upsert({
          user_id: userId,
          custom_colors: colors,
          is_custom_theme_enabled: true,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        userSettings: prev.userSettings ? {
          ...prev.userSettings,
          customizations: {
            ...prev.userSettings.customizations,
            colors: { 
              ...(prev.userSettings.customizations.colors || {}), 
              ...colors 
            } as ThemeColors
          },
          isCustomThemeEnabled: true
        } : null
      }));

      return { success: true };
    } catch (error) {
      console.error('Error updating custom colors:', error);
      throw error;
    }
  }, [userId, tier, supabase]);

  // Update custom layout (Pro/Featured only)
  const updateCustomLayout = useCallback(async (layout: Partial<ThemeLayout>) => {
    if (!userId || !tier) throw new Error('User not authenticated');
    if (!themeSystem.canUseAdvancedLayouts(tier)) {
      throw new Error('Advanced layouts not available for your subscription tier');
    }

    try {
      const { error } = await supabase
        .from('user_theme_settings')
        .upsert({
          user_id: userId,
          custom_layout: layout,
          is_custom_theme_enabled: true,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        userSettings: prev.userSettings ? {
          ...prev.userSettings,
          customizations: {
            ...prev.userSettings.customizations,
            layout: { 
              ...(prev.userSettings.customizations.layout || {}), 
              ...layout 
            } as ThemeLayout
          },
          isCustomThemeEnabled: true
        } : null
      }));

      return { success: true };
    } catch (error) {
      console.error('Error updating custom layout:', error);
      throw error;
    }
  }, [userId, tier, supabase]);

  // Update custom CSS (Pro/Featured only)
  const updateCustomCSS = useCallback(async (css: string) => {
    if (!userId || !tier) throw new Error('User not authenticated');
    if (!themeSystem.canUseCustomCSS(tier)) {
      throw new Error('Custom CSS not available for your subscription tier');
    }

    // Validate CSS
    const validation = themeSystem.validateTheme({ customCSS: css });
    if (!validation.isValid) {
      throw new Error(`Invalid CSS: ${validation.errors.join(', ')}`);
    }

    try {
      const { error } = await supabase
        .from('user_theme_settings')
        .upsert({
          user_id: userId,
          custom_css: css,
          is_custom_theme_enabled: true,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        userSettings: prev.userSettings ? {
          ...prev.userSettings,
          customizations: {
            ...prev.userSettings.customizations,
            customCSS: css
          },
          isCustomThemeEnabled: true
        } : null
      }));

      return { success: true };
    } catch (error) {
      console.error('Error updating custom CSS:', error);
      throw error;
    }
  }, [userId, tier, supabase]);

  // Upload banner image (Pro/Featured only)
  const uploadBannerImage = useCallback(async (file: File) => {
    if (!userId || !tier) throw new Error('User not authenticated');
    if (!themeSystem.canUseCustomBanner(tier)) {
      throw new Error('Custom banner not available for your subscription tier');
    }

    try {
      // Upload to Supabase storage
      const fileName = `${userId}/banner-${Date.now()}.${file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-assets')
        .getPublicUrl(fileName);

      // Save banner record
      const { error: bannerError } = await supabase
        .from('profile_banners')
        .insert({
          user_id: userId,
          banner_url: publicUrl,
          banner_name: file.name,
          is_active: true,
          file_size: file.size,
          file_type: file.type
        });

      if (bannerError) throw bannerError;

      // Update theme settings
      const { error: settingsError } = await supabase
        .from('user_theme_settings')
        .upsert({
          user_id: userId,
          banner_image_url: publicUrl,
          updated_at: new Date().toISOString()
        });

      if (settingsError) throw settingsError;

      setState(prev => ({
        ...prev,
        userSettings: prev.userSettings ? {
          ...prev.userSettings,
          bannerImage: publicUrl
        } : null
      }));

      return { success: true, bannerUrl: publicUrl };
    } catch (error) {
      console.error('Error uploading banner:', error);
      throw error;
    }
  }, [userId, tier, supabase]);

  // Reset to default theme
  const resetToDefault = useCallback(async () => {
    if (!userId || !tier) throw new Error('User not authenticated');

    try {
      const defaultTheme = themeSystem.getDefaultTheme(tier);
      
      const { error } = await supabase
        .from('user_theme_settings')
        .upsert({
          user_id: userId,
          active_theme_id: defaultTheme.id,
          custom_colors: null,
          custom_layout: null,
          custom_css: null,
          is_custom_theme_enabled: false,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        activeTheme: defaultTheme,
        userSettings: prev.userSettings ? {
          ...prev.userSettings,
          activeThemeId: defaultTheme.id,
          customizations: {},
          isCustomThemeEnabled: false,
          bannerImage: undefined,
          logoImage: undefined
        } : null
      }));

      return { success: true };
    } catch (error) {
      console.error('Error resetting theme:', error);
      throw error;
    }
  }, [userId, tier, supabase]);

  return {
    ...state,
    switchTheme,
    updateCustomColors,
    updateCustomLayout,
    updateCustomCSS,
    uploadBannerImage,
    resetToDefault,
    // Utility functions for components
    canUseCustomCSS: tier ? themeSystem.canUseCustomCSS(tier) : false,
    canUseCustomBanner: tier ? themeSystem.canUseCustomBanner(tier) : false,
    canUseAdvancedLayouts: tier ? themeSystem.canUseAdvancedLayouts(tier) : false
  };
}

// Hook for enhanced profile features
export function useEnhancedProfile() {
  const { tier } = useSubscription();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user ID from auth
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, [supabase]);

  // Load enhanced profile data
  const loadProfile = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('enhanced_profile_data')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data);
      setError(null);
    } catch (err) {
      console.error('Error loading enhanced profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase]);

  // Update profile data
  const updateProfile = useCallback(async (updates: any) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('enhanced_profile_data')
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setProfile((prev: any) => ({ ...prev, ...updates }));
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, [userId, supabase]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    reload: loadProfile,
    canUseVideoIntro: tier === 'featured',
    canUseCaseStudies: tier === 'featured',
    canUseEnhancedBio: ['pro', 'featured'].includes(tier)
  };
} 