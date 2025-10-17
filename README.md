# WebGL Avatar Glow Effect

Демо приложение для рендеринга круглого аватара с GPU-ускоренным glow эффектом через WebGL2/WebGL1.

## Требования

- Node.js 20+
- npm
- Современный браузер с WebGL2 (Chrome 56+, Safari 15+, Firefox 51+)

## Установка

```bash
npm install
```

## Команды

- `npm run dev` — запуск dev сервера (http://localhost:5173)
- `npm run build` — production сборка в `dist/`
- `npm run preview` — предпросмотр production билда
- `npm run lint` — проверка ESLint
- `npm run format` — форматирование через Prettier
- `npm run test` — запуск всех тестов (unit + e2e)
- `npm run test:unit` — только unit тесты (Vitest)
- `npm run test:e2e` — только E2E screenshot тесты (Playwright)
- `npm run test:update` — обновить baseline screenshot (`public/example.png`)

## Архитектура

### Render Pipeline (4 прохода):

1. **Background Pass**: заливка canvas цветом `#25262d`
2. **Avatar Pass**: рендер аватара в FBO с circular clipping (diameter = 30% canvas width)
3. **Blur Pass**: separable Gaussian blur (H/V) для создания glow эффекта
4. **Composite Pass**: композиция glow (за аватаром) + avatar (поверх)

### Структура проекта:

- `src/lib/` — WebGL utilities (context, shaders, textures, framebuffers)
- `src/scene/` — render passes (Background, Avatar, Blur, Composite, Pipeline)
- `src/ui/` — UI controls (sliders для radius/opacity)
- `assets/shaders/` — GLSL шейдеры (WebGL2 + WebGL1 variants)
- `tests/e2e/` — Playwright screenshot тесты
- `src/__tests__/` — Vitest unit тесты

## Тестирование

Проект использует deterministic screenshot testing:

- Фиксированный viewport: 1280×720
- DPR = 1
- Baseline: `public/example.png`
- Допустимое отклонение: 1% пикселей (pixelmatch threshold 0.1)

Тесты запускаются в Chromium, WebKit (Safari), Firefox.

## Safari Support

- WebGL2: iPhone 13+ / MacBook 2021+ (Safari 15+)
- WebGL1 fallback: автоматический для старых устройств
- Premultiplied alpha blending для корректной композиции

## Performance

- Reusable FBOs (no per-frame allocation)
- Separable blur (O(n) вместо O(n²))
- Optional half-res blur для больших радиусов (>100px)
- Линейное цветовое пространство для blur (sRGB ↔ linear conversion)

## Debug Mode

Добавьте `?debug=1` к URL для включения performance profiling:

```
http://localhost:5173?debug=1
```

Это покажет timing для каждого render pass в консоли браузера.

## License

MIT