// ==========================================================================
// ALICE MATARISE — PORTFOLIO & CLOUD RESUME CHALLENGE CLIENT SCRIPT
// Creative Direction: Soft Power — Organic Growth Meets Technical Architecture
// ==========================================================================

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileViewportQuery = window.matchMedia("(max-width: 768px)");

// --------------------------------------------------------------------------
// 1. CLOUD RESUME CHALLENGE VISITOR COUNTER (/api/visitors)
//    - In production (Vercel), calls GET /api/visitors backed by Neon PostgreSQL.
//    - On localhost / 127.0.0.1 / file:, uses a deterministic local mock by
//      default so visual & automated testing never inflates the live database.
// --------------------------------------------------------------------------

const localMockCount = 101;

function isLocalPreviewEnvironment() {
    const host = window.location.hostname;
    const params = new URLSearchParams(window.location.search);
    if (params.get("live_visitors") === "1") {
        return false;
    }
    return (
        window.location.protocol === "file:" ||
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "::1"
    );
}

function setCounterElements(textValue) {
    const ids = ["visitor-count", "hero-visitors", "dossier-visitors", "project-crc-visitors"];
    ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = String(textValue);
        }
    });
}

function animateCounterValue(target) {
    if (reducedMotionQuery.matches) {
        setCounterElements(target.toLocaleString("en-ZA"));
        return;
    }

    const durationMs = 600;
    const startTime = performance.now();

    function tick(now) {
        const progress = Math.min(1, (now - startTime) / durationMs);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.max(1, Math.round(target * eased));
        setCounterElements(current.toLocaleString("en-ZA"));

        if (progress < 1) {
            window.requestAnimationFrame(tick);
        } else {
            setCounterElements(target.toLocaleString("en-ZA"));
        }
    }

    window.requestAnimationFrame(tick);
}

async function updateCounter() {
    const statusBadge = document.getElementById("api-status-badge");
    const latencyEl = document.getElementById("api-latency");
    const verifyBtn = document.getElementById("verify-api-btn");

    if (statusBadge) {
        statusBadge.textContent = "Requesting GET /api/visitors…";
    }
    if (verifyBtn) {
        verifyBtn.disabled = true;
    }

    if (isLocalPreviewEnvironment()) {
        animateCounterValue(localMockCount);
        if (statusBadge) {
            statusBadge.textContent = "HTTP 200 OK · Local Mock (Neon DB Protected)";
        }
        if (latencyEl) {
            latencyEl.textContent = "Latency: 1 ms (Mocked)";
        }
        if (verifyBtn) {
            verifyBtn.disabled = false;
        }
        return;
    }

    const startMs = performance.now();

    try {
        const response = await fetch("/api/visitors", {
            method: "GET",
            headers: { Accept: "application/json" }
        });

        const elapsedMs = Math.round(performance.now() - startMs);
        if (latencyEl) {
            latencyEl.textContent = `Latency: ${elapsedMs} ms`;
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
            throw new Error("Non-JSON response");
        }

        const data = await response.json();
        const count = Number(data.count);
        if (!Number.isFinite(count) || count < 0) {
            throw new Error("Invalid count payload");
        }

        animateCounterValue(count);
        if (statusBadge) {
            statusBadge.textContent = "HTTP 200 OK · Neon PostgreSQL";
        }
    } catch {
        setCounterElements("—");
        if (statusBadge) {
            statusBadge.textContent = "API Standby (Requires Vercel Serverless Runtime)";
        }
        if (latencyEl) {
            latencyEl.textContent = "Mode: Static / Offline Preview";
        }
    } finally {
        if (verifyBtn) {
            verifyBtn.disabled = false;
        }
    }
}

updateCounter();

const verifyApiBtn = document.getElementById("verify-api-btn");
if (verifyApiBtn) {
    verifyApiBtn.addEventListener("click", () => {
        updateCounter();
    });
}

// --------------------------------------------------------------------------
// 2. STICKY HEADER OFFSET SYNCHRONIZATION
// --------------------------------------------------------------------------

function initHeaderOffsetSync() {
    const siteHeader = document.querySelector(".site-header");
    if (!siteHeader) return;

    function syncOffset() {
        const height = Math.ceil(siteHeader.getBoundingClientRect().height);
        if (height > 0) {
            document.documentElement.style.setProperty("--header-sticky-offset", `${height}px`);
        }
    }

    syncOffset();
    if ("ResizeObserver" in window) {
        const ro = new ResizeObserver(syncOffset);
        ro.observe(siteHeader);
    }
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(syncOffset).catch(() => {});
    }
    window.addEventListener("resize", syncOffset, { passive: true });
}

