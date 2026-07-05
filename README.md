# wiz_control_frontend

React web app to control WiZ (Philips/Signify) smart bulbs over the local network. It talks over HTTP to the [wiz_control_backend](https://github.com/MNATorres/wiz_control_backend) service, which is the piece that actually speaks the bulbs' UDP protocol.

Currently this only shows a backend health check. Bulb discovery and control UI are not implemented yet.

**Requires `wiz_control_backend` to be running** — this app has no functionality on its own.

## Stack

- React 19
- TypeScript 6
- Vite 8

## Requirements

- Node.js 20+ and npm
- [wiz_control_backend](https://github.com/MNATorres/wiz_control_backend) running locally on port 3001

## Setup

```bash
npm install
```

## Running in development

1. Start the backend first (see its README), it must be listening on `http://localhost:3001`.
2. Then start this app:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173). Requests to `/api/*` are proxied to the backend (configured in `vite.config.ts`), so no CORS setup is needed in development.

You should see "Backend status: ok" on the page if the backend is reachable.

## Building for production

```bash
npm run build     # type-checks and outputs static files to dist/
npm run preview   # serves the production build locally
```

## Project structure

```
src/
  App.tsx     # main screen
  main.tsx    # React entry point
```
