(async () => {
  const stored = await chrome.storage.local.get([
    "enabled", "preset", "customUA", "excludedDomains"
  ]);

  if (!stored.enabled) return;

  const hostname = window.location.hostname;

  const TURNSTILE_HOSTS = [
    "challenges.cloudflare.com",
    "cloudflarechallenge.com",
    "cloudflareinsights.com"
  ];

  const matches = (h, list) =>
    list.some((d) => h === d || h.endsWith("." + d));

  if (matches(hostname, TURNSTILE_HOSTS)) return;

  const excluded = Array.isArray(stored.excludedDomains) ? stored.excludedDomains : [];
  if (matches(hostname, excluded)) return;

  const ua = stored.customUA || (stored.preset && stored.preset.ua);
  if (!ua) return;

  const define = (proto, prop, value) => {
    try {
      Object.defineProperty(proto, prop, {
        get: () => value,
        configurable: true
      });
    } catch (e) {}
  };

  define(Navigator.prototype, "userAgent", ua);
  define(Navigator.prototype, "appVersion", ua.replace(/^Mozilla\//, ""));

  const preset = stored.preset;

  if (preset && preset.hints) {
    const platformRaw = (preset.hints["sec-ch-ua-platform"] || '""').replace(/"/g, "");
    define(Navigator.prototype, "platform", platformRaw || "Win32");
    define(Navigator.prototype, "vendor", "Google Inc.");

    const brands = [];
    const re = /"([^"]+)";v="([^"]+)"/g;
    let m;
    while ((m = re.exec(preset.hints["sec-ch-ua"])) !== null) {
      brands.push({ brand: m[1], version: m[2] });
    }

    const mobile = preset.hints["sec-ch-ua-mobile"] === "?1";
    const platformVersion = (preset.hints["sec-ch-ua-platform-version"] || '""').replace(/"/g, "");

    const uaData = {
      brands,
      mobile,
      platform: platformRaw,
      getHighEntropyValues: (hints) => {
        const out = { brands, mobile, platform: platformRaw };
        if (hints.includes("architecture")) out.architecture = "x86";
        if (hints.includes("bitness")) out.bitness = "64";
        if (hints.includes("model")) out.model = "";
        if (hints.includes("platformVersion")) out.platformVersion = platformVersion;
        if (hints.includes("uaFullVersion")) {
          const main = brands.find((b) => !b.brand.includes("Not")) || brands[0];
          out.uaFullVersion = main ? main.version + ".0.0.0" : "";
        }
        if (hints.includes("fullVersionList")) {
          out.fullVersionList = brands.map((b) => ({
            brand: b.brand,
            version: b.version + ".0.0.0"
          }));
        }
        if (hints.includes("wow64")) out.wow64 = false;
        return Promise.resolve(out);
      },
      toJSON: () => ({ brands, mobile, platform: platformRaw })
    };

    define(Navigator.prototype, "userAgentData", uaData);
  }
})();