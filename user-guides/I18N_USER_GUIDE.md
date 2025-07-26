# Semantest Internationalization (i18n) User Guide

## Overview

Semantest provides comprehensive internationalization support for building applications that work seamlessly across 30+ languages and cultural contexts. This guide covers setup, configuration, implementation, and best practices for creating globally accessible applications.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Configuration](#configuration)
3. [Implementation Guide](#implementation-guide)
4. [Translation Management](#translation-management)
5. [Cultural Adaptation](#cultural-adaptation)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)

## Getting Started

### Supported Languages

**Tier 1 (Full UI + Documentation)**:
- English (en-US, en-GB, en-AU)
- Spanish (es-ES, es-MX, es-AR)
- French (fr-FR, fr-CA)
- German (de-DE, de-AT)
- Italian (it-IT)
- Portuguese (pt-BR, pt-PT)
- Japanese (ja-JP)
- Korean (ko-KR)
- Chinese (zh-CN, zh-TW)

**Tier 2 (UI Translation)**:
- Dutch (nl-NL)
- Russian (ru-RU)
- Arabic (ar-SA) - RTL support
- Hebrew (he-IL) - RTL support
- Hindi (hi-IN)
- Thai (th-TH)
- Vietnamese (vi-VN)
- Turkish (tr-TR)
- Polish (pl-PL)
- Swedish (sv-SE)
- Norwegian (no-NO)
- Danish (da-DK)
- Finnish (fi-FI)
- Czech (cs-CZ)
- Hungarian (hu-HU)
- Greek (el-GR)
- Ukrainian (uk-UA)
- Indonesian (id-ID)

### Prerequisites

- Semantest platform v2.0.0+
- Node.js 18+ for build tools
- Basic understanding of locale concepts

### Quick Setup

1. **Install i18n package**:
```bash
npm install @semantest/i18n
```

2. **Initialize i18n in your project**:
```bash
npx semantest-i18n init
```

3. **Configure basic settings**:
```javascript
// semantest.i18n.config.js
module.exports = {
  defaultLocale: 'en-US',
  locales: ['en-US', 'es-ES', 'fr-FR', 'de-DE'],
  translationDir: './translations',
  fallbackLocale: 'en-US'
};
```

## Configuration

### Basic Configuration

Create `semantest.i18n.config.js`:

```javascript
module.exports = {
  // Default locale for the application
  defaultLocale: 'en-US',
  
  // Supported locales
  locales: [
    'en-US', 'en-GB',
    'es-ES', 'es-MX',
    'fr-FR', 'fr-CA',
    'de-DE', 'de-AT',
    'it-IT',
    'pt-BR', 'pt-PT',
    'ja-JP',
    'ko-KR',
    'zh-CN', 'zh-TW'
  ],
  
  // Fallback locale when translation is missing
  fallbackLocale: 'en-US',
  
  // Translation files directory
  translationDir: './translations',
  
  // Namespace configuration
  namespaces: ['common', 'ui', 'errors', 'validation'],
  defaultNamespace: 'common',
  
  // RTL languages
  rtlLocales: ['ar-SA', 'he-IL'],
  
  // Formatting options
  formatting: {
    currency: {
      style: 'currency',
      minimumFractionDigits: 2
    },
    date: {
      dateStyle: 'medium',
      timeStyle: 'short'
    },
    number: {
      style: 'decimal',
      maximumFractionDigits: 2
    }
  },
  
  // Development options
  debug: process.env.NODE_ENV === 'development',
  missingKeyHandler: 'warn', // 'error', 'warn', 'ignore'
  
  // Build options
  build: {
    extractKeys: true,
    generateTypes: true,
    optimizeBundle: true
  }
};
```

### Environment-Specific Configuration

#### Development

```javascript
// semantest.i18n.dev.js
module.exports = {
  debug: true,
  missingKeyHandler: 'warn',
  hotReload: true,
  pseudoLocalization: true, // For testing
  translationCoverage: true
};
```

#### Production

```javascript
// semantest.i18n.prod.js
module.exports = {
  debug: false,
  missingKeyHandler: 'ignore',
  compression: true,
  lazyLoading: true,
  caching: {
    enabled: true,
    ttl: 3600000 // 1 hour
  }
};
```

### Framework Integration

#### React Configuration

```javascript
// src/i18n/config.js
import { initI18n } from '@semantest/i18n-react';

export const i18n = initI18n({
  locale: 'en-US',
  resources: {
    'en-US': () => import('./translations/en-US.json'),
    'es-ES': () => import('./translations/es-ES.json'),
    'fr-FR': () => import('./translations/fr-FR.json')
  },
  interpolation: {
    escapeValue: false // React already escapes
  }
});
```

#### Vue Configuration

```javascript
// src/i18n/config.js
import { createI18n } from '@semantest/i18n-vue';

export const i18n = createI18n({
  legacy: false,
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages: {
    'en-US': require('./translations/en-US.json'),
    'es-ES': require('./translations/es-ES.json'),
    'fr-FR': require('./translations/fr-FR.json')
  }
});
```

#### Angular Configuration

```typescript
// src/app/i18n/config.ts
import { NgModule } from '@angular/core';
import { SemantestI18nModule } from '@semantest/i18n-angular';

@NgModule({
  imports: [
    SemantestI18nModule.forRoot({
      defaultLocale: 'en-US',
      supportedLocales: ['en-US', 'es-ES', 'fr-FR'],
      translationLoader: {
        provide: TranslationLoader,
        useClass: HttpTranslationLoader
      }
    })
  ]
})
export class I18nModule {}
```

## Implementation Guide

### Basic Usage

#### React Implementation

```jsx
import { useTranslation } from '@semantest/i18n-react';

function WelcomeComponent() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.description', { name: 'User' })}</p>
      
      <select onChange={(e) => changeLanguage(e.target.value)}>
        <option value="en-US">English</option>
        <option value="es-ES">Español</option>
        <option value="fr-FR">Français</option>
      </select>
    </div>
  );
}
```

#### Vue Implementation

```vue
<template>
  <div>
    <h1>{{ $t('welcome.title') }}</h1>
    <p>{{ $t('welcome.description', { name: 'User' }) }}</p>
    
    <select @change="changeLanguage">
      <option value="en-US">English</option>
      <option value="es-ES">Español</option>
      <option value="fr-FR">Français</option>
    </select>
  </div>
</template>

<script>
export default {
  methods: {
    changeLanguage(event) {
      this.$i18n.locale = event.target.value;
    }
  }
};
</script>
```

#### Angular Implementation

```typescript
import { Component } from '@angular/core';
import { SemantestI18nService } from '@semantest/i18n-angular';

@Component({
  selector: 'app-welcome',
  template: `
    <div>
      <h1>{{ 'welcome.title' | translate }}</h1>
      <p>{{ 'welcome.description' | translate: { name: 'User' } }}</p>
      
      <select (change)="changeLanguage($event)">
        <option value="en-US">English</option>
        <option value="es-ES">Español</option>
        <option value="fr-FR">Français</option>
      </select>
    </div>
  `
})
export class WelcomeComponent {
  constructor(private i18n: SemantestI18nService) {}

  changeLanguage(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.i18n.setLocale(target.value);
  }
}
```

### Translation Keys and Structure

#### Basic Translation File Structure

```json
{
  "common": {
    "buttons": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit"
    },
    "messages": {
      "loading": "Loading...",
      "error": "An error occurred",
      "success": "Operation completed successfully"
    }
  },
  "navigation": {
    "home": "Home",
    "dashboard": "Dashboard",
    "settings": "Settings",
    "profile": "Profile"
  },
  "forms": {
    "labels": {
      "name": "Name",
      "email": "Email",
      "password": "Password",
      "confirmPassword": "Confirm Password"
    },
    "placeholders": {
      "enterName": "Enter your name",
      "enterEmail": "Enter your email address"
    },
    "validation": {
      "required": "This field is required",
      "email": "Please enter a valid email address",
      "minLength": "Must be at least {{count}} characters"
    }
  }
}
```

#### Advanced Features

**Interpolation**:
```json
{
  "greeting": "Hello {{name}}, welcome to {{appName}}!",
  "itemCount": "You have {{count}} item",
  "itemCount_plural": "You have {{count}} items"
}
```

**Pluralization**:
```json
{
  "notification": "{{count}} notification",
  "notification_plural": "{{count}} notifications",
  "notification_zero": "No notifications"
}
```

**Context-based translations**:
```json
{
  "friend": "Friend",
  "friend_male": "Male friend",
  "friend_female": "Female friend"
}
```

### Formatting and Localization

#### Date and Time Formatting

```javascript
import { formatDate, formatTime, formatDateTime } from '@semantest/i18n';

// Date formatting
const formattedDate = formatDate(new Date(), 'en-US'); // "01/18/2025"
const formattedDateES = formatDate(new Date(), 'es-ES'); // "18/01/2025"

// Time formatting
const formattedTime = formatTime(new Date(), 'en-US'); // "2:30 PM"
const formattedTime24 = formatTime(new Date(), 'de-DE'); // "14:30"

// Relative time
const relativeTime = formatRelativeTime(-1, 'day', 'en-US'); // "1 day ago"
```

#### Number and Currency Formatting

```javascript
import { formatNumber, formatCurrency } from '@semantest/i18n';

// Number formatting
const number = formatNumber(1234.56, 'en-US'); // "1,234.56"
const numberDE = formatNumber(1234.56, 'de-DE'); // "1.234,56"

// Currency formatting
const price = formatCurrency(99.99, 'USD', 'en-US'); // "$99.99"
const priceEUR = formatCurrency(99.99, 'EUR', 'de-DE'); // "99,99 €"

// Percentage
const percentage = formatPercent(0.856, 'en-US'); // "85.6%"
```

### Dynamic Language Switching

```javascript
import { I18nProvider, useI18n } from '@semantest/i18n-react';

function LanguageSwitcher() {
  const { locale, setLocale, availableLocales } = useI18n();

  return (
    <div className="language-switcher">
      {availableLocales.map(lng => (
        <button
          key={lng}
          onClick={() => setLocale(lng)}
          className={locale === lng ? 'active' : ''}
        >
          {getLanguageName(lng)}
        </button>
      ))}
    </div>
  );
}

function getLanguageName(locale) {
  const names = {
    'en-US': 'English (US)',
    'es-ES': 'Español',
    'fr-FR': 'Français',
    'de-DE': 'Deutsch',
    'ja-JP': '日本語',
    'ko-KR': '한국어',
    'zh-CN': '中文 (简体)',
    'ar-SA': 'العربية'
  };
  return names[locale] || locale;
}
```

## Translation Management

### Translation Workflow

#### 1. Key Extraction

```bash
# Extract translation keys from source code
npx semantest-i18n extract

# Extract with specific patterns
npx semantest-i18n extract --pattern "src/**/*.{js,jsx,ts,tsx}"

# Extract and update existing files
npx semantest-i18n extract --update
```

#### 2. Translation File Management

```bash
# Generate missing translation files
npx semantest-i18n generate-files

# Validate translation completeness
npx semantest-i18n validate

# Find missing translations
npx semantest-i18n missing --locale es-ES

# Sync translations across locales
npx semantest-i18n sync
```

#### 3. Professional Translation Integration

```javascript
// Translation service integration
const translationConfig = {
  service: 'google-translate', // or 'deepl', 'aws-translate'
  apiKey: process.env.TRANSLATION_API_KEY,
  targetLocales: ['es-ES', 'fr-FR', 'de-DE'],
  sourceLocale: 'en-US'
};

// Auto-translate missing keys
npx semantest-i18n auto-translate --config translation.config.js
```

### Translation Tools

#### Web-based Translation Editor

Access the translation editor at `https://translate.semantest.com`:

- **Visual Context**: See translations in context
- **Collaborative Editing**: Multiple translators
- **Translation Memory**: Reuse previous translations
- **Quality Assurance**: Built-in checks
- **Approval Workflow**: Review and approve changes

#### CLI Tools

```bash
# Interactive translation mode
npx semantest-i18n translate --interactive

# Bulk translate from CSV
npx semantest-i18n import --format csv --file translations.csv

# Export for external translation
npx semantest-i18n export --format xliff --locale all
```

### Translation Quality Assurance

#### Automated Checks

```javascript
// Quality check configuration
const qaConfig = {
  checks: [
    'missingTranslations',
    'unusedKeys',
    'consistencyCheck',
    'placeholderValidation',
    'lengthValidation',
    'htmlTagValidation'
  ],
  rules: {
    maxLength: {
      'ui.button.*': 20,
      'ui.title.*': 60
    },
    requiredPlaceholders: {
      'messages.welcome': ['name']
    }
  }
};

// Run quality checks
npx semantest-i18n qa --config qa.config.js
```

## Cultural Adaptation

### Right-to-Left (RTL) Support

#### CSS Configuration

```css
/* Auto RTL support */
html[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

/* RTL-specific styles */
.container {
  margin-left: 20px;
}

html[dir="rtl"] .container {
  margin-left: 0;
  margin-right: 20px;
}

/* Using logical properties (recommended) */
.modern-container {
  margin-inline-start: 20px;
  padding-inline: 16px;
  border-inline-start: 1px solid #ccc;
}
```

#### JavaScript RTL Detection

```javascript
import { isRTL, getDirection } from '@semantest/i18n';

function Layout({ children }) {
  const { locale } = useI18n();
  const direction = getDirection(locale);
  
  return (
    <div dir={direction} className={`layout layout--${direction}`}>
      {children}
    </div>
  );
}

// Check if current locale is RTL
if (isRTL(locale)) {
  // Apply RTL-specific logic
}
```

### Cultural Color Meanings

```javascript
// Cultural color configuration
const culturalColors = {
  'zh-CN': {
    success: '#ff4444', // Red for luck/success
    warning: '#ffd700', // Gold for prosperity
    danger: '#000000'   // Black for seriousness
  },
  'ja-JP': {
    success: '#ff69b4', // Pink for spring/renewal
    warning: '#ffa500', // Orange for attention
    danger: '#8b0000'   // Dark red for danger
  },
  'ar-SA': {
    success: '#228b22', // Green for nature/peace
    warning: '#ff8c00', // Orange for caution
    danger: '#dc143c'   // Crimson for danger
  }
};

// Apply cultural colors
function getCulturalColor(color, locale) {
  return culturalColors[locale]?.[color] || defaultColors[color];
}
```

### Date and Calendar Systems

```javascript
import { formatDate, getCalendarSystem } from '@semantest/i18n';

// Different calendar systems
const dateFormatters = {
  'ar-SA': new Intl.DateTimeFormat('ar-SA', { 
    calendar: 'islamic',
    dateStyle: 'full'
  }),
  'th-TH': new Intl.DateTimeFormat('th-TH', {
    calendar: 'buddhist',
    dateStyle: 'full'
  }),
  'he-IL': new Intl.DateTimeFormat('he-IL', {
    calendar: 'hebrew',
    dateStyle: 'full'
  })
};

// Format date according to cultural calendar
function formatCulturalDate(date, locale) {
  const formatter = dateFormatters[locale] || 
    new Intl.DateTimeFormat(locale);
  return formatter.format(date);
}
```

### Regional Number Formats

```javascript
// Number formatting by region
const numberFormats = {
  'en-US': { decimal: '.', thousands: ',' },
  'de-DE': { decimal: ',', thousands: '.' },
  'fr-FR': { decimal: ',', thousands: ' ' },
  'hi-IN': { 
    decimal: '.', 
    thousands: ',',
    numbering: 'indian' // Lakh/Crore system
  }
};

// Format numbers culturally
function formatCulturalNumber(number, locale) {
  return new Intl.NumberFormat(locale).format(number);
}
```

## API Reference

### Core I18n Class

```typescript
class SemantestI18n {
  constructor(config: I18nConfig);
  
  // Locale management
  setLocale(locale: string): Promise<void>;
  getLocale(): string;
  getAvailableLocales(): string[];
  
  // Translation
  t(key: string, options?: TranslationOptions): string;
  exists(key: string): boolean;
  
  // Formatting
  formatDate(date: Date, options?: DateFormatOptions): string;
  formatNumber(number: number, options?: NumberFormatOptions): string;
  formatCurrency(amount: number, currency: string, options?: CurrencyFormatOptions): string;
  
  // Events
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
}
```

### Configuration Interface

```typescript
interface I18nConfig {
  defaultLocale: string;
  locales: string[];
  fallbackLocale?: string;
  translationDir?: string;
  namespaces?: string[];
  defaultNamespace?: string;
  rtlLocales?: string[];
  formatting?: FormattingConfig;
  debug?: boolean;
  missingKeyHandler?: 'error' | 'warn' | 'ignore';
}

interface FormattingConfig {
  currency?: Intl.NumberFormatOptions;
  date?: Intl.DateTimeFormatOptions;
  number?: Intl.NumberFormatOptions;
}
```

### Translation Options

```typescript
interface TranslationOptions {
  count?: number;
  context?: string;
  defaultValue?: string;
  interpolation?: Record<string, any>;
  namespace?: string;
}
```

### React Hooks

```typescript
// useTranslation hook
function useTranslation(namespace?: string): {
  t: (key: string, options?: TranslationOptions) => string;
  i18n: SemantestI18n;
  ready: boolean;
};

// useI18n hook
function useI18n(): {
  locale: string;
  setLocale: (locale: string) => Promise<void>;
  availableLocales: string[];
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
};
```

## Troubleshooting

### Common Issues

#### Missing Translations

**Issue**: Key not found warnings in console

**Solution**:
```bash
# Check for missing keys
npx semantest-i18n missing --locale es-ES

# Generate placeholder translations
npx semantest-i18n generate-placeholders --locale es-ES

# Auto-translate missing keys
npx semantest-i18n auto-translate --locale es-ES
```

#### Bundle Size Issues

**Issue**: Large bundle size with multiple locales

**Solution**:
```javascript
// Enable lazy loading
const i18nConfig = {
  lazyLoading: true,
  loadPath: '/locales/{{lng}}/{{ns}}.json',
  
  // Split by namespace
  namespaces: ['common', 'ui', 'errors'],
  
  // Optimize bundle
  build: {
    optimizeBundle: true,
    removeUnused: true
  }
};
```

#### RTL Layout Issues

**Issue**: Layout breaks in RTL languages

**Solution**:
```css
/* Use logical properties */
.element {
  margin-inline-start: 10px; /* Instead of margin-left */
  padding-inline: 20px;      /* Instead of padding-left/right */
  border-inline-start: 1px solid #ccc; /* Instead of border-left */
}

/* RTL-specific overrides */
html[dir="rtl"] .custom-element {
  transform: scaleX(-1); /* Flip icons/images */
}
```

#### Performance Issues

**Issue**: Slow initial load with translations

**Solution**:
```javascript
// Preload critical translations
const criticalTranslations = ['common.buttons', 'navigation'];

// Use webpack magic comments for chunking
const loadTranslations = (locale) => 
  import(/* webpackChunkName: "locale-[request]" */ `./locales/${locale}.json`);

// Implement caching
const i18nConfig = {
  caching: {
    enabled: true,
    ttl: 3600000, // 1 hour
    storage: 'localStorage'
  }
};
```

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| I18N001 | Invalid locale format | Use valid locale codes (e.g., 'en-US') |
| I18N002 | Translation file not found | Check file path and naming convention |
| I18N003 | Malformed translation JSON | Validate JSON syntax |
| I18N004 | Missing interpolation value | Provide all required interpolation values |
| I18N005 | Circular reference in fallback | Check fallback locale configuration |
| I18N006 | Unsupported plural rule | Check plural rules for the locale |
| I18N007 | Invalid namespace | Verify namespace exists and is loaded |

### Performance Optimization

1. **Lazy Loading**:
```javascript
// Load translations on demand
const i18n = new SemantestI18n({
  lazyLoading: true,
  preload: ['en-US'], // Preload default only
});
```

2. **Translation Splitting**:
```javascript
// Split by feature/page
const translations = {
  common: () => import('./common.json'),
  dashboard: () => import('./dashboard.json'),
  settings: () => import('./settings.json')
};
```

3. **Caching**:
```javascript
// Enable browser caching
const i18n = new SemantestI18n({
  caching: {
    enabled: true,
    storage: 'localStorage',
    ttl: 24 * 60 * 60 * 1000 // 24 hours
  }
});
```

### Best Practices

1. **Key Organization**:
   - Use hierarchical keys
   - Group by feature/component
   - Keep keys descriptive but concise

2. **Translation Quality**:
   - Use professional translators
   - Implement review workflows
   - Test in target locales

3. **Performance**:
   - Lazy load translations
   - Split by namespace/feature
   - Implement caching strategies

4. **Accessibility**:
   - Support screen readers
   - Proper RTL implementation
   - Cultural color considerations

### Getting Help

1. **Documentation**: https://docs.semantest.com/i18n
2. **Community Forum**: https://community.semantest.com/i18n
3. **GitHub Issues**: https://github.com/semantest/i18n/issues
4. **Translation Services**: https://translate.semantest.com
5. **Support Email**: i18n-support@semantest.com

---

**Last Updated**: January 18, 2025  
**Version**: 1.0.0  
**Maintainer**: Semantest Internationalization Team