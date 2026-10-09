# Cloud Resume Portfolio

Personal portfolio for Alice Matarise, a final-year BSc Information Technology (Software Engineering) student at Eduvos pursuing a cloud-focused career.

**Live portfolio:** https://cloud-resume-challenge-six.vercel.app/

**Source:** https://github.com/SimplyAlice/Cloud-Resume-Challenge

## Current production architecture

The portfolio is hosted on Vercel. Its visitor counter uses a Vercel serverless API route and Neon PostgreSQL:

```text
Visitor
  -> Portfolio on Vercel (HTML, CSS, JavaScript)
  -> GET /api/visitors
  -> Vercel serverless Node.js function
  -> Neon PostgreSQL
```

When the page loads, `assets/js/script.js` requests `/api/visitors`. The handler in `api/visitors.js` uses `@neondatabase/serverless` and the `DATABASE_URL` environment variable to run an atomic PostgreSQL upsert: it creates the counter row if needed, otherwise increments its count, and returns the updated value as JSON.

The API accepts `GET` requests and returns HTTP 405 for other methods. It returns HTTP 500 when the database configuration is missing or a database request fails. The frontend checks the HTTP response and shows an error placeholder if it cannot retrieve the count.

**Microsoft Azure is part of my learning and certification journey; it does not host this portfolio.** The production portfolio and visitor counter currently use Vercel and Neon PostgreSQL.

## Career profile

I am a final-year BSc Information Technology (Software Engineering) student at Eduvos in Cape Town, expected to graduate in May 2027. Relevant coursework includes Systems Analysis & Design, Database Systems, Network Security, Web Server Management, Operating Systems, and IT Project Management. I am seeking early-career opportunities in cloud support, cloud engineering, and technical operations.

### Project experience

- **Dayform:** Developed and shipped a full-stack natural-language outing planner using a React/TypeScript frontend, Python/FastAPI backend, PostgreSQL persistence, and venue/transport data integrations. The live application is deployed on Vercel.
- **Cloud Resume Challenge:** Built a portfolio using Azure Functions, Azure Table Storage, and GitHub Actions CI/CD during my cloud learning. The current live version uses the Vercel and Neon architecture described above.
- **Career Connect:** Served as project manager and frontend Android developer on a six-person Agile academic team. Led research, UI/UX, implementation, and QA; built frontend components with Kotlin, XML, Android Studio, and Material Design; coordinated frontend/backend integration.

### Experience

- **Ignite Events — Events Steward** (September 2022–Present): Coordinate event workflows, manage competing priorities, adapt to changing requirements, and collaborate with teams.
- **The Drain Surgeon Cape Town Central — Marketing & Advertising Assistant:** Coordinate with clients and partners, support marketing service delivery, and independently address day-to-day operational challenges.
- **Capriccio Arts Powered Pre-school — Administrative Assistant** (March 2022–July 2024).

### Cloud learning

- **AWS Skills Center — Becoming a Cloud Practitioner:** Completed four cloud fundamentals classroom classes in September 2026, with exposure to Amazon S3 and Amazon EC2.
- **Microsoft Azure Fundamentals (AZ-900):** Preparing for the certification, with planned progression toward AZ-104.

## Project work

- Built and deployed a responsive static portfolio with HTML, CSS and JavaScript.
- Implemented a serverless API and connected it to a persistent PostgreSQL counter.
- Configured database connectivity through an environment variable rather than storing credentials in source.
- Managed the project in Git and GitHub and tested the deployed portfolio and API.
- Documented the production request flow and error handling.

## Technology

- **Frontend:** HTML5, CSS3, JavaScript
- **API:** Node.js, Vercel serverless functions
- **Database:** Neon PostgreSQL, `@neondatabase/serverless`
- **Source control and deployment:** Git, GitHub, Vercel

## Repository layout

```text
.
├── api/
│   └── visitors.js
├── assets/
│   ├── css/styles.css
│   ├── documents/Alice-Matarise-CV.html
│   ├── documents/Alice-Matarise-CV.pdf
│   ├── images/screenshots/
│   └── js/script.js
├── index.html
├── package.json
└── README.md
```

## Local checks

The repository does not currently define an automated test suite. The visitor API requires `DATABASE_URL` to run against a database. JavaScript syntax can be checked with:

```sh
node --check assets/js/script.js
node --check api/visitors.js
```

## About

I am building practical experience in software development, cloud services, APIs, databases, and deployment while developing toward a career in cloud engineering and technical operations.

- GitHub: https://github.com/SimplyAlice
- LinkedIn: https://www.linkedin.com/in/alice-matarise-778bb6374/
