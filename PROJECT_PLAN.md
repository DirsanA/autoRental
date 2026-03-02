## Project Objective

Design and implement a production-grade SaaS marketing site for an auto rental platform, with a premium, developer-friendly aesthetic inspired structurally by Cursor AI and Stripe. The landing page should feel intentional, high-end, and scalable, serving as the foundation for future product areas (dashboard, docs, pricing, auth) without requiring major rewrites to layout or design tokens.

---

## Design Philosophy

### Elements Inspired by Cursor
- **Modern minimal aesthetic**: Low-noise interface, restrained color usage, and emphasis on content and structure over decoration.
- **Developer-focused feel**: Layouts that foreground product UI (mock dashboard, code-like elements, data visualizations) and clearly explain workflows.
- **Strong hero impact**: Large hero with confident typography, clear value proposition, and immediate context of “what the product looks like”.
- **Clarity in hierarchy**: Distinct separation between primary message, supporting copy, and tertiary details.

### Elements Inspired by Stripe
- **Premium whitespace discipline**: Generous negative space, precise vertical rhythm, and careful line lengths for maximum legibility.
- **Asymmetric layout sophistication**: Alternating and offset grids, staggered cards, and overlapping elements that feel intentional, not chaotic.
- **Alternating content rhythm**: Sequences of sections that shift background tone, grid alignment, and visual weight to avoid monotonous stacking.
- **Large-scale typography clarity**: Clear scaling of headings and body text, with comfortable line height and strong contrast.
- **Grid precision**: Strict use of column and container systems, aligning sections and components to the same underlying grid.

### Unified Cohesive Approach
- Use **one consistent design system** (shadcn tokens + Tailwind utilities) with:
  - A single container width and spacing scale
  - A unified typography ramp and consistent heading behavior
  - Background tone shifts (`background`, `muted`, `card`) for rhythm
- Cursor-inspired **developer/product storytelling** layered on top of a Stripe-inspired **layout and rhythm system**, ensuring the result looks unique but clearly premium.

---

## Layout System Strategy

- **Base layout**:
  - Root wrapper uses an app-wide background pattern (`BackgroundPattern1`) with semantic tokens (`bg-background`, `bg-muted`, `bg-card`) layered for sections.
  - `Navbar` is fixed and independent from section layout, using the same container width.
  - Main content uses a central `SectionContainer` for each vertical section.
- **Section composition**:
  - Each section is a **section component** that:
    - Wraps content in `SectionContainer`
    - Applies background tone (`bg-background`, `bg-muted`, `bg-card`) if needed via parent wrapper
  - Use dedicated layout helpers (e.g., `SplitSection`, `FeatureGrid`) for repeated patterns.
- **Grid system**:
  - 12-column mental model but implemented via Tailwind responsive grid utilities:
    - Typical patterns:
      - 1-col on mobile, 2-col on `md+` (`grid-cols-1 md:grid-cols-2`)
      - 3-col feature grids (`md:grid-cols-3`)
    - Align important content (headers, CTAs) to the same column start across sections for continuity.

---

## Spacing Scale Definition

- **Base scale**: 4px base increments, expressed through Tailwind’s default spacing with an 8px “macro” mindset.
  - XS: `4` (16px) – small gaps, compact badges, minor offsets
  - S: `6` (24px) – default gaps between text blocks
  - M: `8` (32px) – base vertical spacing between subsections
  - L: `10` (40px) – section internal padding
  - XL: `16` (64px) – large section vertical padding on desktop
  - XXL: `20` (80px+) – hero padding and large rhythm breaks
- **Rules**:
  - Section vertical padding:
    - Mobile: `py-12`–`py-16`
    - Desktop: `py-20`–`py-24`
  - Vertical spacing within sections:
    - Headline to body: `space-y-3`–`space-y-4`
    - Between major rows (e.g., heading vs grid): `mt-8`–`mt-10`
  - Maintain consistent **top padding under fixed navbar** in hero to avoid overlap (`pt-32`+ on hero).

---

## Typography Scale

- **Font families**:
  - Sans: Geist (already configured as `--font-geist-sans`)
  - Mono: Geist Mono for any code-like or numeric emphasis if needed.
