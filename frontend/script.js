const API_BASE = "";

const form = document.getElementById("testForm");
const optionsContainer = document.getElementById("testOptions");
const statusPanel = document.getElementById("statusPanel");
const runInfo = document.getElementById("runInfo");
const progressBar = document.getElementById("progressBar");
const resultsContainer = document.getElementById("results");
const template = document.getElementById("resultTemplate");

async function loadAvailableTests() {
    const response = await fetch(`${API_BASE}/api/tests/available`);
    const data = await response.json();
    data.tests.forEach((test) => {
        const wrapper = document.createElement("label");
        wrapper.className = "checkbox-card";
        wrapper.innerHTML = `
            <input type="checkbox" name="test_types" value="${test.name}" />
            <div>
                <strong>${formatName(test.name)}</strong>
                <span>${test.description}</span>
            </div>
        `;
        optionsContainer.appendChild(wrapper);
    });
}

function formatName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function getSelectedTests() {
    return Array.from(form.querySelectorAll('input[name="test_types"]:checked')).map((el) => el.value);
}

function showStatusPanel(run) {
    statusPanel.hidden = false;
    runInfo.innerHTML = `
        <p><strong>Домен:</strong> ${run.domain}</p>
        <p><strong>Статус:</strong> ${translateStatus(run.status)}</p>
    `;
    progressBar.style.width = `${Math.round(run.progress * 100)}%`;

    if (run.status === "completed" || run.status === "failed") {
        progressBar.style.width = "100%";
        renderResults(run);
    }
}

function translateStatus(status) {
    switch (status) {
        case "running":
            return "Выполняется";
        case "completed":
            return "Завершено";
        case "failed":
            return "Ошибка";
        default:
            return status;
    }
}

function renderResults(run) {
    resultsContainer.innerHTML = "";
    if (run.error) {
        const error = document.createElement("p");
        error.textContent = `Ошибка: ${run.error}`;
        resultsContainer.appendChild(error);
        return;
    }
    Object.entries(run.results).forEach(([name, result]) => {
        const clone = template.content.cloneNode(true);
        clone.querySelector("h3").textContent = formatName(name);
        const badge = clone.querySelector(".badge");
        badge.textContent = result.status.toUpperCase();
        badge.classList.add(result.status);
        clone.querySelector(".summary").textContent = result.summary;
        const list = clone.querySelector(".details");
        Object.entries(result.details).forEach(([key, value]) => {
            const dt = document.createElement("dt");
            dt.textContent = key;
            const dd = document.createElement("dd");
            dd.textContent = value;
            list.appendChild(dt);
            list.appendChild(dd);
        });
        resultsContainer.appendChild(clone);
    });
}

async function pollRun(runId) {
    const response = await fetch(`${API_BASE}/api/tests/${runId}`);
    const run = await response.json();
    showStatusPanel(run);
    if (run.status !== "completed" && run.status !== "failed") {
        setTimeout(() => pollRun(runId), 1200);
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const selected = getSelectedTests();
    if (!selected.length) {
        alert("Выберите хотя бы один вид тестирования.");
        return;
    }
    const domain = form.domain.value.trim();
    const response = await fetch(`${API_BASE}/api/tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, test_types: selected }),
    });
    if (!response.ok) {
        const error = await response.json();
        alert(error.detail || "Не удалось запустить тесты");
        return;
    }
    const run = await response.json();
    showStatusPanel(run);
    resultsContainer.innerHTML = "";
    pollRun(run.id);
});

loadAvailableTests();
