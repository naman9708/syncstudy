# SyncStudy

A website for exactly two people: you and your accountability partner. You each build a daily
routine, work through it with a focus timer, and see each other's progress in real time — online
status, current task, streaks, and study hours.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, Firebase Authentication, and
Firestore. No backend server, no Cloud Functions, no paid services — everything runs on the
Firebase Spark (free) plan and Vercel's free tier.

---

## 1. Setup — from a fresh clone

You'll only need to do this once.

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Firebase project**
   - Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** →
     name it (e.g. `syncstudy`) → you can disable Google Analytics → **Create**.
   - **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
   - **Build → Firestore Database → Create database → Start in production mode** → pick a region
     close to you.
   - **Project settings (gear icon) → General → Your apps → Web (`</>`)** → register an app
     (nickname anything, e.g. `syncstudy-web`) → copy the `firebaseConfig` object it shows you.

3. **Add your Firebase config**
   ```bash
   cp .env.local.example .env.local
   ```
   Paste the six values from `firebaseConfig` into `.env.local`.
   `.env.local` is meant to stay local and should not be committed to source control.

4. **Set Firestore security rules** — Firebase console → Firestore Database → Rules → paste the
   full ruleset from [section 3](#3-firestore-security-rules-full-ruleset) below → **Publish**.

5. **Run it**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`, sign up, and send your partner an invite from the Partner page
   (they'll need their own account — sign up again in a private/incognito window to test both
   sides on one machine).

That's it — no Docker, no Firebase CLI, no Cloud Functions, no emulators.

---

## 2. Project folder structure

```
src/
  app/
    (auth)/
      login/page.tsx            Sign in
      signup/page.tsx           Create account
      forgot-password/page.tsx  Password reset email
      layout.tsx                 Redirects signed-in users to /dashboard; branded split screen
    (dashboard)/
      dashboard/page.tsx         You/Partner cards, today's sync ring, streak, study time
      partner/page.tsx           Search, send/accept/reject requests, connected partner card
      checklist/page.tsx         Today / Weekday routine / Weekend routine tabs
      analytics/page.tsx         Daily/Weekly/Monthly/Yearly charts + streaks
      settings/page.tsx          Profile, appearance, reminders, privacy, logout
      layout.tsx                 Protected shell: sidebar, topbar, mobile nav, presence heartbeat,
                                  reminder scheduler, offline banner
    layout.tsx                   Root layout: fonts, ThemeProvider, AuthProvider, toaster
    page.tsx                     Auth-aware redirect gate (→ /dashboard or /login)
    error.tsx, not-found.tsx     App-wide error boundary and 404 page
    globals.css                  Design tokens (colors, fonts, radius) for light + dark mode

  components/
    ui/           Hand-built shadcn-style primitives (button, input, card, dialog, select, tabs,
                  dropdown-menu, switch, avatar, badge, textarea, skeleton, separator)
    auth/         AuthProvider — subscribes to Firebase auth + the live profile doc
    dashboard/    sidebar, mobile-nav, topbar, sync-ring, partner-live-card
    partner/      search form, incoming/outgoing request cards, connected-partner card
    checklist/    task-form-dialog, routine-editor, task-timer-row, todays-checklist
    analytics/    study-hours-chart, completion-chart, stat-summary, colors
    settings/     profile-form, theme-toggle, reminder-toggle, privacy-toggle
    shared/       theme-provider, sync-mark (logo), presence-dot, offline-banner

  hooks/          One hook per concern — usePartnerConnection, useTodaysChecklist, useRoutines,
                  usePresence(uid), useAnalytics, useStreakFor(uid), useReminderScheduler, etc.

  lib/
    firebase/     client.ts (init), auth.ts, users.ts, connections.ts, routines.ts,
                  daily-progress.ts, presence.ts, profile.ts, errors.ts (friendly error messages)
    validations/  zod schemas — auth, partner, task, profile
    analytics.ts  Pure aggregation: daily stats → week/month/year buckets, streak calculation
    task-actions.ts  Pure timer state machine (start/pause/resume/complete/skip)
    date.ts, format.ts, notifications.ts, local-preferences.ts, utils.ts

  store/useAuthStore.ts   Zustand store: current Firebase user + live profile doc
  types/index.ts          Every Firestore document shape, in one place
```

---

## 3. Firestore security rules (full ruleset)

Paste this whole block into Firebase console → Firestore Database → Rules. It's the accumulated
ruleset from every milestone — you don't need to apply anything incrementally on a fresh project.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /connections/{connectionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.auth.uid in request.resource.data.participants
        && request.resource.data.requestedBy == request.auth.uid
        && request.resource.data.participants.size() == 2
        && request.resource.data.participants[0] != request.resource.data.participants[1];
      allow update: if request.auth != null
        && request.auth.uid in resource.data.participants;
      allow delete: if false;
    }

    match /routines/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /dailyProgress/{docId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.uid;
      allow update: if request.auth != null && request.auth.uid == resource.data.uid;
    }

    match /presence/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Why reads are open but writes are locked to the owner:** with no Cloud Functions, your partner's
client needs to read your `dailyProgress` and `presence` docs directly to show live status — but
only *you* should ever be able to write to your own documents. `connections` is the one collection
either side can update (to accept/reject/remove), which is why its rule checks
`request.auth.uid in resource.data.participants` instead of a single owner.

---

## 4. Firestore schema

| Collection | Doc ID | Shape |
|---|---|---|
| `users` | `{uid}` | `uid, name, email, college, branch, semester, partnerId, privacyMode, createdAt` |
| `connections` | auto | `participants: [uidA, uidB], requestedBy, requestedByName, requestedByEmail, requestedToUid, requestedToName, requestedToEmail, status ("pending"\|"accepted"\|"rejected"\|"removed"), createdAt, updatedAt` |
| `routines` | `{uid}` | `weekday: RoutineTask[], weekend: RoutineTask[], updatedAt` |
| `dailyProgress` | `{uid}_{YYYY-MM-DD}` | `uid, date, template ("weekday"\|"weekend"), taskStates: TaskState[], updatedAt` |
| `presence` | `{uid}` | `uid, lastSeenAt` |

```ts
RoutineTask { id, title, description, durationMinutes, category, priority, order }

TaskState {
  taskId, title, description, durationMinutes, category, priority,
  status: "not_started" | "running" | "paused" | "completed" | "skipped",
  elapsedSeconds, runningSince: epoch ms | null, completedAt: epoch ms | null
}
```

Key design decisions, in brief:

- **`connections.participants` is an array**, queried with `array-contains` — one realtime
  listener per user covers every relationship they're in (incoming, outgoing, accepted, history),
  since Firestore has no OR-across-fields query.
- **`dailyProgress` doc IDs embed the date** (`{uid}_{date}`) so Analytics can fetch a whole date
  range with a `documentId()` range query — no composite index required, no extra setup step.
- **Timers survive refresh/restart** because `runningSince` is a timestamp, not a counter. Elapsed
  time is always `elapsedSeconds + (now − runningSince)`, recomputed from that timestamp — never
  from a client-side interval that would reset.
- **Presence is heartbeat-based** (every 20s while a tab is visible; 45s timeout = offline), since
  Realtime Database (the usual `onDisconnect` presence tool) isn't part of the approved stack.

---

## 5. Deployment (Vercel, free tier)

1. Push this project to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → sign in with GitHub → **Add New → Project** → import
   the repo.
3. In **Environment Variables**, add the same six `NEXT_PUBLIC_FIREBASE_*` keys from your
   `.env.local`.
4. **Deploy.** Vercel auto-detects Next.js — no build config needed.
5. Back in the Firebase console → Authentication → Settings → **Authorized domains** → add your
   new `*.vercel.app` domain (Firebase blocks auth from unrecognized domains by default).

Every push to your main branch redeploys automatically.

---

## 6. Testing checklist

**Auth**
- [ ] Sign up creates a Firebase Auth user *and* a `users/{uid}` Firestore doc
- [ ] Log out, log back in with the same credentials
- [ ] "Keep me signed in" unchecked → session doesn't survive a full browser restart; checked → it does
- [ ] Forgot password sends a real reset email and the link works
- [ ] Visiting `/dashboard` while signed out redirects to `/login`; visiting `/login` while signed in redirects to `/dashboard`

**Partner**
- [ ] Search finds the other test account by email (not by name)
- [ ] Sending a request appears instantly as "pending" on the sender's side and as an incoming request on the receiver's, with no manual refresh
- [ ] Accept, reject, cancel, and remove-partner all update both sides live
- [ ] Once connected, search is hidden until you remove your partner

**Checklist & timer**
- [ ] Adding a task to the weekday template shows up in Today's checklist on a weekday (and weekend template on a weekend)
- [ ] Start → Pause → Resume → Complete each update the task's visible state immediately
- [ ] Starting a second task auto-pauses whichever task was running
- [ ] Refresh the page mid-timer — elapsed time continues from where it was, not from zero
- [ ] A completed task fires a browser notification (after granting permission)

**Live presence**
- [ ] Partner shows "Online" within ~20s of them opening the app, and "Offline" within ~45s of them closing the tab
- [ ] Partner's current task and live elapsed time update without refreshing
- [ ] Enabling Privacy mode hides your task title from your partner's view (they still see you're online and your completion count)

**Analytics**
- [ ] Daily/Weekly/Monthly/Yearly tabs all render once there's at least one completed day
- [ ] Current streak increments after a fully-completed day; breaks after a missed day
- [ ] Charts show both you and your partner once connected; only you if not

**Settings**
- [ ] Editing name/college/branch/semester saves and reflects immediately elsewhere in the app
- [ ] Light/Dark/System theme switch works and persists across a refresh
- [ ] Reminder toggle requests notification permission when turned on

**General**
- [ ] `npm run lint` — 0 errors
- [ ] `npm run build` — succeeds with no type errors
- [ ] Every page is usable at mobile width (375px), tablet, and desktop
- [ ] Going offline (disable Wi-Fi) shows the offline banner; reconnecting hides it

---

## Milestone history

1. Project setup, folder structure, authentication, dashboard shell
2. Friend system (search, request, accept/reject, remove — all realtime)
3. Checklist (weekday/weekend templates) + focus timer (survives refresh/restart)
4. Realtime presence (online/offline, live current task, elapsed time)
5. Analytics (daily/weekly/monthly/yearly charts, streaks, partner comparison)
6. Settings (editable profile, theme, reminders, privacy) + final polish (offline banner, error/404 pages, this README)
