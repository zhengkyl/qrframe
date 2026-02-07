# Self-Hosting qrframe

qrframe builds to a fully static site — no server-side runtime needed. You can serve the output from any web server, CDN, or container.

## Quick Start with Docker

```sh
docker compose up -d
```

The app will be available at `http://localhost:8080`.

## Build Locally

Requires Node.js >= 18 and pnpm.

```sh
pnpm install
pnpm run build
```

The static output is in `.output/public/`. Serve it with any HTTP server:

```sh
# using the built-in serve script
pnpm run serve

# or with any static server
npx serve .output/public
python3 -m http.server -d .output/public
```

## Deploy Anywhere

Since the build output is plain static files, you can host it on:

- **Nginx / Caddy / Apache** — copy `.output/public/` to your web root
- **Netlify / Vercel / GitHub Pages** — point the build output to `.output/public`
- **S3 + CloudFront** — upload the contents of `.output/public`

For SPA routing to work, configure your server to fall back to `index.html` for unknown paths. The included `nginx.conf` demonstrates this.

## Customizing Presets

Preset designs live in the `presets/` directory as plain JavaScript files. Each preset exports:

- `paramsSchema` — defines the UI controls (colors, numbers, toggles, etc.)
- `renderSVG(qr, params)` or `renderCanvas(qr, params, canvas)` — the render function

To add a new preset:

1. Create a new `.js` file in `presets/` (use `presets/Basic.js` as a template)
2. Import it in `src/lib/presets.ts` and add it to the `PRESET_CODE` object
3. Rebuild

Users can also create presets at runtime through the editor UI without rebuilding.

## Development

```sh
pnpm install
pnpm run dev
```

The dev server runs at `http://localhost:3000` with hot reload.
