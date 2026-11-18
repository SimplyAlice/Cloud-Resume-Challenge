# Cloud Resume Challenge & Engineering Portfolio — Alice Matarise

Personal software engineering and cloud operations portfolio for **Alice Matarise** — final-year **BSc Information Technology (Software Engineering)** student at **Eduvos, Cape Town** (2023 – May 2027).

- **Live Portfolio:** https://cloud-resume-challenge-six.vercel.app/
- **Repository:** https://github.com/SimplyAlice/Cloud-Resume-Challenge
- **Positioning:** Software Engineering Student | Aspiring Cloud Engineer | Technical Problem Solver
- **Career Direction:** Cloud Support → Cloud Engineering → Technical Project Management

---

## 1. Production Cloud Architecture (Cloud Resume Challenge)

The portfolio is hosted on **Vercel** with a serverless Node.js API endpoint (`GET /api/visitors`) backed by **Neon Serverless PostgreSQL**:

```text
Visitor Browser (HTTPS)
  └──► Vercel Edge CDN (index.html, assets/css/styles.css, assets/js/script.js)
         └──► GET /api/visitors (api/visitors.js — Vercel Node.js Serverless Function)
                └──► @neondatabase/serverless (DATABASE_URL)
                       └──► Neon PostgreSQL (visitor_counter atomic upsert)
```

### Request & Persistence Flow

1. In production, `assets/js/script.js` calls `GET /api/visitors`. During local development (`localhost`, `127.0.0.1`, `file:`), it defaults to a local mock so visual/automated testing does not increment the production Neon counter (pass `?live_visitors=1` to opt into live API calls).
2. `api/visitors.js` enforces `GET`-only semantics (returning `HTTP 405` for non-GET methods) and validates `process.env.DATABASE_URL` (`HTTP 500` if unconfigured).
3. Using `@neondatabase/serverless`, the handler executes an atomic PostgreSQL upsert:
   ```sql
   INSERT INTO visitor_counter (id, count)
   VALUES (1, 1)
   ON CONFLICT (id)
   DO UPDATE SET count = visitor_counter.count + 1
   RETURNING count;
   ```
4. The updated visitor count is returned as JSON (`{ "count": <number> }`) and rendered in the live telemetry displays (`#visitor-count`, `#hero-visitors`, `#dossier-visitors`).

### Architectural Evolution (Azure Phase 1 → Vercel & Neon Phase 2)

- **Phase 1 (Historical Azure Implementation):** Originally built and deployed using **Azure Storage Static Website Hosting** (`$web` container), **Azure Functions** (`alice-cloud-counter`), **Azure Table Storage**, and two **GitHub Actions** CI/CD workflows (`static-site-deploy.yml` and `function-app-deploy.yml`). Verification screenshots from this phase are preserved in `assets/images/screenshots/`.
- **Phase 2 (Active Production):** Migrated in commit `f3edaf2` to **Vercel** (frontend + serverless function) and **Neon PostgreSQL** for low-latency serverless relational persistence.

---

## 2. Featured Engineering Projects (Verified Against Source Repositories)

