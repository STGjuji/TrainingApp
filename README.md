# Training App

A React Native + Expo training app for workouts, meals, weight tracking, progress, and Garmin imports.

## What is included

- Expo app for mobile and web
- Workout, meal, weight, and progress screens
- Shared account design for you and your wife
- Supabase backend integration for synced data across phone and PC
- Garmin file import support placeholder

## Setup

1. Install Node.js 18+ and npm.
2. Install Expo CLI if needed:
   ```bash
   npm install -g expo-cli
   ```
3. Install project dependencies:
   ```bash
   npm install
   ```
4. Create a free Supabase project at https://supabase.com.
5. Add your Supabase credentials in `src/lib/supabase.ts`.
6. Create the database tables in Supabase using `supabase/schema.sql`.
7. Run the app:
   ```bash
   npm start
   ```
8. Open on mobile using Expo Go or in a browser.

## Supabase schema

The `supabase/schema.sql` file contains sample table definitions for workouts, meals, weights, and Garmin uploads.

## Notes

- This scaffold is designed to sync data through Supabase so both phone and PC access the same account.
- Garmin uploads are stored and can be extended later to parse FIT/TCX/GPX files.