initHeaderOffsetSync();

// --------------------------------------------------------------------------
// 3. TWO COMPLETELY INDEPENDENT SCROLL-SCRUB VIDEO CONTROLLERS
//    - Study I (#video-one): Flower_opening_with_architecture.mp4 (0.00 -> 3.92s)
//    - Study II (#video-two): Botanical_animation.mp4 (0.00 -> 9.96s)
//    - Zero shared timeline, zero automatic transition, independent tracks.
// --------------------------------------------------------------------------

const DEFAULT_VIDEO_MANIFEST = {
    video1: {
        durationSeconds: 3.916667,
        posters: {
            open: "assets/images/posters/v1-open.webp",
            close: "assets/images/posters/v1-close.webp"
        },
        sources: {
            desktop: "assets/video/scrub/flower-opening-with-architecture-1080p.mp4",
            mobile: "assets/video/scrub/flower-opening-with-architecture-720p.mp4",
            type: "video/mp4"
        }
    },
    video2: {
        durationSeconds: 9.958333,
        posters: {
            open: "assets/images/posters/v2-open.webp",
            close: "assets/images/posters/v2-close.webp"
        },
        sources: {
            desktop: "assets/video/scrub/botanical-animation-1080p.mp4",
            mobile: "assets/video/scrub/botanical-animation-720p.mp4",
            type: "video/mp4"
        }
    }
};

