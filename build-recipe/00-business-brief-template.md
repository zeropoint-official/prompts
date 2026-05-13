# Business Brief Template — Fill This Out Once

Fill this in before you start. Every prompt in this folder reads from this brief — paste your filled-in version at the top of each session so Claude can plug in your specifics.

Anywhere in the prompts you see `{{LIKE_THIS}}`, that's a placeholder Claude will resolve from this brief.

---

## 1. Business

- **`{{BRAND_NAME}}`**: e.g. `Northwind Dental`, `Atelier Volkov`, `Pulse Strength`
- **`{{TAGLINE}}`**: e.g. `Quiet dentistry, in Reykjavík`, `Patient care, considered.`
- **`{{VERTICAL}}`**: pick one and Claude will tune copy + sections — `architecture-studio` | `real-estate` | `dental-clinic` | `boutique-fitness` | `restaurant` | `interior-design` | `legal-firm` | `b2b-saas` | `consultancy` | `creative-agency` | `wedding-photography` | `art-gallery` | `private-clinic` | `…`
- **`{{LOCATION}}`**: e.g. `Reykjavík, Iceland` — appears in hero, footer, contact
- **`{{FOUNDED}}`**: e.g. `Est. 2014`

## 2. Voice

- **`{{TONE}}`**: choose 1–3 of `editorial`, `restrained`, `cinematic`, `confident`, `warm`, `clinical`, `playful`, `technical`, `literary`
- **`{{COPY_RULES}}`** — any words/themes to **avoid**, or to **always include**. Example:
  > Never mention "price", "discount", "deal". Always use "consultation" not "appointment". Never use exclamation marks.
- **`{{HERO_HEADLINE}}`** — three lines max, the words that show over the scroll video. Example:
  > High / *quality* **homes** / **built** *to last.*
  > (italic for soft words, bold for strong words — the design supports this mix)

## 3. Design language

- **Background**: dark editorial only — `#0f0b06` warm-ink stays as-is unless your brand explicitly demands light. The radial warm-spots and noise overlay depend on dark.
- **`{{ACCENT_HEX}}`** — primary accent (replaces gold). Pick a single chromatic accent. Examples:
  - `#d4b46a` warm gold (default)
  - `#c9a96e` champagne
  - `#bda77a` brass
  - `#9bb0a0` muted sage (for medical / wellness)
  - `#b89968` antique brass (for legal / luxury)
  - `#a87a52` terracotta (for restaurant / artisanal)
- **`{{ACCENT_BRIGHT_HEX}}`** — lighter version, used in the gradient-text shine. Roughly: same hue + ~15% lightness.
- **`{{ACCENT_DEEP_HEX}}`** — darker version for scrollbar thumb and shadows. Same hue − ~30% lightness.
- **`{{DISPLAY_FONT}}`** — e.g. `Plus Jakarta Sans` (default), `Fraunces` (more editorial), `Cormorant Garamond` (serif), `Instrument Serif` (display serif)
- **`{{BODY_FONT}}`** — e.g. `Inter` (default), `Geist`, `Manrope`
- **`{{MONO_FONT}}`** — e.g. `JetBrains Mono` (default), `Geist Mono`, `IBM Plex Mono`

## 4. Sections — what does the home page contain?

Default layout (works for most verticals — Claude will adapt copy):

1. **Hero** — scroll-scrubbed video
2. **Overture** — pinned aperture-style reveal of one signature image
3. **Portfolio Stack** — pinned stack of N items (your projects / services / case studies / properties)
4. **Correspondence** — contact form section
5. **About** — studio / team / story block with portrait image

Adjust as needed. Examples:

- **Dental clinic**: hero → overture (clinic photo) → service stack (cleanings / aligners / cosmetic / pediatric) → testimonials → contact → about
- **Restaurant**: hero (food video) → overture (dining room) → menu stack (starters / mains / desserts / wine) → reservations → about chef
- **SaaS**: hero (product video) → overture (dashboard screenshot) → feature stack → pricing → contact / demo CTA → team

Specify yours:

- **`{{HOME_SECTIONS}}`**: e.g. `hero, overture, services-stack, testimonials, contact, about`
- **`{{STACK_ITEMS}}`**: array of 4–6 items for the portfolio stack. For each: name, subtitle, location/category, year/established, cover image path, 3 metric pairs (e.g. for real estate: Area / Rooms / Year; for dental: Duration / Sessions / Recovery; for SaaS: Users / Uptime / Plans).
- **`{{ITEM_DETAIL_FIELDS}}`**: fields on the per-item detail page. Default for real estate: area, rooms, year, plot size, price, status, architect, coordinates, description, exteriors gallery, interiors gallery. Adapt for vertical.

