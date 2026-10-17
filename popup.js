const listEl = document.getElementById("list");
const toggleEl = document.getElementById("toggle");
const statusEl = document.getElementById("status");
const customBtn = document.getElementById("custom-btn");
const themeBtn = document.getElementById("theme-btn");
const langBtn = document.getElementById("lang-btn");
const langSelectBtn = document.getElementById("lang-select-btn");
const langDropdown = document.getElementById("lang-dropdown");
const versionEl = document.getElementById("version");
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
const excImportBtn = document.getElementById("exc-import-btn");
const excExportBtn = document.getElementById("exc-export-btn");

const checkListEl = document.getElementById("check-list");
const checkBtn = document.getElementById("check-btn");

const I18N = {
  ru: {
    statusDisabled: "Отключено",
    statusNoProfile: "Выберите профиль",
    statusActive: "Активно",
    tabProfiles: "Профили",
    tabExceptions: "Исключения",
    tabCheck: "Проверка",
    customBtn: "Свой User-Agent",
    customGroupTitle: "Свой User-Agent",
    customInputPlaceholder: "Введите User-Agent…",
    langSelectBtn: "Свой Accept-Language",
    themeTooltip: "Сменить тему",
    langTooltip: "Сменить язык",
    excPlaceholder: "example.com",
    excAddBtn: "Добавить",
    excClearBtn: "Очистить всё",
    excImportBtn: "Импорт",
    excExportBtn: "Экспорт",
    excEmpty: "Список пуст",
    excRemove: "Удалить",
    checkEmpty: "Нажмите «Проверить» для анализа заголовков",
    checkBtn: "Проверить",
    checkBtnLoading: "Проверка…",
    checkLoading: "Запрос к httpbin.org…",
    checkDisabled: "Расширение отключено",
    checkNetwork: "Не удалось выполнить запрос",
    checkStatusPrefix: "Ошибка сервера: ",
    checkNoData: "Нет данных",
    checkMatch: "Совпадает",
    checkMismatch: "Расхождение",
    checkMissing: "Отсутствует",
    checkLeak: "Утечка",
    checkFact: "факт:",
    checkNotSent: "не отправлен",
    checkLeakLabel: "утечка:"
  },
  en: {
    statusDisabled: "Disabled",
    statusNoProfile: "Select a profile",
    statusActive: "Active",
    tabProfiles: "Profiles",
    tabExceptions: "Exceptions",
    tabCheck: "Check",
    customBtn: "Custom User-Agent",
    customGroupTitle: "Custom User-Agent",
    customInputPlaceholder: "Enter User-Agent…",
    langSelectBtn: "Custom Accept-Language",
    themeTooltip: "Toggle theme",
    langTooltip: "Switch language",
    excPlaceholder: "example.com",
    excAddBtn: "Add",
    excClearBtn: "Clear all",
    excImportBtn: "Import",
    excExportBtn: "Export",
    excEmpty: "List is empty",
    excRemove: "Remove",
    checkEmpty: "Click «Check» to analyze headers",
    checkBtn: "Check",
    checkBtnLoading: "Checking…",
    checkLoading: "Requesting httpbin.org…",
    checkDisabled: "Extension disabled",
    checkNetwork: "Request failed",
    checkStatusPrefix: "Server error: ",
    checkNoData: "No data",
    checkMatch: "Match",
    checkMismatch: "Mismatch",
    checkMissing: "Missing",
    checkLeak: "Leak",
    checkFact: "actual:",
    checkNotSent: "not sent",
    checkLeakLabel: "leak:"
  }
};

const BROWSER_LABELS = {
  Chrome: "Google Chrome",
  Firefox: "Mozilla Firefox",
  Safari: "Apple Safari",
  "Internet Explorer": "Internet Explorer",
  Edge: "Microsoft Edge",
  Opera: "Opera",
  Vivaldi: "Vivaldi Browser",
  Yandex: "Yandex Browser"
};

const OS_ICONS = {
  Windows: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 3.6L7 3v4.4H2zM8 2.85L14.5 2v5.4H8zM2 8.6h5V13L2 12.4zM8 8.6h6.5V14L8 13.15z"/></svg>',
  macOS: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M11.3 8.2c0-1.3 1-1.9 1.1-1.9-.6-1-1.6-1-1.9-1-.8-.1-1.5.5-1.9.5-.4 0-1-.5-1.7-.5-.9 0-1.7.5-2.1 1.3-.9 1.6-.2 3.9.6 5.1.4.6 1 1.3 1.6 1.3.7 0 .9-.4 1.7-.4s1 .4 1.7.4c.7 0 1.2-.6 1.6-1.3.5-.8.7-1.5.7-1.5 0 0-1.4-.5-1.4-2zM10.1 4.2c.4-.4.6-1 .5-1.7-.5 0-1.2.4-1.5.8-.4.4-.7 1-.5 1.7.6 0 1.2-.4 1.5-.8z"/></svg>',
  Linux: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1c-1.4 0-2.4 1.1-2.4 2.4 0 .6.2 1.1.5 1.6C5 6 4 7.4 4 9c0 .4.1.9.2 1.3-.4.3-.7.9-.7 1.4 0 .4.2.8.5 1h8c.3-.2.5-.6.5-1 0-.5-.3-1.1-.7-1.4.1-.4.2-.9.2-1.3 0-1.6-1-3-2.1-4 .3-.5.5-1 .5-1.6C10.4 2.1 9.4 1 8 1zm-1.5 3c.3 0 .5.2.5.5s-.2.5-.5.5-.5-.2-.5-.5.2-.5.5-.5zm3 0c.3 0 .5.2.5.5s-.2.5-.5.5-.5-.2-.5-.5.2-.5.5-.5zM8 6c.6 0 1.1.4 1.1 1H6.9c0-.6.5-1 1.1-1z"/></svg>',
  iOS: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M11.3 8.2c0-1.3 1-1.9 1.1-1.9-.6-1-1.6-1-1.9-1-.8-.1-1.5.5-1.9.5-.4 0-1-.5-1.7-.5-.9 0-1.7.5-2.1 1.3-.9 1.6-.2 3.9.6 5.1.4.6 1 1.3 1.6 1.3.7 0 .9-.4 1.7-.4s1 .4 1.7.4c.7 0 1.2-.6 1.6-1.3.5-.8.7-1.5.7-1.5 0 0-1.4-.5-1.4-2zM10.1 4.2c.4-.4.6-1 .5-1.7-.5 0-1.2.4-1.5.8-.4.4-.7 1-.5 1.7.6 0 1.2-.4 1.5-.8z"/></svg>',
  Android: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 6.5v5c0 .8.7 1.5 1.5 1.5h.5v2c0 .5.4 1 1 1s1-.5 1-1v-2h1v2c0 .5.4 1 1 1s1-.5 1-1v-2h.5c.8 0 1.5-.7 1.5-1.5v-5H4zM3 6.5c-.6 0-1 .4-1 1v3c0 .6.4 1 1 1s1-.4 1-1v-3c0-.6-.4-1-1-1zM13 6.5c-.6 0-1 .4-1 1v3c0 .6.4 1 1 1s1-.4 1-1v-3c0-.6-.4-1-1-1zM5.6 3l-.7-1.2c-.1-.1 0-.2.1-.2.1 0 .2 0 .2.1L6 3c.6-.3 1.3-.4 2-.4s1.4.1 2 .4l.8-1.3c0-.1.2-.1.2-.1.1 0 .2.1.1.2L10.4 3c1.8 1 3 2.7 3 4.5H2.6c0-1.8 1.2-3.5 3-4.5z"/></svg>'
};

const LANGUAGES = [
  { code: "en-US", nameEn: "English (United States)", nameRu: "Английский (США)" },
  { code: "af-ZA", nameEn: "Afrikaans (South Africa)", nameRu: "Африкаанс (ЮАР)" },
  { code: "ar-AE", nameEn: "Arabic (United Arab Emirates)", nameRu: "Арабский (ОАЭ)" },
  { code: "ar-DZ", nameEn: "Arabic (Algeria)", nameRu: "Арабский (Алжир)" },
  { code: "ar-EG", nameEn: "Arabic (Egypt)", nameRu: "Арабский (Египет)" },
  { code: "ar-IQ", nameEn: "Arabic (Iraq)", nameRu: "Арабский (Ирак)" },
  { code: "ar-JO", nameEn: "Arabic (Jordan)", nameRu: "Арабский (Иордания)" },
  { code: "ar-KW", nameEn: "Arabic (Kuwait)", nameRu: "Арабский (Кувейт)" },
  { code: "ar-LB", nameEn: "Arabic (Lebanon)", nameRu: "Арабский (Ливан)" },
  { code: "ar-MA", nameEn: "Arabic (Morocco)", nameRu: "Арабский (Марокко)" },
  { code: "ar-OM", nameEn: "Arabic (Oman)", nameRu: "Арабский (Оман)" },
  { code: "ar-QA", nameEn: "Arabic (Qatar)", nameRu: "Арабский (Катар)" },
  { code: "ar-SA", nameEn: "Arabic (Saudi Arabia)", nameRu: "Арабский (Саудовская Аравия)" },
  { code: "ar-SY", nameEn: "Arabic (Syria)", nameRu: "Арабский (Сирия)" },
  { code: "ar-TN", nameEn: "Arabic (Tunisia)", nameRu: "Арабский (Тунис)" },
  { code: "ar-YE", nameEn: "Arabic (Yemen)", nameRu: "Арабский (Йемен)" },
  { code: "az-AZ", nameEn: "Azerbaijani (Azerbaijan)", nameRu: "Азербайджанский (Азербайджан)" },
  { code: "be-BY", nameEn: "Belarusian (Belarus)", nameRu: "Белорусский (Беларусь)" },
  { code: "bg-BG", nameEn: "Bulgarian (Bulgaria)", nameRu: "Болгарский (Болгария)" },
  { code: "bn-BD", nameEn: "Bengali (Bangladesh)", nameRu: "Бенгальский (Бангладеш)" },
  { code: "bn-IN", nameEn: "Bengali (India)", nameRu: "Бенгальский (Индия)" },
  { code: "ca-ES", nameEn: "Catalan (Spain)", nameRu: "Каталанский (Испания)" },
  { code: "cs-CZ", nameEn: "Czech (Czechia)", nameRu: "Чешский (Чехия)" },
  { code: "cy-GB", nameEn: "Welsh (United Kingdom)", nameRu: "Валлийский (Великобритания)" },
  { code: "da-DK", nameEn: "Danish (Denmark)", nameRu: "Датский (Дания)" },
  { code: "de-AT", nameEn: "German (Austria)", nameRu: "Немецкий (Австрия)" },
  { code: "de-CH", nameEn: "German (Switzerland)", nameRu: "Немецкий (Швейцария)" },
  { code: "de-DE", nameEn: "German (Germany)", nameRu: "Немецкий (Германия)" },
  { code: "el-GR", nameEn: "Greek (Greece)", nameRu: "Греческий (Греция)" },
  { code: "en-AU", nameEn: "English (Australia)", nameRu: "Английский (Австралия)" },
  { code: "en-CA", nameEn: "English (Canada)", nameRu: "Английский (Канада)" },
  { code: "en-GB", nameEn: "English (United Kingdom)", nameRu: "Английский (Великобритания)" },
  { code: "en-IE", nameEn: "English (Ireland)", nameRu: "Английский (Ирландия)" },
  { code: "en-IN", nameEn: "English (India)", nameRu: "Английский (Индия)" },
  { code: "en-NG", nameEn: "English (Nigeria)", nameRu: "Английский (Нигерия)" },
  { code: "en-NZ", nameEn: "English (New Zealand)", nameRu: "Английский (Новая Зеландия)" },
  { code: "en-PH", nameEn: "English (Philippines)", nameRu: "Английский (Филиппины)" },
  { code: "en-SG", nameEn: "English (Singapore)", nameRu: "Английский (Сингапур)" },
  { code: "en-ZA", nameEn: "English (South Africa)", nameRu: "Английский (ЮАР)" },
  { code: "es-AR", nameEn: "Spanish (Argentina)", nameRu: "Испанский (Аргентина)" },
  { code: "es-CL", nameEn: "Spanish (Chile)", nameRu: "Испанский (Чили)" },
  { code: "es-CO", nameEn: "Spanish (Colombia)", nameRu: "Испанский (Колумбия)" },
  { code: "es-ES", nameEn: "Spanish (Spain)", nameRu: "Испанский (Испания)" },
  { code: "es-MX", nameEn: "Spanish (Mexico)", nameRu: "Испанский (Мексика)" },
  { code: "es-PE", nameEn: "Spanish (Peru)", nameRu: "Испанский (Перу)" },
  { code: "es-US", nameEn: "Spanish (United States)", nameRu: "Испанский (США)" },
  { code: "es-VE", nameEn: "Spanish (Venezuela)", nameRu: "Испанский (Венесуэла)" },
  { code: "et-EE", nameEn: "Estonian (Estonia)", nameRu: "Эстонский (Эстония)" },
  { code: "eu-ES", nameEn: "Basque (Spain)", nameRu: "Баскский (Испания)" },
  { code: "fa-IR", nameEn: "Persian (Iran)", nameRu: "Персидский (Иран)" },
  { code: "fi-FI", nameEn: "Finnish (Finland)", nameRu: "Финский (Финляндия)" },
  { code: "fil-PH", nameEn: "Filipino (Philippines)", nameRu: "Филиппинский (Филиппины)" },
  { code: "fr-BE", nameEn: "French (Belgium)", nameRu: "Французский (Бельгия)" },
  { code: "fr-CA", nameEn: "French (Canada)", nameRu: "Французский (Канада)" },
  { code: "fr-CH", nameEn: "French (Switzerland)", nameRu: "Французский (Швейцария)" },
  { code: "fr-FR", nameEn: "French (France)", nameRu: "Французский (Франция)" },
  { code: "ga-IE", nameEn: "Irish (Ireland)", nameRu: "Ирландский (Ирландия)" },
  { code: "gl-ES", nameEn: "Galician (Spain)", nameRu: "Галисийский (Испания)" },
  { code: "he-IL", nameEn: "Hebrew (Israel)", nameRu: "Иврит (Израиль)" },
  { code: "hi-IN", nameEn: "Hindi (India)", nameRu: "Хинди (Индия)" },
  { code: "hr-HR", nameEn: "Croatian (Croatia)", nameRu: "Хорватский (Хорватия)" },
  { code: "hu-HU", nameEn: "Hungarian (Hungary)", nameRu: "Венгерский (Венгрия)" },
  { code: "hy-AM", nameEn: "Armenian (Armenia)", nameRu: "Армянский (Армения)" },
  { code: "id-ID", nameEn: "Indonesian (Indonesia)", nameRu: "Индонезийский (Индонезия)" },
  { code: "is-IS", nameEn: "Icelandic (Iceland)", nameRu: "Исландский (Исландия)" },
  { code: "it-CH", nameEn: "Italian (Switzerland)", nameRu: "Итальянский (Швейцария)" },
  { code: "it-IT", nameEn: "Italian (Italy)", nameRu: "Итальянский (Италия)" },
  { code: "ja-JP", nameEn: "Japanese (Japan)", nameRu: "Японский (Япония)" },
  { code: "ka-GE", nameEn: "Georgian (Georgia)", nameRu: "Грузинский (Грузия)" },
  { code: "kk-KZ", nameEn: "Kazakh (Kazakhstan)", nameRu: "Казахский (Казахстан)" },
  { code: "km-KH", nameEn: "Khmer (Cambodia)", nameRu: "Кхмерский (Камбоджа)" },
  { code: "ko-KR", nameEn: "Korean (South Korea)", nameRu: "Корейский (Южная Корея)" },
  { code: "lt-LT", nameEn: "Lithuanian (Lithuania)", nameRu: "Литовский (Литва)" },
  { code: "lv-LV", nameEn: "Latvian (Latvia)", nameRu: "Латышский (Латвия)" },
  { code: "mk-MK", nameEn: "Macedonian (North Macedonia)", nameRu: "Македонский (Северная Македония)" },
  { code: "ml-IN", nameEn: "Malayalam (India)", nameRu: "Малаялам (Индия)" },
  { code: "mr-IN", nameEn: "Marathi (India)", nameRu: "Маратхи (Индия)" },
  { code: "ms-MY", nameEn: "Malay (Malaysia)", nameRu: "Малайский (Малайзия)" },
  { code: "nb-NO", nameEn: "Norwegian Bokmål (Norway)", nameRu: "Норвежский (Норвегия)" },
  { code: "ne-NP", nameEn: "Nepali (Nepal)", nameRu: "Непальский (Непал)" },
  { code: "nl-BE", nameEn: "Dutch (Belgium)", nameRu: "Нидерландский (Бельгия)" },
  { code: "nl-NL", nameEn: "Dutch (Netherlands)", nameRu: "Нидерландский (Нидерланды)" },
  { code: "pa-IN", nameEn: "Punjabi (India)", nameRu: "Панджаби (Индия)" },
  { code: "pl-PL", nameEn: "Polish (Poland)", nameRu: "Польский (Польша)" },
  { code: "pt-BR", nameEn: "Portuguese (Brazil)", nameRu: "Португальский (Бразилия)" },
  { code: "pt-PT", nameEn: "Portuguese (Portugal)", nameRu: "Португальский (Португалия)" },
  { code: "ro-MD", nameEn: "Romanian (Moldova)", nameRu: "Румынский (Молдова)" },
  { code: "ro-RO", nameEn: "Romanian (Romania)", nameRu: "Румынский (Румыния)" },
  { code: "ru-RU", nameEn: "Russian (Russia)", nameRu: "Русский (Россия)" },
  { code: "si-LK", nameEn: "Sinhala (Sri Lanka)", nameRu: "Сингальский (Шри-Ланка)" },
  { code: "sk-SK", nameEn: "Slovak (Slovakia)", nameRu: "Словацкий (Словакия)" },
  { code: "sl-SI", nameEn: "Slovenian (Slovenia)", nameRu: "Словенский (Словения)" },
  { code: "sq-AL", nameEn: "Albanian (Albania)", nameRu: "Албанский (Албания)" },
  { code: "sr-RS", nameEn: "Serbian (Serbia)", nameRu: "Сербский (Сербия)" },
  { code: "sv-SE", nameEn: "Swedish (Sweden)", nameRu: "Шведский (Швеция)" },
  { code: "ta-IN", nameEn: "Tamil (India)", nameRu: "Тамильский (Индия)" },
  { code: "te-IN", nameEn: "Telugu (India)", nameRu: "Телугу (Индия)" },
  { code: "th-TH", nameEn: "Thai (Thailand)", nameRu: "Тайский (Таиланд)" },
  { code: "tr-TR", nameEn: "Turkish (Turkey)", nameRu: "Турецкий (Турция)" },
  { code: "uk-UA", nameEn: "Ukrainian (Ukraine)", nameRu: "Украинский (Украина)" },
  { code: "ur-PK", nameEn: "Urdu (Pakistan)", nameRu: "Урду (Пакистан)" },
  { code: "uz-UZ", nameEn: "Uzbek (Uzbekistan)", nameRu: "Узбекский (Узбекистан)" },
  { code: "vi-VN", nameEn: "Vietnamese (Vietnam)", nameRu: "Вьетнамский (Вьетнам)" },
  { code: "zh-CN", nameEn: "Chinese (Simplified, China)", nameRu: "Китайский (упрощённый, Китай)" },
  { code: "zh-HK", nameEn: "Chinese (Hong Kong)", nameRu: "Китайский (Гонконг)" },
  { code: "zh-SG", nameEn: "Chinese (Singapore)", nameRu: "Китайский (Сингапур)" },
  { code: "zh-TW", nameEn: "Chinese (Traditional, Taiwan)", nameRu: "Китайский (традиционный, Тайвань)" }
];

const LS_KEY = "ua-spoofer-cache";

let lastCheckResult = null;
let currentLang = "ru";

let state = {
  enabled: false,
  preset: null,
  customUA: null,
  acceptLanguage: "en-US",
  collapsed: [],
  theme: "dark",
  lang: "ru",
  excludedDomains: []
};

function t(key) {
  const dict = I18N[currentLang] || I18N.ru;
  return dict[key] || key;
}

function hasActiveProfile() {
  return !!(state.preset || state.customUA);
}

function detectDefaultLang() {
  const nav = (navigator.language || "en").toLowerCase();
  return nav.startsWith("ru") ? "ru" : "en";
}

function detectOS(platform) {
  const p = platform || "";
  if (/Windows/i.test(p)) return "Windows";
  if (/iPhone|iPad|iPod/i.test(p)) return "iOS";
  if (/Android/i.test(p)) return "Android";
  if (/macOS|Mac OS|Intel Mac/i.test(p)) return "macOS";
  if (/Linux|Ubuntu|Fedora/i.test(p)) return "Linux";
  return null;
}

function osIcon(platform) {
  const os = detectOS(platform);
  return os ? OS_ICONS[os] || "" : "";
}

function languageName(code) {
  const found = LANGUAGES.find((l) => l.code === code);
  if (!found) return code;
  return currentLang === "ru" ? found.nameRu : found.nameEn;
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
}

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
      lang: state.lang,
      collapsed: state.collapsed,
      enabled: state.enabled,
      presetKey: presetKey(state.preset),
      customUA: state.customUA,
      acceptLanguage: state.acceptLanguage,
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
    statusEl.textContent = t("statusDisabled");
    statusEl.style.color = "";
    return;
  }
  if (!activeUA()) {
    statusEl.textContent = t("statusNoProfile");
    statusEl.style.color = "";
    return;
  }
  statusEl.textContent = t("statusActive");
  statusEl.style.color = "var(--success)";
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
}

function escapeHtml(str) {
  return String(str)
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

function enforceProfileRule() {
  if (!hasActiveProfile()) {
    state.enabled = false;
    toggleEl.checked = false;
  }
}

function renderLangSelect() {
  langSelectBtn.textContent = languageName(state.acceptLanguage);
  if (state.enabled) {
    langSelectBtn.classList.add("blocked");
  } else {
    langSelectBtn.classList.remove("blocked");
  }
}

function renderLangDropdown() {
  langDropdown.innerHTML = "";
  const sorted = LANGUAGES.slice().sort((a, b) => {
    if (a.code === "en-US") return -1;
    if (b.code === "en-US") return 1;
    return a.code.localeCompare(b.code);
  });

  sorted.forEach((lang) => {
    const opt = document.createElement("div");
    opt.className = "lang-option";
    if (lang.code === state.acceptLanguage) opt.classList.add("active");
    opt.innerHTML = `
      <span class="lang-option-name">${escapeHtml(languageName(lang.code))}</span>
      <span class="lang-option-code">${escapeHtml(lang.code)}</span>
    `;
    opt.addEventListener("click", async () => {
      state.acceptLanguage = lang.code;
      await save();
      renderLangSelect();
      closeLangDropdown();
    });
    langDropdown.appendChild(opt);
  });
}

function openLangDropdown() {
  if (state.enabled) return;
  renderLangDropdown();
  langDropdown.hidden = false;
}

function closeLangDropdown() {
  langDropdown.hidden = true;
}

function parseImport(text) {
  if (!text) return [];
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const data = JSON.parse(trimmed);
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.excludedDomains)) {
        list = data.excludedDomains;
      }
      return list.map(normalizeDomain).filter(Boolean);
    } catch (e) {}
  }

  return trimmed
    .split(/[\r\n,;]+/)
    .map(normalizeDomain)
    .filter(Boolean);
}

function exportExceptions() {
  if (!state.excludedDomains.length) return;
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    excludedDomains: [...state.excludedDomains].sort()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "user-agent-spoofer-exceptions.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importExceptions() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,.txt,application/json,text/plain";
  input.addEventListener("change", async () => {
    const file = input.files && input.files[0];
    if (!file) return;
    let text = "";
    try {
      text = await file.text();
    } catch (e) {
      return;
    }
    const imported = parseImport(text);
    if (!imported.length) return;
    const merged = new Set([...state.excludedDomains, ...imported]);
    state.excludedDomains = Array.from(merged);
    await save();
    renderExceptions();
  });
  input.click();
}

function renderProfiles() {
  listEl.innerHTML = "";

  const groups = new Map();
  PRESETS.forEach((p) => {
    if (!groups.has(p.browser)) groups.set(p.browser, []);
    groups.get(p.browser).push(p);
  });

  const activeKey = presetKey(state.preset);
  const customActive = !!state.customUA;
  const blocked = state.enabled;

  if (state.customUA) {
    const groupEl = document.createElement("div");
    groupEl.className = "group";
    if (state.collapsed.includes("__custom__")) groupEl.classList.add("collapsed");
    if (customActive) groupEl.classList.add("has-active");

    const headerEl = document.createElement("div");
    headerEl.className = "group-header";
    headerEl.innerHTML = `
      <svg class="group-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      <span class="group-title">${escapeHtml(t("customGroupTitle"))}</span>
      ${customActive ? `<svg class="group-active-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : ""}
    `;
    headerEl.addEventListener("click", () => toggleGroup("__custom__"));
    groupEl.appendChild(headerEl);

    const itemsEl = document.createElement("div");
    itemsEl.className = "group-items";

    const itemEl = document.createElement("div");
    itemEl.className = "item active";
    if (blocked) itemEl.classList.add("blocked");
    itemEl.innerHTML = `
      <span class="item-name item-custom">${escapeHtml(state.customUA)}</span>
      <svg class="item-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    `;
    itemEl.addEventListener("click", () => {
      if (state.enabled) return;
      state.customUA = null;
      enforceProfileRule();
      save();
      renderProfiles();
    });
    itemsEl.appendChild(itemEl);
    groupEl.appendChild(itemsEl);

    listEl.appendChild(groupEl);
  }

  groups.forEach((items, browser) => {
    const groupEl = document.createElement("div");
    groupEl.className = "group";
    if (state.collapsed.includes(browser)) groupEl.classList.add("collapsed");

    const hasActive = !customActive && activeKey && items.some((p) => presetKey(p) === activeKey);
    if (hasActive) groupEl.classList.add("has-active");

    const label = BROWSER_LABELS[browser] || browser;

    const headerEl = document.createElement("div");
    headerEl.className = "group-header";
    headerEl.innerHTML = `
      <svg class="group-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      <span class="group-title">${escapeHtml(label)}</span>
      <span class="group-count">${items.length}</span>
      ${hasActive ? `<svg class="group-active-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : ""}
    `;
    headerEl.addEventListener("click", () => toggleGroup(browser));
    groupEl.appendChild(headerEl);

    const itemsEl = document.createElement("div");
    itemsEl.className = "group-items";

    items.forEach((preset) => {
      const itemEl = document.createElement("div");
      itemEl.className = "item";
      const isItemActive = !state.customUA && activeKey && presetKey(preset) === activeKey;
      if (isItemActive) {
        itemEl.classList.add("active");
      }
      if (blocked) {
        itemEl.classList.add("blocked");
      }

      const version = extractVersion(preset);
      const osSvg = osIcon(preset.platform);

      itemEl.innerHTML = `
        <span class="item-left">
          <span class="item-icons">
            ${osSvg ? `<span class="item-icon">${osSvg}</span>` : ""}
          </span>
          <span class="item-name">
            <span class="item-platform">${escapeHtml(preset.platform)}</span>
            ${version ? `<span class="item-version">${escapeHtml(version)}</span>` : ""}
          </span>
        </span>
        <svg class="item-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      `;

      itemEl.addEventListener("click", () => {
        if (state.enabled) return;
        if (isItemActive) {
          state.preset = null;
        } else {
          state.preset = preset;
          state.customUA = null;
        }
        enforceProfileRule();
        save();
        renderProfiles();
      });

      itemsEl.appendChild(itemEl);
    });

    groupEl.appendChild(itemsEl);
    listEl.appendChild(groupEl);
  });

  renderLangSelect();
  updateStatus();
}

function renderExceptions() {
  excListEl.innerHTML = "";

  if (!state.excludedDomains.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = t("excEmpty");
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
    removeBtn.title = t("excRemove");
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
  lastCheckResult = result;
  checkListEl.innerHTML = "";

  if (!result || !result.ok) {
    const empty = document.createElement("div");
    empty.className = "empty";
    if (result && result.reason === "disabled") {
      empty.textContent = t("checkDisabled");
    } else if (result && result.reason === "network") {
      empty.textContent = t("checkNetwork");
    } else if (result && result.reason === "status") {
      empty.textContent = t("checkStatusPrefix") + result.status;
    } else {
      empty.textContent = t("checkEmpty");
    }
    checkListEl.appendChild(empty);
    return;
  }

  const summaryEl = document.createElement("div");
  summaryEl.className = "check-summary";

  const s = result.summary;
  const matchBadge = document.createElement("span");
  matchBadge.className = "check-badge ok";
  matchBadge.textContent = t("checkMatch") + ": " + s.match;
  summaryEl.appendChild(matchBadge);

  if (s.mismatch) {
    const b = document.createElement("span");
    b.className = "check-badge err";
    b.textContent = t("checkMismatch") + ": " + s.mismatch;
    summaryEl.appendChild(b);
  }
  if (s.missing) {
    const b = document.createElement("span");
    b.className = "check-badge warn";
    b.textContent = t("checkMissing") + ": " + s.missing;
    summaryEl.appendChild(b);
  }
  if (s.leak) {
    const b = document.createElement("span");
    b.className = "check-badge err";
    b.textContent = t("checkLeak") + ": " + s.leak;
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
      valuesEl.innerHTML = `<span class="label">${escapeHtml(t("checkNotSent"))}</span>`;
    } else if (row.status === "leak") {
      valuesEl.innerHTML = `<span class="label">${escapeHtml(t("checkLeakLabel"))}</span> <span class="val-danger">${escapeHtml(row.actual || "")}</span>`;
    } else {
      valuesEl.innerHTML = `<span class="label">${escapeHtml(t("checkFact"))}</span> ${escapeHtml(row.actual || "")}`;
    }

    rowEl.appendChild(valuesEl);
    checkListEl.appendChild(rowEl);
  });
}

async function runCheck() {
  checkBtn.disabled = true;
  checkBtn.textContent = t("checkBtnLoading");
  checkListEl.innerHTML = "";

  const loadingEl = document.createElement("div");
  loadingEl.className = "empty";
  loadingEl.textContent = t("checkLoading");
  checkListEl.appendChild(loadingEl);

  try {
    const result = await chrome.runtime.sendMessage({ type: "check-headers" });
    renderCheck(result);
  } catch (e) {
    renderCheck({ ok: false, reason: "network" });
  } finally {
    checkBtn.disabled = false;
    checkBtn.textContent = t("checkBtn");
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
    acceptLanguage: state.acceptLanguage,
    collapsed: state.collapsed,
    theme: state.theme,
    lang: state.lang,
    excludedDomains: state.excludedDomains
  });
}

function applyLang() {
  currentLang = state.lang;
  langBtn.textContent = currentLang.toUpperCase();
  applyTranslations();
  updateStatus();
  renderProfiles();
  renderExceptions();
  if (lastCheckResult) {
    renderCheck(lastCheckResult);
  } else {
    checkListEl.innerHTML = "";
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = t("checkEmpty");
    checkListEl.appendChild(empty);
  }
}

toggleEl.addEventListener("change", () => {
  if (toggleEl.checked && !hasActiveProfile()) {
    toggleEl.checked = false;
    state.enabled = false;
    save();
    renderProfiles();
    return;
  }
  state.enabled = toggleEl.checked;
  closeLangDropdown();
  save();
  renderProfiles();
});

themeBtn.addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme();
  save();
});

langBtn.addEventListener("click", () => {
  state.lang = state.lang === "ru" ? "en" : "ru";
  applyLang();
  save();
});

langSelectBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (langDropdown.hidden) {
    openLangDropdown();
  } else {
    closeLangDropdown();
  }
});

document.addEventListener("click", (e) => {
  if (langDropdown.hidden) return;
  if (langDropdown.contains(e.target)) return;
  if (langSelectBtn.contains(e.target)) return;
  closeLangDropdown();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !langDropdown.hidden) {
    closeLangDropdown();
  }
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    tabs.forEach((t) => t.classList.toggle("active", t === tab));
    Object.entries(panels).forEach(([name, el]) => {
      el.classList.toggle("active", name === target);
    });
    closeLangDropdown();
  });
});

customBtn.addEventListener("click", () => {
  if (state.enabled) return;
  if (footerEl.querySelector(".custom-input")) return;

  customBtn.style.display = "none";

  const input = document.createElement("textarea");
  input.className = "custom-input";
  input.rows = 2;
  input.placeholder = t("customInputPlaceholder");
  input.value = state.customUA || "";
  footerEl.insertBefore(input, langSelectBtn);
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

excImportBtn.addEventListener("click", importExceptions);
excExportBtn.addEventListener("click", exportExceptions);

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
  const manifest = chrome.runtime.getManifest();
  versionEl.textContent = "v" + manifest.version;

  const cached = lsLoad();

  if (cached.theme === "light" || cached.theme === "dark") {
    state.theme = cached.theme;
  }
  state.lang = cached.lang === "ru" || cached.lang === "en"
    ? cached.lang
    : detectDefaultLang();
  state.collapsed = Array.isArray(cached.collapsed) && cached.collapsed.length
    ? cached.collapsed
    : defaultCollapsed();
  state.enabled = !!cached.enabled;
  state.preset = cached.presetKey
    ? PRESETS.find((p) => presetKey(p) === cached.presetKey) || null
    : null;
  state.customUA = cached.customUA || null;
  state.acceptLanguage = cached.acceptLanguage && LANGUAGES.some((l) => l.code === cached.acceptLanguage)
    ? cached.acceptLanguage
    : "en-US";
  state.excludedDomains = Array.isArray(cached.excludedDomains)
    ? cached.excludedDomains
    : [];

  enforceProfileRule();

  currentLang = state.lang;
  langBtn.textContent = currentLang.toUpperCase();

  applyTheme();
  applyTranslations();
  toggleEl.checked = state.enabled;
  renderProfiles();
  renderExceptions();

  chrome.storage.local.get([
    "enabled", "presetKey", "presetUA", "customUA", "acceptLanguage", "collapsed", "theme", "lang", "excludedDomains"
  ]).then((stored) => {
    const nextTheme = stored.theme === "light" ? "light" : "dark";
    const nextLang = stored.lang === "ru" || stored.lang === "en"
      ? stored.lang
      : state.lang;
    const nextCollapsed = Array.isArray(stored.collapsed) && stored.collapsed.length
      ? stored.collapsed
      : defaultCollapsed();

    const nextAcceptLanguage = stored.acceptLanguage && LANGUAGES.some((l) => l.code === stored.acceptLanguage)
      ? stored.acceptLanguage
      : state.acceptLanguage;

    let nextPreset = null;
    if (stored.presetKey) {
      nextPreset = PRESETS.find((p) => presetKey(p) === stored.presetKey) || null;
    } else if (stored.presetUA) {
      nextPreset = PRESETS.find((p) => p.ua === stored.presetUA) || null;
    }

    let nextEnabled = !!stored.enabled;
    const nextCustom = stored.customUA || null;

    if (!nextPreset && !nextCustom) {
      nextEnabled = false;
    }

    const nextState = {
      enabled: nextEnabled,
      preset: nextPreset,
      customUA: nextCustom,
      acceptLanguage: nextAcceptLanguage,
      collapsed: nextCollapsed,
      theme: nextTheme,
      lang: nextLang,
      excludedDomains: Array.isArray(stored.excludedDomains) ? stored.excludedDomains : []
    };

    const changed =
      nextState.enabled !== state.enabled ||
      presetKey(nextState.preset) !== presetKey(state.preset) ||
      nextState.customUA !== state.customUA ||
      nextState.acceptLanguage !== state.acceptLanguage ||
      nextState.theme !== state.theme ||
      nextState.lang !== state.lang ||
      nextState.excludedDomains.length !== state.excludedDomains.length ||
      nextState.collapsed.length !== state.collapsed.length;

    state = { ...state, ...nextState };
    lsSave();

    if (changed) {
      currentLang = state.lang;
      langBtn.textContent = currentLang.toUpperCase();
      applyTheme();
      applyTranslations();
      toggleEl.checked = state.enabled;
      renderProfiles();
      renderExceptions();
    }
  });
})();