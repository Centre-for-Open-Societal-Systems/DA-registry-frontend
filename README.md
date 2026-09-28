This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Tech Stack

### Core framework
- **[Next.js](https://nextjs.org) 16.3.5** — App Router (`src/app`), with route groups `(auth)` and `(dashboard)`
- **[React](https://react.dev) 19.2.8** + React DOM
- **[TypeScript](https://www.typescriptlang.org) 5**

### Styling
- **[Tailwind CSS](https://tailwindcss.com) v4** — imported in `src/app/globals.css`; brand tokens (e.g. `--color-brand-green`, `--color-brand-gold`) are defined via `@theme inline`
- **PostCSS** via `@tailwindcss/postcss`
- **[clsx](https://github.com/lukeed/clsx)** + **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** for conditional / merged class names
- Plain CSS for small custom pieces (e.g. the green scrollbar in `globals.css`)
- Markup is written as JSX/TSX — there are no standalone `.html` files

### State management
- **[Zustand](https://zustand.docs.pmnd.rs) 5** for global state (`src/store`)
- React Context for scoped state (`src/contexts`)

### Tooling
- **ESLint 9** with `eslint-config-next`
- Fonts loaded through `next/font` (Inter and Geist Mono)

### Not yet in the project
- Backend / API layer (`src/app/api` route handlers and `src/proxy.ts` are not scaffolded yet)
- UI component library — components in `src/components/ui` are hand-built
- Data-fetching, form, or testing libraries

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
