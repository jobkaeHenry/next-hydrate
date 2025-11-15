# next-hydrate Documentation

This is the official documentation site for `next-hydrate`, built with Gatsby.

## Features

- 📚 Comprehensive documentation
- 🌍 **Multi-language support**: English, Korean, Chinese, Japanese, French, Spanish, Arabic, Hindi
- 🎨 Modern, responsive design
- 🔍 Syntax highlighting for code examples
- 📱 Mobile-optimized

## Development

```bash
npm install
npm run dev
```

Visit http://localhost:8000 to view the site.

## Build

```bash
npm run build
```

## Deploy

The built site will be in the `public/` directory, ready to be deployed to any static hosting service.

## Internationalization (i18n)

The documentation site supports 8 languages:

- 🇬🇧 English (en)
- 🇰🇷 한국어 (ko)
- 🇨🇳 中文 (zh)
- 🇯🇵 日本語 (ja)
- 🇫🇷 Français (fr)
- 🇪🇸 Español (es)
- 🇸🇦 العربية (ar)
- 🇮🇳 हिन्दी (hi)

### Adding Translations

1. Add translation strings to `/locales/{language}/translation.json`
2. Add documentation-specific translations to `/locales/{language}/docs.json`
3. The language switcher will automatically detect and display available languages

## Structure

- `/src/pages/` - Page components
- `/src/components/` - Reusable components
- `/src/templates/` - Page templates
- `/src/styles/` - CSS stylesheets
- `/content/` - MDX documentation files
- `/locales/` - i18n translation files

## Technology Stack

- **Gatsby** - Static site generator
- **React** - UI library
- **gatsby-plugin-react-i18next** - Internationalization
- **MDX** - Markdown with JSX support
- **Prism.js** - Syntax highlighting