function createIndependentScrollVideo(config) {
    const section = document.getElementById(config.sectionId);
    const track = document.getElementById(config.trackId);
    const viewport = document.getElementById(config.viewportId);
    const videoEl = document.getElementById(config.videoId);
    const staticPlate = document.getElementById(config.staticPlateId);
    const scrubFill = document.getElementById(config.scrubFillId);
    const stickyEl = track ? track.querySelector(config.stickySelector) : null;
    const jumpButtons = Array.from(document.querySelectorAll(`[${config.jumpAttr}]`));

    if (!section || !track || !viewport || !videoEl) {
        return null;
    }

    let spec = {
        durationSeconds: config.fallbackDuration,
        posters: config.posters,
        sources: config.sources
    };
    let duration = spec.durationSeconds;
    let ready = false;
    let failed = false;
    let sourceAttached = false;
    let pendingSeek = null;
    let rafPending = false;
    let manualProgress = null;

    function pickSrc() {
        return mobileViewportQuery.matches
            ? spec.sources.mobile || spec.sources.desktop
            : spec.sources.desktop;
    }

    function attachSource() {
        if (sourceAttached || reducedMotionQuery.matches) return;
        sourceAttached = true;
        const src = pickSrc();
        if (!src) return;
        videoEl.preload = "auto";
        if (!videoEl.querySelector("source")) {
            const sourceNode = document.createElement("source");
            sourceNode.src = src;
            sourceNode.type = spec.sources.type || "video/mp4";
            videoEl.appendChild(sourceNode);
        }
        videoEl.load();
    }

    function updateStateAttr() {
        if (reducedMotionQuery.matches) {
            viewport.setAttribute("data-video-state", "reduced-motion");
        } else if (failed) {
            viewport.setAttribute("data-video-state", "fallback");
        } else if (ready) {
            viewport.setAttribute("data-video-state", "ready");
        } else {
            viewport.setAttribute("data-video-state", "loading");
        }
    }

    function seekVideo(seconds) {
        const maxTime = Math.max(0, duration - 0.002);
        const clamped = Math.max(0, Math.min(maxTime, seconds));

        if (!ready || reducedMotionQuery.matches) {
            return;
        }
        if (!videoEl.paused) {
            videoEl.pause();
        }
        if (Math.abs(videoEl.currentTime - clamped) <= 0.01) {
            return;
        }
        if (videoEl.seeking) {
            pendingSeek = clamped;
            return;
        }
        pendingSeek = null;
        try {
            videoEl.currentTime = clamped;
        } catch {
            // Ignore transient InvalidStateError
        }
    }

    function applyProgress(normalizedProgress) {
        const clamped = Math.max(0, Math.min(1, normalizedProgress));
        seekVideo(clamped * duration);

        if (scrubFill) {
            scrubFill.style.width = `${Math.round(clamped * 100)}%`;
        }

        const beat = config.getBeat(clamped);
        if (staticPlate) {
            const targetPoster = beat.poster === "close" ? spec.posters.close : spec.posters.open;
            if (staticPlate.getAttribute("src") !== targetPoster) {
                staticPlate.setAttribute("src", targetPoster);
            }
        }

        config.onBeatChange(beat, clamped, jumpButtons);
    }

    function getTrackMetrics() {
        const rect = track.getBoundingClientRect();
        const stickyTop = stickyEl ? (parseFloat(window.getComputedStyle(stickyEl).top) || 0) : 0;
        const stageHeight = stickyEl ? stickyEl.getBoundingClientRect().height : window.innerHeight;
        const scrollableDistance = Math.max(0, rect.height - stageHeight);
        return {
            rectTop: rect.top,
            stickyTop,
            scrollableDistance
        };
    }

    function computeScrollProgress() {
        if (manualProgress !== null) {
            return manualProgress;
        }
        if (reducedMotionQuery.matches) {
            return 0;
        }
        const { rectTop, stickyTop, scrollableDistance } = getTrackMetrics();
        if (scrollableDistance <= 0) {
            return 0;
        }
        return Math.max(0, Math.min(1, (stickyTop - rectTop) / scrollableDistance));
    }

    function handleReady() {
        if (ready) return;
        if (Number.isFinite(videoEl.duration) && videoEl.duration > 0) {
            ready = true;
            duration = videoEl.duration;
            videoEl.pause();
            updateStateAttr();
            applyProgress(computeScrollProgress());
        }
    }

    videoEl.addEventListener("loadedmetadata", handleReady);
    videoEl.addEventListener("loadeddata", handleReady);
    videoEl.addEventListener("canplay", handleReady);

    videoEl.addEventListener("seeked", () => {
        if (pendingSeek !== null && !reducedMotionQuery.matches) {
            const next = pendingSeek;
            pendingSeek = null;
            if (Math.abs(videoEl.currentTime - next) > 0.01) {
                try {
                    videoEl.currentTime = next;
                } catch {
                    // Ignore transient InvalidStateError
                }
            }
        }
    });

    videoEl.addEventListener("error", () => {
        failed = true;
        updateStateAttr();
    });

    function onScroll() {
        if (rafPending || reducedMotionQuery.matches) return;
        rafPending = true;
        window.requestAnimationFrame(() => {
            rafPending = false;
            manualProgress = null;
            const rect = track.getBoundingClientRect();
            const isNearViewport = rect.bottom > -450 && rect.top < window.innerHeight + 450;
            if (isNearViewport) {
                attachSource();
            }
            applyProgress(computeScrollProgress());
        });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    jumpButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const target = parseFloat(btn.getAttribute(config.jumpAttr)) || 0;
            attachSource();
            const metrics = getTrackMetrics();
            if (!reducedMotionQuery.matches && metrics.scrollableDistance > 20) {
                manualProgress = null;
                const y = window.scrollY + (metrics.rectTop - metrics.stickyTop) + target * metrics.scrollableDistance;
                window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: "instant" });
            } else {
                manualProgress = target;
            }
            applyProgress(target);
        });
    });

    reducedMotionQuery.addEventListener("change", () => {
        if (!reducedMotionQuery.matches) {
            manualProgress = null;
            attachSource();
        }
        updateStateAttr();
        applyProgress(computeScrollProgress());
    });

    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
            (entries, obs) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        attachSource();
                        obs.unobserve(entry.target);
                    }
                }
            },
            { rootMargin: "450px 0px" }
        );
        io.observe(section);
    } else {
        attachSource();
    }

    updateStateAttr();
    applyProgress(computeScrollProgress());

    return {
        setManifestSpec(nextSpec) {
            if (!nextSpec) return;
            spec = {
                durationSeconds: nextSpec.durationSeconds || spec.durationSeconds,
                posters: nextSpec.posters || spec.posters,
                sources: nextSpec.sources || spec.sources
            };
            duration = spec.durationSeconds;
            applyProgress(computeScrollProgress());
        }
    };
}

