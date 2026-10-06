# VitaTrack — Health Tracking App

A cross-platform mobile app (Expo + React Native) for personal health management with two roles: **patients** track medications, symptoms and vital signs; **doctors** monitor their linked patients, review alerts and follow-ups. Backend on **Supabase** (PostgreSQL + Auth + Row Level Security).

> Screenshots: add `screenshots/` images here after running the app.

## ✨ Features

**Patient**
- Medication management with smart reminders and daily intake log
- Symptom journal with detailed evolution tracking
- Vital signs logging (blood pressure, glucose, weight…) with charts
- Quick consultations and health alerts
- Profile management

**Doctor**
- Patient list with search and linking by email
- Patient detail: vitals, medications, symptoms timeline
- Alerts dashboard (rule-based local alert engine)
- Follow-up tracking

## 🛠️ Stack

- **Expo SDK 54** + React Native + TypeScript + Expo Router (file-based navigation)
- **NativeWind** (Tailwind for React Native), `react-native-reanimated` animations
- **Supabase**: Auth (email), PostgreSQL with **Row Level Security**, realtime-ready schema
- **Zustand** for auth state, `react-hook-form` for forms
- `react-native-chart-kit` for vital-sign charts, `expo-notifications` for reminders

## 🗄️ Data model

`supabase/schema.sql` creates: `usuarios`, `perfiles`, `doctor_pacientes`, `medicamentos`, `registro_medicamentos`, `sintomas`, `signos_vitales`, `alertas`, `consultas_rapidas` — with RLS policies so patients only see their own data and doctors only their linked patients.

## 🚀 Run it

**Prerequisites:** Node 18+, the Expo Go app (or an Android/iOS emulator).

```bash
npm install
```

**1. Supabase setup**
1. Create a free project at [supabase.com](https://supabase.com)
2. In SQL Editor, run `supabase/schema.sql`
3. Enable **Email** provider in Authentication → Providers
4. Copy Project URL + anon key from Settings → API

**2. Environment**
```bash
cp .env.example .env
# fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
```

**3. Start**
```bash
npx expo start
```
Scan the QR with Expo Go, or press `a` / `i` for an emulator.

## 🧪 Demo flow

1. Register as **Patient**, pick the patient role, add medications, symptoms and vitals
2. Register a second account as **Doctor**, link the patient by email under *Pacientes*
3. Open the doctor dashboard: alerts, patient detail and follow-up charts

## 📁 Structure

```
app/            # Expo Router screens: (auth), (patient), (doctor)
components/ui/  # Design-system primitives (buttons, cards, screens)
services/       # Supabase data layer (per domain)
lib/            # alertEngine (rules), supabase client, formatters
store/          # Zustand auth store
supabase/       # schema.sql — tables + RLS
```

> 🇪🇸 Spanish setup guide: see [EJECUCION.md](EJECUCION.md).
