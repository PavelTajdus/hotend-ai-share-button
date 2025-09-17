# Hotend AI Share Button

Tlačítko "Kopírovat pro AI" pro produktové stránky e-shopu. Umožňuje zákazníkům jedním klikem sdílet informace o produktech s různými AI asistenty.

**Ukázka v provozu:** https://www.hotend.cz/p/bambu-lab-h2s-combo-ams-2-pro

## Jak to funguje

Widget přidá na produktové stránky plovoucí tlačítko, které po kliknutí zobrazí dropdown menu s volbami AI asistentů. Po výběru asistenta:

1. **Extrahuje obsah stránky** - automaticky získá název produktu, URL a popis
2. **Vytvoří strukturovaný prompt** - formátuje informace do AI-friendly podoby
3. **Zkopíruje do schránky** - obsah je vždy dostupný jako fallback
4. **Otevře AI asistenta** - v novém okně s předvyplněným dotazem (kde to podporují)

## Podporovaní AI asistenti

- **ChatGPT** - otevře s předvyplněným dotazem
- **Claude** - otevře s předvyplněným dotazem  
- **Gemini** - otevře aplikaci, obsah ve schránce k vložení
- **Copilot** - otevře s předvyplněným dotazem
- **Perplexity** - otevře s předvyplněným dotazem
- **Zkopírovat stránku** - pouze kopírování do schránky

## Technické vlastnosti

- **Vanilla JavaScript** - žádné závislosti
- **Safari kompatibilní** - fallback kopírování pro všechny prohlížeče
- **Automatická detekce** - zobrazuje se pouze na produktových stránkách
- **Čištění obsahu** - filtruje navigační prvky a šum
- **Analytics tracking** - podporuje Google Analytics 4 a GTM
- **Responzivní design** - přizpůsobuje se mobilním zařízením

## Detekce produktových stránek

Widget se automaticky zobrazí když najde:
- URL obsahující `/p/`
- Schema.org Product markup (`[itemtype*="Product"]`)
- Produktové CSS třídy (`.product-detail`, `.product-info`, `.add-to-cart` atd.)

## Struktura promptu

Pro produktové stránky vytváří strukturovaný prompt:
```
Analyzuj prosím tento produkt z českého e-shopu Hotend.cz:

📦 PRODUKT: [Název produktu]
🔗 URL: [URL stránky]

📋 POPIS A SPECIFIKACE:
[Vyčištěný obsah stránky]

ℹ️ O PRODEJCI:
Hotend.cz je český specialista na 3D tiskárny značek Bambulab a Voron...

🔗 Zdroj informací: [URL]
```

## Analytics události

Widget odesílá tyto události do GA4/GTM:
- `button_click` - klik na hlavní tlačítko
- `ai_open` - otevření konkrétního AI asistenta  
- `copy_success` / `copy_error` - kopírování do schránky
- `ai_open_error` - chyba při otevírání

## Licence

MIT License - viz [LICENSE](LICENSE) soubor.
