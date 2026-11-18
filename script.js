const STORAGE_ITEMS = "prontiItems";
const STORAGE_PREPARATIONS = "prontiPreparations";

let items = JSON.parse(localStorage.getItem(STORAGE_ITEMS) || "[]");
let preparations = JSON.parse(localStorage.getItem(STORAGE_PREPARATIONS) || "[]");
let currentPreparation = null;

const categoryNames = {
  escola: "Materiais escolares",
  roupas: "Roupas e acessórios",
  viagem: "Itens de viagem",
  passeio: "Passeio",
  necessaire: "Cuidados pessoais",
  geral: "Outros"
};

const suggestions = {
  escola: [
    { name: "Cadernos ou fichário", category: ["escola"] },
    { name: "Estojo", category: ["escola"] },
    { name: "Canetas", category: ["escola"] },
    { name: "Lápis e borracha", category: ["escola"] },
    { name: "Livros e apostilas das matérias", category: ["escola"] },
    { name: "Agenda ou planner", category: ["escola"] },
    { name: "Garrafa de água", category: ["geral"] },
    { name: "Lanche", category: ["geral"] }
  ],
  viagem: [
    { name: "Roupas para os dias da viagem", category: ["roupas"] },
    { name: "Roupa íntima", category: ["roupas"] },
    { name: "Pijama", category: ["roupas"] },
    { name: "Casaco ou roupa de frio", category: ["roupas"] },
    { name: "Calçados", category: ["roupas"] },
    { name: "Documentos pessoais", category: ["viagem", "geral"] },
    { name: "Carregador de celular", category: ["viagem", "geral"] },
    { name: "Necessaire", category: ["necessaire"] },
    { name: "Toalha", category: ["viagem", "geral"] },
    { name: "Garrafa de água", category: ["geral"] }
  ],
  passeio: [
    { name: "Roupa adequada ao passeio", category: ["roupas"] },
    { name: "Calçado confortável", category: ["roupas"] },
    { name: "Celular", category: ["geral"] },
    { name: "Carregador ou bateria portátil", category: ["geral", "viagem"] },
    { name: "Documento pessoal", category: ["geral", "viagem"] },
    { name: "Dinheiro ou cartão", category: ["geral"] },
    { name: "Garrafa de água", category: ["geral"] },
    { name: "Necessaire pequena", category: ["necessaire"] }
  ],
  necessaire: [
    { name: "Escova de dentes", category: ["necessaire"] },
    { name: "Creme dental", category: ["necessaire"] },
    { name: "Desodorante", category: ["necessaire"] },
    { name: "Pente ou escova de cabelo", category: ["necessaire"] },
    { name: "Produtos de cabelo", category: ["necessaire"] },
    { name: "Protetor solar", category: ["necessaire"] },
    { name: "Hidratante", category: ["necessaire"] },
    { name: "Sabonete", category: ["necessaire"] }
  ]
};

function saveData() {
  localStorage.setItem(STORAGE_ITEMS, JSON.stringify(items));
  localStorage.setItem(STORAGE_PREPARATIONS, JSON.stringify(preparations));
  updateDashboard();
}

function normalize(text) {
  return text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function showView(viewId) {
  document.querySelectorAll(".view").forEach(view => {
    view.classList.toggle("active", view.id === viewId);
  });

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle("active", button.dataset.view === viewId);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-view]").forEach(button => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => showView(button.dataset.go));
});

function updateDashboard() {
  document.getElementById("items-count").textContent = items.length;
  document.getElementById("preparations-count").textContent = preparations.length;
}

