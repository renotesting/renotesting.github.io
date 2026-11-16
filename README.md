# RenoFitness website

Calgary personal training and fitness kickboxing site. It's a static [Astro](https://astro.build) site hosted free on GitHub Pages, with no server of its own:

- **Contact form:** sent through [Formspree](https://formspree.io), which emails each message to the studio.
- **Newsletter:** a signup form hosted by [Brevo](https://www.brevo.com), embedded on `/subscribe`. Brevo stores subscribers, sends the newsletters and handles unsubscribes.
- **Live chat:** a WhatsApp click-to-chat button.

The old jQuery site is on the `master` branch until this one goes live.

## Running locally

Requires Node.js 22.23.4 or newer.

```bash
npm install
```

```bash
npm run dev
```

The site runs at http://localhost:4321. To check the production build:

```bash
npm run build
```

```bash
npm run preview
```

## Configuration

Copy `.env.example` to `.env` for local builds. For the live site, set the same names under **Settings → Secrets and variables → Actions → Variables** in GitHub. Values are read at build time, so rebuild (or restart `npm run dev`) after changing them.

Everything here is visible to visitors in the built site, so never put a password or secret key in these settings.

| Variable | What it does | Example |
|----------|--------------|---------|
| `PUBLIC_FORMSPREE_FORM_ID` | Formspree form ID, the part after `/f/` in the form endpoint. Empty shows social links instead of the contact form | `xyzabcd` |
| `PUBLIC_NEWSLETTER_FORM_URL` | Brevo hosted signup form link, `https://` only. Empty shows "signup opens soon" | `https://xxxx.sibforms.com/serve/...` |
| `PUBLIC_WHATSAPP_NUMBER` | WhatsApp number with country code, digits only. Empty hides the chat button | `1403xxxxxxx` |
| `PUBLIC_GTM_ID` | Optional Google Tag Manager ID | `GTM-XXXX` |
| `PUBLIC_GA_ID` | Optional Google Analytics ID | `G-XXXX` |

### Setting up Formspree

1. Sign up at formspree.io with the email address that should receive messages, and confirm it.
2. Create a new form. Its endpoint looks like `https://formspree.io/f/xyzabcd`; the ID is `xyzabcd`.
3. Under the form's settings, restrict it to the `www.renofitness.ca` domain so other sites can't use it.

The free plan has a monthly submission limit; check Formspree's current plans.

### Setting up the Brevo newsletter

1. Sign up at brevo.com and create a contact list for the newsletter.
2. Under **Contacts → Forms**, create a subscription form that adds people to that list. Turn on double opt-in, which Canada's anti-spam law (CASL) expects for consent.
3. Publish it and copy the form's shared link (the hosted page, not the embed code). That's `PUBLIC_NEWSLETTER_FORM_URL`.
4. Send newsletters from Brevo's **Campaigns**. Every campaign includes an unsubscribe link and your studio's mailing address, both required by CASL.

## Pages

- `/` — home (about, photos, testimonials, services, contact form)
- `/blog` — resistance training and kickboxing notes
- `/contact` — contact form
- `/subscribe` — newsletter signup
- `/generator` — loyalty ID generator (not indexed)

Old URLs from the previous site (`/blog.html`, `/generator.html`, and the discontinued Mindbody booking pages under `/widgets/`) redirect through small pages in `static/`.

## Deployment

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds the site and publishes it to GitHub Pages on every push to `master`, or when run by hand from the **Actions** tab. `static/CNAME` keeps the `www.renofitness.ca` domain. GoDaddy's DNS records already point at GitHub Pages and don't need to change.

To switch the live site over, in this order:

1. Push `redesign` to GitHub.
2. Add the repository variables from the table above.
3. In **Settings → Pages**, change **Source** from "Deploy from a branch" to **GitHub Actions**. Check that the custom domain still says `www.renofitness.ca`, with **Enforce HTTPS** on.
4. Straight away, merge `redesign` into `master` and push. The workflow runs and publishes the new site within a few minutes. Merging before step 3 would make GitHub Pages serve the raw repository files.
5. Check the site, send a test message through the contact form, and subscribe with a test address.

If something goes wrong, change **Source** back to "Deploy from a branch" and revert the merge on `master`.

## License

ISC
