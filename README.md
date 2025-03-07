# Zeuz Trading

## Project Description

Zeuz Trading is a web application developed using Next.js with TypeScript. The project supports Server-Side Rendering (SSR), strict typing, and offers a convenient development environment thanks to the integration of linters and modern tools.

## Installation and Launch

### Installing Dependencies

```bash
npm install
```

### Launch Scripts

**Start in Development Mode:**

```bash
npm run dev
```

**Build the Project:**

```bash
npm run build
```

**Run Production Server:**

```bash
npm run build:prod
```

### Running Linters

**JavaScript/TypeScript Check:**

```bash
npm run lint
```

**SCSS Check:**

```bash
npm run lint:styles
```

## Project Structure

### Main Directories

- `/src/app`: Main components of the application and provider settings.
- `/src/shared`: Shared modules, styles, storage, and utilities.
- `/public`: Public files accessible via direct links (e.g., images, favicon).

### Configuration Files

- `.eslintrc.json`: ESLint configuration for code checking (JavaScript/TypeScript) using Prettier.
- `.stylelintrc.json`: Stylelint configuration for SCSS styles, including property order and constraints.
- `commitlint.config.js`: Commit message verification to meet standards.
- `next-sitemap.config.js`: Sitemap generation for SEO.
- `tsconfig.json`: TypeScript configuration for strict typing and support for modern JavaScript features.

## Technologies

### Dependencies

- **React and Next.js**: Main stack for interface development.
- **React Query and Zustand**: State management.
- **TypeScript**: Strict typing.
- **Stylelint and ESLint**: Code quality checking.

### DevDependencies

- **Husky**: Pre-commit scripts.
- **Lint-staged**: Checks modified files before committing.
- **Commitizen**: Creates standardized commit messages.

## Linting and Formatting

### JavaScript/TypeScript Linting

ESLint configuration is located in `.eslintrc.json`.

**Main Rules:** Prettier, TypeScript ESLint.

**Auto-fix:**

```bash
npm run lint:fix
```

### SCSS Linting

Stylelint configuration is located in `.stylelintrc.json`.

**Check and Auto-fix:**

```bash
npm run lint:styles:fix
```

## Branch and Commit Conventions

### Commit Format

Using Commitlint with the configuration:

```json
{
  "commitlint": {
    "extends": ["@commitlint/config-conventional"]
  }
}
```

**Example:**

```bash
fix: fixed a bug in the component
```

### Branch Names

Configuration of validate-branch-name.

**Allowed Patterns:**

- `feature/feature-info`
- `fix/fix-info`
- `release/1.0.0`

**Examples:**

- `chores/cleanup`
- `feature/new-component`

## Environment Settings

### Environment Variables

File `.env.local`:

- `NEXT_PUBLIC_NODE_ENV`: runtime environment (e.g., development, production).
- **API Keys**: Specify your API keys here.

### Sitemap Generation

File: `next-sitemap.config.js`.

- In production mode, uses URL: `https://app.zeuz.trade`.
- For development: `http://localhost:3000`.

## Contributing

If you wish to contribute to the project, please follow these steps:

1. Fork the repository.
2. Create a branch with a descriptive name (`feature/my-new-feature`).
3. Make commits that adhere to the commit message standards.
4. Submit a Pull Request for review.

# test-z

# test-z

# test-z

# test-z
