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

I am developing practical experience in cloud engineering, software development, APIs, automation and technical operations while studying toward the Microsoft Azure Fundamentals (AZ-900) certification.

- GitHub: https://github.com/SimplyAlice
- LinkedIn: https://www.linkedin.com/in/alice-matarise-778bb6374/
