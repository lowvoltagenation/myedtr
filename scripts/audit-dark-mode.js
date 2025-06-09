#!/usr/bin/env node

/**
 * Light/Dark Mode Consistency Audit Script
 * Scans all pages for light/dark mode consistency and generates a report
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Dark mode patterns that should be present for consistency
const REQUIRED_PATTERNS = {
  backgrounds: [
    'dark:from-background',
    'dark:via-background', 
    'dark:to-muted/20'
  ],
  text: [
    'dark:text-white',
    'dark:text-foreground',
    'dark:text-muted-foreground'
  ],
  links: [
    'dark:text-purple-400',
    'dark:hover:text-purple-300'
  ],
  loading: [
    'dark:bg-gray-700'
  ],
  errors: [
    'dark:bg-red-900/20',
    'dark:border-red-800',
    'dark:text-red-400'
  ]
};

// Pages that should be excluded from audit (if any)
const EXCLUDED_PAGES = [
  '_app.js',
  '_document.js',
  'api/**/*'
];

class ModeConsistencyAuditor {
  constructor() {
    this.results = {
      compliant: [],
      needsWork: [],
      missing: [],
      summary: {}
    };
  }

  // Scan all page files
  async auditAllPages() {
    console.log('🔍 Starting Light/Dark Mode Consistency Audit...\n');

    // Find all page files
    const pageFiles = await this.findPageFiles();
    
    console.log(`Found ${pageFiles.length} page files to audit\n`);

    // Audit each file
    for (const file of pageFiles) {
      await this.auditFile(file);
    }

    // Generate report
    this.generateReport();
  }

  // Find all page files in the src directory
  async findPageFiles() {
    const patterns = [
      'src/app/**/page.tsx',
      'src/app/**/page.ts',
      'src/app/**/*.tsx',
      'src/components/**/*.tsx'
    ];

    let files = [];
    
    for (const pattern of patterns) {
      const matches = glob.sync(pattern, {
        ignore: EXCLUDED_PAGES.map(p => `src/${p}`)
      });
      files = files.concat(matches);
    }

    // Remove duplicates and sort
    return [...new Set(files)].sort();
  }

  // Audit a single file
  async auditFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const analysis = this.analyzeFile(content, filePath);
      
      console.log(`📄 ${filePath}`);
      console.log(`   Status: ${analysis.status}`);
      console.log(`   Score: ${analysis.score}/100`);
      
      if (analysis.issues.length > 0) {
        console.log(`   Issues: ${analysis.issues.length}`);
        analysis.issues.forEach(issue => {
          console.log(`     - ${issue}`);
        });
      }
      console.log();

