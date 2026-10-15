(async () => {
  const stored = await chrome.storage.local.get([
    "enabled", "preset", "customUA", "excludedDomains", "__grease"
  ]);

  const el = document.documentElement;
  if (!el) return;

  el.dataset.uaSpoof = JSON.stringify({
    enabled: !!stored.enabled,
    preset: stored.preset || null,
    customUA: stored.customUA || null,
    excludedDomains: Array.isArray(stored.excludedDomains) ? stored.excludedDomains : [],
    grease: stored.__grease || null
  });

  el.dispatchEvent(new Event("ua-spoof-ready"));
})();