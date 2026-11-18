const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const stylesCss = fs.readFileSync(path.join(repoRoot, "assets", "css", "styles.css"), "utf8");
const scriptJs = fs.readFileSync(path.join(repoRoot, "assets", "js", "script.js"), "utf8");
const cvHtml = fs.readFileSync(path.join(repoRoot, "assets", "documents", "Alice-Matarise-CV.html"), "utf8");
const videoManifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "assets", "video", "manifest.json"), "utf8"));
const assetManifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "assets", "asset-manifest.json"), "utf8"));
const visitorHandler = require("../api/visitors.js");

function createMockRes() {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        }
    };
}

test("api/visitors.js returns HTTP 405 for non-GET methods", async () => {
    for (const method of ["POST", "PUT", "DELETE", "PATCH"]) {
        const res = createMockRes();
        await visitorHandler({ method }, res);
        assert.equal(res.statusCode, 405);
        assert.deepEqual(res.body, { error: "Method not allowed" });
    }
});

test("api/visitors.js returns HTTP 500 when DATABASE_URL is missing", async () => {
    const originalUrl = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    try {
        const res = createMockRes();
        await visitorHandler({ method: "GET" }, res);
        assert.equal(res.statusCode, 500);
        assert.deepEqual(res.body, { error: "Database is not configured" });
    } finally {
        if (originalUrl !== undefined) {
            process.env.DATABASE_URL = originalUrl;
        }
    }
});

test("index.html uses a light hero and separates Study I (#video-one) and Study II (#video-two) with projects in between", () => {
    const h1Matches = indexHtml.match(/<h1\b/gi) || [];
    assert.equal(h1Matches.length, 1, "Expected exactly one <h1> element");

    assert.match(
        indexHtml,
        /Software Engineering Student\s*<span[^>]*>\|<\/span>\s*Aspiring Cloud Engineer\s*<span[^>]*>\|<\/span>\s*Technical Problem Solver/
    );
    assert.match(indexHtml, /Eduvos,\s*Cape Town/);
    assert.match(indexHtml, /2023\s*–\s*May 2027/);

    const requiredIds = [
        "hero",
        "about",
        "video-one",
        "video1-track",
        "video1-viewport",
        "botanical-video-1",
        "video1-static-plate",
        "projects",
        "video-two",
        "video2-track",
        "video2-viewport",
        "botanical-video-2",
        "video2-static-plate",
        "systems",
        "architecture",
        "crc-compare-slider",
        "cloud-devops",
        "skills",
        "environment",
        "education",
        "contact",
        "visitor-count",
        "hero-visitors",
        "dossier-visitors",
        "project-crc-visitors",
        "local-time"
    ];

    for (const id of requiredIds) {
        assert.match(indexHtml, new RegExp(`id="${id}"`), `Missing expected DOM id="#${id}"`);
    }

    // Ensure strict independent DOM separation: Hero -> About -> Video 1 -> Projects -> Video 2 -> Systems
    const heroPos = indexHtml.indexOf('id="hero"');
    const v1Pos = indexHtml.indexOf('id="video-one"');
    const projectsPos = indexHtml.indexOf('id="projects"');
    const v2Pos = indexHtml.indexOf('id="video-two"');
    const systemsPos = indexHtml.indexOf('id="systems"');

    assert.ok(heroPos > 0 && heroPos < v1Pos, "Hero must precede Video One");
    assert.ok(v1Pos < projectsPos, "Video One must precede the Wave I project visual break");
    assert.ok(projectsPos < v2Pos, "Wave I projects must sit cleanly between Video One and Video Two");
    assert.ok(v2Pos < systemsPos, "Video Two must precede Wave II interactive systems");

    // Ensure fused legacy bridge veil was completely eliminated
    assert.ok(!indexHtml.includes("botanical-bridge-veil"), "Merged video bridge veil must not exist");
});