function initIndependentVideoSections() {
    const v1Controller = createIndependentScrollVideo({
        sectionId: "video-one",
        trackId: "video1-track",
        stickySelector: ".video-one-sticky",
        viewportId: "video1-viewport",
        videoId: "botanical-video-1",
        staticPlateId: "video1-static-plate",
        scrubFillId: "video1-scrub-fill",
        jumpAttr: "data-v1-jump",
        fallbackDuration: DEFAULT_VIDEO_MANIFEST.video1.durationSeconds,
        posters: DEFAULT_VIDEO_MANIFEST.video1.posters,
        sources: DEFAULT_VIDEO_MANIFEST.video1.sources,
        getBeat(p) {
            if (p < 0.35) {
                return {
                    idx: 0,
                    poster: "open",
                    title: "01 · Unfurling the Problem Space",
                    desc: "In quiet plum darkness, the blush bud holds its structure before orthogonal design elevations illuminate behind it."
                };
            }
            if (p < 0.72) {
                return {
                    idx: 1,
                    poster: "open",
                    title: "02 · Architectural Plans Emerge",
                    desc: "Outer petals unfold while drafted elevation sheets clarify system boundaries, inputs, and failure modes."
                };
            }
            return {
                idx: 2,
                poster: "close",
                title: "03 · Illuminated Blueprint Foundation",
                desc: "Every petal rests against crisp technical drafting sheets — soft composition underpinned by explicit structure."
            };
        },
        onBeatChange(beat, _progress, buttons) {
            const titleEl = document.getElementById("video1-beat-title");
            const descEl = document.getElementById("video1-beat-desc");
            if (titleEl && titleEl.textContent !== beat.title) {
                titleEl.textContent = beat.title;
            }
            if (descEl && descEl.textContent !== beat.desc) {
                descEl.textContent = beat.desc;
            }
            buttons.forEach((btn, idx) => {
                const active = idx === beat.idx;
                btn.classList.toggle("is-active", active);
                btn.setAttribute("aria-pressed", String(active));
            });
        }
    });

    const v2Controller = createIndependentScrollVideo({
        sectionId: "video-two",
        trackId: "video2-track",
        stickySelector: ".video-two-sticky",
        viewportId: "video2-viewport",
        videoId: "botanical-video-2",
        staticPlateId: "video2-static-plate",
        scrubFillId: "video2-scrub-fill",
        jumpAttr: "data-v2-jump",
        fallbackDuration: DEFAULT_VIDEO_MANIFEST.video2.durationSeconds,
        posters: DEFAULT_VIDEO_MANIFEST.video2.posters,
        sources: DEFAULT_VIDEO_MANIFEST.video2.sources,
        getBeat(p) {
            if (p < 0.25) {
                return {
                    idx: 0,
                    poster: "open",
                    kicker: "BEAT 01 OF 04 // INITIAL HYPOTHESIS",
                    title: "01 · Organic Experimentation",
                    desc: "A fresh peony bud rests on warm ivory parchment — mirroring exploratory discovery before imposing strict contracts or constraints."
                };
            }
            if (p < 0.55) {
                return {
                    idx: 1,
                    poster: "open",
                    kicker: "BEAT 02 OF 04 // CONSTRAINT EXTRACTION",
                    title: "02 · Defining System Contracts",
                    desc: "As petals widen steadily outward, vague requirements crystallise into typed schemas, HTTP statuses, and relational foreign keys."
                };
            }
            if (p < 0.82) {
                return {
                    idx: 2,
                    poster: "close",
                    kicker: "BEAT 03 OF 04 // EMPIRICAL VERIFICATION",
                    title: "03 · Precision Geometry Aligns",
                    desc: "Radial protractors and calibration ticks trace around the bloom — representing Pytest units, JUnit rules, and SHA-256 verification."
                };
            }
            return {
                idx: 3,
                poster: "close",
                kicker: "BEAT 04 OF 04 // STRUCTURAL EQUILIBRIUM",
                title: "04 · Balanced Production Bloom",
                desc: "Full peony form anchored by measured engineering geometry — expressive frontend poise backed by deterministic backend truth."
            };
        },
        onBeatChange(beat, _progress, buttons) {
            const kickerEl = document.getElementById("video2-beat-kicker");
            const titleEl = document.getElementById("video2-beat-title");
            const descEl = document.getElementById("video2-beat-desc");
            if (kickerEl && kickerEl.textContent !== beat.kicker) {
                kickerEl.textContent = beat.kicker;
            }
            if (titleEl && titleEl.textContent !== beat.title) {
                titleEl.textContent = beat.title;
            }
            if (descEl && descEl.textContent !== beat.desc) {
                descEl.textContent = beat.desc;
            }
            document.querySelectorAll(".v2-beat-item").forEach((li, idx) => {
                li.classList.toggle("is-active", idx === beat.idx);
            });
            buttons.forEach((btn, idx) => {
                btn.setAttribute("aria-pressed", String(idx === beat.idx));
            });
        }
    });

    (async () => {
        try {
            const resp = await fetch("assets/video/manifest.json", {
                method: "GET",
                headers: { Accept: "application/json" }
            });
            if (!resp.ok) return;
            const parsed = await resp.json();
            if (parsed && Array.isArray(parsed.sections)) {
                const s1 = parsed.sections.find((s) => s.id === "video1");
                const s2 = parsed.sections.find((s) => s.id === "video2");
                if (s1 && v1Controller) v1Controller.setManifestSpec(s1);
                if (s2 && v2Controller) v2Controller.setManifestSpec(s2);
            }
        } catch {
            // Keep default manifest config
        }
    })();
}

