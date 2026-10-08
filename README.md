# MacroCalculators.com

Next.js 15 App Router, static-first, MDX-driven calculator SEO site.

## Setup (run this yourself — no network access was available when
## this scaffold was generated, so dependencies aren't installed)

```
npm install
npm run dev
```

Then open http://localhost:3000

## Contact form email

The contact form sends messages through Resend. Configure these server-side environment variables before using it:

```
RESEND_API_KEY=re_your_api_key
CONTACT_FROM_EMAIL=MacroCalculators <contact@your-verified-domain.com>
CONTACT_TO_EMAIL=macrocalculatorss@gmail.com
```

Verify the sender domain with Resend before setting `CONTACT_FROM_EMAIL`. The recipient defaults to `macrocalculatorss@gmail.com` if `CONTACT_TO_EMAIL` is omitted. Do not expose the Resend API key in a `NEXT_PUBLIC_` variable.

## Adding a new calculator (the only 3 steps, per the master prompt)

1. Add an entry to `src/data/calculators.ts`
2. Create `src/content/calculators/<slug>.mdx` (frontmatter + FAQ/body)
3. Create `src/lib/calculators/<slug>.ts` (the formula logic)

The nav, `/calculators` hub, sitemap, and page route all update
automatically — no other file needs to change.

## Adding a guide / food / glossary entry

Just drop a new `.mdx` file into the matching `src/content/` folder.
Frontmatter (`title`, `description`, `slug`) is read directly — there's
no separate data file to keep in sync.

## Known gaps to finish before shipping

- `getContent()` returns raw MDX text; wire up `@next/mdx` or
  `next-mdx-remote` compilation where the templates say
  `{/* render entry.content via MDX compiler */}`
- Only the macro-calculator formula is wired into `CalculatorWidget`;
  other calculatorTypes (TDEE, protein, body fat, 1RM) need their own
  widget variant, selected by `entry.calculatorType`
- Swap the placeholder `https://macrocalculators.com` domain in
  `lib/seo.ts`, `app/sitemap.ts`, and `app/robots.ts` if it changes
- Add Google Fonts (Space Grotesk, Public Sans) via `next/font` in
  `app/layout.tsx` — not wired yet, currently falls back to system fonts
- Run `npm install` to generate `package-lock.json` before deploying
