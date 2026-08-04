async function updateCounter() {
    const response = await fetch(
        "https://alice-cloud-counter-d3g5b3ejd2cydbby.southafricanorth-01.azurewebsites.net/api/VisitorCounter"
    );

    const data = await response.json();

    document.getElementById("visitor-count").textContent = data.count;
}

updateCounter();