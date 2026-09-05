// ===========================
// VISITOR COUNTER
// ===========================

async function updateCounter() {

    try {

        const response = await fetch(
            "/api/visitors"
        );

        if (!response.ok) {
            throw new Error("Visitor API request failed");
        }

        const data = await response.json();

        const count = Number(data.count) || 0;

        // Main visitor counter
        animateCounter(count);

        // Hero visitor counter
        const heroVisitors =
            document.getElementById("hero-visitors");

        if (heroVisitors) {
            heroVisitors.textContent = count;
        }

    } catch (error) {

        console.error("Visitor counter error:", error);

        const counter =
            document.getElementById("visitor-count");

        const heroVisitors =
            document.getElementById("hero-visitors");

        if (counter) {
            counter.textContent = "—";
        }

        if (heroVisitors) {
            heroVisitors.textContent = "—";
        }

    }

}

updateCounter();


// ===========================
// ANIMATED VISITOR COUNTER
// ===========================

function animateCounter(target) {

    const counter =
        document.getElementById("visitor-count");

    if (!counter) {
        return;
    }

    let current = 0;

    const increment =
        Math.max(1, Math.ceil(target / 60));

    const timer = setInterval(() => {

        current += increment;

        if (current >= target) {

            current = target;

            clearInterval(timer);

        }

        counter.textContent = current;

    }, 30);

}


// ===========================
// CAPE TOWN LOCAL TIME
// ===========================

function updateLocalTime() {

    const localTime =
        document.getElementById("local-time");

    if (!localTime) {
        return;
    }

    const now = new Date();

    localTime.textContent =
        now.toLocaleTimeString("en-ZA", {

            timeZone: "Africa/Johannesburg",

            hour: "2-digit",

            minute: "2-digit",

            second: "2-digit",

            hour12: false

        });

}

updateLocalTime();

setInterval(updateLocalTime, 1000);


// ===========================
// SCROLL REVEAL ANIMATION
// ===========================

const reveals =
    document.querySelectorAll(".reveal");

const observer =
    new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("active");

                }

            });

        },

        {
            threshold: 0.15
        }

    );

reveals.forEach(section => {

    observer.observe(section);

});


// ===========================
// SCROLL PROGRESS BAR
// ===========================

window.addEventListener("scroll", () => {

    const scrollTop =
        window.scrollY;

    const docHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

    const progress =
        docHeight > 0
            ? (scrollTop / docHeight) * 100
            : 0;

    const progressBar =
        document.getElementById("progress-bar");

    if (progressBar) {

        progressBar.style.width =
            progress + "%";

    }

});


// ===========================
// CURSOR GLOW
// ===========================

const glow =
    document.querySelector(".cursor-glow");

document.addEventListener("mousemove", (e) => {

    if (!glow) {
        return;
    }

    glow.style.left =
        e.clientX + "px";

    glow.style.top =
        e.clientY + "px";

});


// ===========================
// MOUSE TRAIL
// ===========================

document.addEventListener("mousemove", (e) => {

    const dot =
        document.createElement("div");

    dot.className =
        "trail-dot";

    dot.style.left =
        e.clientX + "px";

    dot.style.top =
        e.clientY + "px";

    document.body.appendChild(dot);

    setTimeout(() => {

        dot.remove();

    }, 800);

});