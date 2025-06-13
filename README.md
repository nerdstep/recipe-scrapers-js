# Recipe Scrapers JS

[![npm version](https://img.shields.io/npm/v/recipe-scrapers-js.svg?style=flat-square)](https://www.npmjs.com/package/recipe-scrapers-js)
[![build](https://img.shields.io/github/actions/workflow/status/nerdstep/recipe-scrapers-js/ci.yml?branch=main&style=flat-square)](https://github.com/nerdstep/recipe-scrapers-js/actions)
[![license](https://img.shields.io/npm/l/recipe-scrapers-js.svg?style=flat-square)](LICENSE)

> **⚠️ Alpha Version**  
> This library is currently in **alpha**, APIs and behavior may change without notice. Use at your own risk.

A TypeScript/JavaScript library for scraping recipe data from various cooking websites. This is a JavaScript port inspired by the Python [recipe-scrapers](https://github.com/hhursev/recipe-scrapers) library.

## Features

- 🍳 Extract structured recipe data from cooking websites
- 🔍 Support for multiple popular recipe sites
- 🚀 Built with TypeScript for better developer experience
- ⚡ Fast and lightweight using Bun runtime for development and testing
- 🧪 Comprehensive test coverage

## Installation

```bash
npm install recipe-scrapers-js
# or
yarn add recipe-scrapers-js
# or
pnpm add recipe-scrapers-js
# or
bun add recipe-scrapers-js
```

## Usage

### Basic Usage

```typescript
import { getScraper } from 'recipe-scrapers-js'

const html = `<html>The html to scrape...</html>`

// Get a scraper for a specific URL
// This function will throw if a scraper does not exist.
const scraper = getScraper(html, 'https://allrecipes.com/recipe/example')

const recipe = await scraper.toObject()
  
console.log(recipe)
```

## Supported Sites

This library supports recipe extraction from various popular cooking websites. The scraper automatically detects the appropriate parser based on the URL.

## Development

### Prerequisites

- [Bun](https://bun.sh/) (latest version)
- Node.js 18+ (for compatibility)

### Setup

```bash
# Clone the repository
git clone https://github.com/nerdstep/recipe-scrapers-js.git
cd recipe-scrapers

# Install dependencies
bun install

# Fetch test data
bun run test:data

# Run tests
bun test

# Build the project
bun run build
```

### Scripts

- `bun run build` - Build the library for distribution
- `bun test` - Run the test suite
- `bun run test:coverage` - Run tests with coverage report
- `bun run test:data` - Fetch test data from the original Python repository
- `bun run lint` - Run linting and type checking
- `bun run lint:fix` - Fix linting issues automatically

### Adding New Scrapers

1. Create a new scraper class extending `AbstractScraper`
2. Implement the required methods for data extraction
3. Add the scraper to the scrapers registry
4. Write tests using the test data
5. Update documentation as needed

```typescript
import { AbstractScraper } from './abstract-scraper'
import type { RecipeFields } from '@/types/recipe.interface'

export class NewSiteScraper extends AbstractScraper {
  static host() {
    return 'www.newsite.com'
  }

  extractors = {
    ingredients: this.extractIngredients.bind(this),
  }

  protected extractIngredients(): RecipeFields['ingredients'] {
    const items = this.$('.ingredient').map((_, el) =>
      this.$(el).text().trim()
    ).get()

    return new Set(items)
  }
  
  // ... implement other extraction methods
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

The project uses test data from the original Python recipe-scrapers repository to ensure compatibility and accuracy. Tests are written using Bun's built-in test runner.

```bash
# Run all tests
bun test

# Run tests with coverage
bun run test:coverage
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Original [recipe-scrapers](https://github.com/hhursev/recipe-scrapers) Python library by [hhursev](https://github.com/hhursev)
- [Schema.org Recipe specification](https://schema.org/Recipe)
- [Cheerio](https://cheerio.js.org/) for HTML parsing

## Copyright and Usage

_**This library is for educational and personal use. Please respect the robots.txt files and terms of service of the websites you scrape.**_