| Project | Verified Implementation State | Stack | Links |
| :--- | :--- | :--- | :--- |
| **Dayform** | Frontend live on Vercel (HTTP 200); backend FastAPI/domain layers verified across 98 Pytest test files + 4 Vitest suites; hosted Render API + PostgreSQL (`asyncpg` / PgBouncer) connectivity currently under active remediation | React 18, TypeScript, Vite, Python 3.12+, FastAPI, PostgreSQL 15+, SQLAlchemy 2.0 (`asyncpg`), Alembic, Redis 7+, OpenStreetMap Overpass, Open-Meteo, Vercel | [Frontend (Vercel)](https://dayform-live.vercel.app/) · [GitHub](https://github.com/SimplyAlice/dayform) |
| **Zazen Matcha & Tea Co.** | Production deployed on Alwaysdata; custom PHP 8 (`PDO`), MariaDB (`InnoDB` `SELECT ... FOR UPDATE` transactions), `/admin` CRUD console, SSH/SCP rollout preserving live DB & `config.php`, cache-busting, and PowerShell `SHA-256` verification; Chawan sequence & backup scripts refined locally | PHP 8, PDO, MariaDB / MySQL, HTML5/CSS3 Grid, Vanilla JS, Apache, Alwaysdata, SSH/SCP, PowerShell | [Live Store](https://zazen-matcha.alwaysdata.net/) · [GitHub](https://github.com/SimplyAlice/Zazen-Matcha) |
| **Quote_Flow** | In active development; `Feature/Backend-Foundation` implements 12 SQLAlchemy 2.0 ORM entities, PG16 Alembic baseline migration (`6fe0f6e79dd9`), Pydantic v2 `ExactDecimal` contracts, 6 FastAPI v1 routers, and 27 Pytest modules (**179 passing unit tests** across 17 unit files + 10 PG16 integration files / 18 tests); Next.js 15 / TypeScript / Tailwind frontend is planned (`frontend/` holds `.gitkeep` placeholders only) | Python 3.13, FastAPI, PostgreSQL 16, SQLAlchemy 2.0, Alembic, Pydantic v2, Docker Compose, Pytest, Ruff (Next.js 15 / TS / Tailwind planned) | [GitHub](https://github.com/SimplyAlice/Quote_Flow) |
| **Career Connect** | Academic 6-person Agile prototype; 11 Kotlin/XML Activities, Firebase Auth, Cloud Firestore (`${uid}_${jobId}` composite keys, 14-day stale `PENDING` rule, `firestore.rules`), Remotive API (`Retrofit 2`), foreground snapshot listener (`StatusNotifier.kt`), and `AndroidKeyStore` `AES-256-GCM` local encryption verified by 26 JUnit 4 unit tests (`backend/` folder is scaffold-only) | Kotlin, Android SDK (API 24–37), XML & Material Design, Firebase Auth, Cloud Firestore, Retrofit 2, AndroidKeyStore (`AES/GCM/NoPadding`), JUnit 4 | Academic 6-Person Agile Prototype |

---

## 3. Two Standalone Scroll-Scrubbed Video Studies (`#video-one` & `#video-two`)

Both creative video assets run on **completely independent scroll tracks** (`createIndependentScrollVideo` in `assets/js/script.js`), separated by the Wave I project showcase (`#projects`):

- **Study I (`#video-one` — Deep Plum Studio):** Scrubs `assets/video/scrub/flower-opening-with-architecture-1080p.mp4` (`720p` on mobile; `3.92s`) through `video.currentTime` with synchronized captions and chapter jump pills.
- **Study II (`#video-two` — Warm Parchment Right-Side Split-Screen):** Scrubs `assets/video/scrub/botanical-animation-1080p.mp4` (`720p` on mobile; `9.96s`) alongside a sticky 4-beat editorial narrative on desktop and a stacked vertical layout on tablet/mobile.
- **Accessibility & Fallbacks:** Respects `prefers-reduced-motion: reduce` by displaying static WebP plates (`assets/images/posters/v1-*.webp`, `v2-*.webp`) and pausing animated project GIFs onto static posters with WCAG 2.2.2 Pause/Play toggles. See [assets/video/README.md](assets/video/README.md) for encoding details.

---

## 4. Repository Structure

```text
.
├── api/
│   └── visitors.js                 # Vercel serverless visitor counter endpoint (Neon PostgreSQL)
├── assets/
│   ├── asset-manifest.json         # Manifest of editorial, poster, project, and video assets
│   ├── css/styles.css              # Soft Power editorial design system
│   ├── documents/                  # ATS-friendly HTML CV & PDF
│   ├── images/
│   │   ├── editorial/              # Editorial botanical/architectural plates
│   │   ├── posters/                # Static WebP open/close plates for Study I & Study II
│   │   ├── projects/               # Captured app screens, GIFs, posters, and SVG diagrams
│   │   └── screenshots/            # Archival Phase 1 Azure & GitHub Actions screenshots
│   ├── js/script.js                # Local-safe visitor telemetry, independent video scrubbers, tabs, widgets
│   └── video/                      # Original MP4s, all-intra scrub derivatives, and manifest.json
├── tests/
│   └── portfolio.test.js           # Automated Node.js unit & integrity tests
├── index.html                      # Editorial portfolio & Cloud Resume Challenge dossier
├── package.json
└── README.md
```

---

## 5. Local Verification & Testing

Run syntax verification and the automated Node.js test suite (`node:test`):

```bash
npm run check
npm test
npm run verify
```

---

## 6. Contact

- **GitHub:** https://github.com/SimplyAlice
- **LinkedIn:** https://www.linkedin.com/in/alice-matarise-778bb6374/
- **Email:** Minervamatarise@gmail.com
