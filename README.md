# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

---

## Oyun Ekranı Mimarisi

Sınıf Bulutu ilkokul oyunları (6-11 yaş) için tasarlanan modern, pastel renkli, kenardan kenara (edge-to-edge) tam ekran oyun düzeni ve bileşen sistemidir.

### 1. Temel Bileşenler
- **`GameStartScreen`** (`src/components/game/GameStartScreen.tsx`): Oyun öncesi neşeli başlangıç ekranı. Başlık, büyük zıplayan "BAŞLA" butonu, "Nasıl Oynanır?" ve "Ayarlar" butonları, safe-area destekli düzen.
- **`GameShell`** (`src/components/game/GameShell.tsx`): Tam ekran oyun kabuğu (`100dvh`, `env(safe-area-inset-*)`). Arka plan yönetimini, `GameHud`'ı, duraklatma ve sonuç ekranlarını yönetir.
- **`GameHud`** (`src/components/game/GameHud.tsx`): Yüzen, pastel cam efektli tekil durum çubuğu. Duraklat, skor, süre, soru indeksi, seri/alev göstergesi, sesli okuma (TTS) ve ses aç/kapat butonları içerir.
- **`GameHudContext`** (`src/components/game/GameHudContext.tsx`): Oyunlar ile HUD arasındaki çift yönlü state köprüsü (`score`, `streak`, `timeLeft`, `questionIndex`, `questionText`, `isInsideShell`).
- **`PauseMenu`** (`src/components/game/PauseMenu.tsx`): ESC, HUD duraklat butonu veya mobil `HOST_BACK_PRESSED` ile tetiklenen mola menüsü. Süre ve ses otomatik duraklatılır.
- **`GameResultScreen`** (`src/components/game/GameResultScreen.tsx`): Başarı oranına göre 1-3 yıldız, konfeti animasyonu, skor özeti, "Tekrar Oyna" ve "Çık" seçenekleri sunar; `GAME_FINISHED` olayını tetikler.
- **`GameLoadingScreen`** (`src/components/game/GameLoadingScreen.tsx`): Arka plan yüklenene kadar gösterilen tatlı bulut/yıldız animasyonu.
- **`HowToPlaySheet` & `SettingsSheet`**: Oyun kuralları ve ses/müzik/titreşim/sesli okuma ayar pencereleri.
- **`RotateHint`** (`src/components/game/RotateHint.tsx`): Ekran yönü oyunun tercih ettiği yönle uyuşmadığında cihazı çevirme animasyonu gösterir.
- **`DeviceFrame`** (`src/components/game/DeviceFrame.tsx`): Masaüstü web önizlemede (ActivityStudio vb.) oyunları mobil en-boy oranında (9:16 veya 16:9) çerçeve içinde sunar.

### 2. `gameThemes.ts` Nasıl Düzenlenir?
`src/data/gameThemes.ts` dosyasında 15 oyunun temaları, aksan renkleri, yön tercihleri (`portrait`, `landscape`, `auto`), maskotları ve fallback gradyanları bulunur. `Activity` nesnesine opsiyonel `themeId` eklenmiştir.

### 3. Oyun Assetleri Nasıl Düzenlenir?
Tüm oyun assetleri `public/games/{templateType}/` dizininde modüler olarak tutulur:
- Dikey arka plan: `public/games/{templateType}/bg.webp` (1080x1920)
- Yatay arka plan: `public/games/{templateType}/bg-landscape.webp` (1920x1080)
- Önizleme kartı: `public/games/{templateType}/preview.jpg`
- Oyuna özel grafikler: Örneğin `public/games/whack/hole.png`, `public/games/airplane/plane.png` vb.
Yazısız, yüksek ışıklı, pastel illüstrasyon formatında olmalıdır.

### 4. Mobil Köprü Mesajları Listesi (`nativeBridge.ts`)
- **Frontend → Mobil:** `GAME_READY`, `GAME_STARTED`, `GAME_PAUSED`, `GAME_RESUMED`, `GAME_FINISHED`, `CLOSE_GAME`, `REQUEST_ORIENTATION`
- **Mobil → Frontend:** `HOST_BACK_PRESSED`, `PAUSE_ALL_AUDIO`

