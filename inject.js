(() => {
  const TURNSTILE_HOSTS = [
    "challenges.cloudflare.com",
    "cloudflarechallenge.com",
    "cloudflareinsights.com"
  ];

  const matches = (h, list) =>
    list.some((d) => h === d || h.endsWith("." + d));

  const hostname = window.location.hostname;
  if (matches(hostname, TURNSTILE_HOSTS)) return;

  const define = (target, prop, value) => {
    try {
      Object.defineProperty(target, prop, {
        get: () => value,
        configurable: true
      });
    } catch (e) {}
  };

  const defineChain = (proto, obj, prop, value) => {
    define(proto, prop, value);
    define(obj, prop, value);
  };

  const extractFullVersion = (ua) => {
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
  };

  const buildModel = (platform) => {
    const m = platform.match(/Android\s*\(([^)]+)\)/);
    return m ? m[1] : "";
  };

  const buildLegacy = (platform) => {
    if (/iPhone|iPad|iPod/i.test(platform)) {
      return { dpr: 3, deviceMemory: 4, downlink: 10, ect: "4g", rtt: 100 };
    }
    if (/Android/i.test(platform)) {
      return { dpr: 2.625, deviceMemory: 4, downlink: 10, ect: "4g", rtt: 100 };
    }
    return { dpr: 1, deviceMemory: 8, downlink: 10, ect: "4g", rtt: 50 };
  };

  const buildNavigatorExtras = (platform) => {
    if (/iPhone|iPad|iPod/i.test(platform)) {
      return {
        hardwareConcurrency: 4,
        maxTouchPoints: 5,
        availWidth: 390,
        availHeight: 844
      };
    }
    if (/Android/i.test(platform)) {
      return {
        hardwareConcurrency: 8,
        maxTouchPoints: 5,
        availWidth: 412,
        availHeight: 915
      };
    }
    return {
      hardwareConcurrency: 8,
      maxTouchPoints: 0,
      availWidth: 1920,
      availHeight: 1040
    };
  };

  const buildLanguages = (locale) => {
    const code = locale || "en-US";
    if (code === "en-US") return ["en-US", "en"];
    const short = code.split("-")[0];
    return [code, short, "en-US", "en"];
  };

  const applyIntlLocale = (locale) => {
    if (typeof Intl === "undefined") return;
    const wrap = (Ctor) => {
      if (!Ctor || !Ctor.prototype) return;
      const proto = Ctor.prototype;
      const original = proto.resolvedOptions;
      if (typeof original !== "function") return;
      try {
        Object.defineProperty(proto, "resolvedOptions", {
          value: function () {
            const opts = original.call(this);
            return Object.assign({}, opts, { locale });
          },
          configurable: true,
          writable: true
        });
      } catch (e) {}
    };
    wrap(Intl.DateTimeFormat);
    wrap(Intl.NumberFormat);
    wrap(Intl.Collator);
    wrap(Intl.RelativeTimeFormat);
    wrap(Intl.PluralRules);
    wrap(Intl.ListFormat);
  };

  const apply = (stored) => {
    if (!stored || !stored.enabled) return;

    const excluded = Array.isArray(stored.excludedDomains) ? stored.excludedDomains : [];
    if (matches(hostname, excluded)) return;

    const ua = stored.customUA || (stored.preset && stored.preset.ua);
    if (!ua) return;

    const locale = stored.acceptLanguage || "en-US";
    const languages = buildLanguages(locale);

    defineChain(Navigator.prototype, navigator, "userAgent", ua);
    defineChain(Navigator.prototype, navigator, "appVersion", ua.replace(/^Mozilla\//, ""));

    const preset = stored.preset;
    if (!preset) {
      defineChain(Navigator.prototype, navigator, "language", locale);
      defineChain(Navigator.prototype, navigator, "languages", languages);
      applyIntlLocale(locale);
      return;
    }

    const platform = preset.platform || "";

    const extras = buildNavigatorExtras(platform);

    defineChain(Navigator.prototype, navigator, "hardwareConcurrency", extras.hardwareConcurrency);
    defineChain(Navigator.prototype, navigator, "maxTouchPoints", extras.maxTouchPoints);
    defineChain(Navigator.prototype, navigator, "languages", languages);
    defineChain(Navigator.prototype, navigator, "language", locale);

    defineChain(Screen.prototype, screen, "availWidth", extras.availWidth);
    defineChain(Screen.prototype, screen, "availHeight", extras.availHeight);

    applyIntlLocale(locale);

    if (!preset.hints) return;

    const platformRaw = (preset.hints["sec-ch-ua-platform"] || '""').replace(/"/g, "");
    defineChain(Navigator.prototype, navigator, "platform", platformRaw || "Win32");
    defineChain(Navigator.prototype, navigator, "vendor", "Google Inc.");

    let uaHeader = preset.hints["sec-ch-ua"] || "";
    const grease = stored.grease;
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

    const architecture = /iPhone|iPad|iPod|Android/i.test(platform) ? "arm" : "x86";
    const bitness = /i686|i386/i.test(platform) ? "32" : "64";
    const wow64 = /WOW64/i.test(platform);
    const model = buildModel(platform);

    const formFactors = /iPhone|iPad|iPod|Android/i.test(platform)
      ? ["Desktop", "Mobile"]
      : ["Desktop"];

    const fullVersion = extractFullVersion(ua);

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
        if (hints.includes("model")) out.model = model;
        if (hints.includes("platformVersion")) out.platformVersion = platformVersion;
        if (hints.includes("uaFullVersion")) out.uaFullVersion = fullVersion;
        if (hints.includes("fullVersionList")) out.fullVersionList = fullVersionList;
        if (hints.includes("wow64")) out.wow64 = wow64;
        if (hints.includes("formFactors")) out.formFactors = formFactors;
        return Promise.resolve(out);
      },
      toJSON: () => ({ brands, mobile, platform: platformRaw })
    };

    defineChain(Navigator.prototype, navigator, "userAgentData", uaData);

    const legacy = buildLegacy(platform);

    defineChain(Window.prototype, window, "devicePixelRatio", legacy.dpr);

    defineChain(Navigator.prototype, navigator, "deviceMemory", legacy.deviceMemory);

    const connection = {
      downlink: legacy.downlink,
      effectiveType: legacy.ect,
      rtt: legacy.rtt,
      saveData: false,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true
    };

    defineChain(Navigator.prototype, navigator, "connection", connection);

    defineChain(Screen.prototype, screen, "colorDepth", 24);
    defineChain(Screen.prototype, screen, "pixelDepth", 24);
  };

  const consume = () => {
    const el = document.documentElement;
    if (!el || !el.dataset.uaSpoof) return false;
    const raw = el.dataset.uaSpoof;
    delete el.dataset.uaSpoof;
    try {
      apply(JSON.parse(raw));
    } catch (e) {}
    return true;
  };

  if (!consume()) {
    const el = document.documentElement;
    if (el) {
      el.addEventListener("ua-spoof-ready", consume, { once: true });
    } else {
      document.addEventListener("readystatechange", function onReady() {
        if (consume()) {
          document.removeEventListener("readystatechange", onReady);
        }
      });
    }
  }
})();