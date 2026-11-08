# 💍 Wedding Guest Manager (ShaadiSync)
> **The Realtime WhatsApp-First RSVP & Catering Intelligence Platform for Indian Weddings**  
> *Inspired by the viral concept from Utkarsh (@uvichar_) — "Please Someone Build this in India 🇮🇳"*

---

## 🚀 Live App is Running Now!
* **Local Web App:** [http://localhost:5173/](http://localhost:5173/)
* **Mobile On Same Wi-Fi:** `http://192.168.0.100:5173/` *(or scan the QR Code inside the app)*
* **Backend API & WebSockets:** `http://localhost:3001` (WS at `ws://localhost:3001/ws`)

---

## 🌟 What This Realtime App Solves
At Indian weddings, families invite 400 to 1,000+ guests with **zero RSVP culture**. Banquet catering costs ₹1,500 – ₹5,000+ per plate. If 120 guests don't show up, **₹2,00,000 to ₹6,00,000+ is thrown straight into the trash** (*"Someone please eat the paneer!"*).

This platform fixes it with a 10-second WhatsApp-native guest experience and live host intelligence:
1. **Interactive Mobile RSVP Screen (Matching the Reel):**
   * High-contrast monochrome luxury aesthetic.
   * `[ YES ]` / `[ NO ]` 1-tap decision.
   * Headcount counter (`- 2 +`).
   * Food Preference: Pure Vegetarian (green dot) vs Non-Vegetarian (triangle) vs Strict Jain.
   * **Arrival Time Clock:** Sleek interactive analog clock dial (e.g. `07:00 PM`).
   * Sangeet song requests & sweet blessings for the couple.
2. **Realtime Host Command Center:**
   * **Live WebSocket Synchronization:** When any guest confirms or changes their RSVP on any device or tab, all connected dashboards instantly update without reloading, playing an audible chime and updating live counters.
   * **Catering & Savings Calculator:** Dynamic rate slider (₹1,000 – ₹6,000/plate) calculating exact money saved vs blind ordering.
   * **Arrival Rush Heatmap:** Visual timeline showing when guests arrive (6:30 PM to 9:30 PM) so caterers and stage managers know when peak buffet demand occurs.
   * **WhatsApp Automation Engine:** 1-click personalized WhatsApp message templates (First Invitation, 48-hour Catering Nudge, Day-of Directions).
   * **Built-in Mobile Simulator:** Split-screen iPhone frame to test both host and guest views side-by-side.
   * **Simulate Live RSVP Button:** Triggers realistic incoming RSVPs on demand to demonstrate live streaming metrics.
   * **Printable Catering Guarantee Manifest:** Official sheet for Taj Palace banquet managers and head chefs.

---

## 🛠️ Tech Stack
* **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v3, Lucide Icons, Canvas-Confetti, QRCode.react
* **Backend:** Node.js, Express, TypeScript (`tsx`), `ws` (WebSockets)
* **Realtime Protocol:** WebSocket JSON event broadcasts (`RSVP_UPDATED`, `GUEST_ADDED`, `EVENT_UPDATED`)
* **Audio:** Native Web Audio API procedural bell chime

---

## 💻 Commands
```bash
# Start both Backend server and Vite frontend concurrently
npm run dev

# Start backend only
npm run server

# Start frontend only
npm run client

# Production Build
npm run build
```
