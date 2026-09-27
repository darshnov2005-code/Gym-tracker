# Gym Tracker

A full-featured, **offline-first** Progressive Web App for tracking your gym workouts.

Works great in the browser and can be installed on your phone home screen.

## Features

- **Log Workouts** — Sets, reps, weight, notes per set
- **Routines / Templates** — Create and reuse workout plans
- **Workout History** — Full history with volume calculation
- **Personal Records** — Automatic PR detection (Epley 1RM)
- **Progress Charts** — Exercise weight over time + body weight
- **Body Weight Tracking**
- **Rest Timer** — Built-in timer with vibration on finish
- **Fully Offline** — All data stored in IndexedDB on your device
- **Export to CSV**
- **Installable PWA** — Add to home screen on mobile
- **Dark Mode** — Optimized for gym lighting

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Dexie.js (IndexedDB)
- Recharts
- vite-plugin-pwa
- Lucide icons

## Getting Started

```bash
# Clone the repo
git clone https://github.com/darshnov2005-code/Gym-tracker.git
cd Gym-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

### Build for production

```bash
npm run build
npm run preview
```

The `dist` folder can be deployed to any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc.).

## How to use

1. Go to **Routines** and create a few templates (e.g. Push, Pull, Legs)
2. From **Train** page, start an empty workout or pick a routine
3. Log your sets (weight + reps) and tap the checkmark when done
4. Use the Rest Timer between sets
5. Hit **Finish** — PRs are detected automatically
6. Check **Progress** for charts and **History** for past sessions
7. Track body weight and export data from **Profile**

## Notes

- All data stays on your device (no account, no server)
- Works offline after the first load
- On mobile: open in browser → "Add to Home Screen" for app-like experience

Built for personal use.
