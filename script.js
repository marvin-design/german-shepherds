document.addEventListener("DOMContentLoaded", () => {
    const baseURL = "https://gsd-backend-1.onrender.com/api/characters";
    const characterBar = document.querySelector("#dogNames"); 
    const detailedInfo = document.querySelector("#detailed-info");

    fetch(baseURL)
        .then(res => res.json())
        .then(characters => {
            characterBar.innerHTML = "";
            characters.forEach(character => {
                const button = document.createElement("button");
                button.textContent = character.name;
                button.addEventListener("click", () => showCharacterDetails(character));
                characterBar.appendChild(button);
            });
        });

    function showCharacterDetails(character) {
        detailedInfo.innerHTML = `
            <img id="image" src="${character.image}" alt="${character.name}">
            <h2>${character.name}</h2>
            <h3>Color: ${character.color || "Unknown"}</h3>
            <h3>Facts:</h3>
            <ul id="facts-list">
                ${character.facts?.map((fact, index) => `
                    <li>
                        <span>${fact}</span>
                        <button class="remove-fact-btn" data-index="${index}">❌</button>
                    </li>
                `).join("") || "<li>No facts available.</li>"}
            </ul>
            <input type="text" id="new-fact" placeholder="Add a new fact...">
            <button id="add-fact-btn">Add Fact</button>
        `;
    }

    detailedInfo.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-fact-btn")) {
            const li = e.target.closest("li");
            const index = e.target.dataset.index;
            const characterName = detailedInfo.querySelector("h2").textContent;
            
            fetch(`${baseURL}`)
                .then(res => res.json())
                .then(characters => {
                    const character = characters.find(c => c.name === characterName);
                    if (character && index < character.facts.length) {
                        character.facts.splice(index, 1);
                        fetch(`${baseURL}/${character.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ facts: character.facts })
                        }).then(() => li.remove());
                    }
                });
        }

        if (e.target.id === "add-fact-btn") {
            const newFactInput = document.querySelector("#new-fact");
            const newFact = newFactInput.value.trim();
            const factsList = document.querySelector("#facts-list");
            const characterName = detailedInfo.querySelector("h2").textContent;

            if (newFact) {
                fetch(`${baseURL}`)
                    .then(res => res.json())
                    .then(characters => {
                        const character = characters.find(c => c.name === characterName);
                        if (character) {
                            character.facts.push(newFact);
                            fetch(`${baseURL}/${character.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ facts: character.facts })
                            }).then(() => {
                                const newFactItem = document.createElement("li");
                                newFactItem.innerHTML = `<span>${newFact}</span> <button class="remove-fact-btn" data-index="${character.facts.length - 1}">❌</button>`;
                                factsList.appendChild(newFactItem);
                                newFactInput.value = "";
                            });
                        }
                    });
            }
        }
    });
});