- **Scale** (approximate, adjusted for Tailwind classes):
  - Display (hero): `text-4xl md:text-5xl lg:text-6xl`
  - Section H2: `text-2xl md:text-3xl`
  - Subheading: `text-lg md:text-xl`
  - Body: `text-sm md:text-base`
  - Caption/meta: `text-xs md:text-sm`
- **Hierarchy rules**:
  - Only one true “display” element per page (hero h1).
  - Section headings all use the same H2 style to maintain rhythm.
  - Line-length targeted around 60–80 characters for main body text; cap content width via `max-w-2xl` or `max-w-3xl`.

---

## Container & Grid System

- **Container**:
  - Use `SectionContainer` as single source of truth:
    - `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
    - `py-16 sm:py-24` (overridable per section when needed)
- **Grid patterns**:
  - **Two-column** (hero, product showcase, how-it-works steps):
    - `grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12`
  - **Three-column feature grid**:
    - `grid grid-cols-1 gap-6 md:grid-cols-3`
  - **Logo strip**:
    - Responsive flex or low-density grid: `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6`
  - **Testimonial layout**:
    - Single column on mobile, 2-col on desktop for quotes vs main highlighted card.

---

## Section Rhythm Strategy

- **Background alternation**:
  - Hero: `background` (with pattern)
  - Social proof: subtle card or muted background band
  - Features: `bg-background`
  - Product showcase: `bg-card` or `bg-muted`
  - How it works: back to `bg-background`
  - Testimonials: `bg-muted` to feel distinct
  - Pricing preview: `bg-background`
  - Final CTA: `bg-card`
- **Vertical rhythm**:
  - Clear separation between sections via consistent top/bottom padding.
  - Use light borders or subtle shadows only where necessary to differentiate within a section (cards).
- **Visual anchors**:
  - Align major headings and section intros to the same left edge.
  - Use repeating motifs (pill badges, icons, small dividers) to tie sections together.

---

## Component Architecture Strategy

### Categories
1. **Layout components**
   - `BackgroundPattern1` (already present)
   - `Navbar`
   - `SectionContainer` (already present)
   - (Optional later) `PageShell` alias that composes background + navbar + `<main>`

2. **Section components**
   - `LandingHero` (already present; to be evolved)
   - `LandingSocialProof` (to add)
   - `LandingFeatures` (already present; to be evolved into proper multi-feature grid)
   - `LandingProductShowcase` (to add)
   - `LandingHowItWorks` (to add)
   - `LandingTestimonials` (to add)
   - `LandingPricingPreview` (to add)
   - `LandingCta` (already present)
   - `LandingFooter` (already present)

3. **UI primitives**
   - shadcn `Button`, `Badge`, `Card` (if installed later), `Accordion` (for FAQ), etc.
   - `Logo`, `NavMenu`, `NavigationSheet`, `ModeToggle`

### Reuse & Extension Rules
- Before creating a new section:
  - Check if `SectionContainer`, `LandingHero`, or `LandingFeatures` pattern can be reused/refactored.
- Layout patterns (like split hero, feature grids) should be abstracted into helper components if used in 2+ sections:
  - e.g., `SplitSection`, `MetricsRow`, `LogoRow`.
- Avoid multiple variants of “feature list” components; design one flexible version.

---

## Reusability & Refactoring Strategy

- **Props-driven sections**:
  - Data (titles, copy, bullet points) separated from layout where appropriate.
  - E.g., `LandingFeatures` uses a `features` array; `LandingHowItWorks` uses a `steps` array.
- **Composable pieces**:
  - Testimonial card component reusable in carousel, grid, or single highlight.
  - Pricing card reusable for future `/pricing` page.
- **Future proofing**:
  - Sections should be movable or reusable in other routes (e.g., reuse Testimonials on `/pricing`).

---

## Accessibility Standards

- **Semantics**:
  - Use `<header>`, `<main>`, `<section>`, `<footer>` with appropriate `aria-label` or headings.
  - One `<h1>` (hero), then descending `<h2>` for each section.
- **Color contrast**:
  - Ensure all text using theme tokens meets WCAG AA contrast on both light/dark backgrounds.
- **Keyboard navigation**:
  - Navbar, CTAs, and interactive components (accordion, tabs, carousels) fully focusable and usable via keyboard.
- **ARIA**:
  - Use `aria-label`s for icon-only buttons.
  - Landmarks for navigation and main content.

---

## Responsive Strategy (Mobile-first)

- **Mobile-first layouts**:
  - Start with single-column stacks and `gap-y` spacing.
  - Gradually introduce multi-column grids at `sm` and `md` breakpoints.
- **Breakpoints**:
  - `sm` (~640px): Slight typography upscaling, denser content.
  - `md` (~768px): 2-column layouts for hero, product, how-it-works.
  - `lg` (~1024px+): Introduce max-widths and larger white space.
- **Navbar**:
  - Existing `NavigationSheet` for mobile nav; desktop nav remains inline.
- **Image behavior**:
  - Product imagery blocks should stack below text on smaller screens.

---

## Conversion Flow Strategy

- **Primary journey**:
  1. Hero explains core value and offers primary CTA (e.g., “Get started”) and secondary CTA (e.g., “View product tour”).
  2. Social proof builds trust quickly (logos, short statements).
  3. Features and product showcase explain capabilities and how it fits different segments.
  4. How-it-works clarifies mental model in 3–4 steps.
  5. Testimonials and numbers provide proof and outcomes.
  6. Pricing preview reduces uncertainty, hints at plans.
  7. Final CTA reinforces single main action (e.g., “Start free trial”).
- **CTA placement**:
  - Hero, mid-page (after features/how-it-works), and final CTA section.
  - Reuse same CTA label and nearby secondary action (e.g., “Talk to sales” or “View docs”).

---

## Section-by-Section Breakdown

### 1. Hero Section (`LandingHero`)
- **Conversion purpose**: Immediately communicate core value and encourage primary CTA interaction.
- **Layout structure**:
  - 2-column grid on desktop: left text, right product mock.
  - Stacked on mobile with text first, product block second.
- **Grid usage**:
  - `grid-cols-1 md:grid-cols-2`, aligned to `SectionContainer`.
- **Spacing rules**:
  - Top padding: `pt-32` (account for navbar) on mobile, `pt-36`+ on desktop.
  - Internal vertical spacing: `space-y-4` for text stack, `gap-6` for supporting stats.
- **Typography mapping**:
  - `h1`: `text-4xl md:text-5xl lg:text-6xl`.
  - Subcopy: `text-base md:text-lg text-muted-foreground`.
  - Meta badges: `text-xs sm:text-sm`.
- **Visual rhythm placement**:
  - Strong visual weight front-loaded with hero, then simpler sections afterward.
- **Reusable components**:
  - Badge, primary/secondary `Button`, product preview card, metrics row.
- **Responsive adjustments**:
  - Reduce product card size on smaller screens, ensure no horizontal overflow.
- **Accessibility**:
  - Single `<h1>`, clear CTA text, alt text or descriptive ARIA for imagery.

### 2. Social Proof (`LandingSocialProof`)
- **Conversion purpose**: Build trust quickly through logos and short credibility statements.
- **Layout structure**:
  - Intro line + grid of logos.
- **Grid usage**:
  - `grid-cols-2 sm:grid-cols-3 md:grid-cols-5` for logos.
- **Spacing rules**:
  - Slimmer vertical padding than hero (`py-12 sm:py-16`).
- **Typography**:
  - Small heading (`text-sm md:text-base`), muted tone.
- **Visual rhythm**:
  - Lighter, flatter section after heavy hero; possibly use `bg-background` with subtle card containers.
- **Reusable components**:
  - `LogoRow` component to reuse on other pages.
- **Responsive**:
  - Logo sizes adapt; ensure good tap targets if clickable.
- **Accessibility**:
  - `aria-label` for logo strip describing “Trusted by…”; alt text on logos.

### 3. Features (`LandingFeatures`)
- **Conversion purpose**: Explain primary value pillars succinctly.
- **Layout structure**:
  - Heading, subheading, then 3–6 feature cards in grid.
- **Grid usage**:
  - `grid-cols-1 md:grid-cols-3`, consistent card heights via padding.
- **Spacing rules**:
  - `mt-10` between heading block and grid; `gap-6`–`gap-8` between cards.
- **Typography**:
  - Feature titles as `text-base md:text-lg font-medium`.
  - Descriptions as `text-sm md:text-base text-muted-foreground`.
- **Visual rhythm**:
  - Balanced “middle-weight” section after light social proof.
- **Reusable components**:
  - `FeatureCard` component.
- **Responsive**:
  - Single-column stacking on mobile; spacing preserved.
- **Accessibility**:
  - Ensure headings structure within cards is logical (could use `<h3>` or `<p>` with `aria-level` managed via semantics).

### 4. Product Showcase (`LandingProductShowcase`)
- **Conversion purpose**: Show what the product actually looks and feels like (screens, flows).
- **Layout structure**:
  - `SplitSection`: text on one side, large product mock or composited UI on the other.
- **Grid usage**:
  - 2-column at `md+`, stacked at mobile.
- **Spacing rules**:
  - Similar to hero but with slightly reduced top padding.
- **Typography**:
  - Emphasize subheading and bullet points describing key UX wins.
- **Visual rhythm**:
  - Increase visual weight again with larger imagery and overlapping cards.
- **Reusable components**:
  - `SplitSection`, `ProductCard`, `MiniMetric` badges.
- **Responsive**:
  - Collapse into stacked content; ensure imagery resizes elegantly.
- **Accessibility**:
  - Provide alt text for product mock; avoid essential copy baked into images.

### 5. How It Works (`LandingHowItWorks`)
- **Conversion purpose**: Reduce cognitive friction by explaining process in 3–4 clear steps.
- **Layout structure**:
  - Heading + horizontal stepper-like layout or vertical numbered list.
- **Grid usage**:
  - On desktop: `md:grid-cols-3` for three steps; on mobile: stacked columns.
- **Spacing rules**:
  - `mt-8` from heading to steps; `gap-6` between steps.
- **Typography**:
  - Step label (e.g., “Step 1”) small; step title medium; description small.
- **Visual rhythm**:
  - Calm, explanatory; possibly use `bg-muted` with subtle border to distinguish.
- **Reusable components**:
  - `StepCard` or `TimelineStep`.
- **Responsive**:
  - Ensure numbered markers remain visible and clear.
- **Accessibility**:
  - Ordered list semantics (`<ol>` and `<li>`) for steps.

### 6. Testimonials (`LandingTestimonials`)
- **Conversion purpose**: Provide social proof with concrete outcomes.
- **Layout structure**:
  - One highlighted testimonial card + 2–3 smaller ones, or a simple grid if carousel isn’t added yet.
- **Grid usage**:
  - Highlight card spans columns on desktop; smaller cards in grid.
- **Spacing rules**:
  - Slightly denser inner spacing for quotes, more outer padding for the band.
- **Typography**:
  - Quote text medium; name and title smaller; company name emphasized with weight or color.
- **Visual rhythm**:
  - Use `bg-muted` or `bg-card` band; maybe add subtle top border.
- **Reusable components**:
  - `TestimonialCard` independent from layout.
- **Responsive**:
  - Stack testimonials vertically; maintain comfortable line length.
- **Accessibility**:
  - Use `figure`/`blockquote`/`figcaption` semantics where appropriate.

### 7. Pricing Preview (`LandingPricingPreview`)
- **Conversion purpose**: Set expectations; pre-sell pricing tiers or “starts at” message and encourage clickthrough.
- **Layout structure**:
  - Single-row summary with one or two simple pricing cards, not full plan matrix.
- **Grid usage**:
  - 1–2 cards in responsive grid.
- **Spacing rules**:
  - Not as tall as hero; moderate padding.
- **Typography**:
  - Price emphasized, plan name medium, bullets small.
- **Visual rhythm**:
  - Use `bg-background` to feel lighter after testimonials.
- **Reusable components**:
  - `PricingCard` that can be promoted later to `/pricing`.
- **Responsive**:
  - Stack cards; keep CTAs prominent.
- **Accessibility**:
  - Clear, text-based pricing details; avoid relying purely on color to distinguish plans.

### 8. Final CTA (`LandingCta`)
- **Conversion purpose**: Final push to primary action, summarizing value in one or two lines.
- **Layout structure**:
  - Single band with heading, subcopy, and CTAs side by side on desktop, stacked on mobile.
- **Grid usage**:
  - Flex-based or 2-column grid.
- **Spacing rules**:
  - Strong padding (`py-16 sm:py-20`), generous space around CTAs.
- **Typography**:
  - Heading: section H2 size; subcopy smaller but with good contrast.
- **Visual rhythm**:
  - Slightly elevated surface (`bg-card`, border, subtle shadow) to feel important.
- **Reusable components**:
  - CTA band reusable across other pages.
- **Responsive**:
  - Stack CTAs under text on small screens.
- **Accessibility**:
  - Clear CTAs, accessible button labels.

### 9. Footer (`LandingFooter`)
- **Conversion purpose**: Provide navigation to secondary content and trust/legal information.
- **Layout structure**:
  - Simple 2–3 column layout on desktop, single column on mobile.
- **Grid usage**:
  - Flex or small grid, anchored to container.
- **Spacing rules**:
  - `pt-10 pb-12` with border-top separation.
- **Typography**:
  - Small text for links; subdued color.
- **Visual rhythm**:
  - Calm, low-contrast end to the page.
- **Reusable components**:
  - `Footer` / `LandingFooter` for other marketing pages.
- **Responsive**:
  - Stack columns; add vertical spacing between groups.
- **Accessibility**:
  - Semantic `<footer>` element; clear link text; proper contrast.

---

## Completion Checklist per Section

- **Global**
  - [ ] All sections use `SectionContainer` for horizontal layout.
  - [ ] All sections adhere to spacing scale.
  - [ ] Typography scale applied consistently.
  - [ ] Background tokens (`background`, `muted`, `card`) used intentionally.
  - [ ] No duplicated layout components with overlapping responsibilities.

- **Hero**
  - [ ] Single `<h1>` with clear value proposition.
  - [ ] Primary and secondary CTAs present and coherent.
  - [ ] Product visual integrated and responsive.
  - [ ] Spacing and alignment match layout system.

- **Social Proof**
  - [ ] Logos or trust indicators rendered correctly at all breakpoints.
  - [ ] Copy short and legible.
  - [ ] Section visually distinct from hero.

- **Features**
  - [ ] 3–6 feature cards with consistent structure.
  - [ ] Title, description, and optional icon well aligned.
  - [ ] Good balance between white space and content density.

- **Product Showcase**
  - [ ] Split layout implemented with reusable helper if repeated.
  - [ ] Imagery scales correctly and maintains aspect ratio.
  - [ ] Text clearly explains product capabilities.

- **How It Works**
  - [ ] Steps clearly numbered and ordered.
  - [ ] Semantics use `<ol>`/`<li>` where appropriate.
  - [ ] Layout remains readable on mobile.

- **Testimonials**
  - [ ] At least one strong quote with clear attribution.
  - [ ] Testimonial component reusable.
  - [ ] Section visually distinct but cohesive.

- **Pricing Preview**
  - [ ] Simple, non-overwhelming view of pricing.
  - [ ] Clear CTA to full pricing page (even if page comes later).
  - [ ] Text content easily editable for future pricing changes.

- **Final CTA**
  - [ ] Strong, concise headline summarizing value.
  - [ ] Primary CTA matches hero CTA.
  - [ ] Secondary CTA (e.g., “Talk to sales” or “View docs”) is optional but coherent.

- **Footer**
  - [ ] Product, Company, and Legal link groups organized.
  - [ ] Copyright present.
  - [ ] Layout consistent with container and grid system.

- **Quality & Accessibility**
  - [ ] Semantic HTML verified (landmarks, headings).
  - [ ] Color contrast meets WCAG AA.
  - [ ] Keyboard navigation works for all interactive elements.
  - [ ] No layout shift across common breakpoints.