initIndependentVideoSections();

// --------------------------------------------------------------------------
// 4. WCAG 2.2.2 PAUSE / PLAY TOGGLE FOR ANIMATED PROJECT GIFS
// --------------------------------------------------------------------------

function initMotionGifToggles() {
    const containers = Array.from(document.querySelectorAll("[data-gif-container]"));

    containers.forEach((figure) => {
        const img = figure.querySelector("img[data-gif-src][data-poster-src]");
        const toggleBtn = figure.querySelector("[data-gif-toggle]");
        if (!img || !toggleBtn) return;

        const gifSrc = img.getAttribute("data-gif-src");
        const posterSrc = img.getAttribute("data-poster-src");
        let isPlaying = !reducedMotionQuery.matches;

        function renderState() {
            const target = isPlaying ? gifSrc : posterSrc;
            if (img.getAttribute("src") !== target) {
                img.setAttribute("src", target);
            }
            toggleBtn.textContent = isPlaying ? "Pause animation" : "Play animation";
            figure.setAttribute("data-motion-state", isPlaying ? "playing" : "paused");
        }

        toggleBtn.addEventListener("click", () => {
            isPlaying = !isPlaying;
            renderState();
        });

        reducedMotionQuery.addEventListener("change", (evt) => {
            isPlaying = !evt.matches;
            renderState();
        });

        renderState();
    });
}

initMotionGifToggles();

// --------------------------------------------------------------------------
// 5. SCOPED WAI-ARIA TABLISTS (WITH hidden="until-found" beforematch SUPPORT)
// --------------------------------------------------------------------------

function initScopedTablists() {
    const tablists = Array.from(document.querySelectorAll("[data-scoped-tablist]"));

    tablists.forEach((tablist) => {
        const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
        if (tabs.length === 0) return;

        function activateTab(selectedTab, moveFocus = false) {
            tabs.forEach((tab) => {
                const isTarget = tab === selectedTab;
                tab.classList.toggle("active", isTarget);
                tab.setAttribute("aria-selected", String(isTarget));
                tab.setAttribute("tabindex", isTarget ? "0" : "-1");

                const panelId = tab.getAttribute("aria-controls");
                const panel = panelId ? document.getElementById(panelId) : null;
                if (panel) {
                    panel.hidden = isTarget ? false : "until-found";
                }
            });

            if (moveFocus) {
                selectedTab.focus();
            }
        }

        tabs.forEach((tab, index) => {
            tab.setAttribute("tabindex", tab.getAttribute("aria-selected") === "true" ? "0" : "-1");

            const panelId = tab.getAttribute("aria-controls");
            const panel = panelId ? document.getElementById(panelId) : null;
            if (panel) {
                panel.addEventListener("beforematch", () => {
                    activateTab(tab, false);
                });
            }

            tab.addEventListener("click", () => {
                activateTab(tab, false);
            });

            tab.addEventListener("keydown", (event) => {
                let nextIndex = null;
                if (event.key === "ArrowRight") {
                    nextIndex = (index + 1) % tabs.length;
                } else if (event.key === "ArrowLeft") {
                    nextIndex = (index - 1 + tabs.length) % tabs.length;
                } else if (event.key === "Home") {
                    nextIndex = 0;
                } else if (event.key === "End") {
                    nextIndex = tabs.length - 1;
                }

                if (nextIndex !== null) {
                    event.preventDefault();
                    activateTab(tabs[nextIndex], true);
                }
            });
        });
    });
}

initScopedTablists();

// --------------------------------------------------------------------------
// 6. DAYFORM 6-SCREEN GALLERY SWITCHER
// --------------------------------------------------------------------------

function initDayformGallery() {
    const mainImg = document.getElementById("df-active-shot-img");
    const mainCaption = document.getElementById("df-active-shot-caption");
    const thumbs = Array.from(document.querySelectorAll(".df-thumb-btn"));
    if (!mainImg || thumbs.length === 0) return;

    thumbs.forEach((btn) => {
        btn.addEventListener("click", () => {
            const shot = btn.getAttribute("data-df-shot");
            const caption = btn.getAttribute("data-df-caption");
            const alt = btn.getAttribute("data-df-alt");
            if (shot) mainImg.setAttribute("src", shot);
            if (alt) mainImg.setAttribute("alt", alt);
            if (caption && mainCaption) mainCaption.textContent = caption;

            thumbs.forEach((item) => item.classList.toggle("is-selected", item === btn));
        });
    });
}

initDayformGallery();

// --------------------------------------------------------------------------
// 7. HORIZONTAL SCROLL-SNAP FILMSTRIPS (ZAZEN MATCHA & AZURE ARCHIVE)
// --------------------------------------------------------------------------

