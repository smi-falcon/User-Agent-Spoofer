const listEl = document.getElementById("list");
const toggleEl = document.getElementById("toggle");
const statusEl = document.getElementById("status");
const customBtn = document.getElementById("custom-btn");
const themeBtn = document.getElementById("theme-btn");
const footerEl = document.querySelector(".panel-profiles .footer");

const tabs = document.querySelectorAll(".tab");
const panels = {
  profiles: document.getElementById("panel-profiles"),
  exceptions: document.getElementById("panel-exceptions"),
  check: document.getElementById("panel-check")
};

const excListEl = document.getElementById("exc-list");
const excInput = document.getElementById("exc-input");
const excAddBtn = document.getElementById("exc-add-btn");
const excClearBtn = document.getElementById("exc-clear-btn");

const checkListEl = document.getElementById("check-list");
const checkBtn = document.getElementById("check-btn");

const BROWSER_LABELS = {
  Chrome: "Chrome",
  Firefox: "Mozilla Firefox",
  Safari: "Safari",
  "Internet Explorer": "Internet Explorer",
  Edge: "Microsoft Edge",
  Opera: "Opera",
  Vivaldi: "Vivaldi Browser",
  Yandex: "Yandex Browser"
};

const LS_KEY = "ua-spoofer-cache";

let state = {
  enabled: false,
  preset: null,
  customUA: null,
  collapsed: [],
  theme: "dark",
  excludedDomains: []
};

function presetKey(p) {
  if (!p) return null;
  return p.browser + "|" + p.platform;
}

function extractVersion(preset) {
  if (!preset || !preset.ua) return "";
  const ua = preset.ua;

  const patterns = [
    /YaBrowser\/(\d+(?:\.\d+)?)/,
    /Vivaldi\/(\d+(?:\.\d+)?)/,
    /OPR\/(\d+(?:\.\d+)?)/,
    /EdgiOS\/(\d+(?:\.\d+)?)/,
    /EdgA\/(\d+(?:\.\d+)?)/,
    /Edg\/(\d+(?:\.\d+)?)/,
    /CriOS\/(\d+(?:\.\d+)?)/,
    /FxiOS\/(\d+(?:\.\d+)?)/,
    /Firefox\/(\d+(?:\.\d+)?)/,
    /Version\/(\d+(?:\.\d+)?)/,
    /MSIE\s+(\d+(?:\.\d+)?)/,
    /Trident\/.*?rv:(\d+(?:\.\d+)?)/,
    /Chrome\/(\d+(?:\.\d+)?)/
  ];

  for (const re of patterns) {
    const m = ua.match(re);
    if (m) return m[1];
  }
  return "";
}

function lsLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function lsSave() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      theme: state.theme,
      collapsed: state.collapsed,
      enabled: state.enabled,
      presetKey: presetKey(state.preset),
      customUA: state.customUA,
      excludedDomains: state.excludedDomains
    }));
  } catch (e) {}
}

function activeUA() {
  if (state.customUA) return state.customUA;
  if (state.preset) return state.preset.ua;
  return null;
}

function updateStatus() {
  if (!state.enabled) {
    statusEl.textContent = "Отключено";
    statusEl.style.color = "";
    return;
  }
  if (!activeUA()) {
    statusEl.textContent = "Выберите профиль";
    statusEl.style.color = "";
    return;
  }
  statusEl.textContent = "Активно";
  statusEl.style.color = "var(--success)";
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeDomain(value) {
  if (!value) return "";
  let v = value.trim().toLowerCase();
  v = v.replace(/^https?:\/\//, "");
  v = v.replace(/^www\./, "");
  v = v.split("/")[0];
  v = v.split(":")[0];
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(v)) return "";
  return v;
}

function defaultCollapsed() {
  const keys = PRESETS.map((p) => p.browser);
  keys.push("__custom__");
  return Array.from(new Set(keys));
}

function renderProfiles() {
  listEl.innerHTML = "";

  const groups = new Map();
  PRESETS.forEach((p) => {
    if (!groups.has(p.browser)) groups.set(p.browser, []);
    groups.get(p.browser).push(p);
  });

  if (state.customUA) {
    const groupEl = document.createElement("div");
    groupEl.className = "group";
    if (state.collapsed.includes("__custom__")) groupEl.classList.add("collapsed");

    const headerEl = document.createElement("div");
    headerEl.className = "group-header";
    headerEl.innerHTML = `
      <svg class="group-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      <span class="group-title">Свой User-Agent</span>
    `;
    headerEl.addEventListener("click", () => toggleGroup("__custom__"));
    groupEl.appendChild(headerEl);

    const itemsEl = document.createElement("div");
    itemsEl.className = "group-items";

    const itemEl = document.createElement("div");
    itemEl.className = "item active";
    itemEl.innerHTML = `
      <span class="item-name item-custom">${escapeHtml(state.customUA)}</span>
      <svg class="item-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    `;
    itemEl.addEventListener("click", () => {
      state.preset = null;
      save();
      renderProfiles();
    });
    itemsEl.appendChild(itemEl);
    groupEl.appendChild(itemsEl);

    listEl.appendChild(groupEl);
  }

  const activeKey = presetKey(state.preset);

  groups.forEach((items, browser) => {
    const groupEl = document.createElement("div");
    groupEl.className = "group";
    if (state.collapsed.includes(browser)) groupEl.classList.add("collapsed");

    const label = BROWSER_LABELS[browser] || browser;

    const headerEl = document.createElement("div");
    headerEl.className = "group-header";
    headerEl.innerHTML = `
      <svg class="group-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      <span class="group-title">${escapeHtml(label)}</span>
      <span class="group-count">${items.length}</span>
    `;
    headerEl.addEventListener("click", () => toggleGroup(browser));
    groupEl.appendChild(headerEl);

    const itemsEl = document.createElement("div");
    itemsEl.className = "group-items";

    items.forEach((preset) => {
      const itemEl = document.createElement("div");
      itemEl.className = "item";
      if (!state.customUA && activeKey && presetKey(preset) === activeKey) {
        itemEl.classList.add("active");
      }

      const version = extractVersion(preset);

      itemEl.innerHTML = `
        <span class="item-name">
          <span class="item-platform">${escapeHtml(preset.platform)}</span>
          ${version ? `<span class="item-version">${escapeHtml(version)}</span>` : ""}
        </span>
        <svg class="item-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      `;

      itemEl.addEventListener("click", () => {
        state.preset = preset;
        state.customUA = null;
        state.enabled = true;
        toggleEl.checked = true;
        save();
        renderProfiles();
      });

      itemsEl.appendChild(itemEl);
    });

    groupEl.appendChild(itemsEl);
    listEl.appendChild(groupEl);
  });

  updateStatus();
}

function renderExceptions() {
  excListEl.innerHTML = "";

  if (!state.excludedDomains.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Список пуст";
    excListEl.appendChild(empty);
    return;
  }

  const sorted = [...state.excludedDomains].sort();

  sorted.forEach((domain) => {
    const itemEl = document.createElement("div");
    itemEl.className = "exc-item";

    const nameEl = document.createElement("span");
    nameEl.className = "exc-name";
    nameEl.textContent = domain;

    const removeBtn = document.createElement("button");
    removeBtn.className = "exc-remove";
    removeBtn.title = "Удалить";
    removeBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    `;
    removeBtn.addEventListener("click", async () => {
      state.excludedDomains = state.excludedDomains.filter((d) => d !== domain);
      await save();
      renderExceptions();
    });

    itemEl.appendChild(nameEl);
    itemEl.appendChild(removeBtn);
    excListEl.appendChild(itemEl);
  });
}

function renderCheck(result) {
  checkListEl.innerHTML = "";

  if (!result || !result.ok) {
    const empty = document.createElement("div");
    empty.className = "empty";
    if (result && result.reason === "disabled") {
      empty.textContent = "Расширение отключено";
    } else if (result && result.reason === "network") {
      empty.textContent = "Не удалось выполнить запрос";
    } else if (result && result.reason === "status") {
      empty.textContent = "Ошибка сервера: " + result.status;
    } else {
      empty.textContent = "Нет данных";
    }
    checkListEl.appendChild(empty);
    return;
  }

  const summaryEl = document.createElement("div");
  summaryEl.className = "check-summary";

  const s = result.summary;
  const matchBadge = document.createElement("span");
  matchBadge.className = "check-badge ok";
  matchBadge.textContent = "Совпадает: " + s.match;
  summaryEl.appendChild(matchBadge);

  if (s.mismatch) {
    const b = document.createElement("span");
    b.className = "check-badge err";
    b.textContent = "Расхождение: " + s.mismatch;
    summaryEl.appendChild(b);
  }
  if (s.missing) {
    const b = document.createElement("span");
    b.className = "check-badge warn";
    b.textContent = "Отсутствует: " + s.missing;
    summaryEl.appendChild(b);
  }
  if (s.leak) {
    const b = document.createElement("span");
    b.className = "check-badge err";
    b.textContent = "Утечка: " + s.leak;
    summaryEl.appendChild(b);
  }

  checkListEl.appendChild(summaryEl);

  result.report.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "check-row";

    const headEl = document.createElement("div");
    headEl.className = "check-row-head";

    const dot = document.createElement("span");
    dot.className = "check-dot " + row.status;
    headEl.appendChild(dot);

    const nameEl = document.createElement("span");
    nameEl.className = "check-name";
    nameEl.textContent = row.name;
    headEl.appendChild(nameEl);

    rowEl.appendChild(headEl);

    const valuesEl = document.createElement("div");
    valuesEl.className = "check-values";

    if (row.status === "missing") {
      valuesEl.innerHTML = `<span class="label">не отправлен</span>`;
    } else if (row.status === "leak") {
      valuesEl.innerHTML = `<span class="label">утечка:</span> <span class="val-danger">${escapeHtml(row.actual || "")}</span>`;
    } else {
      valuesEl.innerHTML = `<span class="label">факт:</span> ${escapeHtml(row.actual || "")}`;
    }

    rowEl.appendChild(valuesEl);
    checkListEl.appendChild(rowEl);
  });
}

async function runCheck() {
  checkBtn.disabled = true;
  checkBtn.textContent = "Проверка…";
  checkListEl.innerHTML = "";

  const loadingEl = document.createElement("div");
  loadingEl.className = "empty";
  loadingEl.textContent = "Запрос к httpbin.org…";
  checkListEl.appendChild(loadingEl);

  try {
    const result = await chrome.runtime.sendMessage({ type: "check-headers" });
    renderCheck(result);
  } catch (e) {
    renderCheck({ ok: false, reason: "network" });
  } finally {
    checkBtn.disabled = false;
    checkBtn.textContent = "Проверить";
  }
}

function toggleGroup(key) {
  const idx = state.collapsed.indexOf(key);
  if (idx === -1) {
    state.collapsed.push(key);
  } else {
    state.collapsed.splice(idx, 1);
  }
  save();
  renderProfiles();
}

async function save() {
  lsSave();
  await chrome.storage.local.set({
    enabled: state.enabled,
    preset: state.preset,
    presetKey: presetKey(state.preset),
    presetUA: state.preset ? state.preset.ua : null,
    customUA: state.customUA,
    collapsed: state.collapsed,
    theme: state.theme,
    excludedDomains: state.excludedDomains
  });
}

toggleEl.addEventListener("change", () => {
  state.enabled = toggleEl.checked;
  save();
  renderProfiles();
});

themeBtn.addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme();
  save();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    tabs.forEach((t) => t.classList.toggle("active", t === tab));
    Object.entries(panels).forEach(([name, el]) => {
      el.classList.toggle("active", name === target);
    });
  });
});

customBtn.addEventListener("click", () => {
  if (footerEl.querySelector(".custom-input")) return;

  customBtn.style.display = "none";

  const input = document.createElement("textarea");
  input.className = "custom-input";
  input.rows = 2;
  input.placeholder = "Введите User-Agent…";
  input.value = state.customUA || "";
  footerEl.appendChild(input);
  input.focus();
  input.select();

  let committed = false;

  const cancel = () => {
    if (committed) return;
    committed = true;
    input.remove();
    customBtn.style.display = "";
  };

  const commit = async () => {
    if (committed) return;
    committed = true;
    const value = input.value.trim();
    if (value) {
      state.customUA = value;
      state.preset = null;
      state.enabled = true;
      toggleEl.checked = true;
      await save();
    }
    input.remove();
    customBtn.style.display = "";
    renderProfiles();
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  });

  input.addEventListener("blur", () => {
    setTimeout(() => {
      if (document.activeElement === input) return;
      if (committed) return;
      commit();
    }, 120);
  });
});

excAddBtn.addEventListener("click", async () => {
  const domain = normalizeDomain(excInput.value);
  if (!domain) return;
  if (!state.excludedDomains.includes(domain)) {
    state.excludedDomains.push(domain);
    await save();
    renderExceptions();
  }
  excInput.value = "";
});

excInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    excAddBtn.click();
  }
});

excClearBtn.addEventListener("click", async () => {
  if (!state.excludedDomains.length) return;
  state.excludedDomains = [];
  await save();
  renderExceptions();
});

checkBtn.addEventListener("click", runCheck);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.excludedDomains) {
    const next = Array.isArray(changes.excludedDomains.newValue)
      ? changes.excludedDomains.newValue
      : [];
    const same =
      next.length === state.excludedDomains.length &&
      next.every((d, i) => d === state.excludedDomains[i]);
    if (!same) {
      state.excludedDomains = next;
      lsSave();
      renderExceptions();
    }
  }
});

(function boot() {
  const cached = lsLoad();

  if (cached.theme === "light" || cached.theme === "dark") {
    state.theme = cached.theme;
  }
  state.collapsed = Array.isArray(cached.collapsed) && cached.collapsed.length
    ? cached.collapsed
    : defaultCollapsed();
  state.enabled = !!cached.enabled;
  state.preset = cached.presetKey
    ? PRESETS.find((p) => presetKey(p) === cached.presetKey) || null
    : null;
  state.customUA = cached.customUA || null;
  state.excludedDomains = Array.isArray(cached.excludedDomains)
    ? cached.excludedDomains
    : [];

  applyTheme();
  toggleEl.checked = state.enabled;
  renderProfiles();
  renderExceptions();

  chrome.storage.local.get([
    "enabled", "presetKey", "presetUA", "customUA", "collapsed", "theme", "excludedDomains"
  ]).then((stored) => {
    const nextTheme = stored.theme === "light" ? "light" : "dark";
    const nextCollapsed = Array.isArray(stored.collapsed) && stored.collapsed.length
      ? stored.collapsed
      : defaultCollapsed();

    let nextPreset = null;
    if (stored.presetKey) {
      nextPreset = PRESETS.find((p) => presetKey(p) === stored.presetKey) || null;
    } else if (stored.presetUA) {
      nextPreset = PRESETS.find((p) => p.ua === stored.presetUA) || null;
    }

    const nextState = {
      enabled: !!stored.enabled,
      preset: nextPreset,
      customUA: stored.customUA || null,
      collapsed: nextCollapsed,
      theme: nextTheme,
      excludedDomains: Array.isArray(stored.excludedDomains) ? stored.excludedDomains : []
    };

    const changed =
      nextState.enabled !== state.enabled ||
      presetKey(nextState.preset) !== presetKey(state.preset) ||
      nextState.customUA !== state.customUA ||
      nextState.theme !== state.theme ||
      nextState.excludedDomains.length !== state.excludedDomains.length ||
      nextState.collapsed.length !== state.collapsed.length;

    state = { ...state, ...nextState };
    lsSave();

    if (changed) {
      applyTheme();
      toggleEl.checked = state.enabled;
      renderProfiles();
      renderExceptions();
    }
  });
})();