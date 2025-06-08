import { SubscriptionTier } from '@/types/subscription';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export interface ThemeLayout {
  profileLayout: 'classic' | 'modern' | 'minimal' | 'creative';
  portfolioGrid: '2-column' | '3-column' | '4-column' | 'masonry';
  headerStyle: 'standard' | 'banner' | 'overlay' | 'split';
  navigationStyle: 'tabs' | 'sidebar' | 'floating' | 'minimal';
}

export interface ThemeTypography {
  primaryFont: string;
  secondaryFont: string;
  fontSize: 'small' | 'medium' | 'large';
  fontWeight: 'light' | 'normal' | 'medium' | 'bold';
}

export interface CustomTheme {
  id: string;
  name: string;
  description: string;
  tier: SubscriptionTier;
  colors: ThemeColors;
  layout: ThemeLayout;
  typography: ThemeTypography;
  customCSS?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserThemeSettings {
  userId: string;
  activeThemeId: string;
  customizations: Partial<CustomTheme>;
  isCustomThemeEnabled: boolean;
  bannerImage?: string;
  logoImage?: string;
}

// Predefined themes available by tier
export const DEFAULT_THEMES: Record<string, CustomTheme> = {
  // Free tier - basic theme only
  basic: {
    id: 'basic',
    name: 'Classic',
    description: 'Clean and professional basic theme',
    tier: 'free',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb'
    },
    layout: {
      profileLayout: 'classic',
      portfolioGrid: '2-column',
      headerStyle: 'standard',
      navigationStyle: 'tabs'
    },
    typography: {
      primaryFont: 'Inter',
      secondaryFont: 'Inter',
      fontSize: 'medium',
      fontWeight: 'normal'
    },
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // Pro tier themes
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Sleek and modern professional theme',
    tier: 'pro',
    colors: {
      primary: '#0f172a',
      secondary: '#334155',
      accent: '#3b82f6',
      background: '#ffffff',
      surface: '#f1f5f9',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#cbd5e1'
    },
    layout: {
      profileLayout: 'modern',
      portfolioGrid: '3-column',
      headerStyle: 'banner',
      navigationStyle: 'sidebar'
    },
    typography: {
      primaryFont: 'Poppins',
      secondaryFont: 'Inter',
      fontSize: 'medium',
      fontWeight: 'medium'
    },
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'Bold and artistic theme for creative professionals',
    tier: 'pro',
    colors: {
      primary: '#ec4899',
      secondary: '#f59e0b',
      accent: '#8b5cf6',
      background: '#fefce8',
      surface: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#fbbf24'
    },
    layout: {
      profileLayout: 'creative',
      portfolioGrid: 'masonry',
      headerStyle: 'overlay',
      navigationStyle: 'floating'
    },
    typography: {
      primaryFont: 'Playfair Display',
      secondaryFont: 'Inter',
      fontSize: 'large',
      fontWeight: 'bold'
    },
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // Featured tier themes
  premium: {
    id: 'premium',
    name: 'Premium Dark',
    description: 'Sophisticated dark theme with premium features',
    tier: 'featured',
    colors: {
      primary: '#fbbf24',
      secondary: '#f59e0b',
      accent: '#06b6d4',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      border: '#334155'
    },
    layout: {
      profileLayout: 'modern',
      portfolioGrid: '4-column',
      headerStyle: 'banner',
      navigationStyle: 'sidebar'
    },
    typography: {
      primaryFont: 'Space Grotesk',
      secondaryFont: 'Inter',
      fontSize: 'medium',
      fontWeight: 'medium'
    },
    customCSS: `
      .profile-container {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      }
      .portfolio-item {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .portfolio-item:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }
    `,
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  elegant: {
    id: 'elegant',
    name: 'Elegant Minimal',
    description: 'Ultra-minimal elegant design for premium users',
    tier: 'featured',
    colors: {
      primary: '#1f2937',
      secondary: '#374151',
      accent: '#d97706',
      background: '#fffbeb',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#f3f4f6'
    },
    layout: {
      profileLayout: 'minimal',
      portfolioGrid: '3-column',
      headerStyle: 'split',
      navigationStyle: 'minimal'
    },
    typography: {
      primaryFont: 'Crimson Text',
      secondaryFont: 'Inter',
      fontSize: 'large',
      fontWeight: 'light'
    },
    customCSS: `
      .profile-header {
        border-bottom: 1px solid rgba(209, 213, 219, 0.3);
      }
      .section-divider {
        margin: 3rem 0;
        border-top: 1px solid rgba(209, 213, 219, 0.2);
      }
    `,
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
};

export class ThemeSystem {
  /**
   * Get available themes for a specific tier
   */
  getAvailableThemes(userTier: SubscriptionTier): CustomTheme[] {
    const themes = Object.values(DEFAULT_THEMES);
    
    switch (userTier) {
      case 'free':
        return themes.filter(theme => theme.tier === 'free');
      case 'pro':
        return themes.filter(theme => theme.tier === 'free' || theme.tier === 'pro');
      case 'featured':
        return themes; // All themes available
      default:
        return themes.filter(theme => theme.tier === 'free');
    }
  }

  /**
   * Check if user can access a specific theme
   */
  canAccessTheme(userTier: SubscriptionTier, themeId: string): boolean {
    const theme = DEFAULT_THEMES[themeId];
    if (!theme) return false;

    switch (userTier) {
      case 'free':
        return theme.tier === 'free';
      case 'pro':
        return theme.tier === 'free' || theme.tier === 'pro';
      case 'featured':
        return true;
      default:
        return theme.tier === 'free';
    }
  }

  /**
   * Check if user can use custom CSS
   */
  canUseCustomCSS(userTier: SubscriptionTier): boolean {
    return userTier === 'pro' || userTier === 'featured';
  }

  /**
   * Check if user can upload custom banner
   */
  canUseCustomBanner(userTier: SubscriptionTier): boolean {
    return userTier === 'pro' || userTier === 'featured';
  }

  /**
   * Check if user can use advanced layouts
   */
  canUseAdvancedLayouts(userTier: SubscriptionTier): boolean {
    return userTier === 'pro' || userTier === 'featured';
  }

  /**
   * Get theme-specific CSS variables
   */
  generateCSSVariables(theme: CustomTheme): string {
    return `
      :root {
        --theme-primary: ${theme.colors.primary};
        --theme-secondary: ${theme.colors.secondary};
        --theme-accent: ${theme.colors.accent};
        --theme-background: ${theme.colors.background};
        --theme-surface: ${theme.colors.surface};
        --theme-text: ${theme.colors.text};
        --theme-text-secondary: ${theme.colors.textSecondary};
        --theme-border: ${theme.colors.border};
        
        --theme-font-primary: ${theme.typography.primaryFont};
        --theme-font-secondary: ${theme.typography.secondaryFont};
        --theme-font-size: ${theme.typography.fontSize};
        --theme-font-weight: ${theme.typography.fontWeight};
      }
    `;
  }

  /**
   * Validate custom theme configuration
   */
  validateTheme(theme: Partial<CustomTheme>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate colors
    if (theme.colors) {
      const colorFields = ['primary', 'secondary', 'accent', 'background', 'surface', 'text'];
      colorFields.forEach(field => {
        if (theme.colors![field as keyof ThemeColors]) {
          const color = theme.colors![field as keyof ThemeColors];
          if (!/^#[0-9A-F]{6}$/i.test(color)) {
            errors.push(`Invalid color format for ${field}: ${color}`);
          }
        }
      });
    }

    // Validate layout options
    if (theme.layout) {
      const validLayouts = ['classic', 'modern', 'minimal', 'creative'];
      if (theme.layout.profileLayout && !validLayouts.includes(theme.layout.profileLayout)) {
        errors.push(`Invalid profile layout: ${theme.layout.profileLayout}`);
      }
    }

    // Validate custom CSS (basic security check)
    if (theme.customCSS) {
      const dangerousPatterns = ['javascript:', 'expression(', '<script', 'eval('];
      const hasDangerous = dangerousPatterns.some(pattern => 
        theme.customCSS!.toLowerCase().includes(pattern)
      );
      if (hasDangerous) {
        errors.push('Custom CSS contains potentially dangerous content');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get default theme for a tier
   */
  getDefaultTheme(userTier: SubscriptionTier): CustomTheme {
    switch (userTier) {
      case 'pro':
        return DEFAULT_THEMES.professional;
      case 'featured':
        return DEFAULT_THEMES.premium;
      default:
        return DEFAULT_THEMES.basic;
    }
  }
}

// Export singleton instance
export const themeSystem = new ThemeSystem(); 