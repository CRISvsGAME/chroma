# Chroma

## Chroma - Lightweight RGB Contrast Utility Library

Chroma is a lightweight, fully typed TypeScript utility library for working with
CSS RGB colours, random colour generation, and WCAG contrast ratios.

It is designed for simple browser and canvas use cases where colours need to be
generated, converted to CSS, or adjusted to meet accessible contrast levels.

---

## 📦 Installation

Install from npm:

```bash
npm install @crisvsgame/chroma
```

Import the main class:

```typescript
import { Chroma } from "@crisvsgame/chroma";
```

---

## 🚀 Quick Start

```typescript
import { Chroma } from "@crisvsgame/chroma";

const bg = Chroma.randomRgb();
const fg = Chroma.randomWithContrast(bg);

document.body.style.backgroundColor = Chroma.rgbToCss(bg);
document.body.style.color = Chroma.rgbToCss(fg);
```

Generate a random accessible colour pair:

```typescript
const { bg, fg } = Chroma.randomPair();

console.log(Chroma.rgbToCss(bg));
console.log(Chroma.rgbToCss(fg));
console.log(Chroma.contrast(bg, fg));
```

---

## 🌐 CDN / Browser ESM

Chroma can also be imported directly in the browser through jsDelivr:

```html
<script type="module">
    import { Chroma } from "https://cdn.jsdelivr.net/npm/@crisvsgame/chroma@1.0.0/dist/index.js";

    const { bg, fg } = Chroma.randomPair();

    document.body.style.backgroundColor = Chroma.rgbToCss(bg);
    document.body.style.color = Chroma.rgbToCss(fg);
</script>
```

---

## 🔧 Features

- Random integer generation
- Random float generation
- Random RGB colour generation
- RGB to CSS `rgb(...)` conversion
- WCAG contrast ratio calculation
- WCAG AA/AAA contrast constants
- Contrast checking
- Contrast adjustment
- Random accessible colour pairs
- Fully typed TypeScript API

---

## ♿ WCAG Constants

```typescript
Chroma.WCAG_AA_LARGE; // 3
Chroma.WCAG_AA_NORMAL; // 4.5
Chroma.WCAG_AAA_LARGE; // 4.5
Chroma.WCAG_AAA_NORMAL; // 7
```

---

## 🎨 Public API

```typescript
Chroma.randomInt(min, max);
Chroma.randomFloat(min, max);
Chroma.randomRgb();
Chroma.rgbToCss(rgb);
Chroma.contrast(first, second);
Chroma.meetsContrast(first, second, ratio);
Chroma.adjustToContrast(base, color, options);
Chroma.randomWithContrast(base, options);
Chroma.randomPair();
```

Fully typed imports:

```typescript
import { Chroma, type Rgb, type RgbPair, type ContrastOptions, type ContrastDirection } from "@crisvsgame/chroma";
```

---

## 🛠️ Build

Build the library:

```bash
npm run build
```

---

## 📝 License

MIT License

---

## 🔗 Links

- npm: https://www.npmjs.com/package/@crisvsgame/chroma
- Source Code: https://github.com/CRISvsGAME/chroma
