// ===========================
// VISITOR COUNTER
// ===========================

async function updateCounter() {

    const response = await fetch(
        "https://alice-cloud-counter-d3g5b3ejd2cydbby.southafricanorth-01.azurewebsites.net/api/VisitorCounter"
    );

    const data = await response.json();


    animateCounter(data.count);


    const heroVisitors =
    document.getElementById("hero-visitors");


    if(heroVisitors){

        heroVisitors.textContent = data.count;

    }

}

updateCounter();

// ===========================
// ANIMATED VISITOR COUNTER
// ===========================

function animateCounter(target){

    const counter =
    document.getElementById("visitor-count");


    let current = 0;


    const increment =
    Math.ceil(target / 60);


    const timer = setInterval(() => {


        current += increment;


        if(current >= target){

            current = target;

            clearInterval(timer);

        }


        counter.textContent = current;


    }, 30);

}



// ===========================
// SCROLL REVEAL ANIMATION
// ===========================

const reveals = document.querySelectorAll(".reveal");


const observer = new IntersectionObserver(

    entries => {


        entries.forEach(entry => {


            if(entry.isIntersecting){


                entry.target.classList.add("active");


            }


        });


    },

    {

        threshold:0.15

    }

);


reveals.forEach(section => {

    observer.observe(section);

});



// ===========================
// SCROLL PROGRESS BAR
// ===========================

window.addEventListener("scroll", () => {


    const scrollTop = window.scrollY;


    const docHeight =
    document.documentElement.scrollHeight -
    window.innerHeight;


    const progress =
    (scrollTop / docHeight) * 100;


    document.getElementById("progress-bar").style.width =
    progress + "%";


});
// ===========================
// CURSOR GLOW
// ===========================

const glow = document.querySelector(".cursor-glow");


document.addEventListener("mousemove", (e)=>{


    glow.style.left = e.clientX + "px";

    glow.style.top = e.clientY + "px";


});
// ===========================
// MOUSE TRAIL
// ===========================

document.addEventListener("mousemove", (e) => {

    const dot = document.createElement("div");

    dot.className = "trail-dot";

    dot.style.left = e.clientX + "px";

    dot.style.top = e.clientY + "px";

    document.body.appendChild(dot);

    setTimeout(() => {

        dot.remove();

    }, 800);

});