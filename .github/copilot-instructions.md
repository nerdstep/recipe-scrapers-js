# Copilot Instructions for Recipe Scrapers JS

You are helping with a TypeScript project that scrapes recipe data from various cooking websites. The project extracts structured recipe information from HTML pages using multiple extraction methods.

## Project Structure
```
recipe-scrapers-js/
├── src/
|   ├── **/__tests__/    # Test files
│   ├── extractors/      # Site-specific extractors
│   ├── plugins/         # Generic extraction plugins (JSON-LD, microdata, etc.)
|   ├── types/           # TypeScript types    
│   ├── utils/           # Utility functions
│   └── index.js         # Main entry point
└── test-data/           # HTML files and expected JSON outputs for testing     
```

## Key Technologies

- **Bun** for development and testing
- **Cheerio** for HTML parsing and DOM manipulation

## TypeScript Rules

### Strict Type Safety

- **Never use non-null assertions (!)**
- **Never use `any`** - Use proper types, unions, or `unknown` instead
- **Avoid type casting** unless absolutely necessary and safe
- Use **type guards** for runtime type checking instead of casting
- Prefer **union types** over loose typing: `string | number` not `any`

## Code Patterns

### Extraction Methods

1. **JSON-LD**: Extract from `<script type="application/ld+json">` tags
2. **Microdata**: Parse HTML microdata attributes (`itemprop`)
3. **OpenGraph**: Parse OpenGraph meta tags (`og:site_name`)
3. **Site-specific**: Custom extractors for each cooking website

### Expected Output Format

Reference `RecipeObject` from `src/types/recipe.interface.ts`

## Testing Guidelines

- Use Bun for unit tests
- Prefer `it` style test syntax
- Place test files in `__tests__/` directory with `.test.ts` suffix
- Test data goes in `test-data/[sitename]/` with `.testhtml` and `.json` files
- Mock external dependencies when needed

## Common Tasks

### Adding New Site Scraper

1. Create `src/scrapers/[sitename].ts`
2. Export class extending `AbstractScraper`
3. Add test data in `test-data/[sitename]/`

## Code Style

- Prefer native Bun APIs over Node.js APIs
- Use the latest ECMAScript (ESM) features
- User `import`/`export` instead of `require`
- Use `const`/`let` instead of `var`
- Prefer template literals for string interpolation
- Use destructuring for object/array assignments
- Add JSDoc comments for public functions
- Handle errors gracefully with try/catch

When suggesting code changes:
- Prioritize maintainability and readability
- Include error handling
- Add tests for new functionality
- Follow existing project patterns
- Use meaningful variable names