## 5. Pages

Default:

- `/` — home
- `/properties` (or `/services`, `/work`, `/menu`, `/cases`) — index of items
- `/homes/[slug]` (or `/services/[slug]`, etc.) — item detail
- `/about`
- `/contact`
- `/dashboard` — admin (Clerk-protected)
- `/sign-in` — Clerk

Adjust:

- **`{{INDEX_PATH}}`** — e.g. `/properties`, `/work`, `/menu`, `/services`
- **`{{ITEM_BASE_PATH}}`** — e.g. `/homes`, `/cases`, `/dishes`, `/treatments`
- **`{{ITEM_NOUN}}`** — singular, used in copy. e.g. `residence`, `case study`, `dish`, `treatment`, `feature`

## 6. Forms

- **`{{FORM_FIELDS}}`** — what does the contact form collect? Default: `name, email, phone, service (select), message`. Always include `name`, `email`, `message`. Adapt the rest. Examples:
  - Dental: `name, email, phone, preferred_appointment_date, treatment_interested_in, message`
  - Restaurant: `name, email, phone, party_size, preferred_date, preferred_time, special_requests`
  - SaaS: `name, work_email, company, company_size, role, message`
- **`{{FORM_SERVICES}}`** — options for the "service" select (or whatever the topic select is called).

## 7. Email config

- **`{{FROM_EMAIL}}`** — e.g. `Northwind Dental <hello@yourdomain.com>` (must be on a verified Resend domain)
- **`{{ADMIN_EMAILS}}`** — array of who gets lead notifications, e.g. `["you@youragency.com", "owner@northwinddental.is"]`
- **`{{REPLY_TO}}`** — where customer replies route, e.g. `bookings@northwinddental.is`
- **`{{PHONE}}`** — appears in the customer auto-reply email + footer + contact page, e.g. `+354 555 0142`

## 8. Tech keys (have these ready before step 09)

- **`{{TURSO_DATABASE_URL}}`** — from `turso db show <name> --url`
- **`{{TURSO_AUTH_TOKEN}}`** — from `turso db tokens create <name>`
- **`{{CLERK_PUBLISHABLE_KEY}}`** — from clerk.com → app → API keys
- **`{{CLERK_SECRET_KEY}}`** — same
- **`{{RESEND_API_KEY}}`** — from resend.com → API keys (after domain verification)
- **`{{SITE_URL}}`** — your production URL, e.g. `https://northwinddental.is`

## 9. Imagery

- **`{{HERO_VIDEO_PATH}}`** — the path where your generated MP4 from Kling lives, e.g. `~/Downloads/hero.mp4`. See [01-scroll-video-workflow.md](./01-scroll-video-workflow.md) for how to generate it.
- **`{{OVERTURE_IMAGE_PATH}}`** — one signature still image for the overture section. Wide aspect (16:10 or 16:9).
- **`{{STACK_COVER_IMAGES}}`** — one cover image per stack item.
- **`{{GALLERY_IMAGES}}`** — exterior + interior galleries per item, if your vertical has them.
- **`{{ABOUT_IMAGE}}`** — one portrait image for the about block. Tall aspect (4:5).

---

## Example filled brief (real estate — what the Master Homes site actually used)

```yaml
BRAND_NAME: AEM Masterhomes
TAGLINE: Architectural residences, considered.
VERTICAL: real-estate
LOCATION: Larnaca, Cyprus
FOUNDED: Est. 2003

TONE: editorial, restrained, cinematic
COPY_RULES: |
  Never mention sea, beach, coast, Mediterranean, or waterfront.
  Use "residence" not "property" or "house" in display copy.
  Italic for soft adjectives ("quality", "to last"), bold for nouns ("homes", "build").

HERO_HEADLINE: |
  High
  quality homes
  build to last.

ACCENT_HEX: "#d4b46a"
ACCENT_BRIGHT_HEX: "#f0d58a"
ACCENT_DEEP_HEX: "#8d6f32"
DISPLAY_FONT: Plus Jakarta Sans
BODY_FONT: Inter
MONO_FONT: JetBrains Mono

HOME_SECTIONS: hero, overture, portfolio-stack, correspondence, about
INDEX_PATH: /properties
ITEM_BASE_PATH: /homes
ITEM_NOUN: residence

FORM_FIELDS: name, email, phone, service, message
FORM_SERVICES: [Buying, Building, Investment, General enquiry]

FROM_EMAIL: AEM Masterhomes <hello@kyr-media.com>
ADMIN_EMAILS: ["info@kyr-media.com"]
REPLY_TO: info@aemmasterhomes.com
PHONE: "+357 99 000 000"
```
