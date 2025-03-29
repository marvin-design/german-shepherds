document.addEventListener("DOMContentLoaded", async () => {
    const baseURL = "https://gsd-backend-1.onrender.com/api/characters";
    const dogContainer = document.querySelector("#dogContainer");
    let currentExpandedCard = null;

    try {
        let response = await fetch(baseURL);
        let characters = await response.json();
        dogContainer.innerHTML = "";

        characters.forEach(character => {
            const dogCard = document.createElement("div");
            dogCard.classList.add("dog-card");

            dogCard.innerHTML = `
                <div class="card-inner">
                    <!-- Front Side -->
                    <div class="card-front">
                        <img src="${character.image}" alt="${character.name}">
                        <h3>${character.name}</h3>
                    </div>

                    <!-- Back Side -->
                    <div class="card-back">
                        <h3>Facts:</h3>
                        <ul id="facts-list-${character.id}">
                            ${character.facts?.map((fact, index) => `
                                <li>
                                    <span>${fact}</span>
                                    <button class="remove-fact-btn" onclick="removeFact(${character.id}, ${index})">❌</button>
                                </li>
                            `).join("") || "<li>No facts available.</li>"}
                        </ul>
                        <input type="text" id="new-fact-${character.id}" class="fact-input" placeholder="Add a new fact...">
                        <button class="add-fact-btn" onclick="addFact(${character.id})">Add Fact</button>
                    </div>
                </div>
            `;

            // Flip and Expand effect on click
            dogCard.addEventListener("click", (event) => {
                // Prevent clicks inside the back from triggering flip
                if (event.target.classList.contains("remove-fact-btn") || 
                    event.target.classList.contains("add-fact-btn") || 
                    event.target.classList.contains("fact-input")) {
                    return;
                }

                // Collapse the previously expanded card
                if (currentExpandedCard && currentExpandedCard !== dogCard) {
                    currentExpandedCard.classList.remove("expanded", "flipped");
                }

                // Toggle flipped & expanded state
                dogCard.classList.toggle("flipped");
                dogCard.classList.toggle("expanded");

                currentExpandedCard = dogCard.classList.contains("expanded") ? dogCard : null;
            });

            dogContainer.appendChild(dogCard);
        });
    } catch (error) {
        console.error("Error fetching characters:", error);
    }
});

// Add Fact Function
async function addFact(characterId) {
    const factInput = document.querySelector(`#new-fact-${characterId}`);
    const factText = factInput.value.trim();
    if (!factText) return;

    try {
        let response = await fetch(`https://gsd-backend-1.onrender.com/api/characters/${characterId}`);
        let character = await response.json();
        character.facts.push(factText);

        await fetch(`https://gsd-backend-1.onrender.com/api/characters/${characterId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ facts: character.facts })
        });

        factInput.value = ""; // Clear input
        showUpdatedFacts(characterId);

        // Keep card expanded
        const card = document.querySelector(`.dog-card.expanded`);
        if (card) card.classList.add("flipped");

    } catch (error) {
        console.error("Error adding fact:", error);
    }
}

// Remove Fact Function
async function removeFact(characterId, factIndex) {
    try {
        let response = await fetch(`https://gsd-backend-1.onrender.com/api/characters/${characterId}`);
        let character = await response.json();
        character.facts.splice(factIndex, 1);

        await fetch(`https://gsd-backend-1.onrender.com/api/characters/${characterId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ facts: character.facts })
        });

        showUpdatedFacts(characterId);
    } catch (error) {
        console.error("Error removing fact:", error);
    }
}

// Refresh Facts After Update
async function showUpdatedFacts(characterId) {
    let response = await fetch(`https://gsd-backend-1.onrender.com/api/characters/${characterId}`);
    let character = await response.json();

    const factsList = document.querySelector(`#facts-list-${characterId}`);
    factsList.innerHTML = character.facts.map((fact, index) => `
        <li>
            <span>${fact}</span>
            <button class="remove-fact-btn" onclick="removeFact(${characterId}, ${index})">❌</button>
        </li>
    `).join("") || "<li>No facts available.</li>";
}
