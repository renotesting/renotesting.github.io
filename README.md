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

Copy `.env.example` to `.env` for local builds. For the live site, open the repository's **Settings → Secrets and variables → Actions**, choose the **Variables** tab and add each one with **New repository variable** (not "Manage environment variables", which the build step doesn't read). Direct link: https://github.com/renotesting/renotesting.github.io/settings/variables/actions. Values are read at build time, so rebuild (or restart `npm run dev`) after changing them; on GitHub, re-run the deploy from the **Actions** tab.

Everything here is visible to visitors in the built site, so never put a password or secret key in these settings.

| Variable | What it does | Example |
|----------|--------------|---------|
| `PUBLIC_FORMSPREE_FORM_ID` | Formspree form ID, the part after `/f/` in the form endpoint. Empty shows social links instead of the contact form | `xyzabcd` |
| `PUBLIC_RECAPTCHA_SITE_KEY` | Google reCAPTCHA v2 checkbox **site** key, shown on the contact form. The secret key goes only in Formspree. Leave empty if reCAPTCHA is off for the form | `6Lc...` |
| `PUBLIC_NEWSLETTER_FORM_URL` | Brevo hosted signup form link, `https://` only. Empty shows "signup opens soon" | `https://xxxx.sibforms.com/serve/...` |
| `PUBLIC_WHATSAPP_NUMBER` | WhatsApp number with country code, digits only. Empty hides the chat button | `1403xxxxxxx` |
| `PUBLIC_GTM_ID` | Optional Google Tag Manager ID | `GTM-XXXX` |
| `PUBLIC_GA_ID` | Optional Google Analytics ID | `G-XXXX` |

### Setting up Formspree

1. Sign up at formspree.io with the email address that should receive messages, and confirm it.
2. Create a new form. Its endpoint looks like `https://formspree.io/f/xyzabcd`; the ID is `xyzabcd`.
3. Under the form's settings, restrict it to the `www.renofitness.ca` domain so other sites can't use it.

The free plan has a monthly submission limit; check Formspree's current plans.

#### reCAPTCHA on the contact form

With reCAPTCHA on, Formspree rejects messages sent from the page's script unless the form uses your own reCAPTCHA key (available on the free plan):

1. At https://www.google.com/recaptcha/admin, create a key of type **reCAPTCHA v2 → "I'm not a robot" Checkbox**. Add the domains `www.renofitness.ca`, `renofitness.ca` and, for local testing, `localhost`.
2. In Formspree, open the form's **Settings**, keep CAPTCHA on, choose **Adjust settings → Custom reCAPTCHA** and paste the **secret key**.
3. Put the **site key** in `PUBLIC_RECAPTCHA_SITE_KEY`. Only the site key is public; never put the secret key in `.env` or a GitHub variable.

### Setting up the Brevo newsletter

1. Sign up at brevo.com and create a contact list for the newsletter.
2. Authenticate the domain: under **Senders, Domains & Dedicated IPs → Domains**, add `renofitness.ca` and copy the DNS records Brevo shows (DKIM, DMARC) into GoDaddy. Skip Brevo's offer of a free sending domain.
3. Add a sender on that domain, such as `mail@renofitness.ca` (name `RenoFitness`), with reply-to `renostudio@hotmail.com`. Brevo rejects mail sent from an `@hotmail.com` sender ("the sender you used … is not valid").
4. Under **Contacts → Forms**, create a subscription form that adds people to that list. On its **Confirmations** step choose **Double confirmation email**, which Canada's anti-spam law (CASL) expects for consent, and pick a double opt-in template whose sender is the address from step 3.
5. Click through to the **Share** step to save and publish, then copy the form's shared link (the hosted page, not the embed code). That's `PUBLIC_NEWSLETTER_FORM_URL`.
6. Test with a new address. A contact is only added after the link in the confirmation email is clicked. If no email arrives, **Transactional → Logs** in Brevo shows whether it was sent or why it was rejected. Early confirmation emails may land in spam while the domain builds a reputation.
7. Send newsletters from Brevo's **Campaigns**, using the same sender. Every campaign includes an unsubscribe link and your studio's mailing address, both required by CASL.

## Pages

- `/` — home (about, photos, Google reviews, services, contact form)
- `/blog` — resistance training and kickboxing notes
- `/contact` — contact form
- `/subscribe` — newsletter signup
- `/generator` — loyalty ID generator (not indexed)

Old URLs from the previous site (`/blog.html`, `/generator.html`, and the discontinued Mindbody booking pages under `/widgets/`) redirect through small pages in `static/`.

## Editing content

The home page is built from components in `src/components/`:

- **About** (`About.astro`), **Services** (`Services.astro`) and **Photos** (`PhotoGrid.astro`). To hide something without deleting it, use `{/* ... */}` in the page markup and `//` in the code between the `---` lines. HTML `<!-- -->` comments break the code part and are visible to visitors in the markup.
- **Client reviews** (`Testimonials.astro`): reviews copied by hand from the [Google Business Profile](https://maps.app.goo.gl/UxBsWdY9RHWD88fw7). To add one, copy an entry in the `reviews` list; update `rating` and `reviewCount` to match Google. The "Leave a review" button uses `googleWriteReviewUrl` (https://g.page/r/CZB7WJHLLjrGEBM/review), a link also worth sending to clients.
- **WhatsApp greeting**: `GREETING` in `src/scripts/whatsapp.js`.

## Deployment

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds the site and publishes it to GitHub Pages on every push to `master`, or when run by hand from the **Actions** tab.

### Domain

The domain comes from the **Custom domain** box in **Settings → Pages**, which must say `www.renofitness.ca`. GitHub ignores the `static/CNAME` file when publishing from Actions; it's kept only as a record of the domain. Settings that don't change go unsaved, so the Save button does nothing if the box is already correct.

DNS is at GoDaddy (name servers `ns43`/`ns44.domaincontrol.com`):

| Name | Type | Value |
|------|------|-------|
| `www` | CNAME | `renotesting.github.io` |
| `@` | A | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| `@` | AAAA | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |

GitHub redirects the bare `renofitness.ca` to `www`. Don't turn GoDaddy's domain forwarding back on: it replaces the `@` records, and GitHub then reports "renofitness.ca is improperly configured" (`NotServedByPagesError`). Leave the Brevo (`brevo-code`, DKIM, DMARC) and `google-site-verification` records in place.

After a DNS change, Settings → Pages shows "DNS check in progress" until public DNS servers pick up the new records, usually within an hour. GitHub then issues the HTTPS certificate, which can take up to a day; **Enforce HTTPS** can be turned on once it's ready. Publishing isn't blocked in the meantime.

### Switching the live site over

In this order:

1. Push `redesign` to GitHub.
2. Add the repository variables from the table above.
3. In **Settings → Pages**, change **Source** from "Deploy from a branch" to **GitHub Actions**. Check that the custom domain still says `www.renofitness.ca`, and turn on **Enforce HTTPS** when it becomes available.
4. Straight away, merge `redesign` into `master` and push. The workflow runs and publishes the new site within a few minutes; follow it in the **Actions** tab. Merging before step 3 would make GitHub Pages serve the raw repository files.
5. Check the site: send a test message through the contact form (ticking reCAPTCHA), subscribe with a new test address, and open `/blog.html` to check the old-URL redirect.

If something goes wrong, change **Source** back to "Deploy from a branch" and revert the merge on `master`.

## License

ISC
