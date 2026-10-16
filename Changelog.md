# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.8.3] - 2026-10-16

### Changed

- Disabling the enable toggle no longer clears the selected preset or custom User-Agent.
- The active profile stays highlighted and checkmarked while the extension is off.
- Deselecting a profile still turns the toggle off automatically.
- Boot and storage sync only turn the toggle off when no profile is selected; they no longer clear the profile itself.

## [1.8.2] - 2026-10-16

### Fixed

- Deselecting the active profile now turns the enable toggle off automatically.
- Deselecting the custom User-Agent now turns the enable toggle off automatically.
- Attempting to toggle on without a selected profile reverts to off.
- Boot and storage sync reset the enabled state when no profile is present.

## [1.8.1] - 2026-10-16

### Fixed

- Disabling the extension now clears the active preset and custom UA, and removes the group highlight.
- Selecting a profile no longer enables the extension automatically; the toggle must be flipped manually.
- Clicking the currently active profile deselects it. Same behavior for a custom User-Agent.
- Custom UA entered while the extension is disabled is no longer forced to enable the extension.

## [1.8.0] - 2026-10-16

### Added

- Version number shown next to the title in the header, pulled from the manifest at runtime.
- Monochrome SVG icons for operating systems (Windows, macOS, Linux, iOS, Android).
- OS icons rendered for each profile item, matching the panel color scheme and highlighting on hover and active state.
- `author` and `homepage_url` fields in `manifest.json`.

### Changed

- Header layout adjusted to fit the version badge.
- Profile item padding tuned to align OS icon with the platform name.

## [1.7.0] - 2026-10-15

### Added

- RU/EN language switcher between the theme button and the enable toggle.
- Central i18n dictionary in `popup.js` covering all popup strings.
- Group header is highlighted with the accent color when it contains the active profile.
- A checkmark is shown on group headers with the active profile.
- Language is detected from `navigator.language` on first launch and persisted in `chrome.storage.local` and `localStorage`.

### Changed

- Status line shows only the Active/Disabled state, without the profile name.
- Minor text adjustments.

## [1.6.0] - 2026-10-15

### Added

- Aligned `Intl` locale with the spoofed language: `Intl.DateTimeFormat`, `Intl.NumberFormat`, `Intl.Collator`, `Intl.RelativeTimeFormat`, `Intl.PluralRules`, and `Intl.ListFormat` now return `en-US` regardless of the real system locale.
- Universal device extras for all presets: `navigator.hardwareConcurrency`, `navigator.maxTouchPoints`, `navigator.languages`, `navigator.language`, `screen.availWidth`, and `screen.availHeight` are now applied to Firefox, Safari, and Internet Explorer presets as well.

### Changed

- Device extras moved out of the Chrome-only block — they now apply to every preset type based on `preset.platform`.

## [1.5.1] - 2026-10-15

### Added

- Overrode `navigator.hardwareConcurrency`, `navigator.maxTouchPoints`, `navigator.languages`, and `navigator.language`.
- Overrode `screen.availWidth` and `screen.availHeight` based on the device class.

## [1.5.0] - 2026-10-15

### Added

- Support for `Sec-CH-UA-Model` with automatic extraction of the Android device model from the preset `platform` field.
- `buildModel()` helper in `background.js` and `inject.js`.
- `navigator.userAgentData.getHighEntropyValues(["model"])` now returns the actual model for Android.

### Changed

- Preemptive approach: all Client Hints are sent on every request regardless of `Accept-CH`.

## [1.4.2] - 2026-10-15

### Fixed

- `window.devicePixelRatio` was not overridden on some Chrome configurations because the property lives on `WindowProperties`, not on `Window.prototype`.
- Introduced the `defineChain()` helper, which defines a property both on the prototype and on the object itself (`window`, `navigator`, `screen`).

## [1.4.1] - 2026-10-15

### Added

- Aligned the JS surface with legacy headers: `window.devicePixelRatio`, `navigator.deviceMemory`, and `navigator.connection`.
- Overrode `screen.colorDepth` and `screen.pixelDepth`.

## [1.4.0] - 2026-10-15

### Added

- Spoofing of legacy Client Hints: `DPR`, `Device-Memory`, `Downlink`, `ECT`, and `RTT`.
- Removal of `Viewport-Width` and `Save-Data`.
- `buildLegacyHints()` helper with iOS / Android / Desktop classification.
- Legacy header verification in the popup.

## [1.3.1] - 2026-10-15

### Fixed

- False positive in the consistency check: `sec-ch-ua-full-version-list` was flagged as a leak because it was missing from the expected headers list.
- Added `__grease` from `chrome.storage` to `checkHeaders()` so the expected `full-version-list` is built correctly.

## [1.3.0] - 2026-10-15

### Added

- New **Check** tab in the popup.
- The **Check** button sends a test request to `httpbin.org/headers` and parses the response.
- Report shows a status for each header: **match**, **mismatch**, **missing**, or **leak**.
- Summary with counts of matching, mismatching, missing, and leaking headers.

## [1.2.2] - 2026-10-15

### Added

- Extended `CH_HEADERS` list: added `Sec-CH-UA-Form-Factors`, `Sec-CH-UA-WoW64`, `Sec-CH-UA-Bitness`, and `Sec-CH-UA-Arch`.
- Spoofing of `Sec-CH-Prefers-Color-Scheme`, `Sec-CH-Prefers-Reduced-Motion`, `Sec-CH-Prefers-Reduced-Transparency`, and `Sec-CH-Prefers-Contrast`.
- `buildFormFactors()`, `buildArch()`, `buildBitness()`, and `buildWow64()` helpers in `background.js`.

## [1.2.1] - 2026-10-15

### Added

- New file `inject.js` — a content script running in the **page's main world** (`world: "MAIN"`).
- `content.js` rewritten as a bridge: it passes settings from `chrome.storage` into `inject.js` via a `dataset` attribute and the `ua-spoof-ready` event.

### Fixed

- Overrides of `navigator.userAgent`, `navigator.userAgentData`, and `navigator.platform` were applied only inside the isolated content-script sandbox and were not visible to the page.
- `navigator.userAgentData.getHighEntropyValues()` returned native Chrome values.

## [1.2.0] - 2026-10-15

### Added

- `sec-ch-ua-full-version` added to `CH_HEADERS`.
- `extractFullVersion()` extracts the full version from `preset.ua`.
- `buildFullVersionList()` generates `sec-ch-ua-full-version-list` from GREASE and the full version.
- `navigator.userAgentData.uaFullVersion` and `fullVersionList` in `getHighEntropyValues()` now return the full version from the preset.

### Fixed

- Real Chrome version leak: `sec-ch-ua-full-version` exposed the actual version (`125.x.x.x`) while `User-Agent` was spoofed to `155.0.0.0`.

## [1.1.0] - 2026-10-15

### Added

- GREASE brand pool: `Not/A)Brand;v="8"`, `Not?A_Brand;v="24"`, and `Not;A=Brand;v="99"`.
- `pickGrease()`, `applyGrease()`, `getGrease()`, and `regenerateGrease()` helpers in `background.js`.
- GREASE is regenerated on extension install/update and on browser startup.
- The value is cached in `chrome.storage.local` and used consistently by `background.js` and `content.js`.

### Changed

- Removed the static `"Not/A)Brand";v="8"` pattern that made spoofed requests easy to detect.

## [1.0.0] - 2026-10-14

### Added

- Initial release.
- `User-Agent` spoofing via `declarativeNetRequest`.
- Client Hints spoofing (`Sec-CH-UA`, `Sec-CH-UA-Mobile`, `Sec-CH-UA-Platform`, `Sec-CH-UA-Platform-Version`).
- `navigator.userAgent`, `navigator.appVersion`, `navigator.platform`, `navigator.vendor`, and `navigator.userAgentData` overrides.
- Ready-to-use presets: Chrome, Mozilla Firefox, Safari, Internet Explorer, Microsoft Edge, Opera, Vivaldi Browser, and Yandex Browser.
- **Profiles** tab with grouping by browser.
- **Exceptions** tab for disabling spoofing on specific domains.
- Cloudflare Turnstile exceptions.
- Custom User-Agent support.
- Light and dark themes.