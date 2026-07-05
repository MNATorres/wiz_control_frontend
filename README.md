# wiz_control_frontend

React web app to control WiZ (Philips/Signify) smart bulbs over the local network. It talks over HTTP to the [wiz_control_backend](https://github.com/MNATorres/wiz_control_backend) service, which is the piece that actually speaks the bulbs' UDP protocol.

**Requires `wiz_control_backend` to be running** — this app has no functionality on its own.

## Features

- "Discover bulbs" scans the local network and lists every WiZ bulb found
- Per-bulb card: on/off toggle, brightness, RGB color, white color temperature, and scene selection
- Rename a bulb (persisted by the backend)
- Bulb state polls every 5s so changes made from the official WiZ app are reflected here too
- A bulb that stops responding shows an inline error without affecting the rest of the grid

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

Click "Discover bulbs" to scan the network, then use each card to control a bulb.

## Building for production

```bash
npm run build     # type-checks and outputs static files to dist/
npm run preview   # serves the production build locally
```

## Project structure

```
src/
  App.tsx               # main screen: discover button + bulb grid
  main.tsx              # React entry point
  api.ts                # fetch wrappers for the backend API
  types.ts              # shared types (Bulb, PilotState, Scene)
  components/
    BulbCard.tsx        # single bulb: on/off, brightness, color/white/scenes tabs
```
