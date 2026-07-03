// --- VARIABLES DEL JUEGO ---
let clicks = 0;
let baseMultiplier = 1.0;
let highestFruitUnlocked = 0; 
let equippedFruitIndex = 0;   
let currentTab = 'normal';
let specialTimeout = null;     

// --- LISTA DE TODAS LAS FRUTAS ---
const fruitProgression = [
    { name: "Apple", emoji: "🍎", req: 0, bonus: 1.0 },
    { name: "Pear", emoji: "🍐", req: 20, bonus: 1.2 },
    { name: "Orange", emoji: "🍊", req: 100, bonus: 1.5 },
    { name: "Lemon", emoji: "🍋", req: 300, bonus: 1.8 },
    { name: "Banana", emoji: "🍌", req: 800, bonus: 2.2 },
    { name: "Watermelon", emoji: "🍉", req: 2000, bonus: 3.0 },
    { name: "Grapes", emoji: "🍇", req: 5000, bonus: 4.0 },
    { name: "Strawberry", emoji: "🍓", req: 12000, bonus: 5.5 },
    { name: "Blueberry", emoji: "🫐", req: 30000, bonus: 7.0 },
    { name: "Cherry", emoji: "🍒", req: 75000, bonus: 9.0 },
    { name: "Mango", emoji: "🥭", req: 150000, bonus: 12.0 },
    { name: "Pineapple", emoji: "🍍", req: 300000, bonus: 16.0 },
    { name: "Avocado", emoji: "🥑", req: 500000, bonus: 25.0 }
];

let goldDiscovered = Array(fruitProgression.length).fill(false);
let gemDiscovered = Array(fruitProgression.length).fill(false);
let galaxyDiscovered = Array(fruitProgression.length).fill(false);
let rainbowDiscovered = Array(fruitProgression.length).fill(false);

// --- ELEMENTOS HTML ---
const counterElement = document.getElementById('counter');
const multiplierElement = document.getElementById('multiplier');
const fruitButton = document.getElementById('click-btn');
const messageElement = document.getElementById('message');
const fruitGrid = document.getElementById('fruit-grid');
const collectionPanel = document.getElementById('collection-panel');
const effectContainer = document.getElementById('effect-container');

const tabs = {
    normal: document.getElementById('tab-normal'),
    gold: document.getElementById('tab-gold'),
    gem: document.getElementById('tab-gem'),
    galaxy: document.getElementById('tab-galaxy'),
    rainbow: document.getElementById('tab-rainbow')
};

// --- CONTROL DE LA CANASTA ---
document.getElementById('basket-btn').addEventListener('click', () => { updateCollectionGrid(); collectionPanel.classList.remove('hidden'); });
document.getElementById('close-basket').addEventListener('click', () => collectionPanel.classList.add('hidden'));
document.getElementById('donate-btn').addEventListener('click', () => {
    window.open('https://ko-fi.com/clickfruit', '_blank');
});

Object.keys(tabs).forEach(tabName => {
    tabs[tabName].addEventListener('click', () => {
        Object.values(tabs).forEach(t => t.classList.remove('active'));
        tabs[tabName].classList.add('active');
        currentTab = tabName;
        updateCollectionGrid();
    });
});
// --- DIBUJAR LA CANASTA ---
// --- DIBUJAR LA CANASTA ---
function updateCollectionGrid() {
    fruitGrid.innerHTML = "";

    // Mapeo de pestaña especial -> array de descubrimiento + clases visuales
    const specialMap = {
        gold:    { discovered: goldDiscovered,    itemClass: 'item-gold',    fruitClass: 'gold-fruit',    label: 'Gold' },
        gem:     { discovered: gemDiscovered,     itemClass: 'item-gem',     fruitClass: 'gem-fruit',     label: 'Gem' },
        galaxy:  { discovered: galaxyDiscovered,  itemClass: 'item-galaxy',  fruitClass: 'galaxy-fruit',  label: 'Galaxy' },
        rainbow: { discovered: rainbowDiscovered, itemClass: 'item-rainbow', fruitClass: 'rainbow-fruit', label: 'Rainbow' }
    };

    fruitProgression.forEach((fruit, index) => {
        const item = document.createElement('div');
        item.classList.add('grid-item');

        const emojiSpan = document.createElement('span');
        emojiSpan.classList.add('emoji-span');

        const label = document.createElement('span');

        if (currentTab === 'normal') {
            // --- Pestaña Normal ---
            if (index <= highestFruitUnlocked) {
                emojiSpan.textContent = fruit.emoji;
                label.textContent = fruit.name;
                item.appendChild(emojiSpan);
                item.appendChild(label);

                const equipBtn = document.createElement('button');
                equipBtn.classList.add('equip-btn');
                if (index === equippedFruitIndex) {
                    equipBtn.textContent = "Equipped";
                    equipBtn.classList.add('equipped');
                } else {
                    equipBtn.textContent = "Equip";
                    equipBtn.addEventListener('click', () => {
                        equippedFruitIndex = index;
                        fruitButton.textContent = fruit.emoji;
                        updateCollectionGrid();
                        guardarProgreso();
                    });
                }
                item.appendChild(equipBtn);
            } else {
                item.classList.add('locked');
                emojiSpan.textContent = "❓";
                label.textContent = `${fruit.req} clicks`;
                item.appendChild(emojiSpan);
                item.appendChild(label);

                // Placeholder invisible para mantener alineación consistente
                const placeholderBtn = document.createElement('button');
                placeholderBtn.classList.add('equip-btn');
                placeholderBtn.style.visibility = 'hidden';
                placeholderBtn.textContent = "Equip";
                item.appendChild(placeholderBtn);
            }
        } else {
            // --- Pestañas especiales: Gold / Gem / Galaxy / Rainbow ---
            const special = specialMap[currentTab];
            const isDiscovered = special.discovered[index];

            if (isDiscovered) {
                item.classList.add(special.itemClass);
                emojiSpan.classList.add(special.fruitClass);
                emojiSpan.textContent = fruit.emoji;
                label.textContent = `${special.label} ${fruit.name}`;
            } else {
                item.classList.add('locked');
                emojiSpan.textContent = "❓";
                label.textContent = "Not found yet";
            }
            item.appendChild(emojiSpan);
            item.appendChild(label);
        }

        fruitGrid.appendChild(item);
    });
}
// --- CREAR EFECTO FLOTANTE ---
function createFloatingEffect(text, typeClass, emoji) {
    const el = document.createElement('div');
    el.classList.add('floating-text');
    
    let spanClass = typeClass !== 'normal' ? typeClass : '';
    el.innerHTML = `<span class="emoji-span ${spanClass}">${emoji}</span> <span>${text}</span>`;
    
    let randomX = Math.floor(Math.random() * 80) - 40; 
    el.style.setProperty('--rand-x', `${randomX}px`);
    el.style.left = "50%";
    
    effectContainer.appendChild(el);
    setTimeout(() => { el.remove(); }, 800);
}

// --- LÓGICA DEL CLIC ---
fruitButton.addEventListener('click', () => {
    let roll = Math.random();
    let specialMultiplier = 1;
    let clickType = 'normal';
    let currentEmoji = fruitProgression[equippedFruitIndex].emoji;

    let difficultyFactor = index => Math.pow(1.815, index);

    let rainbowChance= 0.0002 / difficultyFactor(equippedFruitIndex); 
    let galaxyChance = 0.0014 / difficultyFactor(equippedFruitIndex); 
    let gemChance    = 0.0028 / difficultyFactor(equippedFruitIndex); 
    let goldChance   = 0.007  / difficultyFactor(equippedFruitIndex); 

    if (specialTimeout) clearTimeout(specialTimeout);
    fruitButton.className = "fruit-btn"; // Limpia las clases de rareza anteriores

    if (roll < rainbowChance) {
        specialMultiplier = 500; 
        clickType = 'rainbow-fruit';
        fruitButton.classList.add('rainbow-fruit');
        messageElement.innerHTML = `<span class="rainbow-text">🌈 RAINBOW FOUND! 🌈</span>`;
        rainbowDiscovered[equippedFruitIndex] = true;
    }
    else if (roll < rainbowChance + galaxyChance) {
        specialMultiplier = 100;
        clickType = 'galaxy-fruit';
        fruitButton.classList.add('galaxy-fruit');
        messageElement.innerHTML = `<span class="galaxy-text">🌌 GALAXY FOUND! 🌌</span>`;
        galaxyDiscovered[equippedFruitIndex] = true;
    } 
    else if (roll < rainbowChance + galaxyChance + gemChance) {
        specialMultiplier = 20;
        clickType = 'gem-fruit';
        fruitButton.classList.add('gem-fruit');
        messageElement.innerHTML = `<span class="gem-text">💎 GEM FOUND! 💎</span>`;
        gemDiscovered[equippedFruitIndex] = true;
    } 
    else if (roll < rainbowChance + galaxyChance + gemChance + goldChance) {
        specialMultiplier = 5;
        clickType = 'gold-fruit';
        fruitButton.classList.add('gold-fruit');
        messageElement.innerHTML = `<span class="gold-text">✨ GOLD FOUND! ✨</span>`;
        goldDiscovered[equippedFruitIndex] = true;
    } 
    else {
        messageElement.textContent = "Keep gathering!";
    }

    if (clickType !== 'normal') {
        specialTimeout = setTimeout(() => {
            fruitButton.className = "fruit-btn";
        }, 1500);
    }

    let finalPoints = 1 * fruitProgression[equippedFruitIndex].bonus * specialMultiplier;
    clicks += finalPoints;
    counterElement.textContent = Math.floor(clicks);

    createFloatingEffect(`+${Math.floor(finalPoints)}`, clickType, currentEmoji);
    checkNextFruit();
    guardarProgreso();
});

function checkNextFruit() {
    let nextIndex = highestFruitUnlocked + 1;
    if (nextIndex < fruitProgression.length && clicks >= fruitProgression[nextIndex].req) {
        highestFruitUnlocked = nextIndex;
        
        if (equippedFruitIndex === highestFruitUnlocked - 1) {
            equippedFruitIndex = highestFruitUnlocked;
            let newFruit = fruitProgression[equippedFruitIndex];
            multiplierElement.textContent = "x" + newFruit.bonus.toFixed(1);
            fruitButton.textContent = newFruit.emoji;
            messageElement.textContent = `Congrats! You unlocked: ${newFruit.name}`;
        }
    }
}
multiplierElement.textContent = "x" + fruitProgression[equippedFruitIndex].bonus.toFixed(1);
function cargarProgreso() {
    const guardado = localStorage.getItem('fruitClickerSave');
    if (!guardado) return; // No hay nada guardado todavía

    const estado = JSON.parse(guardado);

    clicks = estado.clicks || 0;
    highestFruitUnlocked = estado.highestFruitUnlocked || 0;
    equippedFruitIndex = estado.equippedFruitIndex || 0;
    goldDiscovered = estado.goldDiscovered || Array(fruitProgression.length).fill(false);
    gemDiscovered = estado.gemDiscovered || Array(fruitProgression.length).fill(false);
    galaxyDiscovered = estado.galaxyDiscovered || Array(fruitProgression.length).fill(false);
    rainbowDiscovered = estado.rainbowDiscovered || Array(fruitProgression.length).fill(false);

    // Actualizar la pantalla con los datos cargados
    counterElement.textContent = Math.floor(clicks);
    multiplierElement.textContent = "x" + fruitProgression[equippedFruitIndex].bonus.toFixed(1);
    fruitButton.textContent = fruitProgression[equippedFruitIndex].emoji;
}

// Cargar el progreso apenas se abre la página
cargarProgreso();
// GUARDAR Y CARGAR PROGRESO (autosave)
function guardarProgreso() {
    localStorage.setItem('fruitClickerSave', JSON.stringify({
        clicks, highestFruitUnlocked, equippedFruitIndex,
        goldDiscovered, gemDiscovered, galaxyDiscovered, rainbowDiscovered
    }));
}
setInterval(guardarProgreso, 1000);
