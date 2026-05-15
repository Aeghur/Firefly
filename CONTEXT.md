# Firefly

Firefly is Aeghur's personal blog site, built on top of the Firefly Astro theme. This context captures the site's domain language so future changes describe the blog's content and configuration consistently.

## Language

**Personal Blog Site**:
The published website that presents Aeghur's writing, knowledge sharing, interests, and personal pages.
_Avoid_: Theme template, starter project

**Firefly Theme**:
The upstream Astro theme foundation that this site customizes for layout, visual style, and blog features.
_Avoid_: Product, app

**Site Author**:
Aeghur, the person whose identity, writing, and profile information define the site.
_Avoid_: User, customer

**Content Entry**:
A published or draft markdown item that belongs to the site's content collection.
_Avoid_: Page, record

**Post**:
A **Content Entry** in `src/content/posts` that appears in the blog feed, archive, category views, search, and RSS.
_Avoid_: Article when referring to the storage collection

**Special Page**:
A fixed site page whose body content lives outside the blog feed, such as About, Friends, or Guestbook.
_Avoid_: Post

**Route Page**:
An Astro route file that maps a URL to a rendered page.
_Avoid_: Content entry

**Content Type**:
The canonical editorial category of a **Post**.
_Avoid_: Topic, tag

**Essay**:
A loose, personal, low-structure **Post** used for diary-like reflection or everyday observation.
_Avoid_: Diary, note

**Thinking Note**:
A short argumentative or reflective **Post** centered on a concept, viewpoint, or way of thinking.
_Avoid_: Opinion article, critique

**Technical Note**:
A practical **Post** about tools, AI, coding, setup, or technical learning.
_Avoid_: Tutorial unless it is explicitly step-by-step

**Project Log**:
A progress-oriented **Post** about building, changing, or evaluating a concrete project.
_Avoid_: Changelog

**Reading or Watching Note**:
A **Post** responding to a book, article, film, show, game, or other media experience.
_Avoid_: Review unless it is explicitly evaluative

**Tag**:
A flexible keyword attached to a **Post** for cross-cutting ideas, technologies, people, works, or moods.
_Avoid_: Category

**Site Configuration**:
The site's source of truth for behavior, feature switches, copy, visual preferences, and service integrations.
_Avoid_: Component constants, hidden defaults

**Feature Configuration**:
A focused part of **Site Configuration** that controls one site capability, such as comments, navigation, profile, music, gallery, or analytics.
_Avoid_: Settings blob

**Component**:
A reusable Astro or Svelte UI unit that renders layout, interaction, content, or integrations from configuration and content data.
_Avoid_: Configuration owner

**Project Check**:
A local validation command that confirms Astro, Svelte, TypeScript, or the production build still agrees with the project.
_Avoid_: Test suite

**Package Manager**:
The dependency and script runner for this project.
_Avoid_: npm, yarn

## Relationships

- The **Personal Blog Site** is built on the **Firefly Theme**.
- The **Site Author** owns the voice, content, and profile of the **Personal Blog Site**.
- A **Post** is a kind of **Content Entry**.
- A **Special Page** is a kind of **Content Entry**.
- A **Post** has exactly one **Content Type**.
- A **Post** can have zero or more **Tags**.
- The canonical **Content Types** are **Essay**, **Thinking Note**, **Technical Note**, **Project Log**, and **Reading or Watching Note**.
- AI-related writing is usually a **Technical Note** or **Project Log** with an AI-related **Tag**, not its own **Content Type**.
- A **Route Page** renders a URL; it is not itself the canonical content unless it contains page-specific UI logic.
- **Site Configuration** contains many **Feature Configurations**.
- A **Component** consumes **Site Configuration** and content data; it should not own site-level choices.
- The **Package Manager** is pnpm.
- A **Project Check** usually means `pnpm check`; use `pnpm type-check` for TypeScript declaration boundaries and `pnpm build` before release or when build-time behavior changes.

## Example dialogue

> **Dev:** "Should this change make the theme easier for other people to reuse?"
> **Domain expert:** "Only if it also supports the **Personal Blog Site**. This repo's primary goal is Aeghur's blog, not maintaining a general-purpose theme product."
>
> **Dev:** "Should a Codex usage writeup use AI as its category?"
> **Domain expert:** "No. Make it a **Technical Note** or **Project Log**, then use AI or Codex as **Tags**."
>
> **Dev:** "Should I hard-code whether the gallery page is enabled inside the page component?"
> **Domain expert:** "No. That is **Site Configuration**. The **Component** should consume the configured choice."
>
> **Dev:** "Is the about page a **Post**?"
> **Domain expert:** "No. It is a **Special Page** rendered by a **Route Page**."
>
> **Dev:** "Can I install a dependency with npm?"
> **Domain expert:** "No. The **Package Manager** is pnpm, and project scripts should be run through pnpm."

## Flagged ambiguities

- "Firefly" can mean the upstream theme or this repository's blog site. Resolved: in this repo, **Personal Blog Site** is the primary context, and **Firefly Theme** names the reusable theme foundation.
- "AI" was previously used as a category. Resolved: AI is a **Tag**; the **Content Type** should describe the editorial shape, such as **Technical Note** or **Project Log**.
