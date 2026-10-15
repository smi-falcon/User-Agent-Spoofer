(async () => {
  const stored = await chrome.storage.local.get([
    "enabled", "preset", "customUA", "excludedDomains", "__grease"
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

    let uaHeader = preset.hints["sec-ch-ua"] || "";
    const grease = stored.__grease;
    if (grease && grease.brand && grease.version) {
      uaHeader = uaHeader.replace(
        /"Not[^"]*";v="\d+"/,
        `"${grease.brand}";v="${grease.version}"`
      );
    }

    const brands = [];
    const re = /"([^"]+)";v="([^"]+)"/g;
    let m;
    while ((m = re.exec(uaHeader)) !== null) {
      brands.push({ brand: m[1], version: m[2] });
    }

    const mobile = preset.hints["sec-ch-ua-mobile"] === "?1";
    const platformVersion = (preset.hints["sec-ch-ua-platform-version"] || '""').replace(/"/g, "");

    const platform = preset.platform || "";

    const architecture = /iPhone|iPad|iPod|Android/i.test(platform) ? "arm" : "x86";
    const bitness = /i686|i386/i.test(platform) ? "32" : "64";
    const wow64 = /WOW64/i.test(platform);

    const fullVersionPatterns = [
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

    let fullVersion = "";
    for (const re2 of fullVersionPatterns) {
      const mm = ua.match(re2);
      if (mm) {
        fullVersion = mm[1];
        break;
      }
    }

    const fullVersionList = brands.map((b) => ({
      brand: b.brand,
      version: b.brand.includes("Not") ? b.version : fullVersion
    }));

    const uaData = {
      brands,
      mobile,
      platform: platformRaw,
      getHighEntropyValues: (hints) => {
        const out = { brands, mobile, platform: platformRaw };
        if (hints.includes("architecture")) out.architecture = architecture;
        if (hints.includes("bitness")) out.bitness = bitness;
        if (hints.includes("model")) out.model = "";
        if (hints.includes("platformVersion")) out.platformVersion = platformVersion;
        if (hints.includes("uaFullVersion")) out.uaFullVersion = fullVersion;
        if (hints.includes("fullVersionList")) out.fullVersionList = fullVersionList;
        if (hints.includes("wow64")) out.wow64 = wow64;
        return Promise.resolve(out);
      },
      toJSON: () => ({ brands, mobile, platform: platformRaw })
    };

    define(Navigator.prototype, "userAgentData", uaData);
  }
})();