function renderItems() {
  const container = document.getElementById("items-list");

  if (!items.length) {
    container.innerHTML = '<div class="empty-message">Você ainda não cadastrou nenhum item. Adicione seus primeiros itens acima! ♡</div>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="item-row">
      <div>
        <strong>${escapeHTML(item.name)}</strong>
        <small>${categoryNames[item.category] || "Outros"}</small>
      </div>
      <button class="delete-button" data-delete-item="${item.id}">Excluir</button>
    </div>
  `).join("");

  container.querySelectorAll("[data-delete-item]").forEach(button => {
    button.addEventListener("click", () => {
      items = items.filter(item => item.id !== button.dataset.deleteItem);
      saveData();
      renderItems();
    });
  });
}

document.getElementById("item-form").addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("item-name").value.trim();
  const category = document.getElementById("item-category").value;

  if (!name) return;

  items.push({
    id: crypto.randomUUID(),
    name,
    category
  });

  saveData();
  renderItems();
  event.target.reset();
});

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function getSuggestions(mode, formData) {
  let list = [...suggestions[mode]];

  if (mode === "viagem") {
    if (formData.weather === "frio") {
      list.push({ name: "Meias e roupas quentes", category: ["roupas"] });
      list.push({ name: "Acessórios para frio", category: ["roupas"] });
    } else if (formData.weather === "quente") {
      list.push({ name: "Roupas leves", category: ["roupas"] });
      list.push({ name: "Óculos de sol", category: ["roupas", "geral"] });
    } else if (formData.weather === "chuvoso") {
      list.push({ name: "Guarda-chuva ou capa de chuva", category: ["viagem", "geral"] });
    }

    const duration = normalize(formData.duration || "");
    if (duration.includes("dia")) {
      list.push({ name: "Roupas extras", category: ["roupas"] });
    }
  }

  if (mode === "passeio") {
    if (formData.weather === "frio") {
      list.push({ name: "Casaco", category: ["roupas"] });
    } else if (formData.weather === "quente") {
      list.push({ name: "Óculos de sol", category: ["geral", "roupas"] });
      list.push({ name: "Protetor solar", category: ["necessaire"] });
    } else if (formData.weather === "chuvoso") {
      list.push({ name: "Guarda-chuva", category: ["geral", "viagem"] });
    }

    if (formData.outing === "praia") {
      list.push({ name: "Roupa de banho", category: ["roupas"] });
      list.push({ name: "Toalha de praia", category: ["viagem", "geral"] });
      list.push({ name: "Chinelo", category: ["roupas"] });
      list.push({ name: "Protetor solar", category: ["necessaire"] });
    }

    if (formData.outing === "parque") {
      list.push({ name: "Tênis confortável", category: ["roupas"] });
      list.push({ name: "Protetor solar", category: ["necessaire"] });
    }

    if (formData.outing === "evento") {
      list.push({ name: "Ingresso ou confirmação", category: ["geral"] });
    }
  }

  if (mode === "necessaire") {
    if (formData.kit === "viagem") {
      list.push({ name: "Shampoo", category: ["necessaire"] });
      list.push({ name: "Condicionador", category: ["necessaire"] });
      list.push({ name: "Itens de higiene extras", category: ["necessaire"] });
    }
    if (formData.kit === "escola" || formData.kit === "passeio") {
      list.push({ name: "Lenços de papel", category: ["necessaire", "geral"] });
      list.push({ name: "Álcool em gel", category: ["necessaire"] });
    }
  }

  if (mode === "escola" && formData.subjects) {
    list.push({ name: "Materiais específicos das matérias: " + formData.subjects, category: ["escola"] });
  }

  return list;
}

function itemIsAvailable(suggestion) {
  const possibleNames = items.map(item => normalize(item.name));
  const suggestionName = normalize(suggestion.name);

  return items.some(item => {
    const itemName = normalize(item.name);
    const categoryMatches = suggestion.category.includes(item.category);

    return categoryMatches && (
      itemName === suggestionName ||
      itemName.includes(suggestionName) ||
      suggestionName.includes(itemName)
    );
  });
}

function buildPreparation(mode, formData) {
  const list = getSuggestions(mode, formData);

  const uniqueList = list.filter((item, index, array) =>
    array.findIndex(other => normalize(other.name) === normalize(item.name)) === index
  );

  return {
    id: crypto.randomUUID(),
    mode,
    name: formData.name,
    date: formData.date || "",
    destination: formData.destination || "",
    duration: formData.duration || "",
    extra: formData.extra || "",
    notes: "",
    createdAt: new Date().toLocaleDateString("pt-BR"),
    items: uniqueList.map(item => ({
      name: item.name,
      available: itemIsAvailable(item),
      checked: false
    }))
  };
}

document.querySelectorAll(".preparation-form").forEach(form => {
  form.addEventListener("submit", event => {
    event.preventDefault();

    const mode = form.dataset.mode;
    const formData = Object.fromEntries(new FormData(form).entries());

    currentPreparation = buildPreparation(mode, formData);
    renderChecklist(currentPreparation);
    showView("resultado");
    form.reset();
  });
});

function renderChecklist(preparation) {
  document.getElementById("result-title").innerHTML =
    `${escapeHTML(preparation.name)} <span>♡</span>`;

  const details = [preparation.destination, preparation.duration, preparation.date]
    .filter(Boolean)
    .join(" • ");

  document.getElementById("result-description").textContent =
    details || "Confira os itens recomendados para essa preparação.";

  const available = preparation.items.filter(item => item.available).length;
  const missing = preparation.items.length - available;

  document.getElementById("available-count").textContent = available;
  document.getElementById("missing-count").textContent = missing;

  const haveItems = preparation.items.filter(item => item.available);
  const missingItems = preparation.items.filter(item => !item.available);

  let html = "";

  if (haveItems.length) {
    html += `<div class="check-group">
      <h3>♡ Você já tem</h3>
      ${haveItems.map((item, index) => checklistItem(item, index, preparation)).join("")}
    </div>`;
  }

  if (missingItems.length) {
    html += `<div class="check-group">
      <h3>✿ Precisa providenciar</h3>
      ${missingItems.map((item, index) => checklistItem(item, index + haveItems.length, preparation)).join("")}
    </div>`;
  }

  document.getElementById("checklist-area").innerHTML =
    html || '<div class="empty-message">Nenhum item foi sugerido.</div>';

  document.getElementById("result-notes").value = preparation.notes || "";

  document.querySelectorAll("[data-check-index]").forEach(input => {
    input.addEventListener("change", () => {
      const index = Number(input.dataset.checkIndex);
      preparation.items[index].checked = input.checked;
    });
  });
}

function checklistItem(item, index, preparation) {
  const status = item.available ? "Você já tem" : "Falta cadastrar";
  const statusClass = item.available ? "status-have" : "status-missing";

  return `
    <label class="check-item">
      <input type="checkbox" data-check-index="${index}" ${item.checked ? "checked" : ""}>
      <span>${escapeHTML(item.name)}</span>
      <small class="${statusClass}">${status}</small>
    </label>
  `;
}

document.getElementById("save-preparation").addEventListener("click", () => {
  if (!currentPreparation) return;

  currentPreparation.notes = document.getElementById("result-notes").value;

  const existingIndex = preparations.findIndex(
    item => item.id === currentPreparation.id
  );

  if (existingIndex >= 0) {
    preparations[existingIndex] = currentPreparation;
  } else {
    preparations.unshift(currentPreparation);
  }

  saveData();
  renderSavedPreparations();
  alert("Preparação salva com sucesso! ♡");
});

document.getElementById("new-preparation").addEventListener("click", () => {
  currentPreparation = null;
  showView("inicio");
});

function renderSavedPreparations() {
  const container = document.getElementById("all-preparations");

  if (!preparations.length) {
    container.innerHTML = '<div class="empty-message">Você ainda não tem preparações salvas. Suas próximas listas aparecerão aqui! ♡</div>';
    return;
  }

  container.innerHTML = preparations.map(preparation => `
    <div class="saved-card">
      <div>
        <strong>${escapeHTML(preparation.name)}</strong>
        <small>${escapeHTML(preparation.mode)} • ${preparation.createdAt} • ${preparation.items.length} itens</small>
      </div>
      <div>
        <button class="secondary-button" data-open-prep="${preparation.id}">Abrir</button>
        <button class="delete-button" data-delete-prep="${preparation.id}">Excluir</button>
      </div>
    </div>
  `).join("");

  container.querySelectorAll("[data-open-prep]").forEach(button => {
    button.addEventListener("click", () => {
      currentPreparation = preparations.find(
        item => item.id === button.dataset.openPrep
      );
      renderChecklist(currentPreparation);
      showView("resultado");
    });
  });

  container.querySelectorAll("[data-delete-prep]").forEach(button => {
    button.addEventListener("click", () => {
      preparations = preparations.filter(
        item => item.id !== button.dataset.deletePrep
      );
      saveData();
      renderSavedPreparations();
    });
  });
}

/* CONSULTA DO CLIMA */

document.getElementById("weather-form").addEventListener("submit", async event => {
  event.preventDefault();

  const city = document.getElementById("city-name").value.trim();
  const result = document.getElementById("weather-result");

  result.innerHTML = '<p class="empty-message">Consultando previsão...</p>';

  try {
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`
    );

    const geoData = await geoResponse.json();

    if (!geoData.results || !geoData.results.length) {
      throw new Error("Cidade não encontrada.");
    }

    const place = geoData.results[0];

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
    );

    const weather = await weatherResponse.json();
    const current = weather.current;
    const daily = weather.daily;

    result.innerHTML = `
      <div class="weather-result-card">
        <h3>${escapeHTML(place.name)}, ${escapeHTML(place.country || "")}</h3>
        <p><strong>${Math.round(current.temperature_2m)}°C</strong> agora</p>
        <p>Sensação térmica: ${Math.round(current.apparent_temperature)}°C</p>
        <p>Umidade: ${current.relative_humidity_2m}%</p>
        <p>Máxima de hoje: ${Math.round(daily.temperature_2m_max[0])}°C</p>
        <p>Mínima de hoje: ${Math.round(daily.temperature_2m_min[0])}°C</p>
        <p>Chance de chuva: ${daily.precipitation_probability_max[0]}%</p>
      </div>
    `;
  } catch (error) {
    result.innerHTML = `
      <div class="empty-message">
        Não foi possível consultar essa cidade. Confira o nome e tente novamente.
      </div>
    `;
  }
});

/* INICIALIZAÇÃO */

renderItems();
renderSavedPreparations();
updateDashboard();
showView("inicio");