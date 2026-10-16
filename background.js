const RULE_ID = 1;
const RESOURCE_TYPES = [
  "main_frame", "sub_frame", "stylesheet", "script", "image",
  "font", "object", "xmlhttprequest", "ping", "csp_report",
  "media", "other"
];
const CH_HEADERS = [
  "sec-ch-ua",
  "sec-ch-ua-mobile",
  "sec-ch-ua-platform",
  "sec-ch-ua-platform-version",
  "sec-ch-ua-full-version",
  "sec-ch-ua-full-version-list",
  "sec-ch-ua-arch",
  "sec-ch-ua-bitness",
  "sec-ch-ua-model",
  "sec-ch-ua-wow64",
  "sec-ch-ua-form-factors"
];

const PREFERENCE_HEADERS = [
  "sec-ch-prefers-color-scheme",
  "sec-ch-prefers-reduced-motion",
  "sec-ch-prefers-reduced-transparency",
  "sec-ch-prefers-contrast"
];

const LEGACY_HINT_HEADERS = [
  "dpr",
  "device-memory",
  "downlink",
  "ect",
  "rtt"
];

const LEGACY_REMOVE_HEADERS = [
  "viewport-width",
  "save-data"
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

function extractFullVersion(ua) {
  if (!ua) return "";
  const patterns = [
    /YaBrowser\/([\d.]+)/,
    /Vivaldi\/([\d.]+)/,
    /OPR\/([\d.]+)/,
    /EdgiOS\/([\d.]+)/,
    /EdgA\/([\d.]+)/,
    /Edg\/([\d.]+)/,
    /CriOS\/([\d.]+)/,
    /FxiOS\/([\d.]+)/,
    /Firefox\/([\d.]+)/,
    /Version\/([\d.]+)/,
    /Chrome\/([\d.]+)/
  ];
  for (const re of patterns) {
    const m = ua.match(re);
    if (m) return m[1];
  }
  return "";
}

function buildFullVersionList(uaHeader, fullVersion) {
  if (!uaHeader) return "";
  const parts = [];
  const re = /"([^"]+)";v="([^"]+)"/g;
  let m;
  while ((m = re.exec(uaHeader)) !== null) {
    const brand = m[1];
    const isGrease = brand.includes("Not");
    const version = isGrease ? m[2] : fullVersion;
    parts.push(`"${brand}";v="${version}"`);
  }
  return parts.join(", ");
}

function buildFormFactors(preset) {
  const platform = preset.platform || "";
  if (/iPhone|iPad|iPod|Android/i.test(platform)) {
    return "Desktop, Mobile";
  }
  return "Desktop";
}

function buildArch(preset) {
  const platform = preset.platform || "";
  if (/iPhone|iPad|iPod|Android/i.test(platform)) return '"arm"';
  if (/i686|i386/i.test(platform)) return '"x86"';
  return '"x86"';
}

function buildBitness(preset) {
  const platform = preset.platform || "";
  if (/i686|i386/i.test(platform)) return '"32"';
  return '"64"';
}

function buildWow64(preset) {
  const platform = preset.platform || "";
  return /WOW64/i.test(platform) ? "?1" : "?0";
}

function buildModel(preset) {
  const platform = preset.platform || "";
  const m = platform.match(/Android\s*\(([^)]+)\)/);
  if (m) return `"${m[1]}"`;
  return '""';
}

function buildLegacyHints(preset) {
  const platform = preset.platform || "";
  if (/iPhone|iPad|iPod/i.test(platform)) {
    return {
      dpr: "3",
      "device-memory": "4",
      downlink: "10",
      ect: "4g",
      rtt: "100"
    };
  }
  if (/Android/i.test(platform)) {
    return {
      dpr: "2.625",
      "device-memory": "4",
      downlink: "10",
      ect: "4g",
      rtt: "100"
    };
  }
  return {
    dpr: "1",
    "device-memory": "8",
    downlink: "10",
    ect: "4g",
    rtt: "50"
  };
}

function buildAcceptLanguage(lang) {
  const code = lang || "en-US";
  if (code === "en-US") return "en-US,en";
  const short = code.split("-")[0];
  return `${code},${short},en-US;q=0.9,en;q=0.8`;
}

async function loadExcludedDomains() {
  const stored = await chrome.storage.local.get(["excludedDomains"]);
  userExcludedDomains = Array.isArray(stored.excludedDomains) ? stored.excludedDomains : [];
}

async function applyRules() {
  const state = await chrome.storage.local.get(["enabled", "preset", "customUA", "acceptLanguage"]);
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map((r) => r.id);

  const preset = state.enabled ? state.preset : null;
  const customUA = state.enabled ? state.customUA : null;
  const acceptLanguage = state.enabled ? (state.acceptLanguage || "en-US") : null;

  if (!preset && !customUA) {
    if (removeRuleIds.length) {
      await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds });
    }
    return;
  }

  const grease = await getGrease();
  const requestHeaders = [];

  requestHeaders.push({
    header: "accept-language",
    operation: "set",
    value: buildAcceptLanguage(acceptLanguage)
  });

  if (customUA) {
    requestHeaders.push({ header: "user-agent", operation: "set", value: customUA });
    for (const h of CH_HEADERS) {
      requestHeaders.push({ header: h, operation: "remove" });
    }
    for (const h of PREFERENCE_HEADERS) {
      requestHeaders.push({ header: h, operation: "set", value: h === "sec-ch-prefers-color-scheme" ? "dark" : "no-preference" });
    }
    for (const h of LEGACY_HINT_HEADERS) {
      requestHeaders.push({ header: h, operation: "remove" });
    }
    for (const h of LEGACY_REMOVE_HEADERS) {
      requestHeaders.push({ header: h, operation: "remove" });
    }
  } else if (preset) {
    requestHeaders.push({ header: "user-agent", operation: "set", value: preset.ua });

    if (preset.hints) {
      let greaseApplied = null;
      for (const [name, value] of Object.entries(preset.hints)) {
        const finalValue = name === "sec-ch-ua" ? applyGrease(value, grease) : value;
        if (name === "sec-ch-ua") greaseApplied = finalValue;
        requestHeaders.push({ header: name, operation: "set", value: finalValue });
      }

      const fullVersion = extractFullVersion(preset.ua);
      if (fullVersion) {
        requestHeaders.push({
          header: "sec-ch-ua-full-version",
          operation: "set",
          value: `"${fullVersion}"`
        });
        const fvl = buildFullVersionList(greaseApplied, fullVersion);
        if (fvl) {
          requestHeaders.push({
            header: "sec-ch-ua-full-version-list",
            operation: "set",
            value: fvl
          });
        }
      }

      requestHeaders.push({
        header: "sec-ch-ua-arch",
        operation: "set",
        value: buildArch(preset)
      });
      requestHeaders.push({
        header: "sec-ch-ua-bitness",
        operation: "set",
        value: buildBitness(preset)
      });
      requestHeaders.push({
        header: "sec-ch-ua-wow64",
        operation: "set",
        value: buildWow64(preset)
      });
      requestHeaders.push({
        header: "sec-ch-ua-form-factors",
        operation: "set",
        value: buildFormFactors(preset)
      });
      requestHeaders.push({
        header: "sec-ch-ua-model",
        operation: "set",
        value: buildModel(preset)
      });

      const dynamicHeaders = new Set([
        "sec-ch-ua-full-version",
        "sec-ch-ua-full-version-list",
        "sec-ch-ua-arch",
        "sec-ch-ua-bitness",
        "sec-ch-ua-wow64",
        "sec-ch-ua-form-factors",
        "sec-ch-ua-model"
      ]);

      for (const h of CH_HEADERS) {
        if (!(h in preset.hints) && !dynamicHeaders.has(h)) {
          requestHeaders.push({ header: h, operation: "remove" });
        }
      }

      for (const h of PREFERENCE_HEADERS) {
        requestHeaders.push({
          header: h,
          operation: "set",
          value: h === "sec-ch-prefers-color-scheme" ? "dark" : "no-preference"
        });
      }

      const legacy = buildLegacyHints(preset);
      for (const [name, value] of Object.entries(legacy)) {
        requestHeaders.push({ header: name, operation: "set", value });
      }
      for (const h of LEGACY_REMOVE_HEADERS) {
        requestHeaders.push({ header: h, operation: "remove" });
      }
    } else {
      for (const h of CH_HEADERS) {
        requestHeaders.push({ header: h, operation: "remove" });
      }
      for (const h of PREFERENCE_HEADERS) {
        requestHeaders.push({ header: h, operation: "remove" });
      }
      for (const h of LEGACY_HINT_HEADERS) {
        requestHeaders.push({ header: h, operation: "remove" });
      }
      for (const h of LEGACY_REMOVE_HEADERS) {
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

async function checkHeaders() {
  const state = await chrome.storage.local.get(["enabled", "preset", "customUA", "__grease"]);
  if (!state.enabled) {
    return { ok: false, reason: "disabled" };
  }

  let res;
  try {
    res = await fetch("https://httpbin.org/headers", {
      method: "GET",
      cache: "no-store",
      credentials: "omit"
    });
  } catch (e) {
    return { ok: false, reason: "network" };
  }

  if (!res.ok) {
    return { ok: false, reason: "status", status: res.status };
  }

  let data;
  try {
    data = await res.json();
  } catch (e) {
    return { ok: false, reason: "parse" };
  }

  const received = data && data.headers ? data.headers : {};

  const pick = (name) => {
    for (const [k, v] of Object.entries(received)) {
      if (k.toLowerCase() === name) return v;
    }
    return null;
  };

  const expected = {};

  if (state.customUA) {
    expected["user-agent"] = state.customUA;
  } else if (state.preset) {
    const preset = state.preset;
    const grease = state.__grease;
    expected["user-agent"] = preset.ua;
    if (preset.hints) {
      let greaseApplied = null;
      for (const [name, value] of Object.entries(preset.hints)) {
        const finalValue = name === "sec-ch-ua" ? applyGrease(value, grease) : value;
        if (name === "sec-ch-ua") greaseApplied = finalValue;
        expected[name] = finalValue;
      }

      const fullVersion = extractFullVersion(preset.ua);
      if (fullVersion) {
        expected["sec-ch-ua-full-version"] = `"${fullVersion}"`;
        const fvl = buildFullVersionList(greaseApplied, fullVersion);
        if (fvl) {
          expected["sec-ch-ua-full-version-list"] = fvl;
        }
      }

      expected["sec-ch-ua-arch"] = buildArch(preset);
      expected["sec-ch-ua-bitness"] = buildBitness(preset);
      expected["sec-ch-ua-wow64"] = buildWow64(preset);
      expected["sec-ch-ua-form-factors"] = buildFormFactors(preset);
      expected["sec-ch-ua-model"] = buildModel(preset);

      const legacy = buildLegacyHints(preset);
      for (const [name, value] of Object.entries(legacy)) {
        expected[name] = value;
      }
    }
  }

  const report = [];
  for (const [name, expectedValue] of Object.entries(expected)) {
    const actual = pick(name);
    const isGreaseField = name === "sec-ch-ua";
    let status;
    if (actual === null) {
      status = "missing";
    } else if (actual === expectedValue) {
      status = "match";
    } else if (isGreaseField) {
      const actualBrands = (actual.match(/"([^"]+)";v="([^"]+)"/g) || []).length;
      const expectedBrands = (expectedValue.match(/"([^"]+)";v="([^"]+)"/g) || []).length;
      const actualNot = /"Not[^"]*";v="\d+"/.test(actual);
      status = actualBrands === expectedBrands && actualNot ? "match" : "mismatch";
    } else {
      status = "mismatch";
    }
    report.push({
      name,
      expected: expectedValue,
      actual: actual,
      status
    });
  }

  for (const h of CH_HEADERS) {
    if (h in expected) continue;
    const actual = pick(h);
    if (actual !== null && state.preset && state.preset.hints) {
      report.push({
        name: h,
        expected: null,
        actual,
        status: "leak"
      });
    }
  }

  for (const h of LEGACY_HINT_HEADERS) {
    if (h in expected) continue;
    const actual = pick(h);
    if (actual !== null && state.preset && state.preset.hints) {
      report.push({
        name: h,
        expected: null,
        actual,
        status: "leak"
      });
    }
  }

  return {
    ok: true,
    report,
    summary: {
      total: report.length,
      match: report.filter((r) => r.status === "match").length,
      mismatch: report.filter((r) => r.status === "mismatch").length,
      missing: report.filter((r) => r.status === "missing").length,
      leak: report.filter((r) => r.status === "leak").length
    }
  };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === "check-headers") {
    checkHeaders().then(sendResponse);
    return true;
  }
});

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
  if (
    changes.enabled ||
    changes.preset ||
    changes.customUA ||
    changes.acceptLanguage ||
    changes.excludedDomains
  ) {
    sync();
  }
});

sync();