function initHorizontalFilmstrips() {
    document.querySelectorAll("[data-strip-prev]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const strip = document.getElementById(btn.getAttribute("data-strip-prev"));
            if (!strip) return;
            const step = Math.round(strip.clientWidth * 0.72);
            strip.scrollBy({
                left: -step,
                behavior: reducedMotionQuery.matches ? "auto" : "smooth"
            });
        });
    });

    document.querySelectorAll("[data-strip-next]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const strip = document.getElementById(btn.getAttribute("data-strip-next"));
            if (!strip) return;
            const step = Math.round(strip.clientWidth * 0.72);
            strip.scrollBy({
                left: step,
                behavior: reducedMotionQuery.matches ? "auto" : "smooth"
            });
        });
    });
}

initHorizontalFilmstrips();

// --------------------------------------------------------------------------
// 8. QUOTE_FLOW INTERACTIVE PIPELINE & EXACTDECIMAL SANDBOX
// --------------------------------------------------------------------------

function initQuoteFlowLab() {
    const sandboxOutput = document.getElementById("qf-sandbox-output");
    const sandboxBtns = Array.from(document.querySelectorAll("[data-qf-payload]"));
    const payloads = {
        string: `Input : { "unit_cost_zar": "149.99" }\nPydantic v2 ExactDecimal -> ACCEPTED -> Decimal("149.9900")\nPostgreSQL NUMERIC(14,4) -> STORED WITH ZERO MANTISSA DRIFT`,
        float: `Input : { "unit_cost_zar": 149.99 }  // raw JSON IEEE 754 float\nPydantic v2 ExactDecimal -> 422 VALIDATION ERROR\nReason: Binary float 149.9900000000000090949... rejected before DB write.`,
        drift: `IEEE 754 float sum : 0.1 + 0.2 === 0.30000000000000004 (DRIFT)\nQuote_Flow Decimal : Decimal("0.1") + Decimal("0.2") === Decimal("0.3000")`
    };

    sandboxBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const key = btn.getAttribute("data-qf-payload");
            const codeEl = sandboxOutput ? sandboxOutput.querySelector("code") : null;
            if (codeEl && payloads[key]) {
                codeEl.textContent = payloads[key];
            } else if (sandboxOutput && payloads[key]) {
                sandboxOutput.textContent = payloads[key];
            }
            sandboxBtns.forEach((b) => {
                const active = b === btn;
                b.classList.toggle("is-active", active);
                b.setAttribute("aria-pressed", String(active));
            });
        });
    });

    const pipeDetail = document.getElementById("qf-pipe-detail");
    const pipeBtns = Array.from(document.querySelectorAll("[data-pipe-idx]"));
    const stages = [
        {
            title: 'Stage 01 · Canonical ASCII SKU Normalisation (COLLATE "C")',
            body: "Strips whitespace/punctuation into uppercase ASCII keys constrained by PostgreSQL regex CHECK rules so identical supplier parts never duplicate."
        },
        {
            title: "Stage 02 · Explicit Supplier Alias Resolution",
            body: "Maps supplier-specific SKU strings directly to master catalogue entities across historical import batches without losing supplier provenance."
        },
        {
            title: "Stage 03 · Similarity & Category Candidate Scoring",
            body: "Flags probable SKU matches inside an isolated staging batch for review rather than blindly overwriting curated catalogue rows."
        },
        {
            title: "Stage 04 · Preferred Supplier Baseline Protection",
            body: "Prevents lower-confidence CSV/XLSX imports from silently overwriting approved primary supplier unit costs."
        },
        {
            title: "Stage 05 · 4-Column Composite Quotation Revision Key",
            body: "Composite (tenant_id, quote_group_id, revision_number, id) binds quotes to immutable cost snapshots even as supplier sheets change."
        }
    ];

    pipeBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const idx = Number(btn.getAttribute("data-pipe-idx")) || 0;
            const stage = stages[idx];
            if (pipeDetail && stage) {
                pipeDetail.innerHTML = `<strong>${stage.title}</strong><p>${stage.body}</p>`;
            }
            pipeBtns.forEach((b) => {
                const active = b === btn;
                b.classList.toggle("is-active", active);
                b.setAttribute("aria-pressed", String(active));
            });
        });
    });
}

initQuoteFlowLab();

// --------------------------------------------------------------------------
// 9. CAREER CONNECT 11-SCREEN ANDROID VIEWPORT SWITCHER
// --------------------------------------------------------------------------

