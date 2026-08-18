# Security Practices — Fore Grant

This is a **Tier 1 (static)** site. It has a deliberately small attack surface:
it builds to static HTML and ships zero server code and zero database. Keep it
that way unless a feature genuinely requires more, and follow the rules below.

---

## Security model: static by default

Everything in this project is prerendered to HTML at build time and served as
flat files from Netlify's CDN. There is no server to exploit, no database to
breach, and no secrets in the runtime. This is the most secure posture available
— don't give it up casually. If you find yourself needing a database, auth, or
server-rendered data, that's the signal to upgrade to Tier 2 (`project-scaffold
upgrade fore-grant`), not to bolt a client-side secret onto a static site.

---

## Secrets

- **Only `PUBLIC_*` environment variables exist here, and they are public.** Astro
  inlines any `PUBLIC_*` value into the client bundle. Never put anything secret
  behind that prefix.
- **Never commit `.env`.** It is gitignored. Real values live in Netlify's env UI.
- **No private API keys in a static site, ever.** There is no server to keep them
  on — anything the browser can use, an attacker can read. If you need a secret,
  you need a server (Tier 2 + a serverless function), not a static page.

---

## Security headers (`netlify.toml`)

Every response carries these. Don't remove them; tighten if anything.

| Header | Purpose |
|---|---|
| `Content-Security-Policy` | Restricts what can load/run — the main XSS defense. |
| `Strict-Transport-Security` | Forces HTTPS (HSTS), preventing downgrade attacks. |
| `X-Frame-Options: DENY` | Blocks clickjacking via iframing. |
| `X-Content-Type-Options: nosniff` | Stops MIME-type confusion attacks. |
| `Referrer-Policy` | Limits referrer leakage to third parties. |
| `Permissions-Policy` | Disables unused browser features (camera, mic, geo). |

**CSP + inline scripts:** the CSP uses `script-src 'self'`, which blocks inline
`<script>`. Astro sometimes compiles component scripts inline. If a script stops
running in production, do **not** reflexively add `'unsafe-inline'` (that defeats
the CSP). Prefer external script files, or use Astro's CSP/script-hashing support
so scripts are allowlisted by hash.

---

## Dependencies

- Keep `package-lock.json` committed; builds use the pinned versions.
- Run `npm audit --audit-level=high` before shipping, and enable Dependabot on the
  repo so security patches surface automatically.
- Add dependencies deliberately — every package is supply-chain surface.

---

## When adding features — quick checklist

- [ ] No secret value behind a `PUBLIC_*` var or in client code.
- [ ] `.env` still gitignored; nothing sensitive committed.
- [ ] Security headers in `netlify.toml` unchanged or tightened, never loosened.
- [ ] If you reached for a server/database, upgrade to Tier 2 properly rather than
      improvising.
- [ ] User-supplied content is rendered with Astro's default escaping — never via
      `set:html`/`innerHTML` with untrusted input.
