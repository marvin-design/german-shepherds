document.addEventListener("DOMContentLoaded", async () => {
    const baseURL = "https://gsd-backend-1.onrender.com/api/characters";
    const characterBar = document.querySelector("#dogContainer");

    try {
        let response = await fetch(baseURL);
        let characters = await response.json();
        characterBar.innerHTML = "";
        
        characters.forEach(character => {
            const card = document.createElement("div");
            card.classList.add("dog-card");
            card.innerHTML = `
                <div class="card-front">
                    <img src="${character.image}" alt="${character.name}">
                    <h3>${character.name}</h3>
                    <p><strong>Color:</strong> ${character.color || "Unknown"}</p>
                </div>
                <div class="card-back">
                    <h3>Facts</h3>
                    <ul id="facts-list-${character.id}" style="font-size: 18px;">
                        ${character.facts?.map((fact, index) => `
                            <li>
                                <span>${fact}</span>
                                <button class="remove-fact-btn" onclick="removeFact(${character.id}, ${index})">❌</button>
                            </li>
                        `).join("") || "<li>No facts available.</li>"}
                    </ul>
                    <input type="text" class="fact-input" id="new-fact-${character.id}" placeholder="Add a new fact...">
                    <button class="add-fact-btn" onclick="addFact(${character.id})">Add Fact</button>
                </div>
            `;
            
            card.addEventListener("click", () => card.classList.toggle("expanded"));
            card.addEventListener("mouseover", () => card.classList.add("hovered"));
            card.addEventListener("mouseout", () => card.classList.remove("hovered"));
            
            characterBar.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching characters:", error);
    }
});

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
        factInput.value = "";
        updateFactsList(characterId, character.facts);
    } catch (error) {
        console.error("Error adding fact:", error);
    }
}

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
        updateFactsList(characterId, character.facts);
    } catch (error) {
        console.error("Error removing fact:", error);
    }
}

function updateFactsList(characterId, facts) {
    const factsList = document.querySelector(`#facts-list-${characterId}`);
    if (factsList) {
        factsList.innerHTML = facts.map((fact, index) => `
            <li>
                <span>${fact}</span>
                <button class="remove-fact-btn" onclick="removeFact(${characterId}, ${index})">❌</button>
            </li>
        `).join("") || "<li>No facts available.</li>";
    }
}
