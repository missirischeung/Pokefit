# PokéFit

*A fusion of Pokémon TCG Pocket and Pokémon GO — turning real-world fitness into collectible fun!*

Inspired by *Pokémon GO*’s active lifestyle design and *TCG Pocket*’s digital card-opening excitement, PokéFit lets users earn points from their physical activity (like steps) and spend those points to open virtual Pokémon card packs.

---

## Goal & Purpose

The aim of PokéFit is to **motivate healthy habits through play**.
Instead of treating fitness as a chore, we reward users for real-world movement by giving them collectible digital Pokémon cards.
Every step contributes toward earning points, every point brings you closer to opening a new pack, and every pack adds to your growing collection.

---

## Tech Stack

### **Frontend**
* **React Native + Expo**
* **TypeScript** 
* **Pokémon TCG API** - Credits to https://pokemontcg.io/
* **Supabase Auth & Database** 

### **Backend**
* **Node.js + Express** – Lightweight REST API for health data, collections, and trainer info
* **PostgreSQL (via Supabase)** – Secure data persistence with Row-Level Security (RLS)
* **Supabase RLS Policies** – Enforces per-user data ownership

### **Integration**
* **Apple HealthKit (Planned)** – To automatically sync real-world step data
* **Expo Router** – For structured screen navigation

---

## Features
*  **Manual Step Entry (MVP)** – Add daily steps to earn points.
*  **Progress Tracking** – See steps, points, and progress toward your next pack.
*  **Card Pack Opening** – Exchange earned points for Pokémon card packs.
*  **Collection System** – View your earned Pokémon cards.
*  **Trainer Profile** – Track total steps, packs earned, and achievements.

---

## 🔮 Future Development

Our MVP focuses on manual step tracking and basic pack-opening mechanics.
Next steps include:

* **Apple HealthKit Integration**:
  Automatically import step counts and distance data to sync physical activity.
* **Achievements / Badge System**:
  Chase for specific achievements and badges that you can display on your profile.
* **Dynamic Events**:
  Special themed packs and challenges tied to real-world activity goals.

---

## 🛠️ Installation

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/pokefit.git

# 2. Install dependencies
cd pokefit
npm install

# 3. Start the Expo app
npx expo start

# 4. (Optional) Run backend locally
cd backend
npm run dev
```