function initCareerConnectStage() {
    const phoneImg = document.getElementById("cc-phone-screen");
    const codeEl = document.getElementById("cc-screen-code");
    const titleEl = document.getElementById("cc-screen-title");
    const descEl = document.getElementById("cc-screen-desc");
    const chips = Array.from(document.querySelectorAll("[data-cc-idx]"));

    if (!phoneImg || chips.length === 0) return;

    const screens = [
        {
            src: "assets/images/projects/career-connect/01-welcome.webp",
            alt: "Career Connect Welcome splash Activity in Kotlin Material Design",
            code: "SCREEN 01 / 11 · WelcomeActivity.kt",
            title: "Welcome & Entry Onboarding",
            desc: "Entry point introducing graduate career discovery before Firebase session routing."
        },
        {
            src: "assets/images/projects/career-connect/02-login.webp",
            alt: "Career Connect Firebase Authentication Sign In screen",
            code: "SCREEN 02 / 11 · LoginActivity.kt",
            title: "Firebase Auth Session Entry",
            desc: "Authenticates student accounts via Firebase Authentication with UID-scoped Firestore security rules."
        },
        {
            src: "assets/images/projects/career-connect/03-home-feed.webp",
            alt: "Career Connect Android Home screen with graduate role recommendations",
            code: "SCREEN 03 / 11 · MainActivity.kt",
            title: "Home Feed & Curated SA Roles",
            desc: "Pairs JobRepository.kt's 12-item curated South African entry-level dataset with interactive field filters."
        },
        {
            src: "assets/images/projects/career-connect/04-cybersecurity-filter.webp",
            alt: "Career Connect filtered listings showing cybersecurity graduate roles",
            code: "SCREEN 04 / 11 · FieldFilterAdapter",
            title: "Degree-Discipline Filtering",
            desc: "Narrows open graduate listings dynamically across Cloud, Software Dev, Data Science, and Cybersecurity."
        },
        {
            src: "assets/images/projects/career-connect/05-remotive-jobs.webp",
            alt: "Career Connect Remotive API live remote feed via Retrofit 2 and Gson",
            code: "SCREEN 05 / 11 · JobApi.kt (Retrofit 2)",
            title: "Remotive API Live Remote Feed",
            desc: "Fetches public remote listings over HTTPS via Retrofit 2 and flags South Africa time-zone compatibility."
        },
        {
            src: "assets/images/projects/career-connect/06-job-details.webp",
            alt: "Career Connect job detail view with apply action",
            code: "SCREEN 06 / 11 · JobDetailActivity.kt",
            title: "Role Detail & Apply Action",
            desc: "Writes application state cleanly using composite ${uid}_${jobId} keys to prevent duplicate submissions."
        },
        {
            src: "assets/images/projects/career-connect/07-applications-tracker.webp",
            alt: "Career Connect Cloud Firestore application status tracker",
            code: "SCREEN 07 / 11 · ApplicationsActivity.kt",
            title: "Firestore Application Tracker",
            desc: "Enforces status transitions and highlights applications remaining PENDING after 14 days via StatusRulesTest.kt."
        },
        {
            src: "assets/images/projects/career-connect/08-system-notification.webp",
            alt: "Career Connect Android OS status update notification",
            code: "SCREEN 08 / 11 · StatusNotifier.kt",
            title: "Foreground OS Status Notification",
            desc: "Emits local NotificationCompat alerts strictly via active addSnapshotListener while the app is open (no background FCM yet)."
        },
        {
            src: "assets/images/projects/career-connect/09-cv-builder.webp",
            alt: "Career Connect on-device CV Builder form screen",
            code: "SCREEN 09 / 11 · CVBuilderActivity.kt",
            title: "On-Device CV Builder & Plain-Text Share",
            desc: "Stores structured profile fields locally and exports a formatted plain-text summary via Intent.ACTION_SEND."
        },
        {
            src: "assets/images/projects/career-connect/10-encrypted-profile.webp",
            alt: "Career Connect student profile screen backed by AndroidKeyStore AES-256-GCM",
            code: "SCREEN 10 / 11 · SecureProfileStore.kt",
            title: "Hardware-Backed AES-256-GCM Storage",
            desc: "Encrypts personal profile data locally inside SharedPreferences using AndroidKeyStore AES/GCM/NoPadding keys."
        },
        {
            src: "assets/images/projects/career-connect/11-logout-dialog.webp",
            alt: "Career Connect confirmation dialog before Firebase sign out",
            code: "SCREEN 11 / 11 · Session Sign-Out Guard",
            title: "Explicit Session Sign-Out Dialog",
            desc: "Protects active session state before clearing Firebase Authentication credentials."
        }
    ];

    chips.forEach((btn) => {
        btn.addEventListener("click", () => {
            const idx = Number(btn.getAttribute("data-cc-idx")) || 0;
            const s = screens[idx];
            if (!s) return;

            phoneImg.setAttribute("src", s.src);
            phoneImg.setAttribute("alt", s.alt);
            if (codeEl) codeEl.textContent = s.code;
            if (titleEl) titleEl.textContent = s.title;
            if (descEl) descEl.textContent = s.desc;

            chips.forEach((c) => {
                const selected = c === btn;
                c.classList.toggle("is-selected", selected);
                c.setAttribute("aria-pressed", String(selected));
            });
        });
    });
}

