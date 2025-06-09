# Dark/Light Mode Consistency Workflow

## Overview
This document outlines the workflow for ensuring all pages have consistent light and dark mode support in MyEdtr.

## 🚀 Quick Start for New Pages

### Before You Start Coding:
1. **Review Standards**: Read `DARK_MODE_STANDARDS.md`
2. **Use Template**: Start with a mode-consistent page template
3. **Test Both Modes**: Toggle between light and dark during development

### Development Checklist:
```markdown
- [ ] Main background gradient includes dark variants
- [ ] All headings use `dark:text-white` or `dark:text-foreground`
- [ ] All body text uses `dark:text-muted-foreground`
- [ ] All links use `dark:text-purple-400 dark:hover:text-purple-300`
- [ ] All cards have `dark:text-white` titles
- [ ] All form labels use `dark:text-foreground`
- [ ] All loading states use `dark:bg-gray-700`
- [ ] All error states include dark variants
- [ ] All icons include `dark:text-muted-foreground`
```

## 🔄 Workflow Process

### 1. Planning Phase
- [ ] Identify all visual elements on the page
- [ ] Plan color scheme for both light and dark modes
- [ ] Consider accessibility requirements for both modes

### 2. Development Phase
- [ ] Implement light mode styling
- [ ] Add dark mode classes following standards
- [ ] **Test both modes frequently** using browser dev tools
- [ ] Ensure proper contrast in both modes

### 3. Review Phase
- [ ] Run consistency audit: `npm run audit:dark-mode`
- [ ] Manual testing in both light and dark modes
- [ ] Accessibility testing for both modes
- [ ] Peer review with focus on mode consistency

### 4. Deployment Phase
- [ ] Final consistency check
- [ ] Test on staging in both modes
- [ ] Monitor for any missed elements

## 🛠 Tools & Commands

### Development Tools:
```bash
# Run consistency audit
npm run audit:dark-mode

# Get detailed audit report
npm run check:dark-mode

# Regular development (users can toggle modes naturally)
npm run dev
```

### Browser Testing:
- **Dev Tools**: Use browser dark/light mode toggle
- **System Settings**: Change OS theme to test
- **Browser Extensions**: Dark Reader for additional testing

## 📋 Page Templates

### Basic Page Template:
```tsx
export default function MyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Page Title
          </h1>
          <p className="text-gray-600 dark:text-muted-foreground">
            Page description
          </p>
        </div>
        
        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className="dark:text-white">Section Title</CardTitle>
            <CardDescription className="dark:text-muted-foreground">
              Section description
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Your content here */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

## 🎯 Testing Strategy

### Automated Testing:
1. **Consistency Audit**: Run before each commit
2. **CI/CD Integration**: Ensure standards are met
3. **Visual Regression**: Compare both modes

### Manual Testing:
1. **Mode Toggle**: Switch between light/dark on each page
2. **Contrast Test**: Verify readability in both modes
3. **Interactive Test**: Check hover/focus states in both modes
4. **Device Test**: Test on different devices and browsers

## 🚨 Common Issues & Solutions

### Issue: Background Missing Dark Variant
```diff
- bg-gradient-to-br from-purple-50 via-white to-blue-50
+ bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20
```

### Issue: Text Not Visible in Dark Mode
```diff
- text-gray-900
+ text-gray-900 dark:text-white
```

### Issue: Links Hard to See in Dark Mode
```diff
- text-purple-600 hover:text-purple-700
+ text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300
```

### Issue: Cards Look Wrong in Dark Mode
```diff
- <CardTitle>Title</CardTitle>
+ <CardTitle className="dark:text-white">Title</CardTitle>
```

## 📊 Quality Gates

### Definition of Ready:
A task is ready for development when:
- [ ] Light/dark mode requirements are defined
- [ ] Design mockups show both modes (if applicable)
- [ ] Accessibility requirements are clear for both modes

### Definition of Done:
A page is complete when:
- [ ] Consistency audit score is 90+ 
- [ ] Manual testing passed in both modes
- [ ] Accessibility standards met in both modes
- [ ] Peer review completed
- [ ] Documentation updated

## 🔧 VS Code Setup

### Recommended Extensions:
- **Tailwind CSS IntelliSense** - Auto-completion for dark: variants
- **Headwind** - Class sorting
- **Color Highlight** - See colors in code

### Settings for Dark Mode Development:
```json
{
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["className\\s*:\\s*['\"`]([^'\"`]*)['\"`]"]
  ],
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

## 📈 Metrics & Monitoring

### Track These Metrics:
- **Consistency Score**: Target 95%+ compliance
- **Performance**: Mode switching shouldn't impact performance
- **User Adoption**: Monitor light/dark mode preferences
- **Bug Reports**: Track mode-specific issues

### Monthly Reviews:
- [ ] Run full audit on all pages
- [ ] Review new pages for consistency
- [ ] Update standards based on feedback
- [ ] Plan improvements for low-scoring pages

## 🎨 Design System Integration

### Color Variables:
All mode-aware colors should use CSS variables:
```css
--background: /* Adapts to current mode */
--foreground: /* Adapts to current mode */
--muted-foreground: /* Adapts to current mode */
--card: /* Adapts to current mode */
--border: /* Adapts to current mode */
```

### Component Library:
- All UI components should support both modes by default
- No additional classes needed for basic components
- Custom styling should follow standards for both modes

## 🚀 Automation & CI/CD

### Pre-commit Hooks:
```bash
# .husky/pre-commit
npm run audit:dark-mode
if [ $? -ne 0 ]; then
  echo "Mode consistency audit failed. Please ensure all pages support both light and dark modes."
  exit 1
fi
```

### GitHub Actions:
```yaml
# .github/workflows/mode-consistency-audit.yml
name: Light/Dark Mode Consistency Audit
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run audit:dark-mode
      - run: npm run check:dark-mode
```

## 🌓 Quick Testing Tips

### Browser Dev Tools:
1. **Chrome/Edge**: Dev Tools > Rendering > Emulate CSS media feature `prefers-color-scheme`
2. **Firefox**: Dev Tools > Inspector > Simulation > `prefers-color-scheme`
3. **Safari**: Develop > Experimental Features > Dark Mode CSS Support

### System-Level Testing:
- **macOS**: System Preferences > General > Appearance
- **Windows**: Settings > Personalization > Colors > Choose your mode
- **Linux**: Depends on desktop environment

### Quick Verification:
1. Open your page
2. Toggle system dark/light mode
3. Verify all elements are visible and properly styled
4. Check that colors make sense in both modes

## 📚 Resources

### External Resources:
- [WCAG Color Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Tailwind Dark Mode Docs](https://tailwindcss.com/docs/dark-mode)
- [CSS prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)

### Internal Resources:
- `DARK_MODE_STANDARDS.md` - Implementation patterns
- `scripts/audit-dark-mode.js` - Consistency audit tool
- Design system documentation

---

*Last updated: Current Date*
*Focus: Consistency across both light and dark modes* 