test("index.html maintains strict accuracy, contextuality (no flowers on Quote_Flow or Career Connect), and zero sci-fi motifs", () => {
    const expectedLinks = [
        "https://dayform-live.vercel.app/",
        "https://github.com/SimplyAlice/dayform",
        "https://zazen-matcha.alwaysdata.net/",
        "https://github.com/SimplyAlice/Zazen-Matcha",
        "https://github.com/SimplyAlice/Quote_Flow",
        "https://github.com/SimplyAlice/Cloud-Resume-Challenge",
        "https://github.com/SimplyAlice",
        "https://www.linkedin.com/in/alice-matarise-778bb6374/",
        "mailto:Minervamatarise@gmail.com"
    ];

    for (const href of expectedLinks) {
        assert.ok(indexHtml.includes(href), `Expected link "${href}" in index.html`);
    }

    // Verified accurate facts across every showcase
    assert.ok(indexHtml.includes("Frontend Live (Vercel) · Backend DB Connectivity in Active Remediation"));
    assert.ok(indexHtml.includes("98 backend Pytest test modules"));
    assert.ok(!indexHtml.includes("187 automated Pytest"), "Unsupported 187 test claim must not be present");
    assert.ok(indexHtml.includes("179 passed in 9.57s"));
    assert.ok(indexHtml.includes("Feature/Backend-Foundation"));
    assert.ok(indexHtml.includes("Next.js 15 frontend planned"));
    assert.ok(indexHtml.includes("26 JUnit 4 unit tests"));

    // Contextual image guard: zero peony/flower artwork inside Wave II pure-systems band (#systems -> #architecture)
    const sysStart = indexHtml.indexOf('id="systems"');
    const archStart = indexHtml.indexOf('id="architecture"');
    const systemsImgs = indexHtml.slice(sysStart, archStart).match(/<img\b[^>]*>/gi) || [];
    for (const imgTag of systemsImgs) {
        assert.ok(
            !/peony|flower|botanical|floral|quoteflow-architecture-study/i.test(imgTag),
            `Technical Wave II systems must remain strictly free of flower imagery: ${imgTag}`
        );
    }

    // Prohibited sci-fi vocabulary & icy-blue colors
    for (const forbidden of ["Data Core", "rose-quartz", "cyberpunk", "spaceship", "holographic dashboard"]) {
        assert.ok(!indexHtml.toLowerCase().includes(forbidden.toLowerCase()), `Forbidden motif present: ${forbidden}`);
    }
    assert.ok(!stylesCss.toLowerCase().includes("#a8d8f0"), "Prohibited icy-blue #a8d8f0 token must not be present");
});

test("Alice-Matarise-CV.html preserves honest cloud-first summary and accurate Quote_Flow metrics", () => {
    assert.ok(cvHtml.includes("Professional Summary"));
    assert.ok(cvHtml.includes("Technical Skills"));
    assert.ok(cvHtml.includes("Cloud Operations &amp; Engineering Projects"));
    assert.match(cvHtml, /179\s+passing unit tests;\s*PostgreSQL 16 integration testing pending/);
    assert.ok(!cvHtml.includes("18 PG16 integration tests"));
    assert.ok(cvHtml.includes("Frontend Live on Vercel; Backend DB in Remediation"));
    assert.ok(!cvHtml.includes("187 automated Pytest"));
});