initCareerConnectStage();

// --------------------------------------------------------------------------
// 10. CRC BEFORE / AFTER COMPARISON RANGE SLIDER
// --------------------------------------------------------------------------

function initCrcComparisonSlider() {
    const slider = document.getElementById("crc-compare-slider");
    const stage = document.getElementById("crc-compare-stage");
    const readout = document.getElementById("crc-compare-readout");
    if (!slider || !stage) return;

    function syncComparison() {
        const val = Math.max(10, Math.min(90, Number(slider.value) || 52));
        stage.style.setProperty("--compare-pct", `${val}%`);
        slider.style.setProperty("--attr-min", slider.min || 10);
        slider.style.setProperty("--attr-max", slider.max || 90);
        slider.style.setProperty("--control-value", val);
        slider.setAttribute("aria-valuetext", `${val} percent Phase 1 Azure, ${100 - val} percent current Soft Power serverless architecture`);
        if (readout) {
            readout.textContent = `${val}% Phase 1 Azure / ${100 - val}% Soft Power Serverless`;
        }
    }

    syncComparison();
    slider.addEventListener("input", syncComparison);
}

initCrcComparisonSlider();

// --------------------------------------------------------------------------
// 11. CAPE TOWN TIME, MOBILE NAV, SCROLL REVEALS & PROGRESS FALLBACK
// --------------------------------------------------------------------------

function updateLocalTime() {
    const localTime = document.getElementById("local-time");
    if (!localTime) return;
    localTime.textContent = new Date().toLocaleTimeString("en-ZA", {
        timeZone: "Africa/Johannesburg",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });
}

updateLocalTime();
setInterval(updateLocalTime, 1000);

const navToggle = document.getElementById("nav-toggle");
const navList = document.getElementById("primary-nav-list");

if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
        const isOpen = navList.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navList.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navList.classList.remove("is-open");
            navToggle.setAttribute("aria-expanded", "false");
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && navList.classList.contains("is-open")) {
            navList.classList.remove("is-open");
            navToggle.setAttribute("aria-expanded", "false");
            navToggle.focus();
        }
    });
}

const reveals = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !reducedMotionQuery.matches) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.05 }
    );
    reveals.forEach((sec) => observer.observe(sec));
} else {
    reveals.forEach((sec) => sec.classList.add("active"));
}

// JS fallback for parallax plates when native CSS animation-timeline: view() is unavailable
if (!CSS.supports("(animation-timeline: view()) and (animation-range: entry)") && !reducedMotionQuery.matches) {
    const parallaxPlates = Array.from(document.querySelectorAll("[data-parallax-plate]"));
    if (parallaxPlates.length > 0 && "IntersectionObserver" in window) {
        const visiblePlates = new Set();
        const plateObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) visiblePlates.add(entry.target);
                else visiblePlates.delete(entry.target);
            });
        });
        parallaxPlates.forEach((p) => plateObserver.observe(p));

        let pRaf = null;
        window.addEventListener(
            "scroll",
            () => {
                if (pRaf || visiblePlates.size === 0 || reducedMotionQuery.matches) return;
                pRaf = window.requestAnimationFrame(() => {
                    pRaf = null;
                    visiblePlates.forEach((plate) => {
                        const rect = plate.getBoundingClientRect();
                        const ratio = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
                        const shiftY = Math.max(-14, Math.min(14, ratio * -16));
                        plate.style.transform = `translate3d(0, ${shiftY.toFixed(1)}px, 0)`;
                    });
                });
            },
            { passive: true }
        );
    }
}

// JS fallback for top progress hairline only when native CSS scroll-timeline is unsupported
if (!CSS.supports("(animation-timeline: scroll()) and (animation-range: 0% 100%)")) {
    const progressBar = document.getElementById("progress-bar");
    if (progressBar) {
        const syncDocProgress = () => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            const ratio = scrollable > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollable)) : 0;
            progressBar.style.transform = `scaleX(${ratio})`;
        };
        window.addEventListener("scroll", syncDocProgress, { passive: true });
        syncDocProgress();
    }
}
