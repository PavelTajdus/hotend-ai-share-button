# Hotend.cz AI Share Button — Mobile Share Flow

Rozšířená verze AI Share Button widgetu s podporou mobilního sdílení pomocí Web Share API a pokročilými konfiguračními možnostmi.

## 🚀 Nové funkce

### Mobile-First přístup
- **Web Share API**: Na mobilních zařízeních se prioritně používá systémové sdílení
- **Bezpečné kopírování**: Prompt se vždy zkopíruje do schránky jako backup
- **Fallback flow**: Při selhání sdílení se automaticky otevře webová verze AI asistenta
- **Responzivní UI**: Různé možnosti pro mobil a desktop

### Podporované AI asistenty
- **Perplexity** (default): `https://www.perplexity.ai/search?q=...`
- **ChatGPT**: `https://chatgpt.com/?q=...`
- **Claude**: `https://claude.ai/new` (spoléhá na schránku)
- **Gemini**: `https://gemini.google.com/app` (spoléhá na schránku)
- **Copilot**: `https://copilot.microsoft.com/?q=...`

### Pokročilá analytics
- Kompletní tracking všech interakcí (sdílení, kopírování, otevírání)
- Rozlišení mezi mobilními a desktopovými událostmi
- Integrace s Google Analytics 4 a GTM

## 📁 Struktura souborů

```
/
├── skript.html          # Hlavní widget s HTML, CSS a JS
├── shareFlow.js         # Modul pro mobilní sdílení a flow logiku
├── assistants.js        # URL buildery pro webové verze AI asistentů
├── test.html           # Testovací stránka s mockovanými funkcemi
└── README.md           # Tato dokumentace
```

## 🔧 Instalace

### Rychlá instalace (doporučeno)
Stačí zkopírovat obsah `skript.html` do vaší stránky. Soubor obsahuje vše potřebné včetně odkazů na externí moduly.

### Modulární instalace
1. Nahrajte všechny soubory na server
2. Vložte do HTML:

```html
<!-- Include new modules -->
<script src="assistants.js"></script>
<script src="shareFlow.js"></script>

<!-- Include main widget -->
<!-- obsah skript.html zde -->
```

## ⚙️ Konfigurace

Widget lze konfigurovat pomocí objektu `AI_SHARE_CONFIG`:

```javascript
const AI_SHARE_CONFIG = {
    MOBILE_SHARE_FLOW: true,        // Mobil preferuje navigator.share
    DESKTOP_DEEPLINK_FLOW: true,    // Desktop otevře webovou verzi asistenta
    COPY_ALWAYS: true,              // Vždy zkopíruj prompt (bezpečné chování)
    PREFERRED_ASSISTANT: 'perplexity', // 'perplexity'|'chatgpt'|'claude'
    TOAST_DURATION_MS: 3200         // Doba zobrazení toast zprávy
};
```

### Možnosti konfigurace

| Parametr | Typ | Default | Popis |
|----------|-----|---------|--------|
| `MOBILE_SHARE_FLOW` | boolean | `true` | Mobil preferuje `navigator.share` |
| `DESKTOP_DEEPLINK_FLOW` | boolean | `true` | Desktop otevře webovou verzi asistenta |
| `COPY_ALWAYS` | boolean | `true` | Vždy zkopíruj prompt (bezpečné chování) |
| `PREFERRED_ASSISTANT` | string | `'perplexity'` | Výchozí asistent |
| `TOAST_DURATION_MS` | number | `3200` | Doba zobrazení toast zprávy v ms |

## 🔄 Flow chování

### Mobilní zařízení (s Web Share API)
1. **COPY_ALWAYS**: Pokus o `copyToClipboard(prompt + "\n\n" + url)` — chyby ignorovat
2. **sharePrompt()**: Otevře systémové sdílení s `title`, `text`, `url`
3. **Pokud share succeed**: Konec, zobrazí toast
4. **Pokud share cancel/error**: Fallback → `openAssistantWeb()` + toast

### Mobilní zařízení (bez Web Share API)
1. **COPY_ALWAYS**: `copyToClipboard()`
2. **openAssistantWeb()**: Otevře webovou verzi asistenta

### Desktop
1. **COPY_ALWAYS**: `copyToClipboard()`
2. **Pokud DESKTOP_DEEPLINK_FLOW**: `openAssistantWeb()`

## 📱 UI/UX změny

### Mobilní interface
- **Primární akce**: "Sdílet do AI (doporučeno)" - červené zvýraznění
- **Sekundární akce**: "Otevřít ve webové verzi [Assistant]" - menší text
- **Toast zpráva**: "Text je ve schránce – vlož ho do AI a odešli."

### Desktop interface
- Zachovává původní chování a vzhled
- Všechny původní možnosti zůstávají dostupné

## 📊 Analytics události

### Nové události
```javascript
// Základní interakce
gtag('event', 'button_click', { assistant: 'perplexity' });

// Mobilní sdílení
gtag('event', 'share_open', { isMobile: true, title: 'Produkt...' });
gtag('event', 'share_success', { isMobile: true });
gtag('event', 'share_error', { isMobile: true, message: 'User cancelled' });

// Fallback akce
gtag('event', 'fallback_copy_triggered', { isMobile: true });
gtag('event', 'web_assistant_open', { assistant: 'chatgpt' });
gtag('event', 'desktop_deeplink_open', { assistant: 'perplexity' });

// Kopírování
gtag('event', 'copy_success', { isMobile: false });
gtag('event', 'copy_error', { isMobile: false, message: 'Clipboard API failed' });
```

## 🧪 Testování

### Testovací stránka
Otevřete `test.html` v prohlížeči pro testování funkcí:

- **Simulate Mobile/Desktop**: Přepne user agent pro testování
- **Toggle Web Share**: Zapne/vypne Web Share API
- **Toggle Mobile Flow**: Přepne mobilní/desktopový flow
- **Show Config**: Zobrazí aktuální konfiguraci
- **Test Share Function**: Spustí test sdílení

### Testovací scénáře

#### iOS Safari/Chrome
```javascript
// Očekávané chování:
// 1. navigator.share dostupný
// 2. Potvrzení sdílení → share_success
// 3. Zrušení → share_error + otevření web asistenta
// 4. Toast zobrazen
```

#### Android Chrome
```javascript
// Očekávané chování:
// 1. navigator.share dostupný
// 2. Validace encodingu u query parametrů
// 3. Správné URL buildování
```

#### Desktop Chrome/Safari/Firefox
```javascript
// Očekávané chování:
// 1. Bez Web Share API
// 2. copy + web asistenta otevřít v nové záložce
// 3. Desktop-specific analytics události
```

## 🔌 API Reference

### Veřejné API

#### `handleAiShare(assistant, forceWebOpen = false)`
Hlavní funkce pro spuštění AI share flow.

```javascript
// Normální flow (mobile-first)
handleAiShare('perplexity');

// Vynucené otevření webové verze
handleAiShare('chatgpt', true);
```

#### `copyToClipboard()`
Zkopíruje obsah stránky do schránky.

```javascript
copyToClipboard();
```

### Vnitřní moduly

#### shareFlow.js
```javascript
window.shareFlow = {
    detect: { isMobile: boolean },
    canWebShare(): boolean,
    buildSharePayload({ productTitle, productUrl, promptText }),
    sharePrompt({ title, text, url }): Promise<void>,
    copyToClipboard(text, url?): Promise<void>,
    openAssistantWeb(query, assistant): void,
    runAiShareFlow({ assistant, productTitle, productUrl, promptText }): Promise<void>,
    updateConfig(newConfig): void,
    CONFIG: object
};
```

#### assistants.js
```javascript
window.assistantUtils = {
    encodeQ(query): string,
    buildPerplexityWebUrl(query): string,
    buildChatGPTWebUrl(query): string,
    buildClaudeWebUrl(query): string,
    buildGeminiWebUrl(query): string,
    buildCopilotWebUrl(query): string,
    buildAssistantWebUrl(assistant, query): string,
    getAssistantInfo(assistant): object,
    MAX_QUERY_LENGTH: 3000
};
```

## 🚨 Známá omezení

### Query parametry
- **Claude**: Nepodporuje spolehlivé předvyplnění dotazu přes URL
- **Gemini**: Nepodporuje query parametry pro předvyplnění
- **Všechny**: Maximální délka query je omezena na 3000 znaků

### Clipboard API
- **Safari**: Vyžaduje HTTPS nebo user interaction
- **Starší prohlížeče**: Fallback na `document.execCommand('copy')`

### Web Share API
- **Desktop**: Většinou není dostupná
- **PWA**: Vyžaduje HTTPS a manifest.json

## 🔧 Troubleshooting

### Widget se nezobrazuje
```javascript
// Zkontrolujte konzoli pro chyby
console.log('AI Share Debug enabled');

// Zkontrolujte detekci produktové stránky
console.log('Is product page:', isProductPage());
```

### Web Share API nefunguje
```javascript
// Zkontrolujte dostupnost
console.log('Can web share:', navigator.share !== undefined);

// Zkontrolujte HTTPS
console.log('Is HTTPS:', location.protocol === 'https:');
```

### Analytics se neodesílají
```javascript
// Zkontrolujte Google Analytics
console.log('gtag available:', typeof gtag !== 'undefined');

// Zkontrolujte GTM
console.log('dataLayer available:', typeof window.dataLayer !== 'undefined');
```

## 📝 Changelog

### v2.0.0 (aktuální)
- ✅ Přidána podpora Web Share API
- ✅ Mobile-first UI/UX
- ✅ Modulární architektura (shareFlow.js, assistants.js)
- ✅ Pokročilé konfigurační možnosti
- ✅ Rozšířená analytics
- ✅ Responzivní design pro mobil/desktop
- ✅ Fallback mechanismy pro všechny scénáře

### v1.0.0 (původní)
- ✅ Základní kopírování do schránky
- ✅ Otevírání AI asistentů v nových záložkách
- ✅ Základní analytics tracking

## 🤝 Podpora

Pro dotazy nebo problémy vytvořte issue nebo kontaktujte vývojový tým Hotend.cz.

---

**Poznámka**: Tento widget je optimalizován pro e-shop Hotend.cz, ale lze jej snadno přizpůsobit pro jiné webové stránky úpravou selektorů a prompt templates.