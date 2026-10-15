const RULE_ID = 1;
const RESOURCE_TYPES = [
  "main_frame", "sub_frame", "stylesheet", "script", "image",
  "font", "object", "xmlhttprequest", "ping", "csp_report",
  "media", "other"
];
const CH_HEADERS = [
  "sec-ch-ua", "sec-ch-ua-mobile", "sec-ch-ua-platform",
  "sec-ch-ua-platform-version", "sec-ch-ua-full-version-list",
  "sec-ch-ua-arch", "sec-ch-ua-bitness", "sec-ch-ua-model",
  "sec-ch-ua-wow64"
];

const TURNSTILE_HOSTS = [
  "challenges.cloudflare.com",
  "cloudflarechallenge.com",
  "cloudflareinsights.com"
];

const GREASE_BRANDS = [
  { brand: "Not/A)Brand", version: "8" },
  { brand: "Not?A_Brand", version: "24" },
  { brand: "Not;A=Brand", version: "99" }
];

let pending = Promise.resolve();
let userExcludedDomains = [];

function enqueue(task) {
  pending = pending.then(task).catch(() => {});
  return pending;
}

function pickGrease() {
  return GREASE_BRANDS[Math.floor(Math.random() * GREASE_BRANDS.length)];
}

function applyGrease(value, grease) {
  if (!value || !grease || !grease.brand) return value;
  return value.replace(/"Not[^"]*";v="\d+"/, `"${grease.brand}";v="${grease.version}"`);
}

async function getGrease() {
  const stored = await chrome.storage.local.get(["__grease"]);
  const grease = stored.__grease;
  if (
    grease &&
    typeof grease.brand === "string" &&
    typeof grease.version === "string" &&
    GREASE_BRANDS.some((g) => g.brand === grease.brand)
  ) {
    return grease;
  }
  const next = pickGrease();
  await chrome.storage.local.set({ __grease: next });
  return next;
}

async function regenerateGrease() {
  const next = pickGrease();
  await chrome.storage.local.set({ __grease: next });
  return next;
}

async function loadExcludedDomains() {
  const stored = await chrome.storage.local.get(["excludedDomains"]);
  userExcludedDomains = Array.isArray(stored.excludedDomains) ? stored.excludedDomains : [];
}

async function applyRules() {
  const state = await chrome.storage.local.get(["enabled", "preset", "customUA"]);
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map((r) => r.id);

  const preset = state.enabled ? state.preset : null;
  const customUA = state.enabled ? state.customUA : null;

  if (!preset && !customUA) {
    if (removeRuleIds.length) {
      await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds });
    }
    return;
  }

  const grease = await getGrease();
  const requestHeaders = [];

  if (customUA) {
    requestHeaders.push({ header: "user-agent", operation: "set", value: customUA });
    for (const h of CH_HEADERS) {
      requestHeaders.push({ header: h, operation: "remove" });
    }
  } else if (preset) {
    requestHeaders.push({ header: "user-agent", operation: "set", value: preset.ua });
    if (preset.hints) {
      for (const [name, value] of Object.entries(preset.hints)) {
        const finalValue = name === "sec-ch-ua" ? applyGrease(value, grease) : value;
        requestHeaders.push({ header: name, operation: "set", value: finalValue });
      }
      for (const h of CH_HEADERS) {
        if (!(h in preset.hints)) {
          requestHeaders.push({ header: h, operation: "remove" });
        }
      }
    } else {
      for (const h of CH_HEADERS) {
        requestHeaders.push({ header: h, operation: "remove" });
      }
    }
  }

  const excluded = Array.from(new Set([
    ...TURNSTILE_HOSTS,
    ...userExcludedDomains
  ]));

  const condition = {
    urlFilter: "*",
    resourceTypes: RESOURCE_TYPES,
    excludedRequestDomains: excluded
  };

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules: [
      {
        id: RULE_ID,
        priority: 1,
        action: { type: "modifyHeaders", requestHeaders },
        condition
      }
    ]
  });
}

const sync = () => enqueue(async () => {
  await loadExcludedDomains();
  await applyRules();
});

chrome.runtime.onInstalled.addListener(() => {
  enqueue(async () => {
    await regenerateGrease();
    await loadExcludedDomains();
    await applyRules();
  });
});

chrome.runtime.onStartup.addListener(() => {
  enqueue(async () => {
    await regenerateGrease();
    await loadExcludedDomains();
    await applyRules();
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.enabled || changes.preset || changes.customUA || changes.excludedDomains) {
    sync();
  }
});

sync();