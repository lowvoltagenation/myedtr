# Dark Mode Implementation Standards

## Overview
This document outlines the consistent patterns for implementing dark mode across all pages in MyEdtr.

## Core Patterns

### **Background Gradients**
```css
/* Light mode → Dark mode */
bg-gradient-to-br from-purple-50 via-white to-blue-50 
dark:from-background dark:via-background dark:to-muted/20
```

### **Text Colors**
```css
/* Main headings */
text-gray-900 dark:text-white

/* Subheadings */
text-gray-900 dark:text-foreground

/* Body text & descriptions */
text-gray-600 dark:text-muted-foreground

/* Muted/secondary text */
text-gray-500 dark:text-muted-foreground

/* Links */
text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300
```

### **Card Components**
```css
/* Card titles */
CardTitle: dark:text-white

/* Card descriptions */
CardDescription: dark:text-muted-foreground

/* Enhanced card shadows */
hover:shadow-lg dark:hover:shadow-2xl
```

### **Form Elements**
```css
/* Labels */
Label: dark:text-foreground

/* Input icons */
text-gray-400 dark:text-muted-foreground

/* Error messages */
bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400

/* Success messages */
bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400
```

### **Loading States**
```css
/* Skeleton placeholders */
bg-gray-200 dark:bg-gray-700
```

### **Borders & Separators**
```css
/* Dividers */
border-t dark:border-border

/* Background spans */
bg-background dark:bg-card
```

## Required Dark Mode Classes by Component Type

### **Page Layouts**
- Main container: `dark:from-background dark:via-background dark:to-muted/20`
- Page titles: `dark:text-white`
- Page descriptions: `dark:text-muted-foreground`

### **Navigation**
- Links: `dark:text-purple-400 dark:hover:text-purple-300`
- Icons: `dark:text-muted-foreground`

### **Cards & Content**
- Card titles: `dark:text-white`
- Card content: `dark:text-muted-foreground`
- Card shadows: `dark:hover:shadow-2xl`

### **Forms**
- Labels: `dark:text-foreground`
- Placeholders: Auto-handled by components
- Error states: `dark:bg-red-900/20 dark:border-red-800 dark:text-red-400`

### **Interactive Elements**
- Button variants: Auto-handled by component system
- Hover states: Include dark variants for custom elements

## Implementation Checklist

### For New Pages:
- [ ] Main background gradient with dark variants
- [ ] All headings have dark text colors
- [ ] All body text uses muted-foreground
- [ ] All links use purple dark variants
- [ ] All cards have dark titles and descriptions
- [ ] All form labels use dark:text-foreground
- [ ] Loading states use dark skeleton colors
- [ ] Error/success states have dark variants

### For Existing Pages:
- [ ] Audit all text elements
- [ ] Add dark variants to custom backgrounds
- [ ] Update icon colors
- [ ] Test in both light and dark modes
- [ ] Verify proper contrast ratios

## Testing Requirements

### Manual Testing:
1. Toggle between light/dark modes
2. Check all text is readable
3. Verify proper contrast ratios
4. Test all interactive states (hover, focus, active)
5. Validate loading states
6. Check error/success message visibility

### Automated Testing Considerations:
- Consider adding visual regression tests for dark mode
- Ensure accessibility standards are met in both modes
- Test with various screen readers

## Tools & Resources

### Browser Extensions:
- **Dark Reader** - Test how pages look with forced dark mode
- **WAVE** - Check accessibility contrast ratios

### Design Tokens:
All dark mode colors should use the existing Tailwind/CSS variable system:
- `background` - Main dark background
- `foreground` - Main dark text
- `muted-foreground` - Secondary dark text
- `border` - Dark borders
- `card` - Card backgrounds in dark mode

## Common Pitfalls to Avoid

1. **Missing icon colors** - Always add dark variants for custom icons
2. **Hardcoded gray colors** - Use semantic color variables instead
3. **Forgetting loading states** - Skeleton loaders need dark variants
4. **Custom background colors** - Ensure all custom backgrounds have dark variants
5. **Link states** - Don't forget hover and active states for dark mode
6. **Form validation** - Error and success states need dark styling

## Component-Specific Patterns

### Auth Pages:
```css
/* Consistent pattern for all auth pages */
bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20
```

### Dashboard Pages:
```css
/* Same gradient pattern */
bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20
```

### Modal/Dialog Content:
```css
/* Dialog titles */
dark:text-white

/* Dialog descriptions */
dark:text-muted-foreground
```

## Quality Assurance

### Code Review Requirements:
- All new pages must include dark mode styling
- PR reviewers should verify dark mode implementation
- No hardcoded light-only colors allowed

### Definition of Done:
A page is not complete unless it:
1. ✅ Renders properly in both light and dark modes
2. ✅ Meets accessibility contrast requirements
3. ✅ Follows the established color patterns
4. ✅ Has been tested on multiple devices/browsers
5. ✅ Includes all interactive state styling

---

*Last updated: Current Date*
*Maintainer: Development Team* 