document.addEventListener("DOMContentLoaded", () => {
    const baseURL = "https://gsd-backend-1.onrender.com/api/characters";
    const characterBar = document.querySelector("#dogNames"); // Ensure this is the correct ID
    const detailedInfo = document.querySelector("#detailed-info");

    // Fetch and Display Characters as Buttons
    fetch(baseURL)
        .then(res => res.json())
        .then(characters => {
            characterBar.innerHTML = ""; // Clear before adding buttons
            characters.forEach(character => {
                const button = document.createElement("button");
                button.textContent = character.name;
                button.addEventListener("click", () => showCharacterDetails(character));
                characterBar.appendChild(button);
            });
        });

    // Show Character Details on Click
    function showCharacterDetails(character) {
        let factsHTML = "<ul id='facts-list'>"; // Start list
        if (character.facts && character.facts.length > 0) {
            character.facts.forEach((fact, index) => {
                factsHTML += `
                    <li>
                        <span>${fact}</span>
                        <button class="remove-fact-btn" data-index="${index}">❌</button>
                    </li>
                `; 
            });
        } else {
            factsHTML += "<li>No facts available.</li>";
        }
        factsHTML += "</ul>"; 

        detailedInfo.innerHTML = `
            <img id="image" src="${character.image}" alt="${character.name}">
            <h2>${character.name}</h2>
            <h3>Color: ${character.color || "Unknown"}</h3>
            <h3>Facts:</h3>
            ${factsHTML}
            <input type="text" id="new-fact" placeholder="Add a new fact...">
            <button id="add-fact-btn">Add Fact</button>
        `;

        document.querySelectorAll(".remove-fact-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const index = e.target.dataset.index;
                character.facts.splice(index, 1);
                showCharacterDetails(character);

                fetch(`${baseURL}/${character.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ facts: character.facts })
                });
            });
        });

        document.querySelector("#add-fact-btn").addEventListener("click", () => {
            const newFactInput = document.querySelector("#new-fact");
            const newFact = newFactInput.value.trim();
            
            if (newFact) {
                const factList = document.querySelector("#facts-list");
                const newFactItem = document.createElement("li");
                newFactItem.innerHTML = `<span>${newFact}</span> <button class="remove-fact-btn">❌</button>`;
                factList.appendChild(newFactItem);

                character.facts.push(newFact);
                newFactInput.value = "";

                fetch(`${baseURL}/${character.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ facts: character.facts })
                });

                newFactItem.querySelector(".remove-fact-btn").addEventListener("click", () => {
                    const index = character.facts.indexOf(newFact);
                    if (index > -1) {
                        character.facts.splice(index, 1);
                        showCharacterDetails(character);

                        fetch(`${baseURL}/${character.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ facts: character.facts })
                        });
                    }
                });
            }
        });
    }
});