      // Categorize results
      if (analysis.score >= 90) {
        this.results.compliant.push(analysis);
      } else if (analysis.score >= 50) {
        this.results.needsWork.push(analysis);
      } else {
        this.results.missing.push(analysis);
      }

    } catch (error) {
      console.error(`❌ Error reading ${filePath}:`, error.message);
    }
  }

  // Analyze file content for light/dark mode consistency
  analyzeFile(content, filePath) {
    const analysis = {
      file: filePath,
      score: 0,
      status: 'Unknown',
      issues: [],
      hasPatterns: {},
      recommendations: []
    };

    // Check if this is a React component file
    if (!content.includes('export') && !content.includes('function')) {
      analysis.status = 'Not a component';
      return analysis;
    }

    // Check for background gradients
    const hasGradientBg = content.includes('bg-gradient-to-br');
    const hasDarkGradient = content.includes('dark:from-background');
    
    if (hasGradientBg && !hasDarkGradient) {
      analysis.issues.push('Background gradient missing dark mode variants');
    } else if (hasGradientBg && hasDarkGradient) {
      analysis.score += 20;
    }

    // Check for text colors
    const hasTextGray = content.includes('text-gray-900') || content.includes('text-gray-600');
    const hasDarkText = content.includes('dark:text-white') || content.includes('dark:text-foreground');
    
    if (hasTextGray && !hasDarkText) {
      analysis.issues.push('Text colors missing dark mode variants');
    } else if (hasTextGray && hasDarkText) {
      analysis.score += 25;
    }

    // Check for card components
    const hasCards = content.includes('CardTitle') || content.includes('CardDescription');
    const hasCardDarkMode = content.includes('dark:text-white') && hasCards;
    
    if (hasCards && !hasCardDarkMode) {
      analysis.issues.push('Card components missing dark mode styling');
    } else if (hasCards && hasCardDarkMode) {
      analysis.score += 20;
    }

    // Check for links
    const hasLinks = content.includes('text-purple-600');
    const hasLinkDarkMode = content.includes('dark:text-purple-400');
    
    if (hasLinks && !hasLinkDarkMode) {
      analysis.issues.push('Links missing dark mode colors');
    } else if (hasLinks && hasLinkDarkMode) {
      analysis.score += 15;
    }

    // Check for loading states
    const hasLoading = content.includes('bg-gray-200');
    const hasLoadingDarkMode = content.includes('dark:bg-gray-700');
    
    if (hasLoading && !hasLoadingDarkMode) {
      analysis.issues.push('Loading states missing dark mode styling');
    } else if (hasLoading && hasLoadingDarkMode) {
      analysis.score += 10;
    }

    // Check for error states
    const hasErrors = content.includes('bg-red-50') || content.includes('text-red-600');
    const hasErrorDarkMode = content.includes('dark:bg-red-900') || content.includes('dark:text-red-400');
    
    if (hasErrors && !hasErrorDarkMode) {
      analysis.issues.push('Error states missing dark mode styling');
    } else if (hasErrors && hasErrorDarkMode) {
      analysis.score += 10;
    }

    // Determine status
    if (analysis.score >= 90) {
      analysis.status = '✅ Fully Consistent';
    } else if (analysis.score >= 70) {
      analysis.status = '🟡 Mostly Consistent';
    } else if (analysis.score >= 40) {
      analysis.status = '🟠 Needs Work';
    } else {
      analysis.status = '❌ Missing Dark Mode Support';
    }

    return analysis;
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n📊 LIGHT/DARK MODE CONSISTENCY REPORT');
    console.log('='.repeat(55));
    
    const total = this.results.compliant.length + this.results.needsWork.length + this.results.missing.length;
    
    console.log(`\n📈 Summary:`);
    console.log(`   Total files audited: ${total}`);
    console.log(`   ✅ Fully consistent: ${this.results.compliant.length} (${Math.round(this.results.compliant.length/total*100)}%)`);
    console.log(`   🟡 Needs work: ${this.results.needsWork.length} (${Math.round(this.results.needsWork.length/total*100)}%)`);
    console.log(`   ❌ Missing dark mode support: ${this.results.missing.length} (${Math.round(this.results.missing.length/total*100)}%)`);

    // Priority fixes
    console.log(`\n🚨 Priority Fixes Needed:`);
    this.results.missing.forEach(file => {
      console.log(`   - ${file.file} (Score: ${file.score}/100)`);
      file.issues.forEach(issue => {
        console.log(`     • ${issue}`);
      });
    });

    // Recommendations
    console.log(`\n💡 Recommendations:`);
    if (this.results.missing.length > 0) {
      console.log(`   1. Start with the ${this.results.missing.length} files missing dark mode support completely`);
    }
    if (this.results.needsWork.length > 0) {
      console.log(`   2. Improve the ${this.results.needsWork.length} files that are partially consistent`);
    }
    console.log(`   3. Refer to DARK_MODE_STANDARDS.md for implementation patterns`);
    console.log(`   4. Test all changes in both light and dark modes`);

    // Generate JSON report
    this.saveJSONReport();
  }

  // Save detailed JSON report
  saveJSONReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.compliant.length + this.results.needsWork.length + this.results.missing.length,
        compliant: this.results.compliant.length,
        needsWork: this.results.needsWork.length,
        missing: this.results.missing.length
      },
      details: {
        compliant: this.results.compliant,
        needsWork: this.results.needsWork,
        missing: this.results.missing
      }
    };

    const reportPath = 'light-dark-mode-consistency-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run the audit
if (require.main === module) {
  const auditor = new ModeConsistencyAuditor();
  auditor.auditAllPages().catch(console.error);
}

module.exports = ModeConsistencyAuditor; 