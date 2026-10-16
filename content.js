(async () => {
  const stored = await chrome.storage.local.get([
    "enabled", "preset", "customUA", "excludedDomains", "__grease", "acceptLanguage"
  ]);

  const el = document.documentElement;
  if (!el) return;

  el.dataset.uaSpoof = JSON.stringify({
    enabled: !!stored.enabled,
    preset: stored.preset || null,
    customUA: stored.customUA || null,
    excludedDomains: Array.isArray(stored.excludedDomains) ? stored.excludedDomains : [],
    grease: stored.__grease || null,
    acceptLanguage: stored.acceptLanguage || "en-US"
  });

  el.dispatchEvent(new Event("ua-spoof-ready"));
})();