<div align="center">

<img src="icons/icon128.png" alt="User-Agent Spoofer" width="128" height="128">

# User-Agent Spoofer

An extension to spoof User-Agent, Client Hints, and Accept-Language for fingerprinting protection.

![Version](https://img.shields.io/badge/Version-1.9.0-7c6cff)
![Manifest](https://img.shields.io/badge/Manifest-V3-7c6cff)
![Chromium](https://img.shields.io/badge/Chromium-✓-4ade80)
![License](https://img.shields.io/badge/License-MIT-8b8b9a)

**[English](Readme.en.md) | [Русский](Readme.md)**

</div>

## About:

**User-Agent Spoofer** is an extension that spoofs the browser identity at both the network request level and the JavaScript level. It works through `declarativeNetRequest` and `content scripts`.

## Why use it:

- **Site inspection.** See how a website renders on a different device or in a different browser.
- **Platform-specific content.** Some sites serve a mobile or desktop version depending on what the browser claims to be.
- **Bypassing simple blocks.** Rare sites restrict access by browser type or OS. Switching the profile solves the problem.
- **Outdated browser.** If sites keep prompting you to "update" or block functionality, spoofing a modern version removes banners and lifts restrictions. The browser itself stays untouched.
- **Testing and debugging.** Developers verify how a site behaves under different clients and check Client Hints consistency.

## Features:

- **Ready-to-use profiles:** Google Chrome, Mozilla Firefox, Apple Safari, Internet Explorer, Microsoft Edge, Opera, Vivaldi Browser, Yandex Browser.
- **All platforms:** Windows, macOS, Linux, iOS, Android.
- **Two-level spoofing:** HTTP headers and JavaScript `navigator` properties.
- **Full Client Hints support:** all modern `Sec-CH-UA-*` headers, including `Full-Version-List`, `Arch`, `Bitness`, `WoW64`, `Model`, `Form-Factors`.
- **Legacy Client Hints:** spoofed `DPR`, `Device-Memory`, `Downlink`, `ECT`, `RTT`; removed `Viewport-Width` and `Save-Data`.
- **GREASE randomization:** a random non-existent brand is added to `Sec-CH-UA` and regenerated on every browser start. This mimics the behavior of a real Chrome browser.
- **Accept-Language spoofing:** choose one of 107 locales to match the IP region and prevent language leaks when using a virtual private network.
- **Built-in check:** the **Check** tab sends a test request and shows which headers match and which leak.
- **Exception list** for Cloudflare Turnstile captcha sites and any other domains of your choice.
- **Custom User-Agent** - arbitrary string input.
- **Light and dark themes.**
- **RU / EN interface language.**

## Installation:

**Option 1. Download the archive**

1. Download the [archive](https://github.com/smi-falcon/User-Agent-Spoofer/archive/refs/heads/main.zip).
2. Unpack it into a convenient folder.
3. Open `chrome://extensions`.
4. Enable **Developer mode**.
5. Click **Load unpacked** and select the folder.

**Option 2. Clone the repository**

```bash
git clone https://github.com/smi-falcon/User-Agent-Spoofer.git
```
## Usage:

1. Open the extension in your browser.
2. On the Profiles tab, choose the desired User-Agent.
3. Turn on the toggle in the header.
4. Reload open tabs to apply the changes.

On the **Exceptions** tab, add the domain of a site where Cloudflare Turnstile throws an error or loops during captcha verification. After that, spoofing is fully disabled for that domain and its subdomains.

On the **Check** tab, click the **Check** button - the extension sends a test request to httpbin.org, retrieves the list of sent headers, and compares them against the selected profile. The report shows a status for each header: match, mismatch, missing, or leak. A leak is a header that should not be sent for the selected profile but still reached the server. For profiles without Client Hints (Mozilla Firefox, Apple Safari, Internet Explorer), the check will only show `User-Agent` - this is correct behavior, because those browsers do not support `Client Hints`.

## Structure:

```
User-Agent-Spoofer/
├── manifest.json
├── background.js
├── content.js
├── inject.js
├── presets.js
├── popup.html
├── popup.css
├── popup.js
├── Readme.md
├── Readme.en.md
├── Changelog.md
├── License.md
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## How it works:

The extension applies spoofing at **two levels**:

| Level | File | What changes |
|---|---|---|
| Network | `background.js` | HTTP headers `User-Agent`, `sec-ch-ua-*`, `sec-ch-prefers-*`, legacy hints |
| Data transfer | `content.js` | Reads settings from `chrome.storage` and passes them into the page context |
| Page context | `inject.js` | Overrides `navigator.*`, `window.devicePixelRatio`, `screen.*`, `Intl` |

Rules are configured through `declarativeNetRequest` - this is more reliable and faster than intercepting via `XMLHttpRequest` or `fetch`, and it does not require permission to read page content.

JavaScript property spoofing is performed in the page context itself, not inside the isolated environment of the extension. `Content scripts` by default run in a separate sandbox and cannot override the global objects that the site sees.

## About Accept-Language:

By default, the browser sends the `Accept-Language` header with the languages configured in the system. When using a virtual private network, the IP address and language may not match. This mismatch is a visible signal for anti-bot systems and trackers, because real users almost always have an IP and language from the same region.

The extension lets you choose `Accept-Language` manually. The list includes 107 locales from Europe, America, and Asia. The language is spoofed simultaneously in the HTTP header and in JavaScript (`navigator.language`, `navigator.languages`, `Intl` locale), so there is no discrepancy between the network and JS.

**Recommendation:** choose the language that matches the exit node country. Then checks that compare the language region with the IP region will show consistency.

**Example:** if your IP address is located in the Netherlands, choose `nl-NL` - then the language region will match the IP region.

**Important:** If you spoof the language to a different country's locale but then access your own services that expect your real language (for example, email, a bank, or another service from your home country), they may behave incorrectly - for example, show the interface in another language or change the currency. Such services should be added to the **Exceptions** tab so that language spoofing does not apply to them.

## Limitations:

- ⚠️ **Cloudflare Turnstile.** The extension changes `User-Agent` but cannot change the TLS fingerprint (JA3/JA4), HTTP/2 fingerprint, or behavioral signals. On sites protected by Cloudflare, this may cause errors and captcha loops. The solution is to use the exception mechanism inside the extension or a separate proxy (Byparr, Solverr).
- ⚠️ **Not for anonymity.** Spoofing does not hide your IP, cookies, TLS fingerprint, or behavior. This is a client identity spoof, not an invisibility mode.
- ⚠️ **Accept-CH and Critical-CH.** Manifest V3 does not allow the extension to read server response headers, so dynamically reacting to Accept-CH or Critical-CH is impossible. The extension works around this limitation via preemptive sending of all Client Hints.
- ⚠️ **ACCEPT_CH ALPS TLS extension.** The extension cannot interfere with the TLS handshake. However, preemptive hint sending makes the ALPS mechanism unnecessary.
- ⚠️ **Chromium only.** The extension is written for Manifest V3 and works in Chromium-based browsers. Firefox requires porting.

## Support the project:
If you like this project, give it a star on GitHub.

## License:
- [MIT License](https://github.com/smi-falcon/User-Agent-Spoofer/blob/main/License.md)