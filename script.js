const gamePairs = [
  // Edita esta lista cuando me des la correlacion final animal/lugar.
  // Asegurate de usar nombres de archivo exactos dentro de /images.
  { animal: "Panda", animalImage: "Panda.png", place: "Bosque", placeImage: "Bosque.jpeg" },
  { animal: "Mono", animalImage: "Mono.png", place: "Bosque", placeImage: "Bosque.jpeg" },
  { animal: "Pajaro", animalImage: "Pajaro.png", place: "Bosque", placeImage: "Bosque.jpeg" },
  { animal: "Elefante", animalImage: "Elefante.png", place: "Bosque", placeImage: "Bosque.jpeg" },
  { animal: "Leon", animalImage: "Leon.png", place: "Bosque", placeImage: "Bosque.jpeg" },
  { animal: "Jirafa", animalImage: "Jirafa.png", place: "Sabana", placeImage: "Sabana.jpeg" },
  { animal: "Zebra", animalImage: "Zebra.png", place: "Sabana", placeImage: "Sabana.jpeg" },
  { animal: "Perro", animalImage: "Perro.png", place: "Casa", placeImage: "Casa.jpeg" },
  { animal: "Gato", animalImage: "Gato.png", place: "Casa", placeImage: "Casa.jpeg" },
  { animal: "Conejo", animalImage: "Conejo.png", place: "Campo", placeImage: "Campo.jpeg" },
  { animal: "Caballo", animalImage: "Caballo.png", place: "Campo", placeImage: "Campo.jpeg" },
  { animal: "Vaca", animalImage: "Vaca.png", place: "Campo", placeImage: "Campo.jpeg" },
  { animal: "Pez", animalImage: "Pez.png", place: "Mar", placeImage: "Mar.jpeg" },
  { animal: "Hipopotamo", animalImage: "Hipopotamo.png", place: "Rio", placeImage: "Rios.jpeg" }
];

const animalsList = document.getElementById("animalsList");
const placesList = document.getElementById("placesList");
const confettiLayer = document.createElement("div");
confettiLayer.className = "confetti-layer";
document.body.appendChild(confettiLayer);

const placeSummaryImages = {
  Bosque: "BOSQUE COMPLETO.png",
  Sabana: "SABANA JIRAFA Y CEBRA.png",
  Casa: "CASA -NIÑOS - GATO - PERRO.png",
  Campo: "PASTO - VACA - CABALLO- CONEJO.png",
  Mar: "MAR CON PECES.png",
  Rio: "RIO E HIPOPOTAMO.png"
};

const winModal = document.createElement("div");
winModal.className = "win-modal";
winModal.innerHTML = `
  <div class="win-modal__backdrop" data-close-modal="true"></div>
  <div class="win-modal__panel" role="dialog" aria-modal="true" aria-label="Resumen final del juego">
    <div class="win-modal__gallery" id="winModalGallery"></div>
    <div class="win-modal__actions">
      <button id="winModalRestart" class="win-modal__restart" type="button">Reiniciar</button>
    </div>
  </div>
`;
document.body.appendChild(winModal);

const winModalGallery = winModal.querySelector("#winModalGallery");
const winModalRestart = winModal.querySelector("#winModalRestart");

if (winModalRestart) {
  winModalRestart.addEventListener("click", () => {
    resetGame();
  });
}

winModal.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLElement && target.dataset.closeModal === "true") {
    hideWinModal();
  }
});

const sounds = {
  correct: new Audio("audios/Correcta.mp3"),
  wrong: new Audio("audios/Incorrecto.mp3")
};

const animalCardColors = [
  "#ffd166",
  "#ef476f",
  "#06d6a0",
  "#118ab2",
  "#ff9f1c",
  "#8ecae6",
  "#fb8500",
  "#90be6d",
  "#ff6b6b",
  "#4d96ff",
  "#f3722c",
  "#43aa8b",
  "#9b5de5",
  "#00bbf9"
];

sounds.correct.preload = "auto";
sounds.wrong.preload = "auto";

let score = 0;
let matches = 0;
let placeMap = new Map();
let activeRevealedAnimal = null;
let touchDragState = null;

function buildWinModalGallery() {
  winModalGallery.innerHTML = "";

  const uniquePlaces = [...new Set(gamePairs.map((pair) => pair.place))];

  uniquePlaces.forEach((place) => {
    const summaryImage = document.createElement("img");
    summaryImage.className = "win-result-image";

    const imageName = placeSummaryImages[place] || (gamePairs.find((pair) => pair.place === place)?.placeImage ?? "");
    const animals = gamePairs
      .filter((pair) => pair.place === place)
      .map((pair) => pair.animal)
      .join(" - ");

    summaryImage.src = `images/${imageName}`;
    summaryImage.alt = `${place} con ${animals}`;

    winModalGallery.appendChild(summaryImage);
  });
}

function showWinModal() {
  buildWinModalGallery();
  winModal.classList.add("is-open");
  document.body.classList.add("modal-open");
}

function hideWinModal() {
  winModal.classList.remove("is-open");
  document.body.classList.remove("modal-open");
}

function launchConfettiBurst() {
  const colors = ["#ff6b6b", "#ffd93d", "#6bcB77", "#4d96ff", "#ff8fab", "#845ef7"];
  const pieces = 200;

  for (let i = 0; i < pieces; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty("--fall", `${1100 + Math.random() * 900}ms`);
    piece.style.setProperty("--drift", `${-140 + Math.random() * 280}px`);
    piece.style.setProperty("--spin", `${240 + Math.random() * 620}deg`);

    confettiLayer.appendChild(piece);
    setTimeout(() => piece.remove(), 2200);
  }
}

function playSound(type) {
  const source = sounds[type];
  if (!source) return;

  // Clonar permite reproducir sonidos seguidos sin cortar el anterior.
  const instance = source.cloneNode();
  instance.currentTime = 0;
  instance.play().catch(() => {
    // Ignora bloqueos del navegador cuando el audio no puede reproducirse.
  });
}

function playWinJingle() {
  [0, 220, 440].forEach((delay) => {
    setTimeout(() => playSound("correct"), delay);
  });
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function updateCounters() {
  document.title = `משחק חיות ומקומות (${matches}/${gamePairs.length})`;
}

function clearPlaceHover() {
  placesList.querySelectorAll(".place.over").forEach((placeCard) => {
    placeCard.classList.remove("over");
  });
}

function getPlaceFromPoint(x, y) {
  const element = document.elementFromPoint(x, y);
  if (!element) return null;
  return element.closest(".place");
}

function tryMatchAnimalToPlace(animalName, draggedAnimal, placeCard) {
  if (!draggedAnimal || !placeCard) return;

  placeCard.classList.remove("over");
  const expectedAnimals = placeMap.get(placeCard.dataset.place) || [];

  if (expectedAnimals.includes(animalName)) {
    placeCard.classList.add("correct");
    if (placeCard.correctFlashTimer) {
      clearTimeout(placeCard.correctFlashTimer);
    }
    placeCard.correctFlashTimer = setTimeout(() => {
      placeCard.classList.remove("correct");
    }, 1600);

    if (draggedAnimal === activeRevealedAnimal) {
      activeRevealedAnimal = null;
    }

    draggedAnimal.remove();
    score += 10;
    matches += 1;
    updateCounters();
    playSound("correct");
    launchConfettiBurst();

    if (matches === gamePairs.length) {
      playWinJingle();
      setTimeout(showWinModal, 140);
    }
  } else {
    placeCard.classList.add("wrong");
    score = Math.max(0, score - 2);
    updateCounters();
    playSound("wrong");
    setTimeout(() => placeCard.classList.remove("wrong"), 280);
  }
}

function startTouchDrag(card, touch) {
  const ghost = card.cloneNode(true);
  ghost.classList.add("touch-drag-ghost");
  ghost.classList.remove("hidden");
  ghost.classList.add("revealed");
  ghost.style.width = `${card.offsetWidth}px`;
  ghost.style.height = `${card.offsetHeight}px`;
  document.body.appendChild(ghost);

  card.classList.add("dragging");

  touchDragState = {
    touchId: touch.identifier,
    animalCard: card,
    ghost,
    currentPlace: null
  };

  updateTouchDrag(touch.clientX, touch.clientY);
}

function updateTouchDrag(clientX, clientY) {
  if (!touchDragState) return;

  touchDragState.ghost.style.left = `${clientX}px`;
  touchDragState.ghost.style.top = `${clientY}px`;

  const hoveredPlace = getPlaceFromPoint(clientX, clientY);

  if (touchDragState.currentPlace && touchDragState.currentPlace !== hoveredPlace) {
    touchDragState.currentPlace.classList.remove("over");
  }

  if (hoveredPlace) {
    hoveredPlace.classList.add("over");
  }

  touchDragState.currentPlace = hoveredPlace;
}

function endTouchDrag(clientX, clientY) {
  if (!touchDragState) return;

  const { animalCard, ghost, currentPlace } = touchDragState;
  const dropPlace = getPlaceFromPoint(clientX, clientY) || currentPlace;

  if (ghost && ghost.isConnected) {
    ghost.remove();
  }

  if (animalCard && animalCard.isConnected) {
    animalCard.classList.remove("dragging");
  }

  clearPlaceHover();

  if (dropPlace && animalCard && animalCard.isConnected) {
    tryMatchAnimalToPlace(animalCard.dataset.animal, animalCard, dropPlace);
  }

  touchDragState = null;
}

function hideAnimalCard(card) {
  if (!card || !card.isConnected) return;
  card.dataset.revealed = "false";
  card.draggable = false;
  card.classList.add("hidden");
  card.classList.remove("revealed");
}

function revealAnimalCard(card) {
  if (card.dataset.revealed === "true") {
    activeRevealedAnimal = card;
    return true;
  }

  // Si ya hay un animal activo, no permite revelar otro hasta acertar.
  if (activeRevealedAnimal && activeRevealedAnimal !== card) {
    return false;
  }

  card.dataset.revealed = "true";
  card.draggable = true;
  card.classList.remove("hidden");
  card.classList.add("revealed");
  activeRevealedAnimal = card;
  return true;
}

function createAnimalCard(pair, index) {
  const card = document.createElement("div");
  card.className = "card animal hidden";
  card.draggable = false;
  card.dataset.animal = pair.animal;
  card.dataset.id = `${index}`;
  card.dataset.revealed = "false";
  card.style.setProperty("--animal-color", animalCardColors[index % animalCardColors.length]);

  card.innerHTML = `
    <img src="images/${pair.animalImage}" alt="Animal ${pair.animal}">
    <span class="animal-question" aria-hidden="true">?</span>
  `;

  const revealFromTap = () => {
    revealAnimalCard(card);
  };
  card.addEventListener("click", revealFromTap);

  card.addEventListener("touchstart", (event) => {
    const touch = event.changedTouches[0];
    if (!touch) return;

    if (card.dataset.revealed !== "true") {
      revealAnimalCard(card);
      return;
    }

    if (activeRevealedAnimal !== card) return;

    event.preventDefault();
    startTouchDrag(card, touch);
  }, { passive: false });

  card.addEventListener("touchmove", (event) => {
    if (!touchDragState || touchDragState.animalCard !== card) return;
    const touch = [...event.changedTouches].find((item) => item.identifier === touchDragState.touchId);
    if (!touch) return;

    event.preventDefault();
    updateTouchDrag(touch.clientX, touch.clientY);
  }, { passive: false });

  card.addEventListener("touchend", (event) => {
    if (!touchDragState || touchDragState.animalCard !== card) return;
    const touch = [...event.changedTouches].find((item) => item.identifier === touchDragState.touchId);
    if (!touch) return;

    event.preventDefault();
    endTouchDrag(touch.clientX, touch.clientY);
  }, { passive: false });

  card.addEventListener("touchcancel", () => {
    if (!touchDragState || touchDragState.animalCard !== card) return;
    endTouchDrag(-1, -1);
  });

  card.addEventListener("dragstart", (event) => {
    if (card.dataset.revealed !== "true") {
      event.preventDefault();
      revealAnimalCard(card);
      return;
    }

    card.classList.add("dragging");
    event.dataTransfer.setData("text/plain", pair.animal);
    event.dataTransfer.effectAllowed = "move";
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
  });

  return card;
}

function createPlaceCard(pair) {
  const card = document.createElement("div");
  card.className = "card place";
  card.dataset.place = pair.place;

  card.innerHTML = `
    <img src="images/${pair.placeImage}" alt="Lugar ${pair.place}">
  `;

  card.addEventListener("dragover", (event) => {
    event.preventDefault();
    card.classList.add("over");
    event.dataTransfer.dropEffect = "move";
  });

  card.addEventListener("dragleave", () => {
    card.classList.remove("over");
  });

  card.addEventListener("drop", (event) => {
    event.preventDefault();
    const animalName = event.dataTransfer.getData("text/plain");
    const draggedAnimal = animalsList.querySelector(`.animal[data-animal="${animalName}"]`);
    tryMatchAnimalToPlace(animalName, draggedAnimal, card);
  });

  return card;
}

function buildBoard() {
  animalsList.innerHTML = "";
  placesList.innerHTML = "";

  placeMap = gamePairs.reduce((map, pair) => {
    const currentAnimals = map.get(pair.place) || [];
    currentAnimals.push(pair.animal);
    map.set(pair.place, currentAnimals);
    return map;
  }, new Map());

  const animalOrder = shuffle(gamePairs);
  const uniquePlaces = [...placeMap.entries()].map(([place, animals]) => {
    const source = gamePairs.find((pair) => pair.place === place);
    return {
      place,
      placeImage: source ? source.placeImage : "",
      animals
    };
  });

  animalOrder.forEach((pair, index) => {
    animalsList.appendChild(createAnimalCard(pair, index));
  });

  uniquePlaces.forEach((pair) => {
    placesList.appendChild(createPlaceCard(pair));
  });
}

function resetGame() {
  score = 0;
  matches = 0;
  activeRevealedAnimal = null;
  if (touchDragState?.ghost && touchDragState.ghost.isConnected) {
    touchDragState.ghost.remove();
  }
  touchDragState = null;
  clearPlaceHover();
  hideWinModal();
  updateCounters();
  buildBoard();
}

resetGame();