test("video and asset manifests represent two independent sections and every referenced file exists on disk", () => {
    assert.equal(videoManifest.ready, true);
    assert.equal(videoManifest.mode, "independent-sections");
    assert.equal(videoManifest.sections.length, 2);
    assert.equal(videoManifest.sections[0].id, "video1");
    assert.equal(videoManifest.sections[0].sectionId, "video-one");
    assert.equal(videoManifest.sections[0].originalFilename, "Flower_opening_with_architecture.mp4");
    assert.equal(videoManifest.sections[1].id, "video2");
    assert.equal(videoManifest.sections[1].sectionId, "video-two");
    assert.equal(videoManifest.sections[1].originalFilename, "Botanical_animation.mp4");
    assert.equal(videoManifest.bridgeRange, undefined);

    for (const entry of videoManifest.sections) {
        const requiredPaths = [
            entry.originalArchivePath,
            entry.posters.open,
            entry.posters.close,
            entry.sources.desktop,
            entry.sources.mobile
        ];
        for (const relPath of requiredPaths) {
            const fullPath = path.join(repoRoot, relPath);
            assert.ok(fs.existsSync(fullPath), `Missing manifest video/poster asset: ${relPath}`);
            assert.ok(fs.statSync(fullPath).size > 0, `Empty manifest video/poster asset: ${relPath}`);
        }
    }

    const manifestGroups = [
        ...assetManifest.videos.originals,
        ...assetManifest.videos.scrubDerivatives,
        ...assetManifest.videos.posters,
        ...assetManifest.editorialImages,
        ...assetManifest.projectMedia.dayform,
        ...assetManifest.projectMedia.zazenMatcha,
        ...assetManifest.projectMedia.quoteFlow,
        ...assetManifest.projectMedia.careerConnect,
        ...assetManifest.projectMedia.cloudResumeChallenge
    ];

    for (const item of manifestGroups) {
        const fullPath = path.join(repoRoot, item.path);
        assert.ok(fs.existsSync(fullPath), `Missing asset in asset-manifest.json: ${item.path}`);
        assert.ok(fs.statSync(fullPath).size > 0, `Empty asset in asset-manifest.json: ${item.path}`);
    }
});

test("all local images referenced in index.html exist on disk with alt, width, and height", () => {
    const imgTags = indexHtml.match(/<img\b[^>]*>/gi) || [];
    assert.ok(imgTags.length >= 25, `Expected comprehensive editorial & project visuals (found ${imgTags.length})`);

    for (const tag of imgTags) {
        assert.match(tag, /\balt="[^"]*"/i, `Image tag missing alt attribute: ${tag}`);
        assert.match(tag, /\bwidth="\d+"/i, `Image tag missing width attribute: ${tag}`);
        assert.match(tag, /\bheight="\d+"/i, `Image tag missing height attribute: ${tag}`);

        for (const attr of ["src", "data-gif-src", "data-poster-src"]) {
            const match = tag.match(new RegExp(`\\b${attr}="([^"]+)"`, "i"));
            if (match) {
                const assetPath = path.join(repoRoot, match[1]);
                assert.ok(fs.existsSync(assetPath), `Referenced image (${attr}) does not exist: ${match[1]}`);
            }
        }
    }

    assert.ok(fs.existsSync(path.join(repoRoot, "assets", "documents", "Alice-Matarise-CV.pdf")));
    assert.ok(fs.existsSync(path.join(repoRoot, "assets", "documents", "Alice-Matarise-CV.html")));
    assert.ok(fs.existsSync(path.join(repoRoot, "assets", "css", "styles.css")));
    assert.ok(fs.existsSync(path.join(repoRoot, "assets", "js", "script.js")));
});

test("Soft Power design system tokens, independent video controller, and interactive widgets exist", () => {
    assert.ok(stylesCss.includes("--powder-pink: #F4B8D2"));
    assert.ok(stylesCss.includes("--bg-ivory: #FAF6F3"));
    assert.ok(stylesCss.includes("--parchment-warm: #F1EAE1"));
    assert.ok(stylesCss.includes("--plum-studio: #1C1118"));
    assert.ok(stylesCss.includes("--berry: #6E1F42"));
    assert.ok(stylesCss.includes("prefers-reduced-motion: no-preference"));
    assert.ok(stylesCss.includes("prefers-reduced-motion: reduce"));
    assert.ok(stylesCss.includes("forced-colors: active"));

    assert.ok(scriptJs.includes("/api/visitors"));
    assert.ok(scriptJs.includes("isLocalPreviewEnvironment"));
    assert.ok(scriptJs.includes("createIndependentScrollVideo"));
    assert.ok(scriptJs.includes("videoEl.currentTime"));
    assert.ok(scriptJs.includes("initMotionGifToggles"));
    assert.ok(scriptJs.includes("initScopedTablists"));
    assert.ok(scriptJs.includes("initDayformGallery"));
    assert.ok(scriptJs.includes("initQuoteFlowLab"));
    assert.ok(scriptJs.includes("initCareerConnectStage"));
    assert.ok(scriptJs.includes("initCrcComparisonSlider"));